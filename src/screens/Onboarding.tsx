import React, { useState } from 'react';
import { Image, TextInput, View } from 'react-native';
import { Body, Button, Card, Chip, H1, H2, Screen, Wrap } from '../components/ui';
import { defaultDaily } from '../data/seed';
import { useStore } from '../store';
import { useColors } from '../theme';
import { Equip, Goal, Level } from '../types';

const GOALS: { id: Goal; label: string }[] = [
  { id: 'move', label: 'Move more' },
  { id: 'lose', label: 'Lose weight' },
  { id: 'build', label: 'Build strength' },
  { id: 'stamina', label: 'Boost stamina' },
];
const LEVELS: { id: Level; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];
const EQUIP: { id: Equip; label: string }[] = [
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'bands', label: 'Resistance bands' },
];

/** Three quick questions instead of a long form – research showed 68% dropped after onboarding. */
export default function Onboarding() {
  const c = useColors();
  const { update } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<Goal>('move');
  const [level, setLevel] = useState<Level>('beginner');
  const [minutes, setMinutes] = useState(20);
  const [equipment, setEquipment] = useState<Equip[]>([]);

  const finish = () => {
    update((s) => ({
      ...s,
      profile: { name: name.trim() || 'Friend', goal, level, minutes, equipment, onboarded: true },
      daily: defaultDaily(minutes),
      settings: { ...s.settings, calorieGoal: goal === 'lose' ? 1900 : goal === 'build' ? 2600 : 2200 },
    }));
  };

  return (
    <Screen>
      <Image source={require('../../assets/icon.png')} accessibilityLabel="FitFlow logo" style={{ width: 64, height: 64, borderRadius: 16, marginTop: 12, marginBottom: 8 }} />
      <H1>Welcome to FitFlow</H1>
      <Body dim>Three quick questions and your first plan is ready. Step {step + 1} of 3.</Body>

      {step === 0 && (
        <Card style={{ marginTop: 16 }}>
          <H2 style={{ marginTop: 0 }}>What should we call you?</H2>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your first name"
            placeholderTextColor={c.sub}
            accessibilityLabel="Your first name"
            style={{ borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 12, color: c.ink, fontSize: 16 }}
          />
          <H2>What is your main goal?</H2>
          <Wrap>{GOALS.map((g) => <Chip key={g.id} label={g.label} selected={goal === g.id} onPress={() => setGoal(g.id)} />)}</Wrap>
          <Button title="Next" onPress={() => setStep(1)} style={{ marginTop: 12 }} />
        </Card>
      )}

      {step === 1 && (
        <Card style={{ marginTop: 16 }}>
          <H2 style={{ marginTop: 0 }}>Your fitness level</H2>
          <Wrap>{LEVELS.map((l) => <Chip key={l.id} label={l.label} selected={level === l.id} onPress={() => setLevel(l.id)} />)}</Wrap>
          <H2>Equipment you have (optional)</H2>
          <Wrap>
            {EQUIP.map((e) => (
              <Chip
                key={e.id}
                label={e.label}
                selected={equipment.includes(e.id)}
                onPress={() => setEquipment((cur) => (cur.includes(e.id) ? cur.filter((x) => x !== e.id) : [...cur, e.id]))}
              />
            ))}
          </Wrap>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Button title="Back" variant="secondary" onPress={() => setStep(0)} style={{ flex: 1 }} />
            <Button title="Next" onPress={() => setStep(2)} style={{ flex: 1 }} />
          </View>
        </Card>
      )}

      {step === 2 && (
        <Card style={{ marginTop: 16 }}>
          <H2 style={{ marginTop: 0 }}>How much time do you usually have?</H2>
          <Wrap>{[10, 15, 20, 30, 45].map((m) => <Chip key={m} label={`${m} min`} selected={minutes === m} onPress={() => setMinutes(m)} />)}</Wrap>
          <Body dim style={{ marginTop: 8 }}>Irregular schedule? You can change today's time any time from the Home screen.</Body>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Button title="Back" variant="secondary" onPress={() => setStep(1)} style={{ flex: 1 }} />
            <Button title="Start my first plan" onPress={finish} style={{ flex: 2 }} />
          </View>
        </Card>
      )}
      <Body dim style={{ marginTop: 8, fontSize: 12 }}>
        FitFlow gives general fitness guidance, not medical advice. Check with a professional before starting a new programme.
      </Body>
    </Screen>
  );
}
