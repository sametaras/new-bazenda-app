// src/screens/Home/HomeScreen.tsx - PRODUCTION READY
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
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, shadows } from '../../theme/theme';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductsService from '../../services/api/products.api';
import { useFavorites } from '../../store/favoritesStore';
import AnalyticsService from '../../services/analytics/analytics.service';
import FilterModal from '../../components/FilterModal/FilterModal';

const QUICK_ACTIONS = [
  { id: 'favorites', icon: 'heart', label: 'Favoriler', route: 'Favorilerim' },
  { id: 'radar', icon: 'radio', label: 'Radar', action: 'radar' },
  { id: 'trends', icon: 'flame', label: 'Trendler', action: 'trends' },
];

const POPULAR_SEARCHES = [
  { id: '1', text: 'külot', size: 4, color: 1 },
  { id: '2', text: 'tulum', size: 3, color: 2 },
  { id: '3', text: 'tayt', size: 3, color: 3 },
  { id: '4', text: 'tunik', size: 3, color: 4 },
  { id: '5', text: 'atlet', size: 4, color: 5 },
  { id: '6', text: 'boxer', size: 4, color: 1 },
  { id: '7', text: 'yağmurluk', size: 3, color: 2 },
  { id: '8', text: 'çorap', size: 3, color: 3 },
  { id: '9', text: 'salopet', size: 2, color: 4 },
  { id: '10', text: 'tişört', size: 5, color: 5 },
  { id: '11', text: 'bermuda', size: 3, color: 1 },
  { id: '12', text: 'korse', size: 2, color: 2 },
  { id: '13', text: 'bluz', size: 4, color: 3 },
  { id: '14', text: 'sütyen', size: 4, color: 4 },
  { id: '15', text: 'pantolon', size: 5, color: 5 },
  { id: '16', text: 'kaban', size: 4, color: 1 },
  { id: '17', text: 'parka', size: 2, color: 2 },
  { id: '18', text: 'yelek', size: 4, color: 3 },
  { id: '19', text: 'elbise', size: 5, color: 4 },
  { id: '20', text: 'ayakkabı', size: 5, color: 5 },
  { id: '21', text: 'atkı', size: 3, color: 1 },
  { id: '22', text: 'kapri', size: 2, color: 2 },
  { id: '23', text: 'ceket', size: 4, color: 3 },
  { id: '24', text: 'kazak', size: 5, color: 4 },
  { id: '25', text: 'pijama', size: 4, color: 5 },
  { id: '26', text: 'gecelik', size: 3, color: 1 },
  { id: '27', text: 'mont', size: 5, color: 2 },
  { id: '28', text: 'etek', size: 5, color: 3 },
  { id: '29', text: 'trençkot', size: 2, color: 4 },
  { id: '30', text: 'bot', size: 5, color: 5 },
  { id: '31', text: 'gömlek', size: 5, color: 1 },
  { id: '32', text: 'tshirt', size: 5, color: 2 },
  { id: '33', text: 'şort', size: 3, color: 3 },
  { id: '34', text: 'sabahlık', size: 3, color: 4 },
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
  const [showPopularSearches, setShowPopularSearches] = useState(true); // İlk başta açık
  
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

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 500);
    scrollY.setValue(offsetY);
  };

  const scrollToTop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleQuickAction = (action: string, route?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (route) {
      navigation.navigate(route as never);
    } else if (action === 'radar') {
      navigation.navigate('SearchResults', { 
        query: 'radar',
        title: 'Radar Ürünler'
      } as never);
    } else if (action === 'trends') {
      navigation.navigate('SearchResults', { 
        query: 'trends',
        title: 'Trend Ürünler'
      } as never);
    }
  };

  const handleBAIPress = () => {
    AnalyticsService.logEvent('bai_button_click');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.navigate('BAI' as never);
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

  const getTagStyle = (size: number, color: number) => {
    // Font size based on size (2-5)
    const fontSize = 10 + (size * 2);
    
    // Colors from bazenda.com
    const tagColors = [
      colors.tag1, // #FF6B6B
      colors.tag2, // #4ECDC4
      colors.tag3, // #45B7D1
      colors.tag4, // #96CEB4
      colors.tag5, // #9B59B6
    ];
    
    return {
      fontSize,
      color: tagColors[color - 1] || colors.tag1,
    };
  };

  const handleFilterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters(!showFilters);
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
      {/* Header with Shadow */}
      <View style={styles.headerContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/bazenda-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Akıllı Alışveriş Asistanınız</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.gray500} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ne arıyorsunuz?"
              placeholderTextColor={colors.gray500}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>

          {/* Quick Actions Bar */}
          <View style={styles.quickActionsBar}>
            {/* Popular Searches Toggle Button */}
            <TouchableOpacity
              style={styles.popularSearchAction}
              onPress={togglePopularSearches}
            >
              <View style={styles.popularSearchIcon}>
                <Ionicons 
                  name={showPopularSearches ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={colors.primary} 
                />
              </View>
              <Text style={styles.quickActionLabel}>Popüler</Text>
            </TouchableOpacity>

            {/* Filter Button */}
            <TouchableOpacity
              style={styles.filterAction}
              onPress={handleFilterPress}
            >
              <View style={styles.filterIcon}>
                <Ionicons name="options" size={16} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Filtre</Text>
            </TouchableOpacity>

            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                onPress={() => handleQuickAction(action.action, action.route)}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={action.icon as any} size={16} color={colors.primary} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}

            {/* BAI Button */}
            <TouchableOpacity
              style={styles.baiQuickAction}
              onPress={handleBAIPress}
            >
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.baiQuickActionGradient}
              >
                <Ionicons name="camera" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.baiQuickActionLabel}>BAI</Text>
            </TouchableOpacity>
          </View>

          {/* Popular Searches Dropdown kaldırıldı - üstte FlatList içinde */}
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
              onBAIPress={handleBAIPress}
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
            {/* Popular Searches Dropdown - bazenda.com style */}
            {showPopularSearches && (
              <View style={styles.popularSearchesContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tagCloudContent}
                >
                  {POPULAR_SEARCHES.map((item) => {
                    const tagStyle = getTagStyle(item.size, item.color);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.tagItem}
                        onPress={() => handlePopularSearch(item.text)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.tagItemText, tagStyle]}>
                          {item.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Trend Products Header */}
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
  headerContainer: {
    backgroundColor: colors.white,
    paddingBottom: spacing.m,
    ...shadows.medium,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: spacing.m,
    paddingBottom: spacing.m,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 11,
    color: colors.gray600,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: spacing.m,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 10,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginBottom: spacing.s,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: 14,
  },
  quickActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularSearchAction: {
    alignItems: 'center',
    flex: 1,
  },
  popularSearchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  filterAction: {
    alignItems: 'center',
    flex: 1,
  },
  filterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    fontSize: 10,
    color: colors.gray700,
    fontWeight: '500',
  },
  baiQuickAction: {
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  baiQuickActionGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  baiQuickActionLabel: {
    fontSize: 11,
    color: colors.gray700,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.l,
    paddingTop: spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.xs,
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
  popularSection: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.l,
    backgroundColor: colors.white,
    marginBottom: spacing.m,
  },
  popularHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginLeft: spacing.s,
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  popularTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  popularTagEmoji: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  popularTagText: {
    fontSize: 13,
    color: colors.gray700,
    fontWeight: '500',
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
    paddingHorizontal: spacing.l,
    justifyContent: 'center',
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