import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useAppTheme } from '@/components/Themed';
import { font, radius, spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
}) {
  const theme = useAppTheme();
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const colors =
    variant === 'primary'
      ? { backgroundColor: theme.accent, color: theme.onAccent }
      : { backgroundColor: theme.accentSoft, color: theme.accent };

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability -- SharedValue.value è il modo corretto di scrivere in Reanimated, non uno stato React
        scale.value = withTiming(0.96, { duration: 80 });
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability -- vedi sopra
        scale.value = withTiming(1, { duration: 120 });
      }}
      style={[
        styles.button,
        { backgroundColor: colors.backgroundColor },
        isDisabled && styles.disabled,
        animatedStyle,
      ]}>
      <Text style={[font.bodyStrong, { color: colors.color }]}>{loading ? '…' : label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  disabled: { opacity: 0.5 },
});
