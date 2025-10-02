// src/theme/theme.ts
export const colors = {
    // Brand Colors
    primary: '#FF6B35',        // Bazenda Orange
    primaryLight: '#FF8C61',
    primaryDark: '#E55A2B',
    
    secondary: '#004E89',      // Blue
    secondaryLight: '#0066B3',
    
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
    success: '#00D9A5',
    warning: '#FFB800',
    error: '#FF5252',
    info: '#2196F3',
    
    // Badge Colors
    badgeBAI: '#FF6B35',
    badgeTrend: '#FFD700',
    badgeSale: '#FF5252',
    badgeNew: '#00D9A5',
    
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
  
  export const typography = {
    // Headings
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
      letterSpacing: 0,
    },
    
    // Body
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    
    // Small
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      letterSpacing: 0,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
      letterSpacing: 0,
    },
    
    // Button
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
      letterSpacing: 0.5,
    },
  };
  
  export const shadows = {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  };
  
  export const theme = {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
  };
  
  export type Theme = typeof theme;