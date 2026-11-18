import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/components/Themed';
import { spacing } from '@/constants/theme';

// Wrapper comune per le schermate: sfondo dal tema + padding coerente.
// `scroll` usa ScrollView (per contenuti più lunghi di uno schermo), altrimenti un View flex:1.
export function Screen({
  children,
  scroll = true,
  contentContainerStyle,
  style,
}: PropsWithChildren<{
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  style?: ViewStyle;
}>) {
  const theme = useAppTheme();

  if (scroll) {
    return (
      <ScrollView
        style={[styles.flex, { backgroundColor: theme.background }, style]}
        contentContainerStyle={[styles.content, contentContainerStyle]}>
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.flex, styles.content, { backgroundColor: theme.background }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.l, gap: spacing.m },
});
