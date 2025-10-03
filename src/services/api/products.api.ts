// src/services/api/products.api.ts
import axios from 'axios';
import { Product } from '../../types';

const API_BASE_URL = 'https://bazenda.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

export class ProductsService {
  /**
   * Trend ürünleri getir
   */
  static async getTrendProducts(page: number = 1): Promise<Product[]> {
    try {
      const response = await apiClient.post('/get_results', {
        query: '',
        page: page.toString(),
        sort_by: '0',
        search_type: 'text',
      });

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
   * Radar araması
   */
  static async getRadarProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.post('/get_results', {
        query: 'radar',
        page: '1',
        sort_by: '0',
        search_type: 'text',
      });

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
   * Metin araması
   */
  static async searchProducts(
    query: string,
    page: number = 1,
    filters?: any
  ): Promise<{ products: Product[]; totalCount: number }> {
    try {
      const formData = new FormData();
      formData.append('query', query);
      formData.append('page', page.toString());
      formData.append('sort_by', filters?.sortBy || '0');
      formData.append('search_type', 'text');

      if (filters?.priceMin) {
        formData.append('price_min', filters.priceMin.toString());
      }
      if (filters?.priceMax) {
        formData.append('price_max', filters.priceMax.toString());
      }
      if (filters?.genders && filters.genders.length > 0) {
        filters.genders.forEach((gender: string) => {
          formData.append('gender_select[]', gender);
        });
      }

      const response = await apiClient.post('/get_results', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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