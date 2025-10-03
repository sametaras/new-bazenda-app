// src/screens/Home/HomeScreen.tsx - GÜNCEL TAM HAL
import React, { useState } from 'react';
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

const QUICK_ACTIONS = [
  { id: 'favorites', icon: 'heart', label: 'Favoriler', route: 'Favorilerim' },
  { id: 'radar', icon: 'radio', label: 'Radar', action: 'radar' },
  { id: 'trends', icon: 'flame', label: 'Trendler', action: 'trends' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [trendProducts, setTrendProducts] = useState<any[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  const loadTrendProducts = async () => {
    setIsLoadingTrends(true);
    try {
      const products = await ProductsService.getTrendProducts(1);
      setTrendProducts(products);
    } catch (error) {
      console.error('Trend products error:', error);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  React.useEffect(() => {
    AnalyticsService.logScreenView('Home');
    loadTrendProducts();
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>bazenda</Text>
          <Text style={styles.tagline}>Akıllı Alışveriş Asistanı</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.gray500} />
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
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                onPress={() => handleQuickAction(action.action, action.route)}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={action.icon as any} size={20} color={colors.primary} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}

            {/* BAI Button - Larger */}
            <TouchableOpacity
              style={styles.baiQuickAction}
              onPress={handleBAIPress}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.baiQuickActionGradient}
              >
                <Ionicons name="camera" size={28} color={colors.white} />
              </LinearGradient>
              <Text style={styles.baiQuickActionLabel}>BAI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BAI Feature Card - Web Style */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleBAIPress}
        >
          <View style={styles.baiCard}>
            {/* Left Side - Colorful Gradient */}
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.baiCardLeftGradient}
            />

            {/* Right Side - Content */}
            <View style={styles.baiCardContent}>
              <View style={styles.baiNewBadge}>
                <Text style={styles.baiNewText}>YENİ</Text>
              </View>
              
              <Ionicons name="camera" size={48} color={colors.primary} />
              <Text style={styles.baiTitle}>Fotoğraf ile Arama</Text>
              <Text style={styles.baiSubtitle}>Çek, Bul, Satın Al</Text>
              
              <View style={styles.baiFeatures}>
                <View style={styles.baiFeature}>
                  <Ionicons name="flash" size={12} color={colors.primary} />
                  <Text style={styles.baiFeatureText}>Hızlı</Text>
                </View>
                <View style={styles.baiFeature}>
                  <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                  <Text style={styles.baiFeatureText}>Güvenli</Text>
                </View>
                <View style={styles.baiFeature}>
                  <Ionicons name="sparkles" size={12} color={colors.info} />
                  <Text style={styles.baiFeatureText}>AI Destekli</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Trend Products */}
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

          {/* Scroll Hint */}
          <View style={styles.scrollHint}>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            <Text style={styles.scrollHintText}>Sola kaydırın</Text>
          </View>

          {isLoadingTrends ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              horizontal
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
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendList}
              ListEmptyComponent={() => (
                <View style={styles.emptyList}>
                  <Text style={styles.emptyText}>Ürünler yükleniyor...</Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.l,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  tagline: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.l,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    marginBottom: spacing.m,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: 16,
  },
  quickActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    fontSize: 11,
    color: colors.gray700,
    fontWeight: '500',
  },
  baiQuickAction: {
    alignItems: 'center',
    marginLeft: spacing.s,
  },
  baiQuickActionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  baiQuickActionLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  baiCard: {
    marginHorizontal: spacing.m,
    marginBottom: spacing.l,
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...shadows.medium,
  },
  baiCardLeftGradient: {
    width: 8,
  },
  baiCardContent: {
    flex: 1,
    padding: spacing.l,
    alignItems: 'center',
  },
  baiNewBadge: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    backgroundColor: colors.black,
    paddingHorizontal: spacing.m,
    paddingVertical: 4,
    borderRadius: 12,
  },
  baiNewText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  baiTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
    marginTop: spacing.m,
  },
  baiSubtitle: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  baiFeatures: {
    flexDirection: 'row',
    marginTop: spacing.m,
    gap: spacing.s,
  },
  baiFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  baiFeatureText: {
    color: colors.gray700,
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
  },
  scrollHintText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  trendList: {
    paddingLeft: spacing.m,
  },
  trendProductCard: {
    marginRight: spacing.m,
    width: 160,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyList: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.m,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray500,
  },
});