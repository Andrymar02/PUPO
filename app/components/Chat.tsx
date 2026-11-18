import { useState } from 'react';
import { FlatList, Image, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text, useAppTheme } from '@/components/Themed';
import { Button } from '@/components/ui/Button';
import { font, radius, spacing } from '@/constants/theme';
import { expressions } from '@/lib/pupoAssets';

export interface ChatMessage {
  role: 'student' | 'pupo';
  text: string;
}

export function Chat({
  placeholder,
  onSend,
}: {
  placeholder: string;
  onSend: (text: string) => Promise<string>;
}) {
  const theme = useAppTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setError(null);
    setMessages((m) => [...m, { role: 'student', text }]);
    setSending(true);
    try {
      const reply = await onSend(text);
      setMessages((m) => [...m, { role: 'pupo', text: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <Animated.View
            entering={FadeInUp.duration(220)}
            style={[styles.row, item.role === 'student' ? styles.rowEnd : styles.rowStart]}>
            {item.role === 'pupo' && <Image source={expressions.neutro} style={styles.avatar} />}
            <View
              style={[
                styles.bubble,
                item.role === 'student'
                  ? { backgroundColor: theme.accent, borderBottomRightRadius: 4 }
                  : { backgroundColor: theme.surfaceAlt, borderBottomLeftRadius: 4 },
              ]}>
              <Text
                style={[
                  font.body,
                  { color: item.role === 'student' ? theme.onAccent : theme.textPrimary },
                ]}>
                {item.text}
              </Text>
            </View>
          </Animated.View>
        )}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
      {error ? <Text style={[font.caption, { color: theme.danger }]}>{error}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, font.body, { borderColor: theme.border, color: theme.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          editable={!sending}
          multiline
        />
        <Button label="Invia" onPress={send} disabled={sending} loading={sending} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: spacing.s },
  list: { flex: 1 },
  listContent: { gap: spacing.s, paddingVertical: spacing.s },
  row: { flexDirection: 'row', gap: spacing.s, alignItems: 'flex-end', maxWidth: '88%' },
  rowStart: { alignSelf: 'flex-start' },
  rowEnd: { alignSelf: 'flex-end' },
  avatar: { width: 28, height: 36, resizeMode: 'contain' },
  bubble: { padding: spacing.m, borderRadius: radius.lg },
  inputRow: { flexDirection: 'row', gap: spacing.s, alignItems: 'flex-end' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.m,
    minHeight: 40,
    maxHeight: 120,
  },
});
