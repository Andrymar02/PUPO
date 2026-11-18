import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { useAppTheme } from '@/components/Themed';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        tabBarLabelStyle: { fontFamily: 'Nunito_700Bold', fontSize: 11 },
        headerStyle: { backgroundColor: theme.surface },
        headerTitleStyle: { fontFamily: 'Baloo2_700Bold', color: theme.textPrimary },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'I miei Pupi',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'house.fill', android: 'home', web: 'home' }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sfide"
        options={{
          title: 'Sfide',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}
