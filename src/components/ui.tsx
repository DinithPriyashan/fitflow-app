import React, { useEffect, useRef } from 'react';
import {
  AccessibilityRole, Animated, Modal, Platform, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, useColors } from '../theme';

export function Screen({ children, scroll = true, footer }: { children: React.ReactNode; scroll?: boolean; footer?: React.ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const inner = <View style={styles.inner}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">{inner}</ScrollView>
      ) : inner}
      {footer}
    </View>
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text accessibilityRole="header" style={{ color: c.ink, fontSize: 26, fontWeight: '800', marginBottom: 4 }}>{children}</Text>;
}
export function H2({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useColors();
  return <Text accessibilityRole="header" style={[{ color: c.ink, fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 }, style]}>{children}</Text>;
}
export function Body({ children, style, dim }: { children: React.ReactNode; style?: StyleProp<TextStyle>; dim?: boolean }) {
  const c = useColors();
  return <Text style={[{ color: dim ? c.sub : c.ink, fontSize: 15, lineHeight: 21 }, style]}>{children}</Text>;
}

export function Card({ children, style, tone }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; tone?: 'soft' | 'accent' }) {
  const c = useColors();
  const bg = tone === 'soft' ? c.soft : tone === 'accent' ? c.softAccent : c.card;
  return (
    <View style={[{ backgroundColor: bg, borderRadius: radius, padding: 16, borderWidth: 1, borderColor: c.line, marginBottom: 12 }, style]}>
      {children}
    </View>
  );
}

export function Button({
  title, onPress, variant = 'primary', disabled, style, small, accessibilityLabel,
}: {
  title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; disabled?: boolean;
  style?: StyleProp<ViewStyle>; small?: boolean; accessibilityLabel?: string;
}) {
  const c = useColors();
  const bg = variant === 'primary' ? c.primary : variant === 'danger' ? c.danger : variant === 'secondary' ? c.card : 'transparent';
  const fg = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : c.ink;
  const border = variant === 'secondary' ? c.line : 'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg, borderColor: border, borderWidth: 1, borderRadius: 14,
          minHeight: small ? 40 : 48, paddingHorizontal: small ? 14 : 18, alignItems: 'center', justifyContent: 'center',
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: small ? 14 : 16 }}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, role = 'button' }: { label: string; selected?: boolean; onPress?: () => void; role?: AccessibilityRole }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityState={{ selected: !!selected }}
      style={{
        paddingHorizontal: 14, minHeight: 40, justifyContent: 'center', borderRadius: 999, marginRight: 8, marginBottom: 8,
        backgroundColor: selected ? c.primary : c.card, borderWidth: 1, borderColor: selected ? c.primary : c.line,
      }}
    >
      <Text style={{ color: selected ? '#fff' : c.ink, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

export function Wrap({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{children}</View>;
}

export function Bar({ value, max, color }: { value: number; max: number; color?: string }) {
  const c = useColors();
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: Math.min(value, max) }}
      style={{ height: 10, borderRadius: 6, backgroundColor: c.line, overflow: 'hidden' }}
    >
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color ?? c.accent }} />
    </View>
  );
}

/** Works on web too (React Native's Alert.alert buttons do not). */
export function Sheet({
  visible, title, message, onClose, children,
}: { visible: boolean; title: string; message?: string; onClose: () => void; children?: React.ReactNode }) {
  const c = useColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'center', padding: 24 }} onPress={onClose} accessibilityLabel="Close dialog">
        <Pressable style={{ backgroundColor: c.card, borderRadius: 20, padding: 20, maxWidth: 520, width: '100%', alignSelf: 'center' }} onPress={() => {}}>
          <Text accessibilityRole="header" style={{ color: c.ink, fontSize: 20, fontWeight: '800', marginBottom: 6 }}>{title}</Text>
          {message ? <Body dim style={{ marginBottom: 12 }}>{message}</Body> : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function Confirm({
  visible, title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel,
}: { visible: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Sheet visible={visible} title={title} message={message} onClose={onCancel}>
      <Row style={{ justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Button title="Cancel" variant="secondary" onPress={onCancel} small />
        <Button title={confirmLabel} variant={danger ? 'danger' : 'primary'} onPress={onConfirm} small />
      </Row>
    </Sheet>
  );
}

/** Celebration overlay – responds to the "missing celebratory elements" research theme. */
export function Celebration({ visible, title, subtitle, onClose }: { visible: boolean; title: string; subtitle: string; onClose: () => void }) {
  const c = useColors();
  const scale = useRef(new Animated.Value(0.6)).current;
  const burst = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.6); burst.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', friction: 5 }),
      Animated.timing(burst, { toValue: 1, duration: 1200, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [visible, scale, burst]);
  const parts = ['🎉', '✨', '💪', '🔥', '⭐', '🎊', '✨', '💥'];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {parts.map((p, i) => {
          const angle = (i / parts.length) * Math.PI * 2;
          const tx = burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * 130] });
          const ty = burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * 130] });
          const op = burst.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0.9] });
          return (
            <Animated.Text key={i} style={{ position: 'absolute', fontSize: 30, opacity: op, transform: [{ translateX: tx }, { translateY: ty }] }}>{p}</Animated.Text>
          );
        })}
        <Animated.View style={{ transform: [{ scale }], backgroundColor: c.card, borderRadius: 24, padding: 28, alignItems: 'center', maxWidth: 360, width: '100%' }}>
          <Text style={{ fontSize: 56 }}>🏅</Text>
          <Text accessibilityRole="header" style={{ color: c.ink, fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 8 }}>{title}</Text>
          <Body dim style={{ textAlign: 'center', marginVertical: 10 }}>{subtitle}</Body>
          <Button title="Keep it flowing" onPress={onClose} style={{ alignSelf: 'stretch', marginTop: 8 }} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  inner: { padding: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
});
