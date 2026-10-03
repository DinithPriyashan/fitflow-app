import React, { useEffect, useRef, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { Body, Bar, Button, Row } from './ui';
import { EX_BY_ID } from '../data/exercises';
import { useColors } from '../theme';
import { PlanItem } from '../types';
import { fmtClock } from '../util';

export default function WorkoutPlayer({
  visible, title, items, onFinish, onClose,
}: { visible: boolean; title: string; items: PlanItem[]; onFinish: (secondsDone: number) => void; onClose: () => void }) {
  const c = useColors();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'work' | 'rest'>('work');
  const [left, setLeft] = useState(items[0]?.work ?? 0);
  const [paused, setPaused] = useState(false);
  const elapsed = useRef(0);

  useEffect(() => {
    if (visible) { setIdx(0); setPhase('work'); setLeft(items[0]?.work ?? 0); setPaused(false); elapsed.current = 0; }
  }, [visible, items]);

  useEffect(() => {
    if (!visible || paused) return;
    const t = setInterval(() => {
      elapsed.current += 1;
      setLeft((l) => l - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [visible, paused]);

  useEffect(() => {
    if (!visible || left > 0) return;
    const cur = items[idx];
    if (!cur) return;
    if (phase === 'work' && cur.rest > 0 && idx < items.length - 1) { setPhase('rest'); setLeft(cur.rest); return; }
    if (idx >= items.length - 1) { onFinish(elapsed.current); return; }
    setIdx(idx + 1); setPhase('work'); setLeft(items[idx + 1].work);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const cur = items[idx];
  const ex = cur ? EX_BY_ID[cur.exerciseId] : undefined;
  const next = items[idx + 1] ? EX_BY_ID[items[idx + 1].exerciseId] : undefined;

  const skip = () => {
    if (idx >= items.length - 1) { onFinish(elapsed.current); return; }
    setIdx(idx + 1); setPhase('work'); setLeft(items[idx + 1].work);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: phase === 'rest' ? c.softAccent : c.bg, padding: 24, justifyContent: 'center' }}>
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <Body dim>{title} · {idx + 1} / {items.length}</Body>
          <Bar value={idx + 1} max={items.length} color={c.primary} />
          <Text accessibilityRole="header" style={{ color: c.ink, fontSize: 32, fontWeight: '800', marginTop: 28 }}>
            {phase === 'rest' ? 'Rest' : ex?.name}
          </Text>
          <Body dim style={{ marginTop: 6, fontSize: 17 }}>{phase === 'rest' ? `Next: ${next?.name ?? 'Finish'}` : ex?.cue}</Body>
          <Text
            accessibilityLiveRegion="polite"
            accessibilityLabel={`${Math.max(left, 0)} seconds left`}
            style={{ color: phase === 'rest' ? c.accent : c.primary, fontSize: 88, fontWeight: '800', textAlign: 'center', marginVertical: 28 }}
          >
            {fmtClock(Math.max(left, 0))}
          </Text>
          <Row style={{ gap: 10 }}>
            <Button title={paused ? 'Resume' : 'Pause'} variant="secondary" onPress={() => setPaused((p) => !p)} style={{ flex: 1 }} />
            <Button title="Skip" variant="secondary" onPress={skip} style={{ flex: 1 }} />
            <Button title="End" variant="ghost" onPress={() => onFinish(elapsed.current)} style={{ flex: 1 }} />
          </Row>
          <Button title="Close without saving" variant="ghost" onPress={onClose} style={{ marginTop: 8 }} />
        </View>
      </View>
    </Modal>
  );
}
