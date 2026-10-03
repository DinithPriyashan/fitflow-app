import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import WorkoutPlayer from '../components/WorkoutPlayer';
import { Body, Button, Card, Celebration, Chip, H1, H2, Row, Screen, Wrap } from '../components/ui';
import { EX_BY_ID, MUSCLE_LABEL } from '../data/exercises';
import { buildDailyFlow } from '../ai/dailyFlow';
import { recordSession } from '../actions';
import { computeStreak, useStore, weekStats } from '../store';
import { useColors } from '../theme';
import { Muscle } from '../types';

const FOCUS: Muscle[] = ['legs', 'push', 'pull', 'core', 'cardio'];

export default function Home() {
  const c = useColors();
  const { state, update } = useStore();
  const profile = state.profile!;
  const [why, setWhy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [cele, setCele] = useState<{ title: string; sub: string } | null>(null);

  const flow = useMemo(
    () => buildDailyFlow(profile, state.daily, state.history),
    // history length is enough to refresh the rotation after a workout
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, state.daily, state.history.length],
  );
  const streak = computeStreak(state);
  const week = weekStats(state);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const doneToday = week.perDay[6] > 0;

  const setDaily = (patch: Partial<typeof state.daily>) => update((s) => ({ ...s, daily: { ...s.daily, ...patch } }));

  const finish = (secs: number) => {
    setPlaying(false);
    if (secs < 20) return;
    let earned: string[] = [];
    update((s) => {
      const r = recordSession(s, flow.title, flow.items, secs, 'daily');
      earned = r.newMilestones;
      return r.next;
    });
    const mins = Math.max(1, Math.round(secs / 60));
    setCele({
      title: earned.length ? 'New milestone!' : 'Workout complete!',
      sub: earned.length ? earned.join('  ·  ') : `${mins} minutes done. Every win counts, ${profile.name}.`,
    });
  };

  return (
    <Screen>
      <H1>{greet}, {profile.name} 👋</H1>
      <Body dim>{doneToday ? 'Today’s workout is done. Nice work.' : 'Here’s a plan that fits your day.'}</Body>

      <Row style={{ gap: 10, marginTop: 14 }}>
        <Card style={{ flex: 1, marginBottom: 0 }} tone="soft"><Text style={{ fontSize: 22 }}>🔥</Text><Text style={{ color: c.ink, fontSize: 22, fontWeight: '800' }}>{streak}</Text><Body dim>day streak</Body></Card>
        <Card style={{ flex: 1, marginBottom: 0 }} tone="accent"><Text style={{ fontSize: 22 }}>⏱️</Text><Text style={{ color: c.ink, fontSize: 22, fontWeight: '800' }}>{week.minutes}</Text><Body dim>min this week</Body></Card>
      </Row>

      {/* AI Daily Flow card */}
      <Card style={{ marginTop: 16, borderColor: c.primary, borderWidth: 2 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: c.primary, fontWeight: '800', letterSpacing: 1 }}>✨ DAILY FLOW</Text>
          <Body dim>{flow.minutes} min · ~{flow.kcal} kcal</Body>
        </Row>
        <Text accessibilityRole="header" style={{ color: c.ink, fontSize: 24, fontWeight: '800', marginTop: 6 }}>{flow.title}</Text>
        <View style={{ marginTop: 8 }}>
          {flow.items.map((it, i) => (
            <Row key={i} style={{ justifyContent: 'space-between', paddingVertical: 4 }}>
              <Body>{i + 1}. {EX_BY_ID[it.exerciseId].name}</Body>
              <Body dim>{it.work}s</Body>
            </Row>
          ))}
        </View>
        <Button title="Start workout" onPress={() => setPlaying(true)} style={{ marginTop: 12 }} />
        <Row style={{ gap: 8, marginTop: 8 }}>
          <Button title="Not today – show another" variant="secondary" small style={{ flex: 1 }} onPress={() => setDaily({ skips: state.daily.skips + 1 })} />
          <Button title={why ? 'Hide why' : 'Why this plan?'} variant="ghost" small onPress={() => setWhy(!why)} />
        </Row>
        {why && (
          <View style={{ marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: c.softAccent }}>
            {flow.reasons.map((r, i) => <Body key={i} style={{ marginBottom: 4 }}>• {r}</Body>)}
            <Body dim style={{ fontSize: 12, marginTop: 4 }}>
              {state.settings.personalisation ? 'Personalisation is on. Plans run on your device.' : 'Personalisation is off in Settings, plans use only your answers.'}
            </Body>
          </View>
        )}
      </Card>

      {/* user control over AI */}
      <H2>You’re in control</H2>
      <Card>
        <Body dim style={{ marginBottom: 6 }}>Time you have today</Body>
        <Wrap>{[10, 15, 20, 30, 45].map((m) => <Chip key={m} label={`${m} min`} selected={state.daily.minutes === m} onPress={() => setDaily({ minutes: m })} />)}</Wrap>
        <Body dim style={{ marginVertical: 6 }}>Intensity</Body>
        <Wrap>
          <Chip label="Easier" selected={state.daily.intensity === -1} onPress={() => setDaily({ intensity: state.daily.intensity === -1 ? 0 : -1 })} />
          <Chip label="Just right" selected={state.daily.intensity === 0} onPress={() => setDaily({ intensity: 0 })} />
          <Chip label="Harder" selected={state.daily.intensity === 1} onPress={() => setDaily({ intensity: state.daily.intensity === 1 ? 0 : 1 })} />
        </Wrap>
        <Body dim style={{ marginVertical: 6 }}>Focus</Body>
        <Wrap>
          <Chip label="Auto" selected={!state.daily.focus} onPress={() => setDaily({ focus: null })} />
          {FOCUS.map((f) => <Chip key={f} label={MUSCLE_LABEL[f]} selected={state.daily.focus === f} onPress={() => setDaily({ focus: f })} />)}
        </Wrap>
      </Card>

      <WorkoutPlayer visible={playing} title={flow.title} items={flow.items} onFinish={finish} onClose={() => setPlaying(false)} />
      <Celebration visible={!!cele} title={cele?.title ?? ''} subtitle={cele?.sub ?? ''} onClose={() => setCele(null)} />
    </Screen>
  );
}
