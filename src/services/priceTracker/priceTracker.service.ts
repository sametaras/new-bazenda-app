// src/services/priceTracker/priceTracker.service.ts - PRODUCTION READY
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useFavorites } from '../../store/favoritesStore';
import ProductsService from '../api/products.api';
import NotificationService from '../notifications/notification.service';
import ENV_CONFIG from '../../config/env.config';

const PRICE_CHECK_TASK = 'BAZENDA_PRICE_CHECK';
const CHECK_INTERVAL = 60 * 60; // 1 saat (saniye cinsinden)

// Background task tanımla
TaskManager.defineTask(PRICE_CHECK_TASK, async () => {
  try {
    console.log('🔄 Background price check başladı:', new Date().toISOString());

    const result = await PriceTrackerService.checkPrices();

    console.log('✅ Background price check tamamlandı:', {
      checked: result.checked,
      changed: result.changed,
      errors: result.errors,
    });

    return result.errors === 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.Failed;
  } catch (error) {
    console.error('❌ Background task hatası:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

interface PriceCheckResult {
  checked: number;
  changed: number;
  errors: number;
  details: Array<{
    productId: string;
    productTitle: string;
    oldPrice: number;
    newPrice: number;
    change: number;
  }>;
}

class PriceTrackerService {
  private isRegistered = false;

  /**
   * Background fetch servisini başlat
   */
  async initialize(): Promise<void> {
    try {
      // Background fetch'in durumunu kontrol et
      const status = await BackgroundFetch.getStatusAsync();

      if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
        await this.registerBackgroundTask();
        console.log('✅ Price tracker servisi başlatıldı');
      } else {
        console.log('⚠️ Background fetch mevcut değil:', status);
      }
    } catch (error) {
      console.error('❌ Price tracker initialization hatası:', error);
    }
  }

  /**
   * Background task kaydet
   */
  private async registerBackgroundTask(): Promise<void> {
    try {
      // Önce mevcut task'ı unregister et
      await this.unregisterBackgroundTask();

      // Yeni task kaydet
      await BackgroundFetch.registerTaskAsync(PRICE_CHECK_TASK, {
        minimumInterval: CHECK_INTERVAL, // 1 saat
        stopOnTerminate: false, // Uygulama kapansa bile çalış
        startOnBoot: true, // Cihaz yeniden başlatıldığında başlat
      });

      this.isRegistered = true;
      console.log('✅ Background task kaydedildi');
    } catch (error) {
      console.error('❌ Background task kayıt hatası:', error);
      throw error;
    }
  }

  /**
   * Background task'ı kaldır
   */
  async unregisterBackgroundTask(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(PRICE_CHECK_TASK);

      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(PRICE_CHECK_TASK);
        console.log('✅ Background task kaldırıldı');
      }

      this.isRegistered = false;
    } catch (error) {
      console.error('❌ Background task kaldırma hatası:', error);
    }
  }

  /**
   * Fiyatları kontrol et (manuel veya background)
   */
  static async checkPrices(): Promise<PriceCheckResult> {
    const result: PriceCheckResult = {
      checked: 0,
      changed: 0,
      errors: 0,
      details: [],
    };

    try {
      const store = useFavorites.getState();
      const favorites = store.getAllFavorites();

      if (favorites.length === 0) {
        console.log('ℹ️ Kontrol edilecek favori ürün yok');
        return result;
      }

      console.log(`🔍 ${favorites.length} favori ürün kontrol ediliyor...`);

      // Her favori ürün için fiyat kontrolü yap
      for (const favorite of favorites) {
        try {
          result.checked++;

          // API'den güncel ürün bilgilerini al
          const { products } = await ProductsService.searchProducts(
            favorite.product.product_id,
            1
          );

          if (products.length === 0) {
            console.log(`⚠️ Ürün bulunamadı: ${favorite.product.product_id}`);
            continue;
          }

          const updatedProduct = products[0];
          const newPrice = parseFloat(updatedProduct.price.replace(/[^0-9.-]/g, ''));
          const oldPrice = favorite.lastCheckedPrice;

          // Fiyat değişti mi kontrol et
          if (Math.abs(newPrice - oldPrice) > 0.01) {
            const priceChange = newPrice - oldPrice;
            const priceChangePercentage = ((priceChange / oldPrice) * 100);

            console.log(`💰 Fiyat değişikliği tespit edildi:`, {
              product: favorite.product.product_title,
              oldPrice,
              newPrice,
              change: priceChange,
              percentage: priceChangePercentage.toFixed(2) + '%',
            });

            // Store'u güncelle
            store.updateProductPrice(favorite.product.product_id, newPrice);

            // Bildirim gönder (sadece fiyat düşüşlerinde veya %5'ten fazla artışta)
            const shouldNotify =
              priceChange < 0 || // Fiyat düşüşleri her zaman
              Math.abs(priceChangePercentage) > 5; // %5'ten fazla artış

            if (shouldNotify && !favorite.notificationSent) {
              await NotificationService.sendPriceDropNotification({
                productId: favorite.product.product_id,
                productTitle: favorite.product.product_title,
                oldPrice,
                newPrice,
                priceChangeAmount: priceChange,
                priceChangePercentage,
                productImage: favorite.product.image_link,
              });

              store.markNotificationSent(favorite.product.product_id);
            }

            result.changed++;
            result.details.push({
              productId: favorite.product.product_id,
              productTitle: favorite.product.product_title,
              oldPrice,
              newPrice,
              change: priceChange,
            });
          }

          // Rate limiting için kısa bir bekleme
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`❌ Ürün fiyat kontrolü hatası:`, error);
          result.errors++;
        }
      }

      console.log('✅ Fiyat kontrolü tamamlandı:', result);
      return result;
    } catch (error) {
      console.error('❌ Fiyat kontrolü genel hatası:', error);
      result.errors++;
      return result;
    }
  }

  /**
   * Manuel fiyat kontrolü tetikle
   */
  async checkNow(): Promise<PriceCheckResult> {
    console.log('🔄 Manuel fiyat kontrolü başlatılıyor...');
    return await PriceTrackerService.checkPrices();
  }

  /**
   * Servis durumunu kontrol et
   */
  async getStatus(): Promise<{
    isRegistered: boolean;
    backgroundFetchStatus: BackgroundFetch.BackgroundFetchStatus;
    favoriteCount: number;
  }> {
    const status = await BackgroundFetch.getStatusAsync();
    const favoriteCount = useFavorites.getState().getFavoriteCount();

    return {
      isRegistered: this.isRegistered,
      backgroundFetchStatus: status,
      favoriteCount,
    };
  }
}

export default new PriceTrackerService();
