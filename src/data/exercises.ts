import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  { id: 'cat-cow', name: 'Cat–Cow Stretch', muscle: 'mobility', level: 'beginner', equip: 'none', seconds: 45, kcalPerMin: 2.5, cue: 'Move slowly with your breath.' },
  { id: 'hip-circles', name: 'Hip Circles', muscle: 'mobility', level: 'beginner', equip: 'none', seconds: 40, kcalPerMin: 2.5, cue: 'Big, controlled circles each way.' },
  { id: 'child-pose', name: "Child's Pose", muscle: 'mobility', level: 'beginner', equip: 'none', seconds: 45, kcalPerMin: 1.5, cue: 'Sink back and breathe out.' },
  { id: 'hamstring', name: 'Hamstring Stretch', muscle: 'mobility', level: 'beginner', equip: 'none', seconds: 40, kcalPerMin: 1.5, cue: 'Hinge forward, keep your back long.' },

  { id: 'squat', name: 'Bodyweight Squat', muscle: 'legs', level: 'beginner', equip: 'none', seconds: 40, kcalPerMin: 7, cue: 'Chest up, knees track over toes.' },
  { id: 'lunge', name: 'Reverse Lunge', muscle: 'legs', level: 'beginner', equip: 'none', seconds: 40, kcalPerMin: 7, cue: 'Step back softly, drive through the front heel.' },
  { id: 'glute-bridge', name: 'Glute Bridge', muscle: 'legs', level: 'beginner', equip: 'none', seconds: 40, kcalPerMin: 5, cue: 'Squeeze at the top for one second.' },
  { id: 'jump-squat', name: 'Jump Squat', muscle: 'legs', level: 'advanced', equip: 'none', seconds: 35, kcalPerMin: 11, cue: 'Land quietly, reset each rep.' },
  { id: 'goblet-squat', name: 'Goblet Squat', muscle: 'legs', level: 'intermediate', equip: 'dumbbells', seconds: 40, kcalPerMin: 8, cue: 'Hold the weight at your chest.' },
  { id: 'band-squat', name: 'Banded Squat', muscle: 'legs', level: 'intermediate', equip: 'bands', seconds: 40, kcalPerMin: 7.5, cue: 'Push knees gently out against the band.' },

  { id: 'wall-pushup', name: 'Wall Push-up', muscle: 'push', level: 'beginner', equip: 'none', seconds: 40, kcalPerMin: 4, cue: 'Body in one straight line.' },
  { id: 'knee-pushup', name: 'Knee Push-up', muscle: 'push', level: 'beginner', equip: 'none', seconds: 40, kcalPerMin: 5, cue: 'Lower chest between your hands.' },
  { id: 'pushup', name: 'Push-up', muscle: 'push', level: 'intermediate', equip: 'none', seconds: 40, kcalPerMin: 7, cue: 'Elbows about 45° from your body.' },
  { id: 'pike-pushup', name: 'Pike Push-up', muscle: 'push', level: 'advanced', equip: 'none', seconds: 35, kcalPerMin: 7.5, cue: 'Hips high, head moves between your hands.' },
  { id: 'db-press', name: 'Dumbbell Floor Press', muscle: 'push', level: 'intermediate', equip: 'dumbbells', seconds: 40, kcalPerMin: 6, cue: 'Press smoothly, pause at the floor.' },

  { id: 'superman', name: 'Superman Hold', muscle: 'pull', level: 'beginner', equip: 'none', seconds: 35, kcalPerMin: 3.5, cue: 'Lift arms and legs a little, neck neutral.' },
  { id: 'band-row', name: 'Banded Row', muscle: 'pull', level: 'beginner', equip: 'bands', seconds: 40, kcalPerMin: 5, cue: 'Pull elbows back, squeeze shoulder blades.' },
  { id: 'db-row', name: 'One-arm Dumbbell Row', muscle: 'pull', level: 'intermediate', equip: 'dumbbells', seconds: 40, kcalPerMin: 6, cue: 'Flat back, row to your hip.' },
  { id: 'reverse-snow', name: 'Reverse Snow Angel', muscle: 'pull', level: 'intermediate', equip: 'none', seconds: 35, kcalPerMin: 4, cue: 'Sweep arms wide, thumbs up.' },

  { id: 'dead-bug', name: 'Dead Bug', muscle: 'core', level: 'beginner', equip: 'none', seconds: 40, kcalPerMin: 4, cue: 'Keep your lower back pressed down.' },
  { id: 'plank', name: 'Forearm Plank', muscle: 'core', level: 'beginner', equip: 'none', seconds: 30, kcalPerMin: 4.5, cue: 'Squeeze glutes, breathe steadily.' },
  { id: 'bicycle', name: 'Bicycle Crunch', muscle: 'core', level: 'intermediate', equip: 'none', seconds: 40, kcalPerMin: 6, cue: 'Slow and controlled, elbow to opposite knee.' },
  { id: 'mountain-climber', name: 'Mountain Climber', muscle: 'core', level: 'advanced', equip: 'none', seconds: 35, kcalPerMin: 10, cue: 'Hands under shoulders, drive knees fast.' },

  { id: 'march', name: 'Marching in Place', muscle: 'cardio', level: 'beginner', equip: 'none', seconds: 45, kcalPerMin: 4.5, cue: 'Lift knees comfortably, swing arms.' },
  { id: 'step-jack', name: 'Step Jacks', muscle: 'cardio', level: 'beginner', equip: 'none', seconds: 40, kcalPerMin: 6, cue: 'Low-impact jumping jacks, step side to side.' },
  { id: 'jacks', name: 'Jumping Jacks', muscle: 'cardio', level: 'intermediate', equip: 'none', seconds: 40, kcalPerMin: 9, cue: 'Soft landings, steady rhythm.' },
  { id: 'high-knees', name: 'High Knees', muscle: 'cardio', level: 'intermediate', equip: 'none', seconds: 35, kcalPerMin: 10, cue: 'Tall posture, quick feet.' },
  { id: 'burpee', name: 'Burpee', muscle: 'cardio', level: 'advanced', equip: 'none', seconds: 30, kcalPerMin: 12, cue: 'Smooth transitions; step back if needed.' },
];

export const EX_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export const MUSCLE_LABEL: Record<string, string> = {
  legs: 'Legs', push: 'Push', pull: 'Pull', core: 'Core', cardio: 'Cardio', mobility: 'Mobility',
};
