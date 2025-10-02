// src/screens/BAISearch/BAIResultsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { useCurrentSearch, useIsSearching } from '../../store/baiStore';

export default function BAIResultsScreen() {
  const navigation = useNavigation();
  const currentSearch = useCurrentSearch();
  const isSearching = useIsSearching();

  if (isSearching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>BAI Aranıyor...</Text>
        <Text style={styles.loadingSubtext}>
          Benzer ürünler bulunuyor
        </Text>
      </View>
    );
  }

  if (!currentSearch || !currentSearch.results.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sonuçlar</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={colors.gray400} />
          <Text style={styles.emptyTitle}>Sonuç Bulunamadı</Text>
          <Text style={styles.emptyText}>
            Benzer ürün bulunamadı. Farklı bir fotoğraf deneyin.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderProduct = ({ item }: any) => (
    <TouchableOpacity style={styles.productCard}>
      <Image
        source={{ uri: item.image_link }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.badge}>
        <Ionicons name="sparkles" size={12} color={colors.white} />
        <Text style={styles.badgeText}>BAI</Text>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.shopName} numberOfLines={1}>
          {item.shop_name}
        </Text>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.product_title}
        </Text>
        <Text style={styles.price}>{item.price} TL</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentSearch.results.length} Sonuç
        </Text>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      {currentSearch.thumbnail && (
        <View style={styles.searchPreview}>
          <Image
            source={{ uri: currentSearch.thumbnail }}
            style={styles.searchImage}
          />
          <Text style={styles.searchLabel}>Aranan Görsel</Text>
        </View>
      )}

      <FlatList
        data={currentSearch.results}
        renderItem={renderProduct}
        keyExtractor={(item) => item.product_id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  headerTitle: {
    ...typography.h4,
    color: colors.black,
  },
  searchPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    backgroundColor: colors.surface,
  },
  searchImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.gray200,
  },
  searchLabel: {
    ...typography.caption,
    color: colors.gray600,
    marginLeft: spacing.m,
  },
  listContent: {
    padding: spacing.s,
  },
  productCard: {
    flex: 1,
    margin: spacing.s,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: colors.gray100,
  },
  badge: {
    position: 'absolute',
    top: spacing.s,
    left: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.badgeBAI,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  productInfo: {
    padding: spacing.m,
  },
  shopName: {
    ...typography.small,
    color: colors.gray600,
    marginBottom: 4,
  },
  productTitle: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '500',
    marginBottom: spacing.s,
  },
  price: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.h3,
    color: colors.black,
    marginTop: spacing.l,
  },
  loadingSubtext: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.s,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.black,
    marginTop: spacing.l,
    marginBottom: spacing.m,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
  },
});