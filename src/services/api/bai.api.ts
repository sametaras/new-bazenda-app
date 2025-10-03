// src/services/api/bazenda.api.ts
import axios from 'axios';

const API_BASE_URL = 'https://bazenda.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

export const bazendaApi = {
  // Trend ürünleri getir (anasayfa için)
  getTrendProducts: async () => {
    const response = await apiClient.post('/get_results', {
      page: 1,
      sort_by: 0,
      search_type: 'text',
    });
    return response.data;
  },

  // Metin araması
  searchProducts: async (query: string, filters?: any) => {
    const response = await apiClient.post('/get_results', {
      query,
      page: filters?.page || 1,
      sort_by: filters?.sort_by || 0,
      search_type: 'text',
      ...filters,
    });
    return response.data;
  },

  // Ürün fiyat geçmişi
  getProductHistory: async (productId: string) => {
    const response = await apiClient.post('/get_history', {
      current_id: productId,
    });
    return response.data;
  },

  // Raw image al (BAI için)
  getRawImage: async (productId: string) => {
    const response = await apiClient.post('/get_raw_image', {
      product_id: productId,
    });
    return response.data;
  },

  // Filtreleme için markalar
  getBrands: async (keywords?: string) => {
    const response = await apiClient.get('/get_brands', {
      params: { keywords },
    });
    return response.data;
  },

  // Filtreleme için renkler
  getColors: async (keywords?: string) => {
    const response = await apiClient.get('/get_colors', {
      params: { keywords },
    });
    return response.data;
  },

  // Filtreleme için bedenler
  getSizes: async (keywords?: string) => {
    const response = await apiClient.get('/get_sizes', {
      params: { keywords },
    });
    return response.data;
  },
};