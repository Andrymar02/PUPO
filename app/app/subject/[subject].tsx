import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { Chat } from '@/components/Chat';
import { ProgressBar } from '@/components/ProgressBar';
import { Text, useAppTheme } from '@/components/Themed';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { font, radius, spacing } from '@/constants/theme';
import {
  addMaterialText,
  ApiError,
  createSyllabus,
  getProgress,
  listMaterial,
  quiz,
  teach,
} from '@/lib/api';
import { expressions, stageImageFor, subjectImageFor } from '@/lib/pupoAssets';
import { useStudent } from '@/lib/student';
import type { MaterialDoc, ProgressReport, SyllabusTopic } from '@/lib/types';

const REVIEW_REMINDER_DAYS = 3;
type Section = 'materiale' | 'insegna' | 'interroga' | 'preparazione';

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'materiale', label: 'Materiale' },
  { key: 'insegna', label: 'Insegna' },
  { key: 'interroga', label: 'Interroga' },
  { key: 'preparazione', label: 'Preparazione' },
];

export default function SubjectScreen() {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const { student, loading } = useStudent();
  const [section, setSection] = useState<Section>('materiale');
  const theme = useAppTheme();

  if (loading || !subject) return null;

  return (
    <>
      <Stack.Screen options={{ title: subject }} />
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Image source={subjectImageFor(subject)} style={styles.headerImage} />
          <Text style={font.title}>{subject}</Text>
        </View>
        <SegmentedTabs options={SECTIONS} value={section} onChange={setSection} />
        <View style={styles.body}>
          {section === 'materiale' && <MaterialeSection subject={subject} student={student} />}
          {section === 'insegna' && <InsegnaSection subject={subject} student={student} />}
          {section === 'interroga' && <InterrogaSection subject={subject} student={student} />}
          {section === 'preparazione' && <PreparazioneSection subject={subject} student={student} />}
        </View>
      </View>
    </>
  );
}

