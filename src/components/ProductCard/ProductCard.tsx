// src/components/ProductCard/ProductCard.tsx
import React from 'react';
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

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.m * 3) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onFavoritePress: () => void;
  onBAIPress: () => void;
  isFavorite: boolean;
}

export default function ProductCard({
  product,
  onPress,
  onFavoritePress,
  onBAIPress,
  isFavorite,
}: ProductCardProps) {
  
  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoritePress();
  };

  const handleBAIPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBAIPress();
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
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

        {/* Shop Badge - Top Right */}
        <View style={styles.shopBadge}>
          <Text style={styles.shopBadgeText} numberOfLines={1}>
            {product.shop_name}
          </Text>
        </View>

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

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price} ₺</Text>
          
          {product.history_count && product.history_count > 0 && (
            <View style={styles.historyBadge}>
              <Ionicons name="trending-down" size={12} color={colors.warning} />
              <Text style={styles.historyText}>{product.history_count}</Text>
            </View>
          )}
        </View>

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
    </TouchableOpacity>
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
  },
  historyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyText: {
    ...typography.small,
    color: colors.warning,
    fontWeight: '600',
    marginLeft: 2,
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