// src/screens/Home/HomeScreen.tsx - SİMPLİFİED
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, shadows } from '../../theme/theme';

const TREND_TAGS = [
  'pantolon', 'etek', 'gömlek', 'elbise', 'kazak', 'tişört',
  'mont', 'ceket', 'ayakkabı', 'bot', 'çanta', 'sweatshirt'
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBAIPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.navigate('BAI' as never);
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
              placeholder="Ne arıyorsunuz? Örn: pantolon, ayakkabı, elbise..."
              placeholderTextColor={colors.gray500}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleBAIPress}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.cameraGradient}
              >
                <Ionicons name="camera" size={24} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* BAI Feature Card */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleBAIPress}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF8C61']}
            style={styles.baiCard}
          >
            <View style={styles.baiNewBadge}>
              <Text style={styles.baiNewText}>YENİ</Text>
            </View>
            
            <Ionicons name="camera" size={64} color={colors.white} />
            <Text style={styles.baiTitle}>Fotoğraf ile Arama</Text>
            <Text style={styles.baiSubtitle}>Çek, Bul, Satın Al</Text>
            
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
                <Text style={styles.baiFeatureText}>AI</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tag Cloud */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popüler Aramalar</Text>
          <View style={styles.tagCloud}>
            {TREND_TAGS.map((tag, index) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, { 
                  backgroundColor: colors[`tag${(index % 5) + 1}` as keyof typeof colors] 
                }]}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
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
    paddingVertical: spacing.s,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: 16,
  },
  cameraButton: {
    marginLeft: spacing.s,
  },
  cameraGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baiCard: {
    marginHorizontal: spacing.m,
    marginBottom: spacing.l,
    padding: spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    ...shadows.large,
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
    fontSize: 12,
    fontWeight: '700',
  },
  baiTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginTop: spacing.m,
  },
  baiSubtitle: {
    fontSize: 16,
    color: colors.white,
    marginTop: spacing.s,
  },
  baiFeatures: {
    flexDirection: 'row',
    marginTop: spacing.l,
    gap: spacing.m,
  },
  baiFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.m,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  baiFeatureText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    borderRadius: 20,
  },
  tagText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.l,
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
  },
});