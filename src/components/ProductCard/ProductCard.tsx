// src/components/ProductCard/ProductCard.tsx - TAM HALİ
import React, { useState } from 'react';
import { Linking } from 'react-native';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, shadows } from '../../theme/theme';
import { Product } from '../../types';
import PriceHistoryModal from '../PriceHistoryModal/PriceHistoryModal';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.m * 3) / 2;

interface ProductCardProps {
  product: Product;
  onFavoritePress: () => void;
  onBAIPress: () => void;
  isFavorite: boolean;
}

export default function ProductCard({
  product,
  onFavoritePress,
  onBAIPress,
  isFavorite,
}: ProductCardProps) {
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  
  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoritePress();
  };

  const handleBAIPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBAIPress();
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

  return (
    <>
     <TouchableOpacity
        style={styles.card}
        onPress={handleProductPress} // direkt mağazaya git
        activeOpacity={0.9}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image_link }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Favorite Button - Top Left */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.error : colors.white}
            />
          </TouchableOpacity>

          {/* BAI Mini Button - Bottom Right */}
          <TouchableOpacity
            style={styles.baiMiniButton}
            onPress={handleBAIPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.baiMiniText}>BAI</Text>
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.product_title}
          </Text>

          <View style={styles.shopRow}>
            <Text style={styles.shopName} numberOfLines={1}>
              {product.shop_name}
            </Text>
            <TouchableOpacity 
              style={styles.goButton}
              onPress={handleGoPress} // git butonu da aynı işi yapsın
            >
              <Text style={styles.goButtonText}>Git</Text>
              <Ionicons name="arrow-forward" size={12} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price} ₺</Text>
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            {/* Price History Button */}
            {product.history_count && product.history_count > 0 && (
              <TouchableOpacity
                style={styles.historyButton}
                onPress={handlePriceHistoryPress}
              >
                <Ionicons name="trending-down" size={14} color={colors.primary} />
                <Text style={styles.historyButtonText}>
                  Fiyat Geçmişi ({product.history_count})
                </Text>
              </TouchableOpacity>
            )}

            {/* Size/Color Info */}
            {(product.size_count || product.color_count) && (
              <View style={styles.variantRow}>
                {product.size_count > 0 && (
                  <View style={styles.variantBadge}>
                    <Ionicons name="resize-outline" size={10} color={colors.gray600} />
                    <Text style={styles.variantText}>{product.size_count}</Text>
                  </View>
                )}
                {product.color_count > 0 && (
                  <View style={styles.variantBadge}>
                    <Ionicons name="color-palette-outline" size={10} color={colors.gray600} />
                    <Text style={styles.variantText}>{product.color_count}</Text>
                  </View>
                )}
              </View>
            )}
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
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.m,
    ...shadows.small,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.75,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  shopBadge: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: CARD_WIDTH * 0.6,
    zIndex: 10,
  },
  shopBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
    fontSize: 10,
  },
  baiMiniButton: {
    position: 'absolute',
    bottom: spacing.s,
    right: spacing.s,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  baiMiniText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  infoContainer: {
    padding: spacing.m,
  },
  productTitle: {
    ...typography.caption,
    color: colors.black,
    marginBottom: spacing.s,
    minHeight: 34,
    lineHeight: 17,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  shopName: {
    ...typography.small,
    color: colors.gray600,
    flex: 1,
    fontSize: 11,
  },
  goButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: spacing.xs,
  },
  goButtonText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 2,
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  bottomActions: {
    marginTop: spacing.xs,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  historyButtonText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 10,
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
    ...typography.small,
    color: colors.gray600,
    marginLeft: 2,
    fontSize: 9,
  },
});