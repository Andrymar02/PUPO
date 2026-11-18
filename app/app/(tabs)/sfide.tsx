import { Image, StyleSheet, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { Text, useAppTheme } from '@/components/Themed';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { font, spacing } from '@/constants/theme';
import { expressions } from '@/lib/pupoAssets';

// Mock statico: solo per mostrare l'idea nel pitch, nessuna logica reale.
const MOCK_CHALLENGES = [
  { opponent: 'Marco', subject: 'Limiti (Analisi 1)', you: 67, them: 54 },
  { opponent: 'Sara', subject: 'Derivate (Analisi 1)', you: 20, them: 71 },
  { opponent: 'Luca', subject: 'Basi di dati', you: 88, them: 90 },
];

export default function SfideScreen() {
  const theme = useAppTheme();

  return (
    <Screen contentContainerStyle={styles.container}>
      <Image source={expressions.felice} style={styles.hero} />
      <Text style={font.title}>Sfide amichevoli</Text>
      <Text style={[font.body, styles.subtitle, { color: theme.textSecondary }]}>
        Duelli tra Pupi sullo stesso argomento, senza classifiche pubbliche: ci si confronta,
        non si gareggia per il voto.
      </Text>

      {MOCK_CHALLENGES.map((c) => (
        <Card key={c.opponent} style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={font.subtitle}>Tu vs {c.opponent}</Text>
            <Badge
              label={c.you >= c.them ? 'In vantaggio' : 'Da recuperare'}
              tone={c.you >= c.them ? 'success' : 'warning'}
            />
          </View>
          <Text style={[font.caption, { color: theme.textSecondary }]}>{c.subject}</Text>
          <ProgressBar percent={c.you} label="Tu" />
          <ProgressBar percent={c.them} label={c.opponent} />
        </Card>
      ))}

      <Button
        label="Sfida amichevole — prossimamente"
        variant="secondary"
        disabled
        onPress={() => {}}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'stretch' },
  hero: { width: 100, height: 128, resizeMode: 'contain', alignSelf: 'center' },
  subtitle: { textAlign: 'center', marginBottom: spacing.s },
  challengeCard: { gap: spacing.xs },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
