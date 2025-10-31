// src/services/api/products.api.ts
import axios from 'axios';
import { Product } from '../../types';
import ENV_CONFIG from '../../config/env.config';

const apiClient = axios.create({
  baseURL: ENV_CONFIG.apiUrl,
  timeout: ENV_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// Request interceptor - error handling ve logging
apiClient.interceptors.request.use(
  (config) => {
    if (ENV_CONFIG.debugMode) {
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - error handling
apiClient.interceptors.response.use(
  (response) => {
    if (ENV_CONFIG.debugMode) {
      console.log('📥 API Response:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: No response received');
    } else {
      console.error('❌ Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export class ProductsService {
  /**
   * Trend ürünleri getir
   */
  static async getTrendProducts(page: number = 1): Promise<Product[]> {
    try {
      const formData = new URLSearchParams();
      formData.append('query', '');
      formData.append('page', page.toString());
      formData.append('sort_by', '0');
      formData.append('search_type', 'text');

      const response = await apiClient.post('/get_results', formData.toString());

      if (response.data.success) {
        return response.data.results || [];
      }
      
      return [];
    } catch (error) {
      console.error('Trend products error:', error);
      return [];
    }
  }

  /**
   * Radar araması - ÖNEMLİ: query parametresi "radar" olmalı
   */
  static async getRadarProducts(): Promise<Product[]> {
    try {
      const formData = new URLSearchParams();
      formData.append('query', 'radar');  // ✅ RADAR yazıyor
      formData.append('price_min', '');
      formData.append('price_max', '');
      formData.append('page', '1');
      formData.append('sort_by', '0');
      formData.append('search_type', 'text');

      const response = await apiClient.post('/get_results', formData.toString());

      if (response.data.success) {
        return response.data.results || [];
      }
      
      return [];
    } catch (error) {
      console.error('Radar products error:', error);
      return [];
    }
  }

  /**
   * Metin araması - Advanced Filters Support
   */
  static async searchProducts(
    query: string,
    page: number = 1,
    filters?: any
  ): Promise<{ products: Product[]; totalCount: number }> {
    try {
      const formData = new URLSearchParams();
      formData.append('query', query);
      formData.append('page', page.toString());
      formData.append('sort_by', filters?.sortBy || '0');
      formData.append('search_type', 'text');

      // Price filters
      if (filters?.priceMin) {
        formData.append('price_min', filters.priceMin.toString());
      } else {
        formData.append('price_min', '');
      }

      if (filters?.priceMax) {
        formData.append('price_max', filters.priceMax.toString());
      } else {
        formData.append('price_max', '');
      }

      // Color filters (array)
      if (filters?.colors && filters.colors.length > 0) {
        filters.colors.forEach((colorId: string) => {
          formData.append('color_select[]', colorId);
        });
      }

      // Size filters (array)
      if (filters?.sizes && filters.sizes.length > 0) {
        filters.sizes.forEach((sizeId: string) => {
          formData.append('size_select[]', sizeId);
        });
      }

      // Brand filters (array)
      if (filters?.brands && filters.brands.length > 0) {
        filters.brands.forEach((brandId: string) => {
          formData.append('brand_select[]', brandId);
        });
      }

      // Gender filters (array)
      if (filters?.genders && filters.genders.length > 0) {
        filters.genders.forEach((genderId: number) => {
          formData.append('gender_select[]', genderId.toString());
        });
      }

      const response = await apiClient.post('/get_results', formData.toString());

      if (response.data.success) {
        return {
          products: response.data.results || [],
          totalCount: response.data.total_count || 0,
        };
      }

      return { products: [], totalCount: 0 };
    } catch (error) {
      console.error('Search products error:', error);
      return { products: [], totalCount: 0 };
    }
  }
}

export default ProductsService;