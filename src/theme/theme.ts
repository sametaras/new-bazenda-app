// src/theme/theme.ts - PRODUCTION READY WITH OPTIMIZED SIZES
export const colors = {
  // Bazenda Brand
  primary: '#f67310',
  primaryLight: '#ff8533',
  primaryDark: '#e55a00',
  
  secondary: '#042b5a',
  secondaryLight: '#0066B3',
  
  // Tag Colors
  tag1: '#FF6B6B',
  tag2: '#4ECDC4',
  tag3: '#45B7D1',
  tag4: '#96CEB4',
  tag5: '#9B59B6',
  
  // Neutrals
  black: '#1A1A1A',
  white: '#FFFFFF',
  
  // Grays
  gray50: '#F8F9FA',
  gray100: '#F1F3F5',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#868E96',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  
  // Status
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#2196F3',
  
  // Badges
  badgeBAI: '#f67310',
  badgeTrend: '#ffc107',
  badgeSale: '#dc3545',
  badgeNew: '#28a745',
  
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8F9FA',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  round: 9999,
};

// Optimized typography - smaller, cleaner sizes
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  tiny: {
    fontSize: 10,
    fontWeight: '400' as const,
    lineHeight: 14,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};