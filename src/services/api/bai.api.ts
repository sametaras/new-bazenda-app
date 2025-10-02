// src/services/api/bai.api.ts
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';
import { BAISearchResponse, SearchFilters } from '../../types';

const API_BASE_URL = 'https://bazenda.com/api';
const BAI_SEARCH_ENDPOINT = `${API_BASE_URL}/get_results`;

// API Client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Accept': 'application/json',
  },
});

export class BAIService {
  /**
   * Görsel araması yap
   */
  static async visualSearch(
    imageUri: string,
    filters?: SearchFilters,
    page: number = 1
  ): Promise<BAISearchResponse> {
    try {
      // 1. Görseli optimize et
      const optimizedImage = await this.optimizeImage(imageUri);
      
      // 2. FormData oluştur
      const formData = new FormData();
      
      // Image'i blob olarak ekle
      const response = await fetch(optimizedImage.uri);
      const blob = await response.blob();
      
      formData.append('search_image', blob, 'search.jpg');
      formData.append('search_type', 'visual');
      formData.append('page', page.toString());
      formData.append('sort_by', filters?.sortBy === 'price_asc' ? '1' : '0');
      
      // Fiyat filtreleri
      if (filters?.priceMin) {
        formData.append('price_min', filters.priceMin.toString());
      }
      if (filters?.priceMax) {
        formData.append('price_max', filters.priceMax.toString());
      }
      
      // 3. API'ye gönder
      const result = await apiClient.post<BAISearchResponse>(
        '/get_results',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return result.data;
      
    } catch (error) {
      console.error('BAI Search Error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data?.message || 'Arama başarısız oldu');
        } else if (error.request) {
          throw new Error('Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.');
        }
      }
      
      throw new Error('Beklenmeyen bir hata oluştu');
    }
  }
  
  /**
   * Görseli optimize et (boyut + kalite)
   */
  static async optimizeImage(imageUri: string) {
    try {
      const optimized = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024 } }, // Max 1024px genişlik
        ],
        {
          compress: 0.8, // %80 kalite
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      return optimized;
      
    } catch (error) {
      console.error('Image optimization error:', error);
      // Optimize edemediyse orijinali kullan
      return { uri: imageUri };
    }
  }
  
  /**
   * Thumbnail oluştur (önizleme için)
   */
  static async createThumbnail(imageUri: string) {
    try {
      const thumbnail = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 300 } },
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      return thumbnail.uri;
      
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      return imageUri;
    }
  }
  
  /**
   * Arama sonuçlarını filtrele (client-side)
   */
  static filterResults(
    results: any[],
    filters?: SearchFilters
  ): any[] {
    let filtered = [...results];
    
    // Marka filtresi
    if (filters?.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands?.includes(product.shop_name)
      );
    }
    
    // Renk filtresi
    if (filters?.colors && filters.colors.length > 0) {
      filtered = filtered.filter(product =>
        filters.colors?.some(color =>
          product.product_color?.toLowerCase().includes(color.toLowerCase())
        )
      );
    }
    
    // Beden filtresi
    if (filters?.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(product =>
        product.all_sizes_simple?.some((size: string) =>
          filters.sizes?.includes(size)
        )
      );
    }
    
    // Fiyat sıralaması (client-side)
    if (filters?.sortBy === 'price_asc') {
      filtered.sort((a, b) => a.raw_price - b.raw_price);
    } else if (filters?.sortBy === 'price_desc') {
      filtered.sort((a, b) => b.raw_price - a.raw_price);
    }
    
    return filtered;
  }
}

export default BAIService;