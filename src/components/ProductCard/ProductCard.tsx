// src/components/ProductCard/ProductCard.tsx - PRODUCTION READY
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
import { LinearGradient } from 'expo-linear-gradient';
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

          {/* BAI Mini Button - Bottom Right with Gradient */}
          <TouchableOpacity
            style={styles.baiMiniButton}
            onPress={handleBAIPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.baiMiniGradient}
            >
              <Text style={styles.baiMiniText}>BAI</Text>
            </LinearGradient>
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
              onPress={handleGoPress}
            >
              <Text style={styles.goButtonText}>Git</Text>
              <Ionicons name="arrow-forward" size={10} color={colors.primary} />
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
  baiMiniButton: {
    position: 'absolute',
    bottom: spacing.s,
    right: spacing.s,
    zIndex: 10,
    borderRadius: 7,
    overflow: 'hidden',
    ...shadows.small,
  },
  baiMiniGradient: {
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  baiMiniText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '700',
    fontSize: 9,
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
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
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
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 14,
    color: colors.primary,
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
});