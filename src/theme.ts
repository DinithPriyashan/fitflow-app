import { useColorScheme } from 'react-native';

const light = {
  bg: '#F6F7FB',
  card: '#FFFFFF',
  ink: '#14213D',
  sub: '#4A5568',
  line: '#E2E8F0',
  primary: '#C2410C', // white text on this passes WCAG AA
  primaryText: '#FFFFFF',
  accent: '#0F766E',
  soft: '#FFF1E8',
  softAccent: '#E6F6F4',
  danger: '#B91C1C',
  good: '#15803D',
  overlay: 'rgba(20,33,61,0.55)',
};

const dark: typeof light = {
  bg: '#0E1424',
  card: '#182036',
  ink: '#F1F5F9',
  sub: '#A8B3C7',
  line: '#2A3550',
  primary: '#EA580C',
  primaryText: '#FFFFFF',
  accent: '#2DD4BF',
  soft: '#2B2030',
  softAccent: '#12302F',
  danger: '#F87171',
  good: '#4ADE80',
  overlay: 'rgba(0,0,0,0.65)',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export const radius = 16;
export const space = (n: number) => n * 4;
