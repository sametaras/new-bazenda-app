// src/components/ProductCard/ProductCard.tsx - PRODUCTION READY
import React, { useState, useEffect } from 'react';
import { Linking, Alert, Modal, ActivityIndicator, Share } from 'react-native';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, shadows } from '../../theme/theme';
import { Product } from '../../types';
import PriceHistoryModal from '../PriceHistoryModal/PriceHistoryModal';
import { useBaiStore } from '../../store/baiStore';
import { useFavorites } from '../../store/favoritesStore';

const LOADING_MESSAGES = [
  { title: 'BAI Analiz Ediyor...', subtitle: 'Görsel özellikler çıkarılıyor' },
  { title: 'En Benzer Ürünler Aranıyor...', subtitle: 'Binlerce ürün taranıyor' },
  { title: 'Sonuçlar Hazırlanıyor...', subtitle: 'En iyi eşleşmeler getiriliyor' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.m * 3) / 2;

interface ProductCardProps {
  product: Product;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

export default function ProductCard({
  product,
  onFavoritePress,
  isFavorite: isFavoriteProp,
}: ProductCardProps) {
  const navigation = useNavigation();
  const { performProductSearch, isSearching } = useBaiStore();
  const { toggleFavorite, isFavorite: checkIsFavorite } = useFavorites();
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showBAILoading, setShowBAILoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Use prop if provided, otherwise check from store
  const isFavorite = isFavoriteProp !== undefined
    ? isFavoriteProp
    : checkIsFavorite(product.product_id);

  // Loading mesajlarını döndür
  useEffect(() => {
    if (showBAILoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) =>
          prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
        );
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setLoadingMessageIndex(0);
    }
    return undefined;
  }, [showBAILoading]);
  
  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Hemen toggle et
    if (onFavoritePress) {
      onFavoritePress();
    } else {
      // Product objesi ile toggle et
      toggleFavorite(product);
    }
  };

  const handleBAIPress = async () => {
    if (isSearching || showBAILoading) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Loading modal'ı aç
      setShowBAILoading(true);
      
      console.log('BAI arama başlatılıyor, product_id:', product.product_id);
      
      // Arama yap
      await performProductSearch(product.product_id, product.product_title);
      
      console.log('BAI arama tamamlandı, navigation yapılıyor');
      
      // Loading modal'ı kapat
      setShowBAILoading(false);
      
      // Şimdi sonuç sayfasına git
      (navigation as any).navigate('BAI', {
        screen: 'BAIResults'
      });
      
    } catch (error) {
      console.error('BAI arama hatası:', error);
      setShowBAILoading(false);
      Alert.alert('Hata', 'Benzer ürün araması başarısız oldu');
    }
  };

  const handlePriceHistoryPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPriceHistory(true);
  };

  const handleProductPress = async () => {
    try {
      const supported = await Linking.canOpenURL(product.product_link);
      if (supported) {
        await Linking.openURL(product.product_link);
      }
    } catch (error) {
      console.error('Link açılamadı:', error);
    }
  };

  const handleGoPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleProductPress();
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await Share.share({
        message: `${product.product_title}\n\n${product.shop_name}\n${product.price} ₺\n\n${product.product_link}`,
        url: product.product_link, // iOS için
        title: product.product_title,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  // İndirim miktarını kontrol et
  const hasDiscount = product.discount_amount && 
    product.discount_amount !== "0" && 
    product.discount_amount !== "0.00" &&
    product.last_price &&
    parseFloat(product.discount_amount.replace(/,/g, '')) > 0;

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={handleProductPress}
        activeOpacity={0.9}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image_link }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Favorite Button - Top Left with Active State */}
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive
            ]}
            onPress={handleFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? colors.white : colors.white}
            />
          </TouchableOpacity>

          {/* Discount Badge - Top Right */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Ionicons name="arrow-down" size={8} color={colors.white} />
              <Text style={styles.discountText} numberOfLines={1}>
                {product.discount_amount} ₺
              </Text>
            </View>
          )}

          {/* BAI Mini Button - Bottom Right with Rainbow Gradient */}
          <TouchableOpacity
            style={styles.baiMiniButton}
            onPress={handleBAIPress}
            disabled={showBAILoading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.baiMiniGradient, showBAILoading && styles.baiMiniGradientDisabled]}
            >
              <Ionicons name="camera" size={12} color={colors.white} />
              <Text style={styles.baiMiniText}>BAI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.product_title}
          </Text>

          {/* Last Updated */}
          {product.last_updated && (
            <Text style={styles.lastUpdated} numberOfLines={1}>
              {product.last_updated}
            </Text>
          )}

          <View style={styles.shopRow}>
            <Text style={styles.shopName} numberOfLines={1}>
              {product.shop_name}
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="share-outline" size={14} color={colors.gray600} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.goButton}
                onPress={handleGoPress}
              >
                <Text style={styles.goButtonText}>Git</Text>
                <Ionicons name="arrow-forward" size={10} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            {hasDiscount ? (
              <>
                <Text style={styles.originalPrice}>{product.last_price} ₺</Text>
                <Text style={styles.discountedPrice}>{product.price} ₺</Text>
              </>
            ) : (
              <Text style={styles.price}>{product.price} ₺</Text>
            )}
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            {/* Price History Button */}
            {product.history_count && product.history_count > 0 && (
              <TouchableOpacity
                style={styles.historyButton}
                onPress={handlePriceHistoryPress}
              >
                <Ionicons name="trending-down" size={12} color={colors.primary} />
                <Text style={styles.historyButtonText}>
                  Fiyat Geçmişi ({product.history_count})
                </Text>
              </TouchableOpacity>
            )}

            {/* Size/Color Info */}
            {(product.size_count || product.color_count) ? (
              <View style={styles.variantRow}>
                {product.size_count > 0 && (
                  <View style={styles.variantBadge}>
                    <Ionicons name="resize-outline" size={9} color={colors.gray600} />
                    <Text style={styles.variantText}>{product.size_count}</Text>
                  </View>
                )}
                {product.color_count > 0 && (
                  <View style={styles.variantBadge}>
                    <Ionicons name="color-palette-outline" size={9} color={colors.gray600} />
                    <Text style={styles.variantText}>{product.color_count}</Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>

      {/* Price History Modal */}
      <PriceHistoryModal
        visible={showPriceHistory}
        productId={product.product_id}
        productTitle={product.product_title}
        onClose={() => setShowPriceHistory(false)}
      />

      {/* BAI Loading Modal */}
      <Modal
        visible={showBAILoading}
        transparent
        animationType="fade"
      >
        <View style={styles.baiLoadingModal}>
          <View style={styles.baiLoadingContent}>
            <View style={styles.baiLoadingIconContainer}>
              <Ionicons name="sparkles" size={48} color={colors.primary} />
            </View>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.baiLoadingTitle}>
              {LOADING_MESSAGES[loadingMessageIndex].title}
            </Text>
            <Text style={styles.baiLoadingSubtitle}>
              {LOADING_MESSAGES[loadingMessageIndex].subtitle}
            </Text>
            <View style={styles.baiLoadingDots}>
              {LOADING_MESSAGES.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.baiLoadingDot,
                    index === loadingMessageIndex && styles.baiLoadingDotActive
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: spacing.m,
    ...shadows.small,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.75,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray100,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.s,
    left: spacing.s,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  favoriteButtonActive: {
    backgroundColor: colors.error,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    gap: 2,
    zIndex: 10,
    maxWidth: 70,
  },
  discountText: {
    fontSize: 8,
    color: colors.white,
    fontWeight: '700',
  },
  baiMiniButton: {
    position: 'absolute',
    bottom: spacing.s,
    right: spacing.s,
    zIndex: 10,
    borderRadius: 8,
    overflow: 'hidden',
    ...shadows.medium,
  },
  baiMiniGradient: {
    paddingHorizontal: spacing.s + 2,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  baiMiniGradientDisabled: {
    opacity: 0.5,
  },
  baiMiniText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  infoContainer: {
    padding: spacing.s,
  },
  productTitle: {
    fontSize: 12,
    color: colors.black,
    marginBottom: spacing.xs,
    minHeight: 32,
    lineHeight: 16,
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 10,
    color: colors.gray500,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  shareButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 10,
    color: colors.gray600,
    flex: 1,
  },
  goButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: spacing.xs,
  },
  goButtonText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  price: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 11,
    color: colors.gray500,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '700',
  },
  bottomActions: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  historyButtonText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 3,
  },
  variantRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  variantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  variantText: {
    fontSize: 9,
    color: colors.gray600,
    marginLeft: 2,
  },
  baiLoadingModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  baiLoadingContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    width: '85%',
    maxWidth: 340,
  },
  baiLoadingIconContainer: {
    marginBottom: spacing.m,
  },
  baiLoadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginTop: spacing.l,
    textAlign: 'center',
  },
  baiLoadingSubtitle: {
    fontSize: 13,
    color: colors.gray600,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  baiLoadingDots: {
    flexDirection: 'row',
    marginTop: spacing.l,
    gap: spacing.s,
  },
  baiLoadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
  baiLoadingDotActive: {
    backgroundColor: colors.primary,
  },
});