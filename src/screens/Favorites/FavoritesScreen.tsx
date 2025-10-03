// src/screens/Favorites/FavoritesScreen.tsx
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
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, shadows } from '../../theme/theme';
import { useFavorites } from '../../store/favoritesStore';
import ProductCard from '../../components/ProductCard/ProductCard';
import CollectionsAPI from '../../services/api/collections.api';

export default function FavoritesScreen() {
  const { favorites, toggleFavorite, clearFavorites } = useFavorites();
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [collectionUrl, setCollectionUrl] = useState('');

  React.useEffect(() => {
    loadFavoriteProducts();
  }, [favorites]);

  const loadFavoriteProducts = async () => {
    if (favorites.length === 0) {
      setFavoriteProducts([]);
      return;
    }

    try {
      const response = await fetch('https://bazenda.com/api/get_favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `products=${JSON.stringify(favorites)}`,
      });

      const data = await response.json();
      setFavoriteProducts(data);
    } catch (error) {
      console.error('Load favorites error:', error);
    }
  };

  const handleCreateCollection = async () => {
    if (favorites.length === 0) {
      Alert.alert('Uyarı', 'Favori listeniz boş');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await CollectionsAPI.createCollection(favorites);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorilerim</Text>
        {favorites.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAll}>Tümünü Sil</Text>
          </TouchableOpacity>
        )}
      </View>

      {favorites.length > 0 && (
        <View style={styles.actionsBar}>
          <View style={styles.countBadge}>
            <Ionicons name="heart" size={16} color={colors.error} />
            <Text style={styles.countText}>{favorites.length} ürün</Text>
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
                <Ionicons name="share-social" size={18} color={colors.white} />
                <Text style={styles.createButtonText}>Koleksiyon Oluştur</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {favoriteProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.gray400} />
          <Text style={styles.emptyTitle}>Henüz favori ürün yok</Text>
          <Text style={styles.emptyText}>
            Beğendiğiniz ürünleri favorilere ekleyin
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteProducts}
          renderItem={({ item }) => (
            <View style={styles.productWrapper}>
              <ProductCard
                product={item}
                onFavoritePress={() => toggleFavorite(item.product_id)}
                onBAIPress={() => {}}
                isFavorite={true}
              />
            </View>
          )}
          keyExtractor={(item) => item.product_id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  },
  title: {
    ...typography.h3,
    color: colors.black,
  },
  clearAll: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    backgroundColor: colors.surface,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
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
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 20,
    gap: spacing.xs,
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