/**
 * Notifications Screen
 * Kullan1c1n1n geçmi_ bildirimlerini gösterir
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../../theme/theme';
import { useNotifications } from '../../store/notificationsStore';
import { PushNotification } from '../../types/notification.types';
import * as Haptics from 'expo-haptics';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    totalCount,
    isLoading,
    hasMore,
    loadNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications(true);
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: PushNotification) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Okunmam1_sa okundu i_aretle
      if (notification.is_read === 0) {
        await markAsRead(notification.id);
      }

      // Ürün linkine git
      if (notification.product_link) {
        const supported = await Linking.canOpenURL(notification.product_link);
        if (supported) {
          await Linking.openURL(notification.product_link);
        }
      }
    } catch (error) {
      console.error('Bildirim açma hatas1:', error);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Tümünü Okundu 0_aretle',
      `${unreadCount} okunmam1_ bildirim okundu olarak i_aretlensin mi?`,
      [
        { text: '0ptal', style: 'cancel' },
        {
          text: 'Okundu 0_aretle',
          style: 'default',
          onPress: () => markAllAsRead(),
        },
      ]
    );
  };

  const handleDeleteNotification = (notification: PushNotification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Bildirimi Sil',
      'Bu bildirimi silmek istediinizden emin misiniz?',
      [
        { text: '0ptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteNotification(notification.id),
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price_drop':
        return { name: 'trending-down' as const, color: colors.success || '#10b981' };
      case 'price_increase':
        return { name: 'trending-up' as const, color: colors.error || '#ef4444' };
      case 'promo':
        return { name: 'gift' as const, color: colors.warning || '#f59e0b' };
      default:
        return { name: 'notifications' as const, color: colors.primary };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: tr,
      });
    } catch {
      return timestamp;
    }
  };

  const renderNotificationItem = ({ item }: { item: PushNotification }) => {
    const icon = getNotificationIcon(item.notification_type);
    const isUnread = item.is_read === 0;

    return (
      <TouchableOpacity
        style={[styles.notificationCard, isUnread && styles.notificationCardUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
            <Ionicons name={icon.name} size={24} color={icon.color} />
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={2}>
                {item.title}
              </Text>
              {isUnread && <View style={styles.unreadDot} />}
            </View>

            <Text style={styles.body} numberOfLines={3}>
              {item.body}
            </Text>

            {/* Price info for price changes */}
            {(item.notification_type === 'price_drop' || item.notification_type === 'price_increase') &&
              item.old_price &&
              item.new_price && (
                <View style={styles.priceInfo}>
                  <Text style={styles.oldPrice}>{item.old_price} º</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={12}
                    color={colors.gray500}
                    style={{ marginHorizontal: 4 }}
                  />
                  <Text style={[styles.newPrice, { color: icon.color }]}>{item.new_price} º</Text>
                </View>
              )}

            <Text style={styles.timestamp}>{formatTimestamp(item.sent_at)}</Text>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteNotification(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.gray400} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color={colors.gray400} />
      <Text style={styles.emptyTitle}>Bildirim Yok</Text>
      <Text style={styles.emptyText}>Henüz hiç bildiriminiz yok</Text>
    </View>
  );

  const renderHeader = () => {
    if (notifications.length === 0) return null;

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          {totalCount} bildirim {unreadCount > 0 && `" ${unreadCount} okunmam1_`}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButton}>Tümünü Okundu 0_aretle</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bildirimler</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.listContentEmpty,
        ]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        onEndReached={() => {
          if (hasMore && !isLoading) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l || 16,
    paddingVertical: spacing.m || 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    ...shadows.small,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
  },
  badge: {
    position: 'absolute',
    right: spacing.l || 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.m || 12,
  },
  listContentEmpty: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m || 12,
    paddingHorizontal: spacing.xs || 4,
  },
  headerText: {
    fontSize: 13,
    color: colors.gray600,
  },
  markAllButton: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.m || 12,
    ...shadows.small,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: spacing.m || 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m || 12,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.s || 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs || 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray900 || colors.black,
    flex: 1,
  },
  titleUnread: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.xs || 4,
  },
  body: {
    fontSize: 14,
    color: colors.gray700,
    lineHeight: 20,
    marginBottom: spacing.xs || 4,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs || 4,
  },
  oldPrice: {
    fontSize: 13,
    color: colors.gray500,
    textDecorationLine: 'line-through',
  },
  newPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray500,
  },
  deleteButton: {
    padding: spacing.xs || 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl || 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900 || colors.black,
    marginTop: spacing.l || 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: spacing.s || 8,
  },
});
