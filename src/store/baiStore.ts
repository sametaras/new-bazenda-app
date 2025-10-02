// src/store/baiStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchHistory, SearchFilters, Product } from '../types';
import BAIService from '../services/api/bai.api';

interface BAIStore {
  // State
  searchHistory: SearchHistory[];
  currentSearch: SearchHistory | null;
  isSearching: boolean;
  searchError: string | null;
  
  // Actions
  performSearch: (imageUri: string, filters?: SearchFilters) => Promise<void>;
  addToHistory: (search: SearchHistory) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  setCurrentSearch: (search: SearchHistory | null) => void;
  retrySearch: (historyId: string) => Promise<void>;
}

export const useBaiStore = create<BAIStore>()(
  persist(
    (set, get) => ({
      // Initial State
      searchHistory: [],
      currentSearch: null,
      isSearching: false,
      searchError: null,
      
      // Arama yap
      performSearch: async (imageUri: string, filters?: SearchFilters) => {
        set({ isSearching: true, searchError: null });
        
        try {
          // 1. Thumbnail oluştur
          const thumbnail = await BAIService.createThumbnail(imageUri);
          
          // 2. API'ye arama isteği gönder
          const response = await BAIService.visualSearch(imageUri, filters);
          
          if (!response.success) {
            throw new Error(response.message || 'Arama başarısız oldu');
          }
          
          // 3. Sonuçları filtrele (client-side)
          const filteredResults = filters 
            ? BAIService.filterResults(response.results, filters)
            : response.results;
          
          // 4. Arama geçmişine ekle
          const searchRecord: SearchHistory = {
            id: Date.now().toString(),
            imageUri,
            thumbnail,
            results: filteredResults,
            timestamp: Date.now(),
            filters,
          };
          
          get().addToHistory(searchRecord);
          set({ 
            currentSearch: searchRecord,
            isSearching: false 
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Bilinmeyen bir hata oluştu';
          
          set({ 
            isSearching: false,
            searchError: errorMessage 
          });
          
          throw error;
        }
      },
      
      // Geçmişe ekle
      addToHistory: (search: SearchHistory) => {
        set((state) => ({
          searchHistory: [search, ...state.searchHistory].slice(0, 50) // Max 50
        }));
      },
      
      // Geçmişi temizle
      clearHistory: () => {
        set({ searchHistory: [], currentSearch: null });
      },
      
      // Geçmişten sil
      removeFromHistory: (id: string) => {
        set((state) => ({
          searchHistory: state.searchHistory.filter(item => item.id !== id)
        }));
      },
      
      // Mevcut aramayı ayarla
      setCurrentSearch: (search: SearchHistory | null) => {
        set({ currentSearch: search });
      },
      
      // Aramayı tekrarla
      retrySearch: async (historyId: string) => {
        const search = get().searchHistory.find(s => s.id === historyId);
        if (search) {
          await get().performSearch(search.imageUri, search.filters);
        }
      },
    }),
    {
      name: 'bazenda-bai-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        searchHistory: state.searchHistory,
      }),
    }
  )
);

// Selectors
export const useSearchHistory = () => useBaiStore(state => state.searchHistory);
export const useCurrentSearch = () => useBaiStore(state => state.currentSearch);
export const useIsSearching = () => useBaiStore(state => state.isSearching);
export const useSearchError = () => useBaiStore(state => state.searchError);