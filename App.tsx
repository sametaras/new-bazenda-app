// App.tsx - PRODUCTION READY WITH BACKEND PRICE TRACKING
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import NotificationService from './src/services/notifications/notification.service';

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

        // Notification data'dan screen bilgisini al
        const screen = response.notification.request.content.data?.screen;

        if (screen === 'Favorites') {
          console.log('🔗 Navigate to Favorites screen');
          // TODO: Navigation ref ile Favorites ekranına yönlendir
        }
      }
    );

    return () => {
      // Cleanup
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const initializeServices = async () => {
    try {
      console.log('🚀 Servisler başlatılıyor...');

      // Notification servisini başlat (Backend device kaydı burada yapılır)
      await NotificationService.initialize();

      console.log('✅ Tüm servisler başlatıldı');
      console.log('ℹ️  Fiyat kontrolü backend cron job tarafından yapılıyor');
    } catch (error) {
      console.error('❌ Servis başlatma hatası:', error);
    }
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