// src/screens/SearchResults/SearchResultsScreen.tsx - YENİ
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductsService from '../../services/api/products.api';
import { useFavorites } from '../../store/favoritesStore';

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
  const [filters, setFilters] = useState({
    sortBy: '0',
    priceMin: '',
    priceMax: '',
  });

  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    loadProducts();
  }, [query]);

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
        result = await ProductsService.searchProducts(query, currentPage, filters);
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
    loadProducts(true);
    setShowFilters(false);
  };

  const getHeaderTitle = () => {
    if (title) return title;
    if (query === 'radar') return 'Radar Ürünler';
    if (query === 'trends') return 'Trend Ürünler';
    return searchQuery || 'Arama Sonuçları';
  };

  const renderHeader = () => (
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
      
      <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
        <Ionicons name="options-outline" size={24} color={colors.black} />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Sort */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Sıralama</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                filters.sortBy === '0' && styles.sortButtonActive
              ]}
              onPress={() => setFilters({ ...filters, sortBy: '0' })}
            >
              <Text style={[
                styles.sortButtonText,
                filters.sortBy === '0' && styles.sortButtonTextActive
              ]}>
                Önerilen
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sortButton,
                filters.sortBy === '2' && styles.sortButtonActive
              ]}
              onPress={() => setFilters({ ...filters, sortBy: '2' })}
            >
              <Text style={[
                styles.sortButtonText,
                filters.sortBy === '2' && styles.sortButtonTextActive
              ]}>
                Düşük Fiyat
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sortButton,
                filters.sortBy === '1' && styles.sortButtonActive
              ]}
              onPress={() => setFilters({ ...filters, sortBy: '1' })}
            >
              <Text style={[
                styles.sortButtonText,
                filters.sortBy === '1' && styles.sortButtonTextActive
              ]}>
                Yüksek Fiyat
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Fiyat Aralığı</Text>
          <View style={styles.priceInputs}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              keyboardType="numeric"
              value={filters.priceMin}
              onChangeText={(text) => setFilters({ ...filters, priceMin: text })}
            />
            <Text style={styles.priceSeparator}>-</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              keyboardType="numeric"
              value={filters.priceMax}
              onChangeText={(text) => setFilters({ ...filters, priceMax: text })}
            />
          </View>
        </View>

        {/* Apply Button */}
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Filtreleri Uygula</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderFilters()}

      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <View style={styles.productWrapper}>
 <ProductCard
        product={item}
        onFavoritePress={() => toggleFavorite(item.product_id)}
        onBAIPress={() => {}}
        isFavorite={isFavorite(item.product_id)}
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
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h4,
    color: colors.black,
  },
  headerSubtitle: {
    ...typography.small,
    color: colors.gray600,
    marginTop: 2,
  },
  filtersContainer: {
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: 16,
  },
  filterSection: {
    marginBottom: spacing.m,
  },
  filterLabel: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '600',
    marginBottom: spacing.s,
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
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    ...typography.caption,
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
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 16,
  },
  priceSeparator: {
    ...typography.body,
    color: colors.gray600,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    ...typography.button,
    color: colors.white,
  },
  listContent: {
    padding: spacing.s,
  },
  productWrapper: {
    width: '50%',
    padding: spacing.s,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.m,
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
    ...typography.h4,
    color: colors.black,
    marginTop: spacing.l,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.s,
    textAlign: 'center',
  },
});