import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import DragList from '../components/DragList';
import WorkoutPlayer from '../components/WorkoutPlayer';
import { Body, Button, Card, Celebration, Chip, Confirm, H1, H2, Row, Screen, Wrap } from '../components/ui';
import { EXERCISES, EX_BY_ID, MUSCLE_LABEL } from '../data/exercises';
import { estimateKcal, totalSeconds } from '../ai/dailyFlow';
import { recordSession } from '../actions';
import { useStore } from '../store';
import { useColors } from '../theme';
import { CustomWorkout, Muscle, PlanItem } from '../types';
import { uid } from '../util';

const ROW = 60;

export default function Workouts() {
  const c = useColors();
  const { state, update } = useStore();
  const [editing, setEditing] = useState<CustomWorkout | null>(null);
  const [filter, setFilter] = useState<Muscle | 'all'>('all');
  const [playing, setPlaying] = useState<CustomWorkout | null>(null);
  const [del, setDel] = useState<CustomWorkout | null>(null);
  const [cele, setCele] = useState<string | null>(null);

  const equip = new Set(['none', ...(state.profile?.equipment ?? [])]);
  const library = EXERCISES.filter((e) => equip.has(e.equip) && (filter === 'all' || e.muscle === filter));

  const save = () => {
    if (!editing) return;
    const w: CustomWorkout = { ...editing, name: editing.name.trim() || 'My workout' };
    update((s) => ({ ...s, custom: s.custom.some((x) => x.id === w.id) ? s.custom.map((x) => (x.id === w.id ? w : x)) : [...s.custom, w] }));
    setEditing(null);
  };
  const move = (from: number, to: number) => setEditing((w) => {
    if (!w) return w;
    const items = [...w.items];
    const [it] = items.splice(from, 1);
    items.splice(to, 0, it);
    return { ...w, items };
  });
  const setWork = (i: number, delta: number) => setEditing((w) => w && ({
    ...w, items: w.items.map((it, k) => (k === i ? { ...it, work: Math.max(15, Math.min(120, it.work + delta)) } : it)),
  }));

  if (editing) {
    const mins = Math.round(totalSeconds(editing.items) / 60);
    return (
      <Screen>
        <H1>{state.custom.some((x) => x.id === editing.id) ? 'Edit workout' : 'Workout builder'}</H1>
        <Body dim>Add moves, then drag ⠿ (or use ↑ ↓) to reorder. {editing.items.length} moves · {mins} min · ~{estimateKcal(editing.items)} kcal</Body>
        <TextInput
          value={editing.name}
          onChangeText={(t) => setEditing({ ...editing, name: t })}
          placeholder="Workout name"
          placeholderTextColor={c.sub}
          accessibilityLabel="Workout name"
          style={{ borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 12, color: c.ink, fontSize: 16, marginVertical: 12, backgroundColor: c.card }}
        />
        {editing.items.length === 0 ? (
          <Card><Body dim>No moves yet. Pick some below.</Body></Card>
        ) : (
          <DragList
            count={editing.items.length}
            rowHeight={ROW}
            onMove={move}
            renderRow={(i) => {
              const it = editing.items[i];
              return (
                <Row style={{ justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ color: c.ink, fontWeight: '700' }}>{EX_BY_ID[it.exerciseId].name}</Text>
                    <Row>
                      <Pressable accessibilityLabel="Less time" onPress={() => setWork(i, -5)} style={{ padding: 6 }}><Text style={{ color: c.primary, fontWeight: '800' }}>−</Text></Pressable>
                      <Text style={{ color: c.sub }}>{it.work}s</Text>
                      <Pressable accessibilityLabel="More time" onPress={() => setWork(i, 5)} style={{ padding: 6 }}><Text style={{ color: c.primary, fontWeight: '800' }}>+</Text></Pressable>
                    </Row>
                  </View>
                  <Row>
                    <Pressable accessibilityLabel="Move up" disabled={i === 0} onPress={() => move(i, i - 1)} style={{ padding: 8, opacity: i === 0 ? 0.3 : 1 }}><Text style={{ color: c.ink, fontSize: 18 }}>↑</Text></Pressable>
                    <Pressable accessibilityLabel="Move down" disabled={i === editing.items.length - 1} onPress={() => move(i, i + 1)} style={{ padding: 8, opacity: i === editing.items.length - 1 ? 0.3 : 1 }}><Text style={{ color: c.ink, fontSize: 18 }}>↓</Text></Pressable>
                    <Pressable accessibilityLabel="Remove move" onPress={() => setEditing({ ...editing, items: editing.items.filter((_, k) => k !== i) })} style={{ padding: 8 }}><Text style={{ color: c.danger, fontSize: 18 }}>✕</Text></Pressable>
                  </Row>
                </Row>
              );
            }}
          />
        )}
        <H2>Exercise library</H2>
        <Wrap>
          <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          {(Object.keys(MUSCLE_LABEL) as Muscle[]).map((m) => <Chip key={m} label={MUSCLE_LABEL[m]} selected={filter === m} onPress={() => setFilter(m)} />)}
        </Wrap>
        {library.map((e) => (
          <Pressable
            key={e.id}
            accessibilityRole="button"
            accessibilityLabel={`Add ${e.name}`}
            onPress={() => setEditing({ ...editing, items: [...editing.items, { exerciseId: e.id, work: e.seconds, rest: 15 }] })}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: c.line, minHeight: 48 }}
          >
            <View style={{ flex: 1 }}><Text style={{ color: c.ink, fontWeight: '600' }}>{e.name}</Text><Text style={{ color: c.sub, fontSize: 12 }}>{MUSCLE_LABEL[e.muscle]} · {e.level}</Text></View>
            <Text style={{ color: c.primary, fontWeight: '800', fontSize: 20 }}>＋</Text>
          </Pressable>
        ))}
        <Row style={{ gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => setEditing(null)} />
          <Button title="Save workout" style={{ flex: 2 }} disabled={editing.items.length === 0} onPress={save} />
        </Row>
      </Screen>
    );
  }

  return (
    <Screen>
      <H1>Your workouts</H1>
      <Body dim>Build your own sessions with drag and drop.</Body>
      <Button title="＋ New workout" onPress={() => setEditing({ id: uid('w'), name: '', items: [] })} style={{ marginVertical: 14 }} />
      {state.custom.length === 0 && <Card tone="soft"><Body>No saved workouts yet. Create one in under a minute.</Body></Card>}
      {state.custom.map((w) => (
        <Card key={w.id}>
          <Text style={{ color: c.ink, fontSize: 18, fontWeight: '800' }}>{w.name}</Text>
          <Body dim>{w.items.length} moves · {Math.round(totalSeconds(w.items) / 60)} min · ~{estimateKcal(w.items)} kcal</Body>
          <Row style={{ gap: 8, marginTop: 10 }}>
            <Button title="Start" small style={{ flex: 1 }} onPress={() => setPlaying(w)} />
            <Button title="Edit" small variant="secondary" style={{ flex: 1 }} onPress={() => setEditing(w)} />
            <Button title="Delete" small variant="ghost" onPress={() => setDel(w)} />
          </Row>
        </Card>
      ))}
      <WorkoutPlayer
        visible={!!playing}
        title={playing?.name ?? ''}
        items={playing?.items ?? ([] as PlanItem[])}
        onClose={() => setPlaying(null)}
        onFinish={(secs) => {
          const w = playing;
          setPlaying(null);
          if (!w || secs < 20) return;
          update((s) => recordSession(s, w.name, w.items, secs, 'custom').next);
          setCele(`${w.name} complete. Every win counts!`);
        }}
      />
      <Confirm visible={!!del} title="Delete workout?" message={`“${del?.name}” will be removed from this device.`} confirmLabel="Delete" danger
        onCancel={() => setDel(null)} onConfirm={() => { update((s) => ({ ...s, custom: s.custom.filter((x) => x.id !== del!.id) })); setDel(null); }} />
      <Celebration visible={!!cele} title="Workout complete!" subtitle={cele ?? ''} onClose={() => setCele(null)} />
    </Screen>
  );
}
