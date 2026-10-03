import { AppState, Circle, DailyState, Post, Settings } from '../types';
import { dateKey } from '../util';

export const defaultSettings: Settings = {
  personalisation: true,
  analytics: false,
  shareWorkouts: false,
  shareTrends: false,
  calorieGoal: 2200,
};

export function defaultDaily(minutes = 25): DailyState {
  return { date: dateKey(), minutes, intensity: 0, focus: null, skips: 0 };
}

const circles: Circle[] = [
  { id: 'c1', name: 'Morning Movers', about: 'Early workouts, gentle encouragement.', code: 'MORN24', members: 14, joined: false, mine: false },
  { id: 'c2', name: 'Beginners Together', about: 'Safe space for people starting out.', code: 'BEGIN7', members: 38, joined: false, mine: false },
  { id: 'c3', name: 'Desk Warriors', about: 'Quick sessions for busy workdays.', code: 'DESK99', members: 22, joined: false, mine: false },
];

const now = Date.now();
const posts: Post[] = [
  { id: 'p1', circleId: 'c1', author: 'Nadee', text: 'Finished a 20 min flow before breakfast. Small win!', at: now - 1000 * 60 * 42, cheers: 6, cheered: false, mine: false },
  { id: 'p2', circleId: 'c2', author: 'Kasun', text: 'Day 3 of my first streak. Legs are sore but I showed up.', at: now - 1000 * 60 * 60 * 3, cheers: 11, cheered: false, mine: false },
  { id: 'p3', circleId: 'c2', author: 'Ishara', text: 'Tip: I set my workout clothes out the night before. It works.', at: now - 1000 * 60 * 60 * 9, cheers: 8, cheered: false, mine: false },
  { id: 'p4', circleId: 'c3', author: 'Dilan', text: 'Meeting-heavy day, still squeezed in 10 minutes of core.', at: now - 1000 * 60 * 60 * 20, cheers: 4, cheered: false, mine: false },
];

export function initialState(): AppState {
  return {
    profile: null,
    daily: defaultDaily(),
    custom: [],
    history: [],
    meals: [],
    circles,
    posts,
    challengesJoined: [],
    blocked: [],
    settings: defaultSettings,
  };
}

export const CHALLENGES = [
  { id: 'ch1', title: 'Move 5 days this week', kind: 'sessions' as const, target: 5, emoji: '🔥' },
  { id: 'ch2', title: '150 active minutes', kind: 'minutes' as const, target: 150, emoji: '⏱️' },
  { id: 'ch3', title: 'Log meals 5 days', kind: 'mealDays' as const, target: 5, emoji: '🥗' },
];
