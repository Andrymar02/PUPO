// Sistema di design del Pupo: token derivati dalla palette in Design/PUPO.md (vedi anche
// pupoPalette in Colors.ts, che resta per i colori "di illustrazione" per materia).
import { pupoPalette } from './Colors';

// Larghezza massima del contenuto: su schermi larghi (browser desktop) evita che le
// schermate si stirino a tutta pagina; su telefono (sempre più stretto) non ha effetto.
export const maxContentWidth = 640;

// Colori tra cui scegliere creando una materia (punto 4 del redesign): le 5 varianti già
// disegnate per materia in Design/PUPO.md, più gli accenti principali della palette.
export const subjectPalette = [
  pupoPalette.purple,
  '#4A7BF7', // blu, come la variante Matematica/Analisi
  '#D2694A', // terracotta, come Storia/Lettere
  '#7FAA8B', // verde salvia, come Biologia/Medicina
  '#7D96B8', // grigio-azzurro, come Informatica
  '#9A3352', // bordeaux, come Diritto/Economia
  pupoPalette.mint,
  pupoPalette.coral,
] as const;

export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

// Un peso per famiglia: i font Google si caricano come famiglie separate per peso
// (es. "Nunito_600SemiBold"), non come fontWeight su un'unica famiglia.
export const font = {
  display: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 32, lineHeight: 38 },
  title: { fontFamily: 'Baloo2_700Bold', fontSize: 22, lineHeight: 28 },
  subtitle: { fontFamily: 'Baloo2_600SemiBold', fontSize: 17, lineHeight: 22 },
  body: { fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: 'Nunito_700Bold', fontSize: 15, lineHeight: 21 },
  label: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 16 },
} as const;

function withAlpha(hex: string, alpha: string) {
  return hex + alpha;
}

export interface AppTheme {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  onAccent: string;
}

export const lightTheme: AppTheme = {
  background: '#FBF8FF', // crema freddo, non bianco puro
  surface: '#FFFFFF',
  surfaceAlt: withAlpha(pupoPalette.purple, '0F'),
  border: withAlpha(pupoPalette.navy, '1F'),
  textPrimary: pupoPalette.navy,
  textSecondary: withAlpha(pupoPalette.navy, 'B3'),
  accent: pupoPalette.purple,
  accentSoft: withAlpha(pupoPalette.purple, '1A'),
  success: pupoPalette.mint,
  successSoft: withAlpha(pupoPalette.mint, '22'),
  danger: pupoPalette.coral,
  dangerSoft: withAlpha(pupoPalette.coral, '22'),
  warning: pupoPalette.yellow,
  warningSoft: withAlpha(pupoPalette.yellow, '26'),
  onAccent: '#FFFFFF',
};

export const darkTheme: AppTheme = {
  background: pupoPalette.navy,
  surface: '#272147',
  surfaceAlt: withAlpha(pupoPalette.purple, '26'),
  border: withAlpha('#FFFFFF', '1A'),
  textPrimary: '#F5F3FF',
  textSecondary: withAlpha('#F5F3FF', 'B3'),
  accent: pupoPalette.purple,
  accentSoft: withAlpha(pupoPalette.purple, '33'),
  success: pupoPalette.mint,
  successSoft: withAlpha(pupoPalette.mint, '2E'),
  danger: pupoPalette.coral,
  dangerSoft: withAlpha(pupoPalette.coral, '2E'),
  warning: pupoPalette.yellow,
  warningSoft: withAlpha(pupoPalette.yellow, '2E'),
  onAccent: '#FFFFFF',
};
