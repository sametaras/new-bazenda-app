// src/store/favoritesStore.ts - ENHANCED WITH PRICE TRACKING
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';

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
  favorites: Map<string, FavoriteProduct>;

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
      favorites: new Map<string, FavoriteProduct>(),

      addFavorite: (product: Product) => {
        const currentPrice = parseFloat(product.price.replace(/[^0-9.-]/g, ''));

        set((state) => {
          const newFavorites = new Map(state.favorites);
          newFavorites.set(product.product_id, {
            product,
            addedAt: Date.now(),
            lastCheckedPrice: currentPrice,
            initialPrice: currentPrice,
            priceHistory: [{
              price: currentPrice,
              timestamp: Date.now()
            }],
            priceChanged: false,
          });
          return { favorites: newFavorites };
        });
      },

      removeFavorite: (productId: string) => {
        set((state) => {
          const newFavorites = new Map(state.favorites);
          newFavorites.delete(productId);
          return { favorites: newFavorites };
        });
      },

      toggleFavorite: (product: Product) => {
        const state = get();
        if (state.favorites.has(product.product_id)) {
          state.removeFavorite(product.product_id);
        } else {
          state.addFavorite(product);
        }
      },

      isFavorite: (productId: string) => {
        return get().favorites.has(productId);
      },

      getFavorite: (productId: string) => {
        return get().favorites.get(productId);
      },

      getAllFavorites: () => {
        return Array.from(get().favorites.values());
      },

      updateProductPrice: (productId: string, newPrice: number) => {
        set((state) => {
          const favorite = state.favorites.get(productId);
          if (!favorite) return state;

          const priceChange = newPrice - favorite.lastCheckedPrice;
          const priceChangePercentage = ((priceChange / favorite.lastCheckedPrice) * 100);

          const newFavorites = new Map(state.favorites);
          newFavorites.set(productId, {
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
          });

          return { favorites: newFavorites };
        });
      },

      markNotificationSent: (productId: string) => {
        set((state) => {
          const favorite = state.favorites.get(productId);
          if (!favorite) return state;

          const newFavorites = new Map(state.favorites);
          newFavorites.set(productId, {
            ...favorite,
            notificationSent: true,
          });

          return { favorites: newFavorites };
        });
      },

      clearPriceChange: (productId: string) => {
        set((state) => {
          const favorite = state.favorites.get(productId);
          if (!favorite) return state;

          const newFavorites = new Map(state.favorites);
          newFavorites.set(productId, {
            ...favorite,
            priceChanged: false,
            priceChangeAmount: undefined,
            priceChangePercentage: undefined,
            notificationSent: false,
          });

          return { favorites: newFavorites };
        });
      },

      clearFavorites: () => {
        set({ favorites: new Map() });
      },

      getFavoriteCount: () => {
        return get().favorites.size;
      },
    }),
    {
      name: 'bazenda-favorites-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);