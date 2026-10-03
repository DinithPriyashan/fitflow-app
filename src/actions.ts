import { AppState, PlanItem, Session } from './types';
import { dateKey, uid } from './util';
import { estimateKcal } from './ai/dailyFlow';
import { milestones } from './store';

/** Saves a finished workout, optionally shares it with the user's circles, and reports newly earned milestones. */
export function recordSession(
  state: AppState, title: string, items: PlanItem[], secondsDone: number, source: Session['source'],
): { next: AppState; newMilestones: string[] } {
  const planned = items.reduce((s, i) => s + i.work + i.rest, 0);
  const ratio = planned ? Math.min(1, secondsDone / planned) : 1;
  const session: Session = {
    id: uid('s'),
    date: dateKey(),
    title,
    minutes: Math.max(1, Math.round(secondsDone / 60)),
    kcal: Math.round(estimateKcal(items) * ratio),
    source,
  };
  const before = new Set(milestones(state).filter((m) => m.done).map((m) => m.id));
  let next: AppState = { ...state, history: [...state.history, session] };
  if (state.settings.shareWorkouts) {
    const target = state.circles.find((c) => c.joined);
    if (target) {
      next = {
        ...next,
        posts: [
          { id: uid('p'), circleId: target.id, author: state.profile?.name ?? 'Me', text: `Finished "${title}" (${session.minutes} min). `, at: Date.now(), cheers: 0, cheered: false, mine: true },
          ...next.posts,
        ],
      };
    }
  }
  const earned = milestones(next).filter((m) => m.done && !before.has(m.id)).map((m) => `${m.emoji} ${m.title}`);
  return { next, newMilestones: earned };
}
