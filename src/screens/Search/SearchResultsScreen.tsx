// src/screens/Search/SearchResultsScreen.tsx - PRODUCTION READY WITH ADVANCED FILTERS
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography, shadows } from '../../theme/theme';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductsService from '../../services/api/products.api';
import { useFavorites } from '../../store/favoritesStore';
import { useFilterStore } from '../../store/filterStore';
import { FilterModal } from '../../components/FilterModal/FilterModal';
import * as Haptics from 'expo-haptics';

const LOADING_MESSAGES = [
  { title: 'Aranıyor...', subtitle: 'Yüzlerce mağazada sizin için arama yapıyoruz' },
  { title: 'Neredeyse bitti...', subtitle: 'En iyi sonuçları buluyoruz' },
  { title: 'Son kontroller...', subtitle: 'Fiyatları karşılaştırıyoruz' },
];

export default function SearchResultsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { query, title } = route.params as { query: string; title?: string };

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Advanced filters from store
  const { filters, getActiveFilterCount, loadFilters } = useFilterStore();

  // Favoriler store artık ProductCard içinde kullanılıyor

  // Load saved filters on mount
  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [query]);

  // Loading message rotation
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) =>
          prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
        );
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setLoadingMessageIndex(0);
    }
    return undefined;
  }, [loading]);

  const loadProducts = async (resetPage = true) => {
    if (loading) return;

    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;

      let result;
      if (query === 'radar') {
        result = { products: await ProductsService.getRadarProducts(), totalCount: 0 };
      } else if (query === 'trends') {
        result = { products: await ProductsService.getTrendProducts(currentPage), totalCount: 0 };
      } else {
        // Pass advanced filters to API
        result = await ProductsService.searchProducts(query, currentPage, {
          colors: filters.colors,
          sizes: filters.sizes,
          brands: filters.brands,
          genders: filters.genders,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
        });
      }

      if (resetPage) {
        setProducts(result.products);
        setPage(1);
      } else {
        setProducts(prev => [...prev, ...result.products]);
      }

      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && products.length < totalCount) {
      setPage(prev => prev + 1);
      loadProducts(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.setParams({ query: searchQuery } as never);
      loadProducts(true);
    }
  };

  const applyFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Store güncellemesini bekle (async state update)
    setTimeout(() => {
      loadProducts(true);
    }, 100);
  };

  const getHeaderTitle = () => {
    if (title) return title;
    if (query === 'radar') return 'Radar Ürünler';
    if (query === 'trends') return 'Trend Ürünler';
    return searchQuery || 'Arama Sonuçları';
  };

  const renderLoadingModal = () => (
    <Modal
      visible={loading && products.length === 0}
      transparent
      animationType="fade"
    >
      <View style={styles.loadingModal}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingTitle}>
            {LOADING_MESSAGES[loadingMessageIndex].title}
          </Text>
          <Text style={styles.loadingSubtitle}>
            {LOADING_MESSAGES[loadingMessageIndex].subtitle}
          </Text>
          <View style={styles.loadingDots}>
            {LOADING_MESSAGES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.loadingDot,
                  index === loadingMessageIndex && styles.loadingDotActive
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          {totalCount > 0 && (
            <Text style={styles.headerSubtitle}>{totalCount} sonuç</Text>
          )}
        </View>
        
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color={colors.black} />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {renderLoadingModal()}

      {/* Advanced Filters Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={applyFilters}
      />

      {!loading || products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <View style={styles.productWrapper}>
              <ProductCard
                product={item}
              />
            </View>
          )}
          keyExtractor={(item) => item.product_id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && products.length > 0 ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={colors.gray400} />
                <Text style={styles.emptyTitle}>Sonuç Bulunamadı</Text>
                <Text style={styles.emptyText}>
                  Farklı bir arama terimi deneyin
                </Text>
              </View>
            ) : null
          }
        />
      ) : null}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    ...shadows.small,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.m,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.gray600,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.s,
  },
  productWrapper: {
    width: '50%',
    padding: spacing.s,
  },
  loadingMore: {
    paddingVertical: spacing.l,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginTop: spacing.l,
  },
  emptyText: {
    fontSize: 13,
    color: colors.gray600,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  loadingModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginTop: spacing.l,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: colors.gray600,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: spacing.l,
    gap: spacing.s,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
  loadingDotActive: {
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filtersModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: spacing.xl,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  filterSection: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  filterLabel: {
    fontSize: 13,
    color: colors.black,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 10,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: 14,
  },
  genderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  genderButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderButtonText: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  sortButton: {
    flex: 1,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  priceSeparator: {
    fontSize: 14,
    color: colors.gray600,
  },
  applyButton: {
    marginHorizontal: spacing.l,
    marginTop: spacing.m,
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.medium,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  filterButton: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});