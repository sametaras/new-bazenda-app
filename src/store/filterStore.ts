/**
 * Filter Store
 * Advanced search filters with Zustand
 */

import { create } from 'zustand';
import { SearchFilters, ActiveFilters, FilterOption } from '../types/filter.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FILTER_STORAGE_KEY = 'bazenda_search_filters';

interface FilterState {
  // Current filters
  filters: SearchFilters;

  // Active filters with labels (for display)
  activeFilters: ActiveFilters;

  // Available options from API
  availableColors: FilterOption[];
  availableSizes: FilterOption[];
  availableBrands: FilterOption[];

  // Loading states
  isLoadingColors: boolean;
  isLoadingSize: boolean;
  isLoadingSizes: boolean;
  isLoadingBrands: boolean;

  // Actions
  setColors: (colors: string[], labels: string[]) => void;
  setSizes: (sizes: string[], labels: string[]) => void;
  setBrands: (brands: string[], labels: string[]) => void;
  setGenders: (genders: number[], labels: string[]) => void;
  setPriceRange: (min?: string, max?: string) => void;

  setAvailableColors: (colors: FilterOption[]) => void;
  setAvailableSizes: (sizes: FilterOption[]) => void;
  setAvailableBrands: (brands: FilterOption[]) => void;

  setLoadingColors: (loading: boolean) => void;
  setLoadingSizes: (loading: boolean) => void;
  setLoadingBrands: (loading: boolean) => void;

  clearFilters: () => void;
  clearAllFilters: () => void;

  // Get active filter count
  getActiveFilterCount: () => number;

  // Check if filters are active
  hasActiveFilters: () => boolean;

  // Load/Save to AsyncStorage
  loadFilters: () => Promise<void>;
  saveFilters: () => Promise<void>;
}

const initialFilters: SearchFilters = {
  colors: [],
  sizes: [],
  brands: [],
  genders: [],
  priceMin: undefined,
  priceMax: undefined,
};

const initialActiveFilters: ActiveFilters = {
  ...initialFilters,
  colorLabels: [],
  sizeLabels: [],
  brandLabels: [],
  genderLabels: [],
};

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: initialFilters,
  activeFilters: initialActiveFilters,

  availableColors: [],
  availableSizes: [],
  availableBrands: [],

  isLoadingColors: false,
  isLoadingSize: false,
  isLoadingSizes: false,
  isLoadingBrands: false,

  setColors: (colors, labels) => {
    set(state => ({
      filters: { ...state.filters, colors },
      activeFilters: { ...state.activeFilters, colors, colorLabels: labels },
    }));
    get().saveFilters();
  },

  setSizes: (sizes, labels) => {
    set(state => ({
      filters: { ...state.filters, sizes },
      activeFilters: { ...state.activeFilters, sizes, sizeLabels: labels },
    }));
    get().saveFilters();
  },

  setBrands: (brands, labels) => {
    set(state => ({
      filters: { ...state.filters, brands },
      activeFilters: { ...state.activeFilters, brands, brandLabels: labels },
    }));
    get().saveFilters();
  },

  setGenders: (genders, labels) => {
    set(state => ({
      filters: { ...state.filters, genders },
      activeFilters: { ...state.activeFilters, genders, genderLabels: labels },
    }));
    get().saveFilters();
  },

  setPriceRange: (min, max) => {
    set(state => ({
      filters: { ...state.filters, priceMin: min, priceMax: max },
      activeFilters: { ...state.activeFilters, priceMin: min, priceMax: max },
    }));
    get().saveFilters();
  },

  setAvailableColors: (colors) => set({ availableColors: colors }),
  setAvailableSizes: (sizes) => set({ availableSizes: sizes }),
  setAvailableBrands: (brands) => set({ availableBrands: brands }),

  setLoadingColors: (loading) => set({ isLoadingColors: loading }),
  setLoadingSizes: (loading) => set({ isLoadingSizes: loading }),
  setLoadingBrands: (loading) => set({ isLoadingBrands: loading }),

  clearFilters: () => {
    set({
      filters: initialFilters,
      activeFilters: initialActiveFilters,
    });
    get().saveFilters();
  },

  clearAllFilters: () => {
    set({
      filters: initialFilters,
      activeFilters: initialActiveFilters,
      availableColors: [],
      availableSizes: [],
      availableBrands: [],
    });
    AsyncStorage.removeItem(FILTER_STORAGE_KEY);
  },

  getActiveFilterCount: () => {
    const { filters } = get();
    let count = 0;

    if (filters.colors.length > 0) count++;
    if (filters.sizes.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.genders.length > 0) count++;
    if (filters.priceMin || filters.priceMax) count++;

    return count;
  },

  hasActiveFilters: () => {
    return get().getActiveFilterCount() > 0;
  },

  loadFilters: async () => {
    try {
      const stored = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          filters: parsed.filters || initialFilters,
          activeFilters: parsed.activeFilters || initialActiveFilters,
        });
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  },

  saveFilters: async () => {
    try {
      const { filters, activeFilters } = get();
      await AsyncStorage.setItem(
        FILTER_STORAGE_KEY,
        JSON.stringify({ filters, activeFilters })
      );
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  },
}));
