// src/screens/Home/HomeScreen.tsx - STICKY SEARCH HEADER
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, shadows } from '../../theme/theme';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductsService from '../../services/api/products.api';
import { useFavorites } from '../../store/favoritesStore';
import AnalyticsService from '../../services/analytics/analytics.service';
import FilterModal from '../../components/FilterModal/FilterModal';

const QUICK_ACTIONS = [
  { id: 'favorites', icon: 'heart', label: 'Favoriler', route: 'Favorilerim', color: colors.error },
  { id: 'discover', icon: 'compass', label: 'Keşfet', action: 'discover', color: colors.info },
  { id: 'filter', icon: 'options', label: 'Filtre', action: 'filter', color: colors.success },
  { id: 'bai', icon: 'camera', label: 'BAI', action: 'bai', color: colors.primary },
];

// En çok arama yapılan ürünler
const POPULAR_SEARCHES = [
  { id: '1', text: 'tişört', category: 'Üst Giyim', popularity: 99 },
  { id: '2', text: 'pantolon', category: 'Alt Giyim', popularity: 98 },
  { id: '3', text: 'elbise', category: 'Dış Giyim', popularity: 97 },
  { id: '4', text: 'ayakkabı', category: 'Ayakkabı', popularity: 96 },
  { id: '5', text: 'mont', category: 'Dış Giyim', popularity: 95 },
  { id: '6', text: 'kazak', category: 'Üst Giyim', popularity: 94 },
  { id: '7', text: 'ceket', category: 'Dış Giyim', popularity: 93 },
  { id: '8', text: 'jean', category: 'Alt Giyim', popularity: 92 },
  { id: '9', text: 'bot', category: 'Ayakkabı', popularity: 91 },
  { id: '10', text: 'gömlek', category: 'Üst Giyim', popularity: 90 },
  { id: '11', text: 'çanta', category: 'Aksesuar', popularity: 89 },
  { id: '12', text: 'bluz', category: 'Üst Giyim', popularity: 88 },
  { id: '13', text: 'tayt', category: 'Alt Giyim', popularity: 87 },
  { id: '14', text: 'etek', category: 'Alt Giyim', popularity: 86 },
  { id: '15', text: 'sweatshirt', category: 'Üst Giyim', popularity: 85 },
  { id: '16', text: 'spor ayakkabı', category: 'Ayakkabı', popularity: 84 },
  { id: '17', text: 'şort', category: 'Alt Giyim', popularity: 83 },
  { id: '18', text: 'kaban', category: 'Dış Giyim', popularity: 82 },
  { id: '19', text: 'tunik', category: 'Üst Giyim', popularity: 81 },
  { id: '20', text: 'tulum', category: 'Dış Giyim', popularity: 80 },
  { id: '21', text: 'cüzdan', category: 'Aksesuar', popularity: 79 },
  { id: '22', text: 'şapka', category: 'Aksesuar', popularity: 78 },
  { id: '23', text: 'eşofman', category: 'Spor', popularity: 77 },
  { id: '24', text: 'pijama', category: 'İç Giyim', popularity: 76 },
  { id: '25', text: 'kemer', category: 'Aksesuar', popularity: 75 },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [trendProducts, setTrendProducts] = useState<any[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [trendPage, setTrendPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showPopularSearches, setShowPopularSearches] = useState(true);
  
  const { toggleFavorite, isFavorite } = useFavorites();

  const loadTrendProducts = async (page: number = 1) => {
    setIsLoadingTrends(true);
    try {
      const products = await ProductsService.getTrendProducts(page);
      if (page === 1) {
        setTrendProducts(products);
      } else {
        setTrendProducts(prev => [...prev, ...products]);
      }
    } catch (error) {
      console.error('Trend products error:', error);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  React.useEffect(() => {
    AnalyticsService.logScreenView('Home');
    loadTrendProducts(1);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setShowPopularSearches(true);
    }, [])
  );

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 500);
    scrollY.setValue(offsetY);
  };

  const scrollToTop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleQuickAction = (actionId: string, route?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (actionId === 'bai') {
      AnalyticsService.logEvent('bai_button_click');
      navigation.navigate('BAI' as never);
    } else if (route) {
      navigation.navigate(route as never);
    } else if (actionId === 'discover') {
      navigation.navigate('SearchResults', { 
        query: 'trends',
        title: 'Keşfet'
      } as never);
    } else if (actionId === 'filter') {
      setShowFilters(true);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      AnalyticsService.logSearch(searchQuery.trim(), 'text');
      navigation.navigate('SearchResults', { 
        query: searchQuery.trim()
      } as never);
    }
  };

  const handlePopularSearch = (searchText: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    AnalyticsService.logSearch(searchText, 'text');
    setShowPopularSearches(false);
    navigation.navigate('SearchResults', { 
      query: searchText
    } as never);
  };

  const togglePopularSearches = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPopularSearches(!showPopularSearches);
  };

  const getTagColor = (index: number) => {
    const tagColors = [
      { bg: colors.primary + '15', text: colors.primary, border: colors.primary + '40' },
      { bg: colors.secondary + '15', text: colors.secondary, border: colors.secondary + '40' },
      { bg: colors.success + '15', text: colors.success, border: colors.success + '40' },
      { bg: colors.info + '15', text: colors.info, border: colors.info + '40' },
      { bg: '#FF6B6B15', text: '#FF6B6B', border: '#FF6B6B40' },
      { bg: '#4ECDC415', text: '#4ECDC4', border: '#4ECDC440' },
      { bg: '#45B7D115', text: '#45B7D1', border: '#45B7D140' },
      { bg: '#96CEB415', text: '#96CEB4', border: '#96CEB440' },
    ];
    return tagColors[index % tagColors.length];
  };

  const getTagSize = (popularity: number) => {
    if (popularity >= 90) return { fontSize: 14, paddingH: 14, paddingV: 8 };
    if (popularity >= 80) return { fontSize: 13, paddingH: 12, paddingV: 7 };
    if (popularity >= 70) return { fontSize: 12, paddingH: 11, paddingV: 6 };
    return { fontSize: 11, paddingH: 10, paddingV: 6 };
  };

  const handleApplyFilters = (appliedFilters: any) => {
    AnalyticsService.logFilterUsage('home_filters', appliedFilters);
    navigation.navigate('SearchResults', { 
      query: searchQuery || 'all',
      filters: appliedFilters
    } as never);
  };

  const loadMoreTrends = () => {
    if (!isLoadingTrends && trendPage < 2) {
      const nextPage = trendPage + 1;
      setTrendPage(nextPage);
      loadTrendProducts(nextPage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header - Always Visible */}
      <View style={styles.stickyHeader}>
        {/* Logo - Small, Left Corner */}
        <View style={styles.topBar}>
          <Image
            source={require('../../../assets/bazenda-logo.png')}
            style={styles.smallLogo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Akıllı Alışveriş Asistanı</Text>
        </View>

        {/* Search Bar - Always Visible */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ne arıyorsunuz? Örn: pantolon, ayakkabı..."
              placeholderTextColor={colors.gray500}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.gray400} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={trendProducts}
        renderItem={({ item }) => (
          <View style={styles.trendProductCard}>
            <ProductCard
              product={item}
              onFavoritePress={() => toggleFavorite(item.product_id)}
              isFavorite={isFavorite(item.product_id)}
            />
          </View>
        )}
        keyExtractor={(item) => item.product_id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.trendGrid}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            {/* Quick Actions Card */}
            <View style={styles.quickActionsCard}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickActionsScroll}
              >
                {QUICK_ACTIONS.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.quickActionItem}
                    onPress={() => handleQuickAction(action.id, action.route)}
                  >
                    {action.id === 'bai' ? (
                      <LinearGradient
                        colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.quickActionIconGradient}
                      >
                        <Ionicons name={action.icon as any} size={18} color={colors.white} />
                      </LinearGradient>
                    ) : (
                      <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                        <Ionicons name={action.icon as any} size={18} color={action.color} />
                      </View>
                    )}
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Popüler Aramalar Toggle */}
            <TouchableOpacity
              style={styles.popularToggle}
              onPress={togglePopularSearches}
            >
              <Ionicons 
                name="star" 
                size={16} 
                color={colors.primary} 
              />
              <Text style={styles.popularToggleText}>Popüler Aramalar</Text>
              <Ionicons 
                name={showPopularSearches ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={colors.primary} 
              />
            </TouchableOpacity>

            {/* Popular Searches */}
            {showPopularSearches && (
              <View style={styles.popularSearchesContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tagCloudScroll}
                >
                  {POPULAR_SEARCHES.map((item, index) => {
                    const tagColor = getTagColor(index);
                    const tagSize = getTagSize(item.popularity);
                    
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.modernTag,
                          { 
                            backgroundColor: tagColor.bg,
                            borderColor: tagColor.border,
                            paddingHorizontal: tagSize.paddingH,
                            paddingVertical: tagSize.paddingV,
                          }
                        ]}
                        onPress={() => handlePopularSearch(item.text)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.modernTagText,
                          { color: tagColor.text, fontSize: tagSize.fontSize }
                        ]}>
                          {item.text}
                        </Text>
                        <View style={[styles.popularityDot, { backgroundColor: tagColor.text }]} />
                      </TouchableOpacity>
                    );
                  })}
                  
                  {/* More Indicator */}
                  <View style={styles.moreIndicator}>
                    <Ionicons name="ellipsis-horizontal" size={20} color={colors.gray500} />
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Section Header */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trendleri Keşfedin</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SearchResults', { 
                  query: 'trends',
                  title: 'Trend Ürünler'
                } as never)}>
                  <Text style={styles.seeAll}>Tümünü Gör</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        ListFooterComponent={
          isLoadingTrends && trendProducts.length > 0 ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoadingTrends ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <TouchableOpacity
          style={styles.scrollTopButton}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.scrollTopGradient}
          >
            <Ionicons name="arrow-up" size={24} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stickyHeader: {
    backgroundColor: colors.white,
    paddingBottom: spacing.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
    paddingBottom: spacing.xs,
  },
  smallLogo: {
    width: 80,
    height: 28,
    marginRight: spacing.xs,
  },
  tagline: {
    fontSize: 10,
    color: colors.gray600,
    fontWeight: '500',
  },
  searchBarContainer: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 12,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s + 2,
    borderWidth: 1.5,
    borderColor: colors.gray200,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: 14,
    color: colors.black,
  },
  quickActionsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.m,
    marginTop: spacing.m,
    marginBottom: spacing.s,
    paddingVertical: spacing.m,
    borderRadius: 16,
    ...shadows.small,
  },
  quickActionsScroll: {
    paddingHorizontal: spacing.m,
    gap: spacing.m,
  },
  quickActionItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.small,
  },
  quickActionLabel: {
    fontSize: 11,
    color: colors.gray700,
    fontWeight: '600',
  },
  popularToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '10',
    marginHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 10,
    gap: spacing.xs,
    marginBottom: spacing.s,
  },
  popularToggleText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  popularSearchesContainer: {
    backgroundColor: 'transparent',
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    paddingVertical: spacing.s,
  },
  tagCloudScroll: {
    paddingHorizontal: spacing.xs,
    gap: spacing.s,
  },
  modernTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: spacing.s,
  },
  modernTagText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  popularityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  moreIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.s,
  },
  section: {
    marginBottom: spacing.m,
    paddingTop: spacing.s,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  trendGrid: {
    padding: spacing.s,
  },
  trendProductCard: {
    width: '50%',
    padding: spacing.s,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  loadingMore: {
    paddingVertical: spacing.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollTopButton: {
    position: 'absolute',
    right: spacing.m,
    bottom: spacing.xl,
    zIndex: 100,
  },
  scrollTopGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
});