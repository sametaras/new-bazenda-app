/**
 * Notification Types
 * Bildirim sisteminin type tanımlamaları
 */

export type NotificationType = 'price_drop' | 'price_increase' | 'general' | 'promo';

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'delivered';

export interface NotificationData {
  type?: string;
  product_id?: string;
  screen?: string;
  [key: string]: any;
}

export interface PushNotification {
  id: number;
  device_id: string;
  expo_push_token: string;
  title: string;
  body: string;
  data: NotificationData | null;
  notification_type: NotificationType;
  product_id: string | null;
  product_link: string | null;
  old_price: number | null;
  new_price: number | null;
  sent_at: string; // ISO datetime
  is_read: 0 | 1;
  read_at: string | null;
  expo_response: any;
  status: NotificationStatus;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: PushNotification[];
  total_count: number;
  unread_count: number;
}

export interface SendNotificationRequest {
  device_id: string;
  expo_push_token: string;
  title: string;
  body: string;
  notification_type?: NotificationType;
  product_id?: string;
  product_link?: string;
  old_price?: number;
  new_price?: number;
  data?: NotificationData;
}
