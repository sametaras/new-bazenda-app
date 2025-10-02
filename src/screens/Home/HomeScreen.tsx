// src/screens/Home/HomeScreen.tsx - BAZENDA CLONE
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, shadows } from '../../theme/theme';
import ProductCard from '../../components/ProductCard/ProductCard';

// Trend tags (bazenda.com'dan)
const TREND_TAGS = [
  'pantolon', 'etek', 'gömlek', 'elbise', 'kazak', 'tişört',
  'mont', 'ceket', 'ayakkabı', 'bot', 'çanta', 'sweatshirt'
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleBAIPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.navigate('BAI' as never);
  };

  const handleTagPress = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery(tag);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} // Search bar sticky
      >
        {/* Logo Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>bazenda</Text>
        </View>

        {/* Search Bar - Sticky */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Ne arıyorsunuz? Örn: pantolon, ayakkabı..."
              placeholderTextColor={colors.gray500}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            {/* Camera Button (BAI) */}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleBAIPress}
            >
              <Ionicons name="camera" size={22} color={colors.primary} />
            </TouchableOpacity>

            {/* Search Button */}
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Filter Toggle */}
          <TouchableOpacity
            style={styles.filterToggleButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options" size={20} color={colors.white} />
            <Text style={styles.filterToggleText}>Filtreler</Text>
          </TouchableOpacity>
        </View>

        {/* BAI Hero Card */}
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.baiHero}
        >
          <TouchableOpacity
            style={styles.baiHeroContent}
            onPress={handleBAIPress}
            activeOpacity={0.9}
          >
            <View style={styles.baiNewBadge}>
              <Text style={styles.baiNewText}>YENİ</Text>
            </View>
            
            <Ionicons name="camera" size={48} color={colors.white} />
            
            <Text style={styles.baiHeroTitle}>Fotoğrafla Ara</Text>
            <Text style={styles.baiHeroSubtitle}>
              BAI ile ürünleri saniyeler içinde bul
            </Text>
            
            <View style={styles.baiFeatures}>
              <View style={styles.baiFeature}>
                <Ionicons name="flash" size={12} color={colors.white} />
                <Text style={styles.baiFeatureText}>Hızlı</Text>
              </View>
              <View style={styles.baiFeature}>
                <Ionicons name="shield-checkmark" size={12} color={colors.white} />
                <Text style={styles.baiFeatureText}>Güvenli</Text>
              </View>
              <View style={styles.baiFeature}>
                <Ionicons name="sparkles" size={12} color={colors.white} />
                <Text style={styles.baiFeatureText}>AI Destekli</Text>
              </View>
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* Trend Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popüler Aramalar</Text>
          <View style={styles.tagCloud}>
            {TREND_TAGS.map((tag, index) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  { backgroundColor: colors[`tag${(index % 5) + 1}` as keyof typeof colors] || colors.primary }
                ]}
                onPress={() => handleTagPress(tag)}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="trending-up" size={28} color={colors.primary} />
              <Text style={styles.actionText}>Trendler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="pricetag" size={28} color={colors.success} />
              <Text style={styles.actionText}>Radar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="bookmark" size={28} color={colors.secondary} />
              <Text style={styles.actionText}>Koleksiyonlar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Grid Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trend Ürünler</Text>
          <View style={styles.productsGrid}>
            {/* ProductCard components will be rendered here */}
            <View style={styles.productsPlaceholder}>
              <Ionicons name="shirt-outline" size={48} color={colors.gray400} />
              <Text style={styles.placeholderText}>
                Ürünler yüklenecek...
              </Text>
            </View>
          </View>
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
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'Inter',
  },
  searchBarContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray300,
    paddingHorizontal: spacing.m,
    ...shadows.small,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.m,
    color: colors.black,
  },
  cameraButton: {
    padding: spacing.s,
    marginRight: spacing.xs,
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: spacing.s,
    borderRadius: 8,
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 8,
    marginTop: spacing.s,
    alignSelf: 'flex-start',
  },
  filterToggleText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  baiHero: {
    marginHorizontal: spacing.m,
    marginVertical: spacing.l,
    borderRadius: 24,
    ...shadows.large,
  },
  baiHeroContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  baiNewBadge: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 8,
  },
  baiNewText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '700',
  },
  baiHeroTitle: {
    ...typography.h2,
    color: colors.white,
    marginTop: spacing.m,
    fontWeight: '700',
  },
  baiHeroSubtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  baiFeatures: {
    flexDirection: 'row',
    marginTop: spacing.m,
    gap: spacing.m,
  },
  baiFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
  },
  baiFeatureText: {
    ...typography.small,
    color: colors.white,
    marginLeft: 4,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.m,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.black,
    marginBottom: spacing.m,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  tag: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 16,
  },
  tagText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.s,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.m,
    alignItems: 'center',
    ...shadows.small,
  },
  actionText: {
    ...typography.caption,
    color: colors.black,
    marginTop: spacing.s,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  productsPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.body,
    color: colors.gray500,
    marginTop: spacing.s,
  },
});