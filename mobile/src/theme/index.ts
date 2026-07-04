/**
 * Casey design system — cute, K-pop, bubblegum-pink brand.
 * "Design it. Print it. Love it."
 */

export const colors = {
  // Brand pinks
  primary: '#FF3E9A', // hot bubblegum pink (buttons, key accents)
  primaryDark: '#D6006E', // deep magenta (headings, pressed states)
  primarySoft: '#FF7EC0', // secondary pink
  blush: '#FFD6EC', // soft pink surfaces / chips
  petal: '#FFE9F4', // pale pink section backgrounds
  cream: '#FFF5FA', // app background

  // Ink
  ink: '#1E1420', // near-black plum for text
  inkSoft: '#6E5A66', // muted text
  inkFaint: '#A896A2', // captions / placeholders

  // Utility
  white: '#FFFFFF',
  black: '#141018',
  line: '#F4D6E7', // hairline borders
  success: '#3EC8A0',
  warning: '#FFB020',
  danger: '#FF5470',

  // Gradient stops for the hero
  gradientA: '#FF4FA3',
  gradientB: '#FF8AC7',
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const shadow = {
  card: {
    shadowColor: '#D6006E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  soft: {
    shadowColor: '#D6006E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  float: {
    shadowColor: '#D6006E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const font = {
  // System stack for now; can swap to a rounded display font later.
  display: undefined as string | undefined,
  weightBlack: '900' as const,
  weightBold: '800' as const,
  weightSemi: '700' as const,
  weightMed: '600' as const,
};

export const type = {
  hero: { fontSize: 34, fontWeight: font.weightBlack, color: colors.primaryDark, letterSpacing: 0.2 },
  h1: { fontSize: 26, fontWeight: font.weightBold, color: colors.ink },
  h2: { fontSize: 20, fontWeight: font.weightBold, color: colors.ink },
  h3: { fontSize: 16, fontWeight: font.weightSemi, color: colors.ink },
  body: { fontSize: 15, fontWeight: '500' as const, color: colors.ink },
  label: { fontSize: 13, fontWeight: font.weightSemi, color: colors.inkSoft },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.inkFaint },
} as const;

export const theme = { colors, radii, spacing, shadow, font, type };
export default theme;
