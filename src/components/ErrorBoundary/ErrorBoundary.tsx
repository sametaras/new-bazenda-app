// src/components/ErrorBoundary/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ENV_CONFIG from '../../config/env.config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Uygulama çökmelerini yakalar ve kullanıcı dostu bir hata ekranı gösterir
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Bir sonraki render'da fallback UI göster
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Hatayı loglayın
    console.error('🔴 Error Boundary Caught:', error);
    console.error('Component Stack:', errorInfo.componentStack);

    // Production'da error reporting servise gönder
    if (ENV_CONFIG.enableErrorReporting) {
      this.reportError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Burada Sentry, Firebase Crashlytics vb. servisler kullanılabilir
    console.log('📊 Reporting error to monitoring service...');

    // Örnek: Sentry integration
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    // });
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI varsa onu göster
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <Ionicons name="warning-outline" size={64} color="#FF6B6B" />

          <Text style={styles.title}>Bir Hata Oluştu</Text>

          <Text style={styles.message}>
            Üzgünüz, bir şeyler yanlış gitti. Lütfen uygulamayı yeniden başlatmayı deneyin.
          </Text>

          {ENV_CONFIG.debugMode && this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorTitle}>Hata Detayları (Debug Mode):</Text>
              <Text style={styles.errorText}>{this.state.error.toString()}</Text>
              {this.state.errorInfo && (
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorDetails: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
  },
  stackText: {
    fontSize: 10,
    color: '#999999',
    fontFamily: 'monospace',
    marginTop: 8,
  },
});

export default ErrorBoundary;
