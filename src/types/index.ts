// src/types/index.ts

export interface Product {
  product_id: string;
  product_info: number;
  product_title: string;
  image_link: string;
  product_link: string;
  app_product_link: string;
  original_link: string;
  
  last_updated?: string;
  history_count?: number;
  discount_amount?: string;  // ✅ YENİ: İndirim miktarı
  
  shop_id: number;
  shop_name: string;
  product_color?: string;
  
  price: string;           // Şu anki fiyat (indirimli)
  last_price?: string;     // Eski fiyat (indirim öncesi)
  raw_price: number;
  
  // Sizes
  all_sizes?: string;
  all_sizes_simple?: string[];
  size_count?: number;
  
  // Colors
  all_colors?: string;
  color_count?: number;
  
  // BAI specific (optional)
  similarity_score?: number;
  match_confidence?: number;
}
  
  export interface BAISearchRequest {
    search_image: Blob | File;
    search_type: 'visual';
    page: number;
    sort_by: number;
    price_min?: string;
    price_max?: string;
  }
  
  export interface BAISearchResponse {
    success: boolean;
    results: Product[];
    total_count: number;
    current_count: number;
    search_type: string;
    uploaded_image?: string;
    search_metadata?: {
      search_time: number;
      content_confidence: number;
      total_products_searched: number;
      optimized_mode: boolean;
      max_results: number;
    };
    error?: string;
    message?: string;
  }
  
  export interface SearchHistory {
    id: string;
    imageUri: string;
    thumbnail?: string;
    results: Product[];
    timestamp: number;
    filters?: SearchFilters;
  }
  
  export interface SearchFilters {
    priceMin?: number;
    priceMax?: number;
    brands?: string[];
    colors?: string[];
    sizes?: string[];
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
  }
  
  export interface Collection {
    id: string;
    name: string;
    description?: string;
    coverImage?: string;
    products: Product[];
    createdAt: number;
    updatedAt: number;
  }
  
  export interface User {
    id: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    collections: Collection[];
    searchHistory: SearchHistory[];
    favorites: string[]; // product_ids
  }