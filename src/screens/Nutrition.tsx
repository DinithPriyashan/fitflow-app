import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Bar, Body, Button, Card, Confirm, H1, H2, Row, Screen, Sheet } from '../components/ui';
import { FOODS } from '../data/foods';
import { Candidate, recognise } from '../ai/foodRecognizer';
import { useStore } from '../store';
import { useColors } from '../theme';
import { FoodItem, Meal } from '../types';
import { dateKey, timeNow, uid } from '../util';

export default function Nutrition() {
  const c = useColors();
  const { state, update } = useStore();
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cands, setCands] = useState<Candidate[] | null>(null);
  const [picked, setPicked] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [del, setDel] = useState<Meal | null>(null);
  const [manual, setManual] = useState(false);

  const today = state.meals.filter((m) => m.date === dateKey());
  const tot = today.reduce((a, m) => ({
    kcal: a.kcal + m.food.kcal * m.servings, p: a.p + m.food.protein * m.servings, cb: a.cb + m.food.carbs * m.servings, f: a.f + m.food.fat * m.servings,
  }), { kcal: 0, p: 0, cb: 0, f: 0 });
  const goal = state.settings.calorieGoal;

  const snap = async () => {
    try {
      let res: ImagePicker.ImagePickerResult;
      if (Platform.OS === 'web') {
        res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5 });
      } else {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) { setMsg('Camera permission was denied. You can still log meals by searching the list below.'); setManual(true); return; }
        res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.5 });
      }
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      setPhoto(a.uri); setBusy(true); setCands(null); setPicked(null); setServings(1);
      const list = await recognise(`${a.fileName ?? ''}|${a.fileSize ?? ''}|${a.width ?? ''}|${a.uri.slice(-24)}`);
      setCands(list); setPicked(list[0].food);
    } catch {
      setMsg('Could not open the camera. You can search for your meal instead.');
      setManual(true);
    } finally { setBusy(false); }
  };

  const save = (via: Meal['via']) => {
    if (!picked) return;
    update((s) => ({ ...s, meals: [...s.meals, { id: uid('m'), date: dateKey(), time: timeNow(), food: picked, servings, via }] }));
    setPhoto(null); setCands(null); setPicked(null); setServings(1); setManual(false); setSearch('');
  };

  const results = FOODS.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  const selecting = !!picked;

  return (
    <Screen>
      <H1>Nutrition</H1>
      <Body dim>Log a meal in two taps. Works offline.</Body>

      <Card style={{ marginTop: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: c.ink, fontSize: 28, fontWeight: '800' }}>{Math.round(tot.kcal)} <Text style={{ fontSize: 14, color: c.sub, fontWeight: '400' }}>/ {goal} kcal</Text></Text>
          <Row>
            <Button title="−" small variant="secondary" accessibilityLabel="Lower calorie goal" onPress={() => update((s) => ({ ...s, settings: { ...s.settings, calorieGoal: Math.max(1200, s.settings.calorieGoal - 100) } }))} />
            <View style={{ width: 6 }} />
            <Button title="+" small variant="secondary" accessibilityLabel="Raise calorie goal" onPress={() => update((s) => ({ ...s, settings: { ...s.settings, calorieGoal: Math.min(4500, s.settings.calorieGoal + 100) } }))} />
          </Row>
        </Row>
        <View style={{ marginVertical: 8 }}><Bar value={tot.kcal} max={goal} color={tot.kcal > goal ? c.danger : c.accent} /></View>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body dim>Protein {Math.round(tot.p)} g</Body><Body dim>Carbs {Math.round(tot.cb)} g</Body><Body dim>Fat {Math.round(tot.f)} g</Body>
        </Row>
      </Card>

      {!selecting && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Snap your meal with the camera"
            onPress={snap}
            style={({ pressed }) => ({ backgroundColor: c.primary, borderRadius: 24, paddingVertical: 28, alignItems: 'center', opacity: pressed ? 0.85 : 1, marginVertical: 8 })}
          >
            <Text style={{ fontSize: 48 }}>📷</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 4 }}>Snap your meal</Text>
            <Text style={{ color: '#fff', opacity: 0.9, marginTop: 2 }}>{Platform.OS === 'web' ? 'Choose a photo' : 'Instant food recognition'}</Text>
          </Pressable>
          {busy && <Row style={{ justifyContent: 'center', marginVertical: 8 }}><ActivityIndicator color={c.primary} /><Body dim style={{ marginLeft: 8 }}>Recognising your food…</Body></Row>}
          <Button title={manual ? 'Hide search' : 'Or search for a meal'} variant="ghost" onPress={() => setManual(!manual)} />
          {manual && (
            <Card>
              <TextInput value={search} onChangeText={setSearch} placeholder="Search foods" placeholderTextColor={c.sub} accessibilityLabel="Search foods"
                style={{ color: c.ink, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 10, marginBottom: 6 }} />
              {results.map((f) => (
                <Pressable key={f.id} accessibilityRole="button" onPress={() => { setPicked(f); setServings(1); }}
                  style={{ paddingVertical: 12, minHeight: 48, borderBottomWidth: 1, borderColor: c.line, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: c.ink }}>{f.name}</Text><Text style={{ color: c.sub }}>{f.kcal} kcal</Text>
                </Pressable>
              ))}
              {results.length === 0 && <Body dim>No matches.</Body>}
            </Card>
          )}
        </>
      )}

      {selecting && (
        <Card tone="accent">
          {photo && <Image source={{ uri: photo }} accessibilityLabel="Your meal photo" style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 10 }} />}
          {cands ? <H2 style={{ marginTop: 0 }}>Is this what you ate?</H2> : <H2 style={{ marginTop: 0 }}>Add to today</H2>}
          {cands && cands.map((cd) => (
            <Pressable key={cd.food.id} accessibilityRole="radio" accessibilityState={{ selected: picked?.id === cd.food.id }} onPress={() => setPicked(cd.food)}
              style={{ padding: 12, minHeight: 48, borderRadius: 12, marginBottom: 6, borderWidth: 2, borderColor: picked?.id === cd.food.id ? c.primary : c.line, backgroundColor: c.card, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: c.ink, fontWeight: '600', flex: 1 }}>{cd.food.name}</Text>
              <Text style={{ color: c.sub }}>{Math.round(cd.confidence * 100)}% match</Text>
            </Pressable>
          ))}
          {!cands && picked && <Body style={{ fontWeight: '700' }}>{picked.name}</Body>}
          {picked && (
            <>
              <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
                <Body>Servings ({picked.serving})</Body>
                <Row>
                  <Button title="−" small variant="secondary" accessibilityLabel="Fewer servings" onPress={() => setServings((s) => Math.max(0.5, s - 0.5))} />
                  <Text style={{ color: c.ink, fontWeight: '800', width: 48, textAlign: 'center' }}>{servings}</Text>
                  <Button title="+" small variant="secondary" accessibilityLabel="More servings" onPress={() => setServings((s) => s + 0.5)} />
                </Row>
              </Row>
              <Body dim style={{ marginTop: 6 }}>{Math.round(picked.kcal * servings)} kcal · P {Math.round(picked.protein * servings)} g · C {Math.round(picked.carbs * servings)} g · F {Math.round(picked.fat * servings)} g</Body>
              <Body dim style={{ fontSize: 12, marginTop: 4 }}>Recognition can be wrong. Please check and edit before saving.</Body>
              <Row style={{ gap: 8, marginTop: 10 }}>
                <Button title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => { setPicked(null); setCands(null); setPhoto(null); }} />
                <Button title="Save meal" style={{ flex: 2 }} onPress={() => save(cands ? 'camera' : 'manual')} />
              </Row>
            </>
          )}
        </Card>
      )}

      <H2>Today</H2>
      {today.length === 0 && <Body dim>Nothing logged yet.</Body>}
      {today.map((m) => (
        <Card key={m.id} style={{ paddingVertical: 12 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontWeight: '700' }}>{m.via === 'camera' ? '📷 ' : ''}{m.food.name}{m.servings !== 1 ? ` × ${m.servings}` : ''}</Text>
              <Body dim>{m.time} · {Math.round(m.food.kcal * m.servings)} kcal</Body>
            </View>
            <Button title="Remove" small variant="ghost" onPress={() => setDel(m)} />
          </Row>
        </Card>
      ))}
      <Body dim style={{ fontSize: 12, marginTop: 8 }}>Food recognition and calorie values are estimates for general wellness, not medical advice.</Body>
      <Confirm visible={!!del} title="Remove this meal?" message={del?.food.name ?? ''} confirmLabel="Remove" danger onCancel={() => setDel(null)}
        onConfirm={() => { update((s) => ({ ...s, meals: s.meals.filter((x) => x.id !== del!.id) })); setDel(null); }} />
      <Sheet visible={!!msg} title="Heads up" message={msg} onClose={() => setMsg('')}><Button title="OK" onPress={() => setMsg('')} /></Sheet>
    </Screen>
  );
}
