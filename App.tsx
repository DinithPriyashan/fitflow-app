import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Text, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Community from './src/screens/Community';
import Home from './src/screens/Home';
import Me from './src/screens/Me';
import Nutrition from './src/screens/Nutrition';
import Onboarding from './src/screens/Onboarding';
import Workouts from './src/screens/Workouts';
import { StoreProvider, useStore } from './src/store';
import { useColors } from './src/theme';

const Tab = createBottomTabNavigator();
const icon = (e: string) => ({ focused }: { focused: boolean }) => <Text aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{e}</Text>;

function Root() {
  const { state, ready } = useStore();
  const c = useColors();
  const scheme = useColorScheme();
  if (!ready) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}><ActivityIndicator color={c.primary} /></View>;
  if (!state.profile?.onboarded) return <Onboarding />;
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <NavigationContainer theme={{ ...base, colors: { ...base.colors, background: c.bg, card: c.card, text: c.ink, border: c.line, primary: c.primary } }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.primary,
          tabBarInactiveTintColor: c.sub,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarStyle: { minHeight: 58 },
        }}
      >
        <Tab.Screen name="Home" component={Home} options={{ tabBarIcon: icon('🏠') }} />
        <Tab.Screen name="Workouts" component={Workouts} options={{ tabBarIcon: icon('🏋️') }} />
        <Tab.Screen name="Circles" component={Community} options={{ tabBarIcon: icon('👥') }} />
        <Tab.Screen name="Nutrition" component={Nutrition} options={{ tabBarIcon: icon('🥗') }} />
        <Tab.Screen name="Me" component={Me} options={{ tabBarIcon: icon('📈') }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="auto" />
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
