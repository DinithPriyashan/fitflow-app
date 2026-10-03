export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'lose' | 'build' | 'stamina' | 'move';
export type Equip = 'none' | 'dumbbells' | 'bands';
export type Muscle = 'legs' | 'push' | 'pull' | 'core' | 'cardio' | 'mobility';

export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  level: Level;
  equip: Equip;
  seconds: number; // default work time
  kcalPerMin: number;
  cue: string;
}

export interface PlanItem {
  exerciseId: string;
  work: number; // seconds
  rest: number; // seconds
}

export interface Profile {
  name: string;
  goal: Goal;
  level: Level;
  minutes: number; // typical time available
  equipment: Equip[];
  onboarded: boolean;
}

export interface CustomWorkout {
  id: string;
  name: string;
  items: PlanItem[];
}

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  minutes: number;
  kcal: number;
  source: 'daily' | 'custom';
}

export interface FoodItem {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

export interface Meal {
  id: string;
  date: string;
  time: string; // HH:MM
  food: FoodItem;
  servings: number;
  via: 'camera' | 'manual';
}

export interface Circle {
  id: string;
  name: string;
  about: string;
  code: string;
  members: number;
  joined: boolean;
  mine: boolean;
}

export interface Post {
  id: string;
  circleId: string;
  author: string;
  text: string;
  at: number; // epoch ms
  cheers: number;
  cheered: boolean;
  mine: boolean;
}

export interface Settings {
  personalisation: boolean;
  analytics: boolean;
  shareWorkouts: boolean;
  shareTrends: boolean;
  calorieGoal: number;
}

export interface DailyState {
  date: string;
  minutes: number;
  intensity: -1 | 0 | 1;
  focus: Muscle | null;
  skips: number;
}

export interface AppState {
  profile: Profile | null;
  daily: DailyState;
  custom: CustomWorkout[];
  history: Session[];
  meals: Meal[];
  circles: Circle[];
  posts: Post[];
  challengesJoined: string[];
  blocked: string[];
  settings: Settings;
}
