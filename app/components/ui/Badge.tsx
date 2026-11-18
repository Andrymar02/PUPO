import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/components/Themed';
import { font, radius, spacing } from '@/constants/theme';

type Tone = 'accent' | 'success' | 'danger' | 'warning' | 'neutral';

const TONE_KEYS: Record<Exclude<Tone, 'neutral'>, { bg: 'accent' | 'success' | 'danger' | 'warning' }> = {
  accent: { bg: 'accent' },
  success: { bg: 'success' },
  danger: { bg: 'danger' },
  warning: { bg: 'warning' },
};

// Pill per stati brevi (badge "Ripassa", tipo di documento, esito). `tone` sceglie il colore.
export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const theme = useAppTheme();
  const backgroundColor = tone === 'neutral' ? theme.surfaceAlt : theme[TONE_KEYS[tone].bg];
  const color = tone === 'neutral' ? theme.textSecondary : theme.onAccent;

  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={[font.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
});
