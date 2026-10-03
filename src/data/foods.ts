import { FoodItem } from '../types';

// Small built-in food list (per serving). A real build would call a nutrition database.
export const FOODS: FoodItem[] = [
  { id: 'rice-curry', name: 'Rice & curry plate', kcal: 620, protein: 22, carbs: 90, fat: 18, serving: '1 plate' },
  { id: 'dosa', name: 'Plain dosa', kcal: 168, protein: 4, carbs: 29, fat: 4, serving: '1 dosa' },
  { id: 'egg-roti', name: 'Egg roti', kcal: 290, protein: 11, carbs: 35, fat: 11, serving: '1 roti' },
  { id: 'kottu', name: 'Chicken kottu', kcal: 710, protein: 32, carbs: 85, fat: 24, serving: '1 plate' },
  { id: 'hoppers', name: 'Egg hopper', kcal: 130, protein: 5, carbs: 17, fat: 5, serving: '1 hopper' },
  { id: 'dhal', name: 'Dhal curry', kcal: 180, protein: 10, carbs: 24, fat: 5, serving: '1 cup' },
  { id: 'oatmeal', name: 'Oatmeal with banana', kcal: 280, protein: 8, carbs: 52, fat: 5, serving: '1 bowl' },
  { id: 'banana', name: 'Banana', kcal: 105, protein: 1, carbs: 27, fat: 0, serving: '1 medium' },
  { id: 'apple', name: 'Apple', kcal: 95, protein: 0, carbs: 25, fat: 0, serving: '1 medium' },
  { id: 'salad', name: 'Garden salad', kcal: 120, protein: 3, carbs: 12, fat: 7, serving: '1 bowl' },
  { id: 'grilled-chicken', name: 'Grilled chicken breast', kcal: 230, protein: 43, carbs: 0, fat: 5, serving: '150 g' },
  { id: 'fish-curry', name: 'Fish curry', kcal: 210, protein: 24, carbs: 5, fat: 10, serving: '1 serving' },
  { id: 'egg-boiled', name: 'Boiled egg', kcal: 78, protein: 6, carbs: 1, fat: 5, serving: '1 egg' },
  { id: 'yogurt', name: 'Plain yogurt', kcal: 100, protein: 9, carbs: 8, fat: 3, serving: '1 cup' },
  { id: 'sandwich', name: 'Chicken sandwich', kcal: 380, protein: 24, carbs: 40, fat: 13, serving: '1 sandwich' },
  { id: 'pasta', name: 'Pasta with tomato sauce', kcal: 450, protein: 14, carbs: 78, fat: 9, serving: '1 plate' },
  { id: 'pizza', name: 'Pizza slice', kcal: 285, protein: 12, carbs: 36, fat: 10, serving: '1 slice' },
  { id: 'burger', name: 'Burger', kcal: 540, protein: 28, carbs: 40, fat: 28, serving: '1 burger' },
  { id: 'fried-rice', name: 'Fried rice', kcal: 520, protein: 14, carbs: 80, fat: 16, serving: '1 plate' },
  { id: 'smoothie', name: 'Fruit smoothie', kcal: 190, protein: 4, carbs: 42, fat: 2, serving: '1 glass' },
  { id: 'tea-milk', name: 'Milk tea', kcal: 70, protein: 2, carbs: 10, fat: 2, serving: '1 cup' },
  { id: 'nuts', name: 'Mixed nuts', kcal: 170, protein: 5, carbs: 6, fat: 15, serving: '30 g' },
];
