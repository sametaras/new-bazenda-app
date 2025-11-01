// src/services/backend/backend.service.ts - Backend Integration
import axios from 'axios';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV_CONFIG from '../../config/env.config';
import { FilterResponse } from '../../types/filter.types';
import { NotificationsResponse, PushNotification } from '../../types/notification.types';

const DEVICE_ID_KEY = 'bazenda_device_id';

class BackendService {
  private apiClient;
  private deviceId: string | null = null;

  constructor() {
    this.apiClient = axios.create({
      baseURL: ENV_CONFIG.apiUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
      },
    });
  }

  /**
   * Unique device ID oluştur veya al
   */
  async getDeviceId(): Promise<string> {
    if (this.deviceId) {
      return this.deviceId;
    }

    // Önce storage'dan dene
    const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (stored) {
      this.deviceId = stored;
      return stored;
    }

    // Yeni ID oluştur
    const newId = this.generateDeviceId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
    this.deviceId = newId;

    return newId;
  }

  /**
   * Device ID oluştur
   */
  private generateDeviceId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const platform = Device.osName || 'unknown';

    return `${platform}_${timestamp}_${random}`;
  }

  /**
   * Cihazı kaydet / Token gönder
   */
  async registerDevice(expoPushToken: string): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();
      const platform = Device.osName?.toLowerCase() || 'unknown';
      const appVersion = Constants.expoConfig?.version || '1.0.0';

      const response = await this.apiClient.post('/notifications/register-device', {
        device_id: deviceId,
        expo_push_token: expoPushToken,
        platform: platform === 'ios' || platform === 'android' ? platform : 'web',
        app_version: appVersion,
      });

      if (__DEV__) {
        console.log('✅ Device registered');
      }
      return response.data.success;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('⚠️  Backend notification endpoint not found (404)');
        console.warn('⚠️  Please check: https://bazenda.com/api/notifications/register-device');
        console.warn('⚠️  Notification system will be disabled until backend is ready');
      } else {
        console.error('❌ Device registration failed:', error.message || error);
      }
      return false;
    }
  }

  /**
   * Cihazı deaktif et
   */
  async unregisterDevice(expoPushToken: string): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();

      const response = await this.apiClient.post('/notifications/unregister-device', {
        device_id: deviceId,
        expo_push_token: expoPushToken,
      });

      return response.data.success;
    } catch (error) {
      console.error('❌ Device unregistration failed:', error);
      return false;
    }
  }

  /**
   * Favorileri backend ile senkronize et
   */
  async syncFavorites(favorites: Array<{ product_id: string; current_price: number }>): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();

      if (__DEV__) {
        console.log('📤 Syncing favorites:', {
          count: favorites.length,
          first_3: favorites.slice(0, 3),
        });
      }

      const response = await this.apiClient.post('/notifications/sync-favorites', {
        device_id: deviceId,
        favorites: favorites.map(f => ({
          product_id: f.product_id,
          current_price: f.current_price,
        })),
      });

      if (__DEV__) {
        console.log('✅ Favorites synced');
      }
      return response.data.success;
    } catch (error: any) {
      console.error('❌ Favorites sync failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return false;
    }
  }

  /**
   * Tek bir favoriye ekleme
   */
  async addFavoriteToBackend(productId: string, currentPrice: number): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();

      if (__DEV__) {
        console.log('📤 Adding favorite to backend:', {
          product_id: productId,
          current_price: currentPrice,
        });
      }

      const response = await this.apiClient.post('/notifications/add-favorite', {
        device_id: deviceId,
        product_id: productId,
        current_price: currentPrice,
      });

      if (__DEV__) {
        console.log('✅ Favorite added to backend');
      }
      return response.data.success;
    } catch (error: any) {
      console.error('❌ Add favorite to backend failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        product_id: productId,
        price: currentPrice,
      });
      return false;
    }
  }

  /**
   * Favoriden çıkarma
   */
  async removeFavoriteFromBackend(productId: string): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();

      const response = await this.apiClient.post('/notifications/remove-favorite', {
        device_id: deviceId,
        product_id: productId,
      });

      return response.data.success;
    } catch (error) {
      console.error('❌ Remove favorite from backend failed:', error);
      return false;
    }
  }

  /**
   * Get available colors (with search support)
   */
  async getColors(keywords: string = '', page: number = 1): Promise<FilterResponse> {
    try {
      const response = await this.apiClient.get('/get_colors', {
        params: { keywords, page },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Get colors failed:', error);
      return { results: [] };
    }
  }

  /**
   * Get available sizes (with search support)
   */
  async getSizes(keywords: string = '', page: number = 1): Promise<FilterResponse> {
    try {
      const response = await this.apiClient.get('/get_sizes', {
        params: { keywords, page },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Get sizes failed:', error);
      return { results: [] };
    }
  }

  /**
   * Get available brands (with search support)
   */
  async getBrands(keywords: string = '', page: number = 1): Promise<FilterResponse> {
    try {
      const response = await this.apiClient.get('/get_brands', {
        params: { keywords, page },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Get brands failed:', error);
      return { results: [] };
    }
  }

  /**
   * Get notifications for device
   */
  async getNotifications(limit: number = 50, offset: number = 0, unreadOnly: boolean = false): Promise<NotificationsResponse> {
    try {
      const deviceId = await this.getDeviceId();

      const response = await this.apiClient.get('/notifications/get-notifications', {
        params: {
          device_id: deviceId,
          limit,
          offset,
          unread_only: unreadOnly,
        },
      });

      return response.data;
    } catch (error) {
      console.error('❌ Get notifications failed:', error);
      return {
        success: false,
        notifications: [],
        total_count: 0,
        unread_count: 0,
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();

      const response = await this.apiClient.post('/notifications/mark-as-read', {
        notification_id: notificationId,
        device_id: deviceId,
      });

      return response.data.success;
    } catch (error) {
      console.error('❌ Mark as read failed:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();

      const response = await this.apiClient.post('/notifications/mark-all-read', {
        device_id: deviceId,
      });

      return response.data.success;
    } catch (error) {
      console.error('❌ Mark all as read failed:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();

      const response = await this.apiClient.post('/notifications/delete-notification', {
        notification_id: notificationId,
        device_id: deviceId,
      });

      return response.data.success;
    } catch (error) {
      console.error('❌ Delete notification failed:', error);
      return false;
    }
  }
}

export default new BackendService();
