// src/screens/BAISearch/BAIResultsScreen.tsx - MODERN VERSION
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, shadows } from '../../theme/theme';
import { useCurrentSearch } from '../../store/baiStore';
import ProductCard from '../../components/ProductCard/ProductCard';

export default function BAIResultsScreen() {
  const navigation = useNavigation();
  const currentSearch = useCurrentSearch();

  if (!currentSearch || currentSearch.results.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BAI Sonuçları</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={colors.gray400} />
          <Text style={styles.emptyTitle}>Sonuç Bulunamadı</Text>
          <Text style={styles.emptyText}>
            Benzer ürün bulunamadı. Farklı bir ürün deneyin.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>BAI ile Benzer Ürünler</Text>
          <Text style={styles.headerSubtitle}>
            {currentSearch.results.length} sonuç
          </Text>
        </View>
        
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={currentSearch.results}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
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
    textAlign: 'center',
    marginTop: spacing.s,
  },
});