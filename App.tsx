// App.tsx - PRODUCTION READY WITH PRICE TRACKING
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import NotificationService from './src/services/notifications/notification.service';
import PriceTrackerService from './src/services/priceTracker/priceTracker.service';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Servisleri başlat
    initializeServices();

    // Notification listener'ları ekle
    notificationListener.current = NotificationService.addNotificationListener(
      (notification) => {
        console.log('📬 Bildirim alındı:', notification);
      }
    );

    responseListener.current = NotificationService.addNotificationResponseListener(
      (response) => {
        console.log('👆 Bildirime tıklandı:', response);
        // Burada kullanıcıyı ilgili ürün sayfasına yönlendirebilirsiniz
      }
    );

    // App state değişikliklerini dinle
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Cleanup
      notificationListener.current?.remove();
      responseListener.current?.remove();
      subscription.remove();
    };
  }, []);

  const initializeServices = async () => {
    try {
      console.log('🚀 Servisler başlatılıyor...');

      // Notification servisini başlat
      await NotificationService.initialize();

      // Price tracker servisini başlat
      await PriceTrackerService.initialize();

      console.log('✅ Tüm servisler başlatıldı');
    } catch (error) {
      console.error('❌ Servis başlatma hatası:', error);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Uygulama background'dan foreground'a geçtiğinde fiyatları kontrol et
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('📱 Uygulama aktif hale geldi, fiyatlar kontrol ediliyor...');
      PriceTrackerService.checkNow().catch(console.error);
    }

    appState.current = nextAppState;
  };

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="dark" />
            <RootNavigator />
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}