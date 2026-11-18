import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Text, useAppTheme } from '@/components/Themed';
import { font, radius, spacing } from '@/constants/theme';

export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  const theme = useAppTheme();
  const clamped = Math.max(0, Math.min(100, percent));
  const [trackWidth, setTrackWidth] = useState(0);
  const fillWidth = useSharedValue(0);

  useEffect(() => {
    fillWidth.value = withTiming((clamped / 100) * trackWidth, { duration: 400 });
  }, [clamped, trackWidth, fillWidth]);

  const fillStyle = useAnimatedStyle(() => ({ width: fillWidth.value }));

  return (
    <View style={styles.wrap}>
      {label ? <Text style={font.label}>{label}</Text> : null}
      <View
        style={[styles.track, { backgroundColor: theme.surfaceAlt }]}
        onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}>
        <Animated.View style={[styles.fill, fillStyle, { backgroundColor: theme.success }]} />
      </View>
      <Text style={[font.caption, { color: theme.textSecondary }]}>{clamped}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  track: {
    height: 14,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.sm,
  },
});