function MaterialeSection({ subject, student }: { subject: string; student: string }) {
  const theme = useAppTheme();
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [docs, setDocs] = useState<MaterialDoc[] | null>(null);
  const [topics, setTopics] = useState<SyllabusTopic[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const refresh = useCallback(() => {
    listMaterial(subject, student).then(setDocs).catch(() => setDocs([]));
  }, [subject, student]);

  useEffect(refresh, [refresh]);

  return (
    <ScrollView contentContainerStyle={styles.sectionContent}>
      <Card style={styles.formCard}>
        <Text style={font.label}>Incolla appunti o sbobinatura</Text>
        <TextInput
          style={[styles.textarea, font.body, { borderColor: theme.border, color: theme.textPrimary }]}
          value={text}
          onChangeText={setText}
          multiline
          placeholder="Testo della lezione…"
          placeholderTextColor={theme.textSecondary}
        />
        <TextInput
          style={[styles.input, font.body, { borderColor: theme.border, color: theme.textPrimary }]}
          value={source}
          onChangeText={setSource}
          placeholder="nome del documento (es. lezione1.txt)"
          placeholderTextColor={theme.textSecondary}
        />
        <Button
          label="Carica"
          onPress={async () => {
            if (!text.trim()) return;
            setStatus('Carico…');
            try {
              await addMaterialText(subject, student, text, source || 'appunti.txt');
              setText('');
              setSource('');
              setStatus('Caricato.');
              refresh();
            } catch (e) {
              setStatus(e instanceof Error ? e.message : 'Errore');
            }
          }}
        />
      </Card>

      <Text style={[font.subtitle, { color: theme.textSecondary }]}>Materiale già caricato</Text>
      {(docs ?? []).length === 0 ? (
        <Text style={[font.body, { color: theme.textSecondary }]}>Niente ancora.</Text>
      ) : (
        (docs ?? []).map((d) => (
          <Card key={d.id} style={styles.docRow}>
            <Text style={[font.bodyStrong, styles.docTitle]} numberOfLines={1}>
              {d.source}
            </Text>
            <Badge label={d.kind === 'upload' ? 'Caricato' : 'Trascrizione'} tone="accent" />
            <Text style={[font.caption, { color: theme.textSecondary }]}>{d.words} parole</Text>
          </Card>
        ))
      )}

      <Button
        label="Crea programma"
        variant="secondary"
        onPress={async () => {
          setStatus('Creo il programma…');
          try {
            const t = await createSyllabus(subject, student);
            setTopics(t);
            setStatus(null);
          } catch (e) {
            setStatus(e instanceof Error ? e.message : 'Errore');
          }
        }}
      />
      {status ? <Text style={[font.caption, { color: theme.textSecondary }]}>{status}</Text> : null}
      {topics ? (
        <Card tint={theme.successSoft}>
          <Text style={font.body}>
            Argomenti trovati: {topics.map((t) => `${t.name} (${t.concepts.length})`).join(', ')}
          </Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

function InsegnaSection({ subject, student }: { subject: string; student: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.chatSection}>
      <Text style={[font.body, { color: theme.textSecondary }]}>
        Spiega l&apos;argomento al Pupo con parole tue.
      </Text>
      <Chat placeholder="Spiega qui…" onSend={(text) => teach(subject, student, text)} />
    </View>
  );
}

function InterrogaSection({ subject, student }: { subject: string; student: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.chatSection}>
      <Text style={[font.body, { color: theme.textSecondary }]}>
        Fai domande per vedere cosa ha capito il Pupo.
      </Text>
      <Chat placeholder="Fai una domanda…" onSend={(text) => quiz(subject, student, text)} />
    </View>
  );
}

function PreparazioneSection({ subject, student }: { subject: string; student: string }) {
  const theme = useAppTheme();
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setError(null);
    getProgress(subject, student)
      .then(setReport)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Errore'));
  }, [subject, student]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- avvia il fetch del progresso al montaggio
  useEffect(refresh, [refresh]);

  const needsReview =
    report?.days_since_last_review !== null &&
    report?.days_since_last_review !== undefined &&
    report.days_since_last_review >= REVIEW_REMINDER_DAYS;

  return (
    <ScrollView contentContainerStyle={styles.sectionContent}>
      {report && <Image source={stageImageFor(report.overall_percent)} style={styles.stageImage} />}
      {needsReview && (
        <Card tint={theme.dangerSoft} style={styles.reviewBanner}>
          <Image source={expressions.addormentato} style={styles.reviewImage} />
          <Text style={[font.bodyStrong, styles.reviewText, { color: theme.danger }]}>
            Non ripassi questa materia da {report?.days_since_last_review} giorni.
          </Text>
        </Card>
      )}
      {error && <Text style={[font.body, { color: theme.textSecondary }]}>{error}</Text>}
      {report && (
        <>
          <ProgressBar percent={report.overall_percent} label="Totale" />
          {report.topics.map((t) => (
            <ProgressBar key={t.topic} percent={t.percent} label={t.topic} />
          ))}
        </>
      )}
      <Button label="Aggiorna" variant="secondary" onPress={refresh} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.l, gap: spacing.m },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  headerImage: { width: 48, height: 60, resizeMode: 'contain' },
  body: { flex: 1 },
  sectionContent: { gap: spacing.m, paddingBottom: spacing.xl },
  formCard: { gap: spacing.s, alignItems: 'flex-start' },
  textarea: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.m,
    minHeight: 100,
  },
  input: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.m,
  },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  docTitle: { flex: 1 },
  chatSection: { flex: 1, gap: spacing.s },
  stageImage: { width: 90, height: 115, resizeMode: 'contain', alignSelf: 'center' },
  reviewBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  reviewImage: { width: 40, height: 52, resizeMode: 'contain' },
  reviewText: { flex: 1 },
});
