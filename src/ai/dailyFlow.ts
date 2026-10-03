/**
 * "Daily Flow" recommendation engine.
 *
 * This is a small, explainable, on-device scoring model that stands in for the
 * TensorFlow Lite personalisation model described in the case study. It runs
 * fully offline, is deterministic for a given seed, and returns the reasons for
 * every choice so the UI can show a "Why this plan?" explanation (HMW: make
 * personalisation feel intelligent AND trustworthy).
 *
 * To plug in a real model later, keep this function signature and replace the
 * body with a call into a TFLite wrapper.
 */
import { EXERCISES, EX_BY_ID } from '../data/exercises';
import { DailyState, Equip, Exercise, Level, Muscle, PlanItem, Profile, Session } from '../types';

export interface DailyFlow {
  title: string;
  focus: Muscle | 'full';
  items: PlanItem[];
  minutes: number;
  kcal: number;
  reasons: string[];
}

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function estimateKcal(items: PlanItem[]): number {
  return Math.round(items.reduce((sum, it) => sum + ((EX_BY_ID[it.exerciseId]?.kcalPerMin ?? 5) * it.work) / 60, 0));
}

export function totalSeconds(items: PlanItem[]): number {
  return items.reduce((s, it) => s + it.work + it.rest, 0);
}

const STRENGTH_ROTATION: Muscle[] = ['legs', 'push', 'pull', 'core'];

function pickFocus(profile: Profile, daily: DailyState, history: Session[], reasons: string[]): Muscle | 'full' {
  if (daily.focus) {
    reasons.push(`You asked to focus on ${daily.focus}.`);
    return daily.focus;
  }
  if (profile.goal === 'stamina' && history.length % 2 === 0) {
    reasons.push('Your goal is stamina, so today leans on cardio.');
    return 'cardio';
  }
  // rotate strength focus based on how many sessions you've done
  const idx = history.length % STRENGTH_ROTATION.length;
  const f = STRENGTH_ROTATION[idx];
  reasons.push(`Your last sessions covered other areas, so ${f} is next in your rotation.`);
  return f;
}

export function buildDailyFlow(profile: Profile, daily: DailyState, history: Session[]): DailyFlow {
  const reasons: string[] = [];
  const seed = daily.skips * 7919 + new Date().getDate() * 31 + history.length * 13 + profile.level.length;
  const rand = rng(seed);

  const baseLevel = LEVELS.indexOf(profile.level);
  const effLevel = Math.max(0, Math.min(2, baseLevel + daily.intensity));
  if (daily.intensity < 0) reasons.push('Made easier as you requested.');
  if (daily.intensity > 0) reasons.push('Made harder as you requested.');

  const equip: Equip[] = Array.from(new Set<Equip>(['none', ...profile.equipment]));
  const allowed = (e: Exercise) => equip.includes(e.equip) && LEVELS.indexOf(e.level) <= effLevel;
  const pool = EXERCISES.filter(allowed);

  const minutes = daily.minutes;
  reasons.push(`You have ${minutes} minutes today, so the plan is sized to fit.`);
  reasons.push(`Matched to your ${profile.level} level${equip.length > 1 ? ' and available equipment' : ' (no equipment needed)'}.`);

  const focus = pickFocus(profile, daily, history, reasons);

  const workSec = 40 + daily.intensity * 10;
  const restSec = Math.max(15, 20 - daily.intensity * 5);
  const warm = shuffle(pool.filter((e) => e.muscle === 'mobility'), rand).slice(0, 1);
  const cool = shuffle(pool.filter((e) => e.muscle === 'mobility' && !warm.includes(e)), rand).slice(0, 1);
  const budget = minutes * 60 - 2 * (45 + 15);
  const slots = Math.max(2, Math.min(24, Math.floor(budget / (workSec + restSec))));

  const mainPool = focus === 'full' ? pool.filter((e) => e.muscle !== 'mobility') : pool.filter((e) => e.muscle === focus);
  const otherPool = pool.filter((e) => e.muscle !== 'mobility' && e.muscle !== focus);
  const main = shuffle(mainPool, rand);
  const others = shuffle(otherPool, rand);

  const chosen: Exercise[] = [];
  const mainCount = Math.max(1, Math.ceil(slots * 0.6));
  for (const e of main) { if (chosen.length >= mainCount) break; chosen.push(e); }
  // if the focus pool is small, repeat nothing; fill with complementary moves
  let oi = 0;
  while (chosen.length < slots && oi < others.length) chosen.push(others[oi++]);
  // short on variety for a long session? run a second round of the same moves
  for (let r = 0; chosen.length < slots && chosen.length > 0 && r < 3; r++) {
    const round = [...chosen];
    for (const e of round) { if (chosen.length >= slots) break; chosen.push(e); }
  }
  // finish with cardio when the goal asks for it
  if (profile.goal === 'lose' || profile.goal === 'stamina') {
    const cardio = shuffle(pool.filter((e) => e.muscle === 'cardio' && !chosen.includes(e)), rand)[0];
    if (cardio && chosen.length > 2) {
      chosen[chosen.length - 1] = cardio;
      reasons.push('Added a cardio finisher to support your goal.');
    }
  }

  const items: PlanItem[] = [
    ...warm.map((e) => ({ exerciseId: e.id, work: 45, rest: 15 })),
    ...chosen.map((e) => ({ exerciseId: e.id, work: Math.min(e.seconds, workSec + 5), rest: restSec })),
    ...cool.map((e) => ({ exerciseId: e.id, work: 45, rest: 0 })),
  ];

  const label = focus === 'full' ? 'Full body' : focus[0].toUpperCase() + focus.slice(1);
  return {
    title: `${label} flow`,
    focus,
    items,
    minutes: Math.round(totalSeconds(items) / 60),
    kcal: estimateKcal(items),
    reasons,
  };
}
