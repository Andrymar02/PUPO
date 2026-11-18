import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useAppTheme } from '@/components/Themed';
import { font, radius } from '@/constants/theme';

// Controllo segmentato con indicatore animato: sostituisce la riga di Pressable
// usata per le 4 sezioni della schermata materia (Materiale/Insegna/Interroga/Preparazione).
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  const theme = useAppTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.key === value)
  );
  const segmentWidth = trackWidth / options.length;

  useEffect(() => {
    if (trackWidth === 0) return;
    translateX.value = withSpring(activeIndex * segmentWidth, { damping: 18, stiffness: 180 });
  }, [activeIndex, segmentWidth, trackWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[styles.track, { backgroundColor: theme.surfaceAlt }]}
      onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}>
      {trackWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            indicatorStyle,
            { width: segmentWidth, backgroundColor: theme.accent },
          ]}
        />
      )}
      {options.map((o) => (
        <Pressable key={o.key} style={styles.segment} onPress={() => onChange(o.key)}>
          <Text
            style={[
              font.label,
              styles.label,
              { color: value === o.key ? theme.onAccent : theme.textSecondary },
            ]}
            numberOfLines={1}>
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: 4,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: radius.pill,
  },
  segment: { flex: 1, paddingVertical: 8, zIndex: 1 },
  label: { textAlign: 'center' },
});
