import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { Text, useAppTheme } from '@/components/Themed';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { font, radius, spacing } from '@/constants/theme';
import { ApiError, getProgress } from '@/lib/api';
import { expressions, stageImageFor } from '@/lib/pupoAssets';
import { useStudent } from '@/lib/student';

const REVIEW_REMINDER_DAYS = 3;

type SubjectStatus = { percent: number; days: number | null } | 'no-syllabus' | 'loading' | 'error';

function statusLabel(status: SubjectStatus | undefined, percent: number) {
  if (status === 'loading') return 'Carico…';
  if (status === 'no-syllabus') return 'Nessun programma ancora';
  if (status === 'error') return 'Errore nel caricare lo stato';
  if (typeof status === 'object') return `Preparazione: ${percent}%`;
  return '';
}

export default function HomeScreen() {
  const { loading, student, setStudent, subjects, addSubject } = useStudent();
  const [statuses, setStatuses] = useState<Record<string, SubjectStatus>>({});
  const [newSubject, setNewSubject] = useState('');
  const theme = useAppTheme();

  const refresh = useCallback(() => {
    for (const subject of subjects) {
      setStatuses((s) => ({ ...s, [subject]: 'loading' }));
      getProgress(subject, student)
        .then((r) =>
          setStatuses((s) => ({
            ...s,
            [subject]: { percent: r.overall_percent, days: r.days_since_last_review },
          }))
        )
        .catch((e) =>
          setStatuses((s) => ({
            ...s,
            [subject]: e instanceof ApiError ? 'no-syllabus' : 'error',
          }))
        );
    }
  }, [subjects, student]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- avvia il fetch del progresso per materia
    if (!loading) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, subjects, student]);

  if (loading) return null;

  return (
    <Screen>
      <Text style={font.title}>Ciao{student ? `, ${student}` : ''} 👋</Text>
      <TextInput
        style={[styles.studentInput, font.body, { borderColor: theme.border, color: theme.textPrimary }]}
        value={student}
        onChangeText={setStudent}
        placeholder="il tuo nome"
        placeholderTextColor={theme.textSecondary}
      />

      <Text style={[font.subtitle, styles.sectionLabel, { color: theme.textSecondary }]}>
        Le tue materie
      </Text>

      {subjects.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Image source={expressions.curioso} style={styles.emptyImage} />
          <Text style={[font.body, styles.emptyText, { color: theme.textSecondary }]}>
            Nessuna materia ancora. Aggiungine una per far nascere il tuo primo Pupo.
          </Text>
        </Card>
      ) : null}

      {subjects.map((subject) => {
        const status = statuses[subject];
        const percent = typeof status === 'object' ? status.percent : 0;
        const needsReview =
          typeof status === 'object' && status.days !== null && status.days >= REVIEW_REMINDER_DAYS;
        return (
          <Card
            key={subject}
            onPress={() => router.push({ pathname: '/subject/[subject]', params: { subject } })}
            style={styles.row}>
            <Image source={stageImageFor(percent)} style={styles.rowImage} />
            <View style={styles.rowBody}>
              <Text style={font.subtitle}>{subject}</Text>
              <Text style={[font.caption, { color: theme.textSecondary }]}>
                {statusLabel(status, percent)}
              </Text>
              {needsReview && <Badge label="Ripassa" tone="danger" />}
            </View>
          </Card>
        );
      })}

      <Text style={[font.subtitle, styles.sectionLabel, { color: theme.textSecondary }]}>
        Nuova materia
      </Text>
      <Card style={styles.newCard}>
        <TextInput
          style={[styles.newInput, font.body, { borderColor: theme.border, color: theme.textPrimary }]}
          value={newSubject}
          onChangeText={setNewSubject}
          placeholder="es. analisi1"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
        />
        <Button
          label="Aggiungi"
          onPress={() => {
            if (!newSubject.trim()) return;
            addSubject(newSubject.trim());
            setNewSubject('');
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  studentInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.m,
  },
  sectionLabel: { marginTop: spacing.s },
  emptyCard: { alignItems: 'center', gap: spacing.s },
  emptyImage: { width: 72, height: 92, resizeMode: 'contain' },
  emptyText: { textAlign: 'center' },
  row: { flexDirection: 'row', gap: spacing.m, alignItems: 'center' },
  rowImage: { width: 56, height: 72, resizeMode: 'contain' },
  rowBody: { flex: 1, gap: spacing.xs, alignItems: 'flex-start' },
  newCard: { gap: spacing.m, alignItems: 'flex-start' },
  newInput: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.m,
  },
});
