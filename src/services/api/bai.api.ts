// src/services/api/bai.service.ts - PRODUCTION READY
import * as ImageManipulator from 'expo-image-manipulator';
import { BAISearchRequest, BAISearchResponse, SearchFilters, Product } from '../../types';

const API_BASE_URL = 'https://bazenda.com/api';

export class BAIService {
  /**
   * Görsel arama yap
   */
  static async visualSearch(
    imageUri: string,
    filters?: SearchFilters
  ): Promise<BAISearchResponse> {
    try {
      // Form data oluştur
      const formData = new FormData();
      
      // Image'ı blob'a çevir
      const imageBlob = await fetch(imageUri).then(res => res.blob());
      formData.append('search_image', imageBlob, 'search.jpg');
      formData.append('search_type', 'visual');
      formData.append('page', '1');
      formData.append('sort_by', filters?.sortBy === 'price_asc' ? '2' : filters?.sortBy === 'price_desc' ? '1' : '0');

      // Filtreler
      if (filters?.priceMin) {
        formData.append('price_min', filters.priceMin.toString());
      }
      if (filters?.priceMax) {
        formData.append('price_max', filters.priceMax.toString());
      }

      // API isteği
      const response = await fetch(`${API_BASE_URL}/get_results`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Arama başarısız');
      }

      return {
        success: true,
        results: data.results || [],
        total_count: data.total_count || 0,
        current_count: data.current_count || 0,
        search_type: data.search_type || 'visual',
        uploaded_image: data.uploaded_image,
        search_metadata: data.search_metadata,
      };
    } catch (error) {
      console.error('BAI Search Error:', error);
      
      return {
        success: false,
        results: [],
        total_count: 0,
        current_count: 0,
        search_type: 'visual',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        message: 'Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Thumbnail oluştur (önizleme için)
   */
  static async createThumbnail(imageUri: string): Promise<string> {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      return imageUri; // Fallback to original
    }
  }

  /**
   * Client-side sonuç filtreleme
   */
  static filterResults(products: Product[], filters: SearchFilters): Product[] {
    let filtered = [...products];

    // Fiyat filtreleme
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(p => p.raw_price >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(p => p.raw_price <= filters.priceMax!);
    }

    // Marka filtreleme
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(p => 
        filters.brands!.some(brand => 
          p.product_title.toLowerCase().includes(brand.toLowerCase())
        )
      );
    }

    // Renk filtreleme
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(p => 
        filters.colors!.some(color => 
          p.product_color?.toLowerCase().includes(color.toLowerCase()) ||
          p.all_colors?.toLowerCase().includes(color.toLowerCase())
        )
      );
    }

    // Beden filtreleme
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(p => 
        filters.sizes!.some(size => 
          p.all_sizes?.toLowerCase().includes(size.toLowerCase())
        )
      );
    }

    // Sıralama
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => a.raw_price - b.raw_price);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.raw_price - a.raw_price);
          break;
        case 'relevance':
          // Similarity score'a göre sırala (varsa)
          filtered.sort((a, b) => 
            (b.similarity_score || 0) - (a.similarity_score || 0)
          );
          break;
      }
    }

    return filtered;
  }

  /**
   * Ürünün orijinal görselini al
   */
  static async getRawImage(productId: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/get_raw_image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `product_id=${productId}`,
      });

      const data = await response.json();
      
      if (data.status && data.image_url) {
        return data.image_url;
      }
      
      return null;
    } catch (error) {
      console.error('Get raw image error:', error);
      return null;
    }
  }
}

export default BAIService;