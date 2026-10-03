/**
 * Camera food recognition (demo implementation).
 *
 * The case study calls for computer-vision food logging (ML Kit / TensorFlow Lite).
 * To keep this project runnable everywhere (Android Studio and the browser) with no
 * native ML dependency, this module returns ranked candidates derived from the photo
 * so the full UX flow works: capture -> suggestions with confidence -> user confirms
 * or edits -> saved. Replace `recognise` with a real model call for production.
 */
import { FOODS } from '../data/foods';
import { FoodItem } from '../types';

export interface Candidate { food: FoodItem; confidence: number }

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export async function recognise(imageKey: string): Promise<Candidate[]> {
  await new Promise((r) => setTimeout(r, 900)); // simulated on-device inference time
  const h = hash(imageKey || String(Date.now()));
  const picks: FoodItem[] = [];
  // Demo hint: if the photo's file name contains a food word (e.g. "rice_and_curry.jpg"), that food ranks first.
  // Real camera photos have no such name and fall back to the generic suggestions below.
  const name = (imageKey || '').toLowerCase();
  const hinted = FOODS.find((f) => f.id.split('-').some((w) => w.length > 3 && name.includes(w)));
  if (hinted) picks.push(hinted);
  let k = h;
  while (picks.length < 3) {
    const f = FOODS[k % FOODS.length];
    if (!picks.includes(f)) picks.push(f);
    k = Math.imul(k, 1103515245) + 12345 >>> 0;
  }
  const top = hinted ? 0.93 : 0.78 + (h % 15) / 100;
  return [
    { food: picks[0], confidence: top },
    { food: picks[1], confidence: (1 - top) * 0.6 },
    { food: picks[2], confidence: (1 - top) * 0.4 },
  ];
}
