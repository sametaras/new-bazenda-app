// src/screens/Home/HomeScreen.tsx - MODERN TAG CLOUD VERSION
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  { id: 'radar', icon: 'radio', label: 'Radar', action: 'radar' },
  { id: 'trends', icon: 'flame', label: 'Trendler', action: 'trends' },
];

// En çok arama yapılan ürünler - gerçek e-ticaret verilerine göre sıralı
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

export default function HomeScreen({ route }: any) {
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
  const [refreshing, setRefreshing] = useState(false);

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

  // Double tap scroll-to-top
  React.useEffect(() => {
    if (route?.params?.scrollToTop) {
      scrollToTop();
    }
  }, [route?.params?.scrollToTop]);

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
    navigation.navigate('SearchResults', {
      query: searchText
    } as never);
  };

  const togglePopularSearches = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPopularSearches(!showPopularSearches);
  };

  const getTagColor = (index: number) => {
    const tagColors = [colors.tag1, colors.tag2, colors.tag3, colors.tag4, colors.tag5];
    return tagColors[index % tagColors.length];
  };

  const getTagSize = (popularity: number) => {
    if (popularity >= 90) return { fontSize: 16, paddingH: 16, paddingV: 10 };
    if (popularity >= 80) return { fontSize: 15, paddingH: 14, paddingV: 9 };
    if (popularity >= 70) return { fontSize: 14, paddingH: 12, paddingV: 8 };
    return { fontSize: 13, paddingH: 11, paddingV: 7 };
  };

  const handleBAIPress = () => {
    AnalyticsService.logEvent('bai_button_click');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.navigate('BAI' as never);
  };

  const handleFilterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters(!showFilters);
  };

  const handleApplyFilters = (appliedFilters: any) => {
    // TODO: Add analytics when service is ready
    console.log('🔍 Filters applied:', appliedFilters);
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

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTrendPage(1);
    await loadTrendProducts(1);
    setRefreshing(false);
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
              <Text style={styles.quickActionLabel}>Aramalar</Text>
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

            <TouchableOpacity
              style={styles.filterAction}
              onPress={handleFilterPress}
            >
              <View style={styles.filterIcon}>
                <Ionicons name="options" size={16} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Filtre</Text>
            </TouchableOpacity>

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
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={trendProducts}
        renderItem={({ item }) => (
          <View style={styles.trendProductCard}>
            <ProductCard
              product={item}
              onFavoritePress={() => toggleFavorite(item)}
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
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <>
            {/* Popüler Aramalar Header */}
            {showPopularSearches && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Popüler Aramalar</Text>
                </View>
              </View>
            )}

            {/* Modern Popular Searches Cloud - Horizontal Scroll */}
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
                            backgroundColor: `${tagColor}15`,
                            borderColor: `${tagColor}40`,
                            paddingHorizontal: tagSize.paddingH,
                            paddingVertical: tagSize.paddingV,
                          }
                        ]}
                        onPress={() => handlePopularSearch(item.text)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.modernTagText,
                          { color: tagColor, fontSize: tagSize.fontSize }
                        ]}>
                          {item.text}
                        </Text>
                        <View style={[styles.popularityDot, { backgroundColor: tagColor }]} />
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
  popularSearchesContainer: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.m,
    marginBottom: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: 16,
    ...shadows.small,
  },
  tagCloudScroll: {
    paddingHorizontal: spacing.l,
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