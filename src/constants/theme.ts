// Scrible Design System — Color Palette & Theme
export const Colors = {
  // Primary palette
  primary: '#FF6B9D',
  primaryLight: '#FF8FB8',
  primaryDark: '#E04E80',

  // Secondary palette
  secondary: '#C44BFF',
  secondaryLight: '#D47FFF',
  secondaryDark: '#9B2ED6',

  // Accent
  accent: '#FFD166',
  accentLight: '#FFE099',
  accentDark: '#E6B84D',

  // Backgrounds
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#252540',
  surfaceElevated: '#2D2D4A',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B8B8D0',
  textMuted: '#6B6B8A',

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassLight: 'rgba(255, 255, 255, 0.10)',

  // Status
  online: '#4ADE80',
  offline: '#6B6B8A',
  error: '#FF4D6A',
  success: '#4ADE80',

  // Gradients (used as arrays for LinearGradient)
  gradientPrimary: ['#FF6B9D', '#C44BFF'] as const,
  gradientAccent: ['#FFD166', '#FF6B9D'] as const,
  gradientDark: ['#1A1A2E', '#0F0F1A'] as const,
  gradientSurface: ['#252540', '#1A1A2E'] as const,

  // Drawing canvas colors
  canvasColors: [
    '#FF6B9D', '#C44BFF', '#FFD166', '#4ADE80', '#60A5FA',
    '#F472B6', '#FB923C', '#FFFFFF', '#A78BFA', '#34D399',
  ],
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 36,
} as const;

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  }),
} as const;
