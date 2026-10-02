import {
  COLORS,
  DARK_COLORS,
  spacing,
  radii,
  typography,
} from './color';

const sharedShadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
};

export const lightTheme = {
  mode: 'light',
  colors: COLORS,
  spacing,
  borderRadius: radii,
  typography,
  shadows: sharedShadows,
};

export const darkTheme = {
  mode: 'dark',
  colors: DARK_COLORS,
  spacing,
  borderRadius: radii,
  typography,
  shadows: sharedShadows,
};

export const theme = lightTheme;

export default theme;