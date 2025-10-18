// src/services/analytics/analytics.service.ts - EXO VERSİYON
export class AnalyticsService {
    /**
     * Ekran görüntüleme
     */
    static logScreenView(screenName: string) {
      console.log('[Analytics] Screen View:', screenName);
      // Production'da: Firebase veya başka analytics servisine gönder
    }
  
    /**
     * Event logla
     */
    static logEvent(eventName: string, params?: Record<string, any>) {
      console.log('[Analytics] Event:', eventName, params);
      // Production'da: Analytics servisine gönder
    }
  
    /**
     * Arama eventi
     */
    static logSearch(searchTerm: string, searchType: 'text' | 'visual' | 'radar') {
      this.logEvent('search', {
        search_term: searchTerm,
        search_type: searchType,
      });
    }
  
    /**
     * Ürün tıklama
     */
    static logProductClick(productId: string, productName: string, shopName: string) {
      this.logEvent('product_click', {
        product_id: productId,
        product_name: productName,
        shop_name: shopName,
      });
    }
  
    /**
     * Favori ekleme/çıkarma
     */
    static logFavoriteAction(action: 'add' | 'remove', productId: string) {
      this.logEvent(`favorite_${action}`, {
        product_id: productId,
      });
    }
  
    /**
     * Koleksiyon oluşturma
     */
    static logCollectionCreate(productCount: number) {
      this.logEvent('collection_create', {
        product_count: productCount,
      });
    }
  
    /**
     * BAI arama
     */
    static logBAISearch(resultCount: number) {
      this.logEvent('bai_search', {
        result_count: resultCount,
      });
    }
  }
  
  export default AnalyticsService;