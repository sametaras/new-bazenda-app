// src/config/env.config.ts
import Constants from 'expo-constants';

/**
 * Environment Configuration
 * Bu dosya farklı environment'lar için merkezi konfigürasyon sağlar
 */

interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  timeout: number;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  debugMode: boolean;
}

// Environment'a göre API URL belirleme
const getApiUrl = (): string => {
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel || 'development';

  switch (releaseChannel) {
    case 'production':
      return 'https://bazenda.com/api';
    case 'staging':
      return 'https://staging.bazenda.com/api';
    default:
      return 'https://bazenda.com/api'; // Development için de production API kullanıyoruz
  }
};

// Environment'a göre configuration
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel || 'development';

  if (releaseChannel === 'production') return 'production';
  if (releaseChannel === 'staging') return 'staging';
  return 'development';
};

export const ENV_CONFIG: AppConfig = {
  apiUrl: getApiUrl(),
  environment: getEnvironment(),
  timeout: 15000,
  enableAnalytics: getEnvironment() === 'production',
  enableErrorReporting: getEnvironment() === 'production' || getEnvironment() === 'staging',
  debugMode: getEnvironment() === 'development',
};

// Debug için environment bilgisini konsola yazdır
if (__DEV__) {
  console.log('🔧 Environment Config:', {
    environment: ENV_CONFIG.environment,
    apiUrl: ENV_CONFIG.apiUrl,
    enableAnalytics: ENV_CONFIG.enableAnalytics,
    enableErrorReporting: ENV_CONFIG.enableErrorReporting,
  });
}

export default ENV_CONFIG;
