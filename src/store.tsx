import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultDaily, initialState } from './data/seed';
import { AppState } from './types';
import { dateKey, daysAgoKey } from './util';

const KEY = 'fitflow.state.v2';

interface Ctx {
  state: AppState;
  ready: boolean;
  update: (fn: (s: AppState) => AppState) => void;
  reset: () => Promise<void>;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw) as AppState;
          const base = initialState();
          const merged: AppState = { ...base, ...saved, settings: { ...base.settings, ...saved.settings } };
          // new day -> reset the daily plan adjustments
          if (merged.daily.date !== dateKey()) merged.daily = defaultDaily(merged.profile?.minutes ?? 25);
          setState(merged);
        }
      } catch {
        // storage unavailable: app still works in memory
      } finally {
        loaded.current = true;
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);

  const reset = useCallback(async () => {
    try { await AsyncStorage.removeItem(KEY); } catch {}
    setState(initialState());
  }, []);

  const value = useMemo(() => ({ state, ready, update, reset }), [state, ready, update, reset]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Ctx {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('StoreProvider missing');
  return c;
}

// ---------- derived data ----------

export function computeStreak(state: AppState): number {
  const days = new Set(state.history.map((h) => h.date));
  let streak = 0;
  let offset = days.has(dateKey()) ? 0 : 1; // today not done yet doesn't break the streak
  while (days.has(daysAgoKey(offset))) { streak++; offset++; }
  return streak;
}

export function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => daysAgoKey(n - 1 - i));
}

export function weekStats(state: AppState) {
  const days = lastNDays(7);
  const perDay = days.map((d) => state.history.filter((h) => h.date === d).reduce((s, h) => s + h.minutes, 0));
  const sessions = state.history.filter((h) => days.includes(h.date));
  const mealDays = new Set(state.meals.filter((m) => days.includes(m.date)).map((m) => m.date)).size;
  return {
    days,
    perDay,
    sessions: sessions.length,
    minutes: perDay.reduce((a, b) => a + b, 0),
    kcalBurned: sessions.reduce((s, h) => s + h.kcal, 0),
    mealDays,
  };
}

export interface Milestone { id: string; title: string; emoji: string; done: boolean }

export function milestones(state: AppState): Milestone[] {
  const total = state.history.length;
  const minutes = state.history.reduce((s, h) => s + h.minutes, 0);
  const streak = computeStreak(state);
  return [
    { id: 'm1', title: 'First workout', emoji: '🌱', done: total >= 1 },
    { id: 'm2', title: '3-day streak', emoji: '🔥', done: streak >= 3 },
    { id: 'm3', title: '5 workouts', emoji: '💪', done: total >= 5 },
    { id: 'm4', title: '100 active minutes', emoji: '⏱️', done: minutes >= 100 },
    { id: 'm5', title: 'First meal logged', emoji: '🥗', done: state.meals.length >= 1 },
    { id: 'm6', title: '7-day streak', emoji: '🏆', done: streak >= 7 },
  ];
}
