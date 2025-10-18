// src/screens/Home/HomeScreen.tsx - MODERN INSTAGRAM-STYLE HEADER
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
  Modal,
  Linking,
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
  { id: 'popular', icon: 'star', label: 'Popüler', action: 'popular', color: colors.warning },
  { id: 'discover', icon: 'compass', label: 'Keşfet', action: 'discover', color: colors.info },
  { id: 'radar', icon: 'radio-outline', label: 'Radar', action: 'radar', color: colors.secondary },
];

const POPULAR_SEARCHES = [
  { id: '1', text: 'tişört', popularity: 99 },
  { id: '2', text: 'pantolon', popularity: 98 },
  { id: '3', text: 'elbise', popularity: 97 },
  { id: '4', text: 'ayakkabı', popularity: 96 },
  { id: '5', text: 'mont', popularity: 95 },
  { id: '6', text: 'kazak', popularity: 94 },
  { id: '7', text: 'ceket', popularity: 93 },
  { id: '8', text: 'jean', popularity: 92 },
  { id: '9', text: 'bot', popularity: 91 },
  { id: '10', text: 'gömlek', popularity: 90 },
  { id: '11', text: 'çanta', popularity: 89 },
  { id: '12', text: 'bluz', popularity: 88 },
  { id: '13', text: 'tayt', popularity: 87 },
  { id: '14', text: 'etek', popularity: 86 },
  { id: '15', text: 'sweatshirt', popularity: 85 },
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
  const [showPopularSearches, setShowPopularSearches] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
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
      setShowPopularSearches(false);
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
    
    if (actionId === 'popular') {
      setShowPopularSearches(true);
    } else if (actionId === 'bai') {
      AnalyticsService.logEvent('bai_button_click');
      navigation.navigate('BAI' as never);
    } else if (route) {
      navigation.navigate(route as never);
    } else if (actionId === 'discover') {
      navigation.navigate('SearchResults', { 
        query: 'trends',
        title: 'Keşfet'
      } as never);
    } else if (actionId === 'radar') {
      navigation.navigate('SearchResults', { 
        query: 'radar',
        title: 'Radar Ürünler'
      } as never);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      AnalyticsService.logSearch(searchQuery.trim(), 'text');
      setShowPopularSearches(false);
      navigation.navigate('SearchResults', { 
        query: searchQuery.trim()
      } as never);
    }
  };

  const handlePopularSearch = (searchText: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    AnalyticsService.logSearch(searchText, 'text');
    setSearchQuery(searchText);
    setShowPopularSearches(false);
    navigation.navigate('SearchResults', { 
      query: searchText
    } as never);
  };

  const handleMenuLink = async (url: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        setShowMenu(false);
      }
    } catch (error) {
      console.error('Link açma hatası:', error);
    }
  };

  const handleBAIPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    AnalyticsService.logEvent('bai_button_click');
    // Direkt kamera ekranına git
    (navigation as any).navigate('BAI', {
      screen: 'BAICamera'
    });
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
      {/* MODERN INSTAGRAM-STYLE HEADER */}
      <View style={styles.modernHeader}>
        {/* Top Bar: Logo + Icons */}
        <View style={styles.topBar}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/bazenda-logo.png')}
              style={styles.logo}
            />
          </View>

          <View style={styles.headerIcons}>
            {/* Menu */}
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowMenu(!showMenu);
              }}
            >
              <Ionicons name="menu" size={22} color={colors.black} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Row with Actions */}
        <View style={styles.searchRow}>
          {/* Main Search Bar */}
          <TouchableOpacity 
            style={styles.mainSearchBar}
            onPress={() => setShowPopularSearches(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={18} color={colors.primary} />
            <TextInput
              style={styles.mainSearchInput}
              placeholder="Ne arıyorsunuz?"
              placeholderTextColor={colors.gray500}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              onFocus={() => setShowPopularSearches(true)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.gray400} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Filter Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFilters(true);
            }}
          >
            <Ionicons name="options-outline" size={20} color={colors.black} />
          </TouchableOpacity>

          {/* BAI Button - Rainbow Gradient */}
          <TouchableOpacity 
            style={styles.baiButton}
            onPress={handleBAIPress}
          >
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.baiGradient}
            >
              <Ionicons name="camera" size={20} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
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
            {/* Quick Actions */}
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
                    <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                      <Ionicons name={action.icon as any} size={22} color={action.color} />
                    </View>
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Section Header */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Trendleri Keşfedin</Text>
                  <Text style={styles.sectionSubtitle}>En popüler ürünler</Text>
                </View>
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

      {/* Popular Searches Modal */}
      <Modal
        visible={showPopularSearches}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPopularSearches(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPopularSearches(false)}
        >
          <View style={styles.popularSearchesModal}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Popüler Aramalar</Text>
              <TouchableOpacity onPress={() => setShowPopularSearches(false)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.popularSearchesList}
            >
              {POPULAR_SEARCHES.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.popularSearchItem}
                  onPress={() => handlePopularSearch(item.text)}
                >
                  <View style={styles.popularSearchIcon}>
                    <Ionicons name="search" size={16} color={colors.gray600} />
                  </View>
                  <Text style={styles.popularSearchText}>{item.text}</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.gray400} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>


      {/* Menu Dropdown */}
      {showMenu && (
        <View style={styles.dropdown}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Menü</Text>
            <TouchableOpacity onPress={() => setShowMenu(false)}>
              <Ionicons name="close" size={20} color={colors.black} />
            </TouchableOpacity>
          </View>
          <View style={styles.dropdownContent}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuLink('https://bazenda.com/hakkinda')}
            >
              <Ionicons name="information-circle-outline" size={20} color={colors.black} />
              <Text style={styles.menuText}>Hakkımızda</Text>
              <Ionicons name="open-outline" size={16} color={colors.gray400} style={styles.menuArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuLink('https://bazenda.com/iletisim')}
            >
              <Ionicons name="mail-outline" size={20} color={colors.black} />
              <Text style={styles.menuText}>İletişim</Text>
              <Ionicons name="open-outline" size={16} color={colors.gray400} style={styles.menuArrow} />
            </TouchableOpacity>
          </View>
        </View>
      )}

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
  
  // ===== MODERN HEADER =====
  modernHeader: {
    backgroundColor: colors.white,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    ...shadows.small,
    zIndex: 10,
  },
  
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
    paddingBottom: spacing.s,
  },
  
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  logo: {
    width: 100,
    height: 32,
    resizeMode: 'contain',
  },
  
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    gap: spacing.s,
  },
  
  mainSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 12,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s + 2,
    borderWidth: 1.5,
    borderColor: colors.gray200,
  },
  
  mainSearchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: 14,
    color: colors.black,
  },
  
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  
  baiButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.medium,
  },
  
  baiGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Quick Actions
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
  
  quickActionLabel: {
    fontSize: 11,
    color: colors.gray700,
    fontWeight: '600',
  },
  
  // Section
  section: {
    marginBottom: spacing.m,
    paddingTop: spacing.s,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.m,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
  },
  
  sectionSubtitle: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 2,
  },
  
  seeAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Products Grid
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
  
  // Scroll to Top
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
  
  // Popular Searches Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  
  popularSearchesModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.m,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  
  popularSearchesList: {
    padding: spacing.l,
  },
  
  popularSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  
  popularSearchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  
  popularSearchText: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },
  
  // Dropdowns
  dropdown: {
    position: 'absolute',
    top: 100,
    right: spacing.m,
    width: 260,
    backgroundColor: colors.white,
    borderRadius: 16,
    ...shadows.medium,
    overflow: 'hidden',
    zIndex: 1000,
  },
  
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  
  dropdownContent: {
    padding: spacing.m,
    maxHeight: 300,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  
  emptyText: {
    fontSize: 13,
    color: colors.gray600,
    marginTop: spacing.m,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  
  menuText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
    marginLeft: spacing.m,
    flex: 1,
  },
  
  menuArrow: {
    marginLeft: 'auto',
  },
});