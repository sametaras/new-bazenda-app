// src/store/favoritesStore.ts - ENHANCED WITH PRICE TRACKING + BACKEND SYNC
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';
import backendService from '../services/backend/backend.service';

export interface FavoriteProduct {
  product: Product;
  addedAt: number;
  lastCheckedPrice: number;
  initialPrice: number;
  priceHistory: Array<{
    price: number;
    timestamp: number;
  }>;
  priceChanged: boolean;
  priceChangeAmount?: number;
  priceChangePercentage?: number;
  notificationSent?: boolean;
}

interface FavoritesStore {
  favorites: Record<string, FavoriteProduct>;

  // Favori ekleme/çıkarma
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  getFavorite: (productId: string) => FavoriteProduct | undefined;
  getAllFavorites: () => FavoriteProduct[];

  // Fiyat güncellemeleri
  updateProductPrice: (productId: string, newPrice: number) => void;
  markNotificationSent: (productId: string) => void;
  clearPriceChange: (productId: string) => void;

  // Utility
  clearFavorites: () => void;
  getFavoriteCount: () => number;
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: {},

      addFavorite: (product: Product) => {
        // Fiyat kontrolü - undefined veya boş string durumunda varsayılan değer
        const priceString = product.price || product.save_price?.toString() || '0';
        const currentPrice = parseFloat(priceString.toString().replace(/[^0-9.]/g, '')) || 0;

        // ⚠️ Geçersiz fiyat kontrolü
        if (isNaN(currentPrice) || currentPrice <= 0) {
          console.warn('Invalid price for product:', product.product_id, 'price:', product.price);
        }

        set((state) => {
          const newFavorites = { ...state.favorites };
          newFavorites[product.product_id] = {
            product,
            addedAt: Date.now(),
            lastCheckedPrice: currentPrice,
            initialPrice: currentPrice,
            priceHistory: [{
              price: currentPrice,
              timestamp: Date.now()
            }],
            priceChanged: false,
          };
          return { favorites: newFavorites };
        });

        // ✅ Backend'e de bildir (arka planda, sessizce)
        const validPrice = currentPrice > 0 ? currentPrice : 1; // Backend'e 0 gönderme
        backendService.addFavoriteToBackend(product.product_id, validPrice).catch(err => {
          console.error('❌ Backend sync failed for addFavorite:', err.response?.data || err.message);
        });
      },

      removeFavorite: (productId: string) => {
        set((state) => {
          const newFavorites = { ...state.favorites };
          delete newFavorites[productId];
          return { favorites: newFavorites };
        });

        // ✅ Backend'e de bildir (arka planda, sessizce)
        backendService.removeFavoriteFromBackend(productId).catch(err => {
          console.warn('Backend sync failed for removeFavorite:', err);
        });
      },

      toggleFavorite: (product: Product) => {
        const state = get();
        if (product.product_id in state.favorites) {
          state.removeFavorite(product.product_id);
        } else {
          state.addFavorite(product);
        }
      },

      isFavorite: (productId: string) => {
        return productId in get().favorites;
      },

      getFavorite: (productId: string) => {
        return get().favorites[productId];
      },

      getAllFavorites: () => {
        return Object.values(get().favorites);
      },

      updateProductPrice: (productId: string, newPrice: number) => {
        set((state) => {
          const favorite = state.favorites[productId];
          if (!favorite) return state;

          const priceChange = newPrice - favorite.lastCheckedPrice;
          const priceChangePercentage = ((priceChange / favorite.lastCheckedPrice) * 100);

          const newFavorites = { ...state.favorites };
          newFavorites[productId] = {
            ...favorite,
            lastCheckedPrice: newPrice,
            priceHistory: [
              ...favorite.priceHistory,
              {
                price: newPrice,
                timestamp: Date.now()
              }
            ],
            priceChanged: Math.abs(priceChange) > 0.01, // Küçük farkları yok say
            priceChangeAmount: priceChange,
            priceChangePercentage,
            notificationSent: false,
          };

          return { favorites: newFavorites };
        });
      },

      markNotificationSent: (productId: string) => {
        set((state) => {
          const favorite = state.favorites[productId];
          if (!favorite) return state;

          const newFavorites = { ...state.favorites };
          newFavorites[productId] = {
            ...favorite,
            notificationSent: true,
          };

          return { favorites: newFavorites };
        });
      },

      clearPriceChange: (productId: string) => {
        set((state) => {
          const favorite = state.favorites[productId];
          if (!favorite) return state;

          const newFavorites = { ...state.favorites };
          newFavorites[productId] = {
            ...favorite,
            priceChanged: false,
            priceChangeAmount: undefined,
            priceChangePercentage: undefined,
            notificationSent: false,
          };

          return { favorites: newFavorites };
        });
      },

      clearFavorites: () => {
        console.log('🗑️ Clearing all favorites...');
        set({ favorites: {} });

        // ✅ Backend'e de bildir (tüm favorileri temizle)
        console.log('📤 Syncing empty favorites array to backend...');
        backendService.syncFavorites([]).then(success => {
          if (success) {
            console.log('✅ Backend favorites cleared successfully');
          } else {
            console.warn('⚠️  Backend favorites clear returned false');
          }
        }).catch(err => {
          console.error('❌ Backend sync failed for clearFavorites:', err.response?.data || err.message);
        });
      },

      getFavoriteCount: () => {
        return Object.keys(get().favorites).length;
      },
    }),
    {
      name: 'bazenda-favorites-v3',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);