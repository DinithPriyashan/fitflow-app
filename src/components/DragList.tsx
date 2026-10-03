import React, { useRef, useState } from 'react';
import { Animated, PanResponder, Platform, Text, View } from 'react-native';
import { useColors } from '../theme';

interface Props {
  count: number;
  rowHeight: number;
  renderRow: (index: number) => React.ReactNode;
  onMove: (from: number, to: number) => void;
}

/** Vertical drag-and-drop reordering using the drag handle (⠿). Fixed row height keeps it simple and reliable on native and web. */
export default function DragList({ count, rowHeight, renderRow, onMove }: Props) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => (
        <DragRow key={i} index={i} count={count} rowHeight={rowHeight} onMove={onMove}>{renderRow(i)}</DragRow>
      ))}
    </View>
  );
}

function DragRow({ index, count, rowHeight, onMove, children }: { index: number; count: number; rowHeight: number; onMove: Props['onMove']; children: React.ReactNode }) {
  const c = useColors();
  const dy = useRef(new Animated.Value(0)).current;
  const [dragging, setDragging] = useState(false);
  const latest = useRef({ index, count, rowHeight, onMove });
  latest.current = { index, count, rowHeight, onMove };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => setDragging(true),
      onPanResponderMove: (_, g) => dy.setValue(g.dy),
      onPanResponderRelease: (_, g) => {
        const { index: i, count: n, rowHeight: h, onMove: move } = latest.current;
        const to = Math.max(0, Math.min(n - 1, i + Math.round(g.dy / h)));
        setDragging(false);
        dy.setValue(0);
        if (to !== i) move(i, to);
      },
      onPanResponderTerminate: () => { setDragging(false); dy.setValue(0); },
    }),
  ).current;

  return (
    <Animated.View
      style={{
        height: rowHeight, flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 12, borderWidth: 1,
        borderColor: dragging ? c.primary : c.line, marginBottom: 8, paddingRight: 8,
        zIndex: dragging ? 10 : 0, elevation: dragging ? 6 : 0, transform: [{ translateY: dy }],
        shadowColor: '#000', shadowOpacity: dragging ? 0.2 : 0, shadowRadius: 8,
      }}
    >
      <View
        {...pan.panHandlers}
        accessibilityLabel="Drag handle. Use the up and down buttons for keyboard or screen reader reordering."
        style={[{ width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' }, Platform.OS === 'web' ? ({ touchAction: 'none', cursor: 'grab' } as object) : null]}
      >
        <Text style={{ color: c.sub, fontSize: 22 }}>⠿</Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Animated.View>
  );
}
