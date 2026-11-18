import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/components/Themed';
import { radius, spacing } from '@/constants/theme';

// Contenitore "superficie": sfondo card, bordo sottile, raggio grande.
// Se `onPress` è passato diventa premibile (usato per le righe materia/sfida).
export function Card({
  children,
  onPress,
  style,
  tint,
}: PropsWithChildren<{
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Colore di sfondo alternativo (es. una tinta soft del tema), sovrascrive `surface`. */
  tint?: string;
}>) {
  const theme = useAppTheme();
  const cardStyle = [
    styles.card,
    { backgroundColor: tint ?? theme.surface, borderColor: theme.border },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        onPress={onPress}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.m,
    gap: spacing.xs,
  },
  pressed: { opacity: 0.8 },
});
