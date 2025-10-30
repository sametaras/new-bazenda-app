// src/services/api/collections.api.ts
import axios from 'axios';
import ENV_CONFIG from '../../config/env.config';

interface CreateCollectionResponse {
  status: boolean;
  value?: string | number;
  message?: string;
}

export class CollectionsAPI {
  /**
   * Favori ürünlerden koleksiyon oluştur
   */
  static async createCollection(productIds: string[]): Promise<CreateCollectionResponse> {
    try {
      const response = await axios.post<CreateCollectionResponse>(
        `${ENV_CONFIG.apiUrl}/create_collection`,
        `products=${JSON.stringify(productIds)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Create collection error:', error);
      throw new Error('Koleksiyon oluşturulamadı');
    }
  }

  /**
   * Koleksiyon linkini oluştur
   */
  static getCollectionUrl(collectionId: string | number): string {
    return `https://bazenda.com/k/${collectionId}`;
  }

  /**
   * Koleksiyon ürünlerini getir
   */
  static async getCollectionProducts(collectionKey: string) {
    try {
      const response = await axios.post(
        `${ENV_CONFIG.apiUrl}/get_collection_products`,
        `the_collection=${collectionKey}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.status) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Get collection products error:', error);
      return [];
    }
  }
}

export default CollectionsAPI;