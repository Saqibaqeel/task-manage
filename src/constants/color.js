/* -------------------- LIGHT PALETTE (existing) -------------------- */
export const palette = {
  brand: {
    50: '#eef4ff',
    100: '#dfeafe',
    200: '#c7dafe',
    300: '#a5b9ff',
    400: '#7c94ff',
    500: '#5b6ef7',
    600: '#3d4ad8',
    700: '#2d3ab0',
    800: '#242d89',
    900: '#1d265f',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: { 50: '#ecfdf5', 500: '#10b981', 600: '#059669' },
  warning: { 50: '#fff7ed', 500: '#f59e0b', 600: '#d97706' },
  error:   { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626' },
  info:    { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb' },
  white: '#ffffff',
  black: '#020817',
  background: '#f7f9fc',
  overlay: 'rgba(15, 23, 42, 0.32)',
};

/* -------------------- DARK PALETTE  -------------------- */
export const darkPalette = {
  brand: {
    50: '#1e2a5a',
    100: '#26347a',
    200: '#2f3f95',
    300: '#3d4ad8',
    400: '#5b6ef7',
    500: '#7c94ff',
    600: '#a5b9ff',
    700: '#c7dafe',
    800: '#dfeafe',
    900: '#eef4ff',
  },
  neutral: {
    50: '#0f172a',
    100: '#1e293b',
    200: '#334155',
    300: '#475569',
    400: '#64748b',
    500: '#94a3b8',
    600: '#cbd5e1',
    700: '#e2e8f0',
    800: '#f1f5f9',
    900: '#f8fafc',
  },
  success: { 50: '#0b2e20', 500: '#22c55e', 600: '#16a34a' },
  warning: { 50: '#3a2506', 500: '#fbbf24', 600: '#f59e0b' },
  error:   { 50: '#3b0d0d', 500: '#f87171', 600: '#ef4444' },
  info:    { 50: '#0c2340', 500: '#60a5fa', 600: '#3b82f6' },
  white: '#0b1220',   // inverted: "white" means base card surface in dark mode
  black: '#f8fafc',   // inverted: "black" means primary text in dark mode
  background: '#0b1220',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

/* -------------------- SEMANTIC LIGHT COLORS -------------------- */
export const COLORS = {
  primary: palette.brand[600],
  primarySoft: palette.brand[50],
  secondary: palette.neutral[900],
  muted: palette.neutral[500],
  border: palette.neutral[200],
  surface: palette.white,
  background: palette.background,
  success: palette.success[500],
  warning: palette.warning[500],
  error: palette.error[500],
  info: palette.info[500],
  white: palette.white,
  black: palette.black,
  shadow: 'rgba(15, 23, 42, 0.12)',
  text: palette.neutral[900],
  textSecondary: palette.neutral[600],
  textMuted: palette.neutral[500],
  textInverse: palette.white,
  divider: palette.neutral[100],
  surfaceAlt: palette.neutral[100],
  inputBackground: palette.white,
  inputBorder: palette.neutral[300],
  inputPlaceholder: palette.neutral[400],
  overlay: palette.overlay,
};

/* -------------------- SEMANTIC DARK COLORS -------------------- */
export const DARK_COLORS = {
  primary: darkPalette.brand[600],
  primarySoft: darkPalette.brand[50],
  secondary: darkPalette.neutral[900],
  muted: darkPalette.neutral[500],
  border: darkPalette.neutral[200],
  surface: darkPalette.white,
  background: darkPalette.background,
  success: darkPalette.success[500],
  warning: darkPalette.warning[500],
  error: darkPalette.error[500],
  info: darkPalette.info[500],
  white: darkPalette.white,
  black: darkPalette.black,
  shadow: 'rgba(0, 0, 0, 0.5)',
  text: darkPalette.neutral[900],
  textSecondary: darkPalette.neutral[600],
  textMuted: darkPalette.neutral[500],
  textInverse: darkPalette.neutral[50],
  divider: darkPalette.neutral[100],
  surfaceAlt: darkPalette.neutral[100],
  inputBackground: darkPalette.neutral[50],
  inputBorder: darkPalette.neutral[200],
  inputPlaceholder: darkPalette.neutral[400],
  overlay: darkPalette.overlay,
};

/* -------------------- TOKENS (shared) -------------------- */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 20, xl: 24, xxl: 32 };
export const radii = { sm: 8, md: 12, lg: 16, xl: 20, full: 999 };

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  sizes: {
    caption: 10, body2: 12, body1: 14, subtitle: 16,
    h6: 20, h5: 24, h4: 28, h3: 32, h2: 40,
  },
  lineHeights: {
    caption: 14, body2: 18, body1: 20, subtitle: 24,
    h6: 28, h5: 30, h4: 34, h3: 38, h2: 48,
  },
};

export const VARIANTS = [
  'caption', 'body2', 'body1', 'subtitle',
  'h6', 'h5', 'h4', 'h3', 'h2',
];

export const COLOR_OPTIONS = [
  'primary', 'secondary', 'muted', 'success', 'warning',
  'error', 'info', 'white', 'black', 'text', 'textSecondary', 'textMuted',
];

export default COLORS;