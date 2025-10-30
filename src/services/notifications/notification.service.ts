// src/services/notifications/notification.service.ts - PRODUCTION READY
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import BackendService from '../backend/backend.service';

// Notification ayarları
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PriceChangeNotification {
  productId: string;
  productTitle: string;
  oldPrice: number;
  newPrice: number;
  priceChangeAmount: number;
  priceChangePercentage: number;
  productImage?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Notification izinlerini al ve push token oluştur
   */
  async initialize(): Promise<string | null> {
    try {
      // Sadece fiziksel cihazlarda çalışır
      if (!Device.isDevice) {
        console.warn('⚠️  SIMULATOR ALGILAN DI');
        console.warn('⚠️  Push notification\'lar sadece fiziksel cihazlarda çalışır!');
        console.warn('⚠️  Backend\'e cihaz kaydı yapılamayacak.');
        console.warn('⚠️  Test etmek için gerçek iOS/Android cihaz kullanın.');
        return null;
      }

      // Mevcut izinleri kontrol et
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // İzin yoksa iste
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification izni reddedildi');
        return null;
      }

      // Push token al
      const token = await this.getExpoPushToken();
      this.expoPushToken = token;

      // Backend'e kaydet
      await BackendService.registerDevice(token);

      console.log('✅ Notification servisi başlatıldı:', token);
      return token;
    } catch (error) {
      console.error('❌ Notification initialization hatası:', error);
      return null;
    }
  }

  /**
   * Expo Push Token al
   */
  private async getExpoPushToken(): Promise<string> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId || undefined,
      });

      return token.data;
    } catch (error) {
      console.error('❌ Push token alma hatası:', error);
      throw error;
    }
  }

  /**
   * Fiyat düşüşü bildirimi gönder
   */
  async sendPriceDropNotification(data: PriceChangeNotification): Promise<void> {
    try {
      const priceChange = data.priceChangeAmount;
      const isPriceDrop = priceChange < 0;

      const title = isPriceDrop
        ? '🎉 Fiyat Düştü!'
        : '📈 Fiyat Değişikliği';

      const body = isPriceDrop
        ? `${data.productTitle}\n${Math.abs(data.priceChangeAmount).toFixed(2)} ₺ düştü (${Math.abs(data.priceChangePercentage).toFixed(1)}%)`
        : `${data.productTitle}\n${data.priceChangeAmount.toFixed(2)} ₺ arttı (${data.priceChangePercentage.toFixed(1)}%)`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'price_change',
            productId: data.productId,
            productTitle: data.productTitle,
            oldPrice: data.oldPrice,
            newPrice: data.newPrice,
            priceChangeAmount: data.priceChangeAmount,
            priceChangePercentage: data.priceChangePercentage,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Hemen gönder
      });

      console.log('✅ Notification gönderildi:', data.productTitle);
    } catch (error) {
      console.error('❌ Notification gönderme hatası:', error);
    }
  }

  /**
   * Test bildirimi gönder
   */
  async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Bazenda',
          body: 'Fiyat takip sistemi aktif! Favorilerinizde fiyat değişikliği olduğunda bildirim alacaksınız.',
          data: { type: 'test' },
          sound: true,
        },
        trigger: null,
      });

      console.log('✅ Test notification gönderildi');
    } catch (error) {
      console.error('❌ Test notification hatası:', error);
    }
  }

  /**
   * Notification badge sayısını güncelle
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('❌ Badge count hatası:', error);
    }
  }

  /**
   * Tüm bildirimleri temizle
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.setBadgeCount(0);
    } catch (error) {
      console.error('❌ Clear notifications hatası:', error);
    }
  }

  /**
   * Push token'ı al
   */
  getToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Notification listener ekle
   */
  addNotificationListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Notification response listener ekle (kullanıcı bildiriме tıkladığında)
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export default new NotificationService();
