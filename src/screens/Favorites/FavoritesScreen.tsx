// src/screens/Favorites/FavoritesScreen.tsx - BACKEND MANAGED PRICE TRACKING
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, shadows } from '../../theme/theme';
import { useFavorites } from '../../store/favoritesStore';
import ProductCard from '../../components/ProductCard/ProductCard';
import CollectionsAPI from '../../services/api/collections.api';

export default function FavoritesScreen() {
  const { getAllFavorites, getFavoriteCount, clearFavorites, clearPriceChange } = useFavorites();
  const favoriteProducts = getAllFavorites();
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [collectionUrl, setCollectionUrl] = useState('');

  // Fiyat değişikliği olan ürünleri filtrele (Backend cron job tarafından güncellenir)
  const priceChangedProducts = favoriteProducts.filter(f => f.priceChanged);

  const handleCreateCollection = async () => {
    if (getFavoriteCount() === 0) {
      Alert.alert('Uyarı', 'Favori listeniz boş');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Product ID'lerini al
      const productIds = favoriteProducts.map(f => f.product.product_id);
      const response = await CollectionsAPI.createCollection(productIds);

      if (response.status && response.value) {
        const url = CollectionsAPI.getCollectionUrl(response.value);
        setCollectionUrl(url);
        setShowQRModal(true);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Hata', response.message || 'Koleksiyon oluşturulamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Koleksiyon oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Bazenda Koleksiyonum 🛍️\n\n${collectionUrl}`,
        url: collectionUrl,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleOpenCollection = async () => {
    try {
      const supported = await Linking.canOpenURL(collectionUrl);
      if (supported) {
        await Linking.openURL(collectionUrl);
      }
    } catch (error) {
      console.error('Open URL error:', error);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Tümünü Sil',
      'Tüm favorileri silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tümünü Sil',
          style: 'destructive',
          onPress: () => {
            clearFavorites();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleClearPriceChanges = () => {
    priceChangedProducts.forEach(f => {
      clearPriceChange(f.product.product_id);
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderHeader = () => (
    <>
      {/* Fiyat Değişiklikleri Banner */}
      {priceChangedProducts.length > 0 && (
        <View style={styles.priceChangeBanner}>
          <LinearGradient
            colors={[colors.success, colors.info]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.priceChangeBannerGradient}
          >
            <View style={styles.priceChangeBannerContent}>
              <Ionicons name="trending-down" size={24} color={colors.white} />
              <View style={styles.priceChangeBannerText}>
                <Text style={styles.priceChangeBannerTitle}>
                  Fiyat Değişiklikleri!
                </Text>
                <Text style={styles.priceChangeBannerSubtitle}>
                  {priceChangedProducts.length} üründe fiyat değişti
                </Text>
              </View>
              <TouchableOpacity
                style={styles.clearPriceButton}
                onPress={handleClearPriceChanges}
              >
                <Ionicons name="checkmark" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Actions */}
      {getFavoriteCount() > 0 && (
        <View style={styles.actionsBar}>
          <View style={styles.countBadge}>
            <Ionicons name="heart" size={16} color={colors.error} />
            <Text style={styles.countText}>{getFavoriteCount()} ürün</Text>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateCollection}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="share-social" size={16} color={colors.white} />
                <Text style={styles.createButtonText}>Koleksiyon Oluştur</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  const renderProduct = ({ item }: { item: any }) => {
    const priceChange = item.priceChangeAmount;
    const isPriceDrop = priceChange && priceChange < 0;
    const showPriceBadge = item.priceChanged;

    return (
      <View style={styles.productWrapper}>
        {showPriceBadge && (
          <View style={[
            styles.priceChangeBadge,
            isPriceDrop ? styles.priceDropBadge : styles.priceIncreaseBadge
          ]}>
            <Ionicons
              name={isPriceDrop ? 'arrow-down' : 'arrow-up'}
              size={10}
              color={colors.white}
            />
            <Text style={styles.priceChangeBadgeText}>
              {isPriceDrop ? '-' : '+'}{Math.abs(priceChange).toFixed(2)} ₺
            </Text>
          </View>
        )}
        <ProductCard
          product={item.product}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorilerim</Text>
        <View style={styles.headerActions}>
          {getFavoriteCount() > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.headerButton}>
              <Text style={styles.clearAll}>Tümünü Sil</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {favoriteProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.gray400} />
          <Text style={styles.emptyTitle}>Henüz favori ürün yok</Text>
          <Text style={styles.emptyText}>
            Beğendiğiniz ürünleri favorilere ekleyin ve fiyat değişikliklerinden haberdar olun!
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.product.product_id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader()}
        />
      )}

      {/* QR Modal */}
      <Modal
        visible={showQRModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Koleksiyon Hazır!</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrContainer}>
              <QRCode value={collectionUrl} size={200} />
            </View>

            <Text style={styles.qrText}>
              QR kodu okutarak koleksiyona ulaşılabilir
            </Text>

            <TouchableOpacity
              style={styles.urlContainer}
              onPress={handleOpenCollection}
            >
              <Text style={styles.urlText} numberOfLines={1}>
                {collectionUrl}
              </Text>
              <Ionicons name="open-outline" size={16} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color={colors.white} />
                <Text style={styles.shareButtonText}>Paylaş</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  title: {
    ...typography.h3,
    color: colors.black,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  headerButton: {
    padding: spacing.xs,
  },
  clearAll: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  priceChangeBanner: {
    marginHorizontal: spacing.m,
    marginTop: spacing.m,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.medium,
  },
  priceChangeBannerGradient: {
    padding: spacing.m,
  },
  priceChangeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChangeBannerText: {
    flex: 1,
    marginLeft: spacing.m,
  },
  priceChangeBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  priceChangeBannerSubtitle: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  clearPriceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  countText: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    gap: spacing.xs,
    minWidth: 80,
    justifyContent: 'center',
  },
  createButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.s,
  },
  productWrapper: {
    width: '50%',
    padding: spacing.s,
    position: 'relative',
  },
  priceChangeBadge: {
    position: 'absolute',
    top: spacing.m,
    left: spacing.m,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
    ...shadows.medium,
  },
  priceDropBadge: {
    backgroundColor: colors.success,
  },
  priceIncreaseBadge: {
    backgroundColor: colors.error,
  },
  priceChangeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.black,
    marginTop: spacing.l,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    marginTop: spacing.s,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.black,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: spacing.l,
  },
  qrText: {
    ...typography.caption,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray100,
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.l,
  },
  urlText: {
    ...typography.small,
    color: colors.gray700,
    flex: 1,
  },
  modalActions: {
    gap: spacing.m,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: 12,
    gap: spacing.s,
  },
  shareButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
