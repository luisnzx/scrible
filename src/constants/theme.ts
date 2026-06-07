// Scrible Design System — Color Palette & Theme
export const Colors = {
  // Primary palette (Green/Emerald)
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',

  // Secondary palette (Teal)
  secondary: '#0D9488',
  secondaryLight: '#14B8A6',
  secondaryDark: '#0F766E',

  // Accent
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentDark: '#D97706',

  // Backgrounds
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  surfaceElevated: '#475569',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassLight: 'rgba(255, 255, 255, 0.08)',

  // Status
  online: '#22C55E',
  offline: '#64748B',
  error: '#EF4444',
  success: '#22C55E',

  // Gradients (used as arrays for LinearGradient)
  gradientPrimary: ['#10B981', '#0D9488'] as const,
  gradientAccent: ['#F59E0B', '#10B981'] as const,
  gradientDark: ['#1E293B', '#0F172A'] as const,
  gradientSurface: ['#334155', '#1E293B'] as const,

  // Drawing canvas colors
  canvasColors: [
    '#10B981', '#0D9488', '#F59E0B', '#22C55E', '#3B82F6',
    '#EF4444', '#A855F7', '#F8FAFC', '#14B8A6', '#8B5CF6',
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
