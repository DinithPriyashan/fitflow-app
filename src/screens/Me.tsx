import React, { useState } from 'react';
import { Linking, Platform, Share, Switch, Text, View } from 'react-native';
import { Bar, Body, Button, Card, Chip, Confirm, H1, H2, Row, Screen, Sheet } from '../components/ui';
import { APP_VERSION, PRIVACY_POLICY_URL, SUPPORT_EMAIL } from '../config';
import { computeStreak, milestones, useStore, weekStats } from '../store';
import { useColors } from '../theme';

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function Me() {
  const c = useColors();
  const { state, update, reset } = useStore();
  const [seg, setSeg] = useState<'progress' | 'settings'>('progress');
  const [delOpen, setDelOpen] = useState(false);
  const [info, setInfo] = useState('');
  const week = weekStats(state);
  const ms = milestones(state);
  const streak = computeStreak(state);
  const maxMin = Math.max(30, ...week.perDay);
  const s = state.settings;

  const setSetting = (patch: Partial<typeof s>) => update((st) => ({ ...st, settings: { ...st.settings, ...patch } }));

  const exportData = async () => {
    const json = JSON.stringify({ exportedAt: new Date().toISOString(), profile: state.profile, history: state.history, meals: state.meals, custom: state.custom, settings: state.settings }, null, 2);
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'fitflow-my-data.json'; a.click();
      URL.revokeObjectURL(url);
      setInfo('Your data was downloaded as fitflow-my-data.json.');
    } else {
      try { await Share.share({ message: json, title: 'FitFlow – my data' }); } catch { setInfo('Could not share your data.'); }
    }
  };

  const Toggle = ({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) => (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 10 }}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: c.ink, fontWeight: '700' }}>{label}</Text>
        <Body dim style={{ fontSize: 13 }}>{hint}</Body>
      </View>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={label} trackColor={{ true: c.accent, false: c.line }} />
    </Row>
  );

  return (
    <Screen>
      <H1>Me</H1>
      <Row style={{ marginVertical: 8 }}>
        <Chip role="tab" label="Progress" selected={seg === 'progress'} onPress={() => setSeg('progress')} />
        <Chip role="tab" label="Settings & privacy" selected={seg === 'settings'} onPress={() => setSeg('settings')} />
      </Row>

      {seg === 'progress' && (
        <>
          <Card tone="soft">
            <Text style={{ color: c.ink, fontSize: 20, fontWeight: '800' }}>
              {streak >= 3 ? `🔥 ${streak}-day streak. You’re on fire!` : week.sessions > 0 ? '🌟 You showed up this week. That counts.' : '🌱 Your first workout is one tap away.'}
            </Text>
            <Body dim style={{ marginTop: 4 }}>{week.sessions} workout{week.sessions === 1 ? "" : "s"} · {week.minutes} min · ~{week.kcalBurned} kcal burned in the last 7 days</Body>
          </Card>

          <H2>Active minutes</H2>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130 }}>
              {week.days.map((d, i) => {
                const v = week.perDay[i];
                return (
                  <View key={d} style={{ flex: 1, alignItems: 'center' }} accessible accessibilityLabel={`${d}: ${v} minutes`}>
                    <Text style={{ color: c.sub, fontSize: 11 }}>{v || ''}</Text>
                    <View style={{ width: 22, height: Math.max(4, (v / maxMin) * 90), borderRadius: 6, backgroundColor: v ? c.primary : c.line, marginVertical: 4 }} />
                    <Text style={{ color: c.sub, fontSize: 12 }}>{DOW[new Date(d + 'T12:00:00').getDay()]}</Text>
                  </View>
                );
              })}
            </View>
          </Card>

          <H2>Milestones</H2>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {ms.map((m) => (
              <View key={m.id} accessible accessibilityLabel={`${m.title}, ${m.done ? 'earned' : 'locked'}`}
                style={{ width: '31%', minWidth: 96, flexGrow: 1, padding: 12, borderRadius: 14, alignItems: 'center', backgroundColor: m.done ? c.soft : c.card, borderWidth: 1, borderColor: m.done ? c.primary : c.line, opacity: m.done ? 1 : 0.6 }}>
                <Text style={{ fontSize: 28 }}>{m.done ? m.emoji : '🔒'}</Text>
                <Text style={{ color: c.ink, fontSize: 12, textAlign: 'center', fontWeight: '600', marginTop: 4 }}>{m.title}</Text>
              </View>
            ))}
          </View>
          <H2>Weekly goals</H2>
          <Card>
            <Body>Workouts: {week.sessions} / 4</Body><Bar value={week.sessions} max={4} color={c.primary} />
            <Body style={{ marginTop: 10 }}>Meal-log days: {week.mealDays} / 5</Body><Bar value={week.mealDays} max={5} />
          </Card>
        </>
      )}

      {seg === 'settings' && (
        <>
          <H2 style={{ marginTop: 4 }}>Your data, your choice</H2>
          <Card>
            <Toggle label="AI personalisation" hint="Use your history to tailor plans. Runs on your device. Off = plans use only your answers." value={s.personalisation} onChange={(v) => setSetting({ personalisation: v })} />
            <Toggle label="Share anonymous usage analytics" hint="Helps us fix problems. Never includes your name or meals." value={s.analytics} onChange={(v) => setSetting({ analytics: v })} />
            <Toggle label="Share finished workouts to my circle" hint="Posts a short note to your first circle. Health metrics are never shared." value={s.shareWorkouts} onChange={(v) => setSetting({ shareWorkouts: v })} />
            <Toggle label="Share anonymised wellness trends" hint="Aggregated, never identifies you. Optional, for partners such as gyms." value={s.shareTrends} onChange={(v) => setSetting({ shareTrends: v })} />
          </Card>

          <H2>Account</H2>
          <Card>
            <Body>{state.profile?.name} · {state.profile?.level} · goal: {state.profile?.goal}</Body>
            <Row style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <Button title="Export my data" variant="secondary" small onPress={exportData} />
              <Button title="Delete account & data" variant="danger" small onPress={() => setDelOpen(true)} />
            </Row>
          </Card>

          {state.blocked.length > 0 && (
            <Card>
              <Text style={{ color: c.ink, fontWeight: '700', marginBottom: 6 }}>Blocked people</Text>
              {state.blocked.map((b) => (
                <Row key={b} style={{ justifyContent: 'space-between' }}>
                  <Body>{b}</Body>
                  <Button title="Unblock" small variant="ghost" onPress={() => update((st) => ({ ...st, blocked: st.blocked.filter((x) => x !== b) }))} />
                </Row>
              ))}
            </Card>
          )}

          <H2>About</H2>
          <Card>
            <Body>FitFlow {APP_VERSION}</Body>
            <Row style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <Button title="Privacy policy" variant="secondary" small onPress={() => Linking.openURL(PRIVACY_POLICY_URL).catch(() => setInfo(`Open ${PRIVACY_POLICY_URL}`))} />
              <Button title="Contact support" variant="secondary" small onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => setInfo(`Email ${SUPPORT_EMAIL}`))} />
            </Row>
            <Body dim style={{ fontSize: 12, marginTop: 12 }}>
              FitFlow provides general fitness and nutrition information and is not a substitute for professional medical advice. AI suggestions and food recognition are estimates and may not suit everyone.
            </Body>
          </Card>
        </>
      )}

      <Confirm visible={delOpen} title="Delete everything?" message="This permanently removes your profile, workouts, meals and posts from this device. This cannot be undone." confirmLabel="Delete" danger
        onCancel={() => setDelOpen(false)} onConfirm={async () => { setDelOpen(false); await reset(); }} />
      <Sheet visible={!!info} title="Info" message={info} onClose={() => setInfo('')}><Button title="OK" onPress={() => setInfo('')} /></Sheet>
    </Screen>
  );
}
