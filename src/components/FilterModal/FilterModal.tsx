/**
 * FilterModal Component - ADVANCED FILTERS
 * Colors, Sizes, Brands, Genders, Price Range with API integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../../theme/theme';
import { useFilterStore } from '../../store/filterStore';
import { GENDERS, FilterOption } from '../../types/filter.types';
import backendService from '../../services/backend/backend.service';
import * as Haptics from 'expo-haptics';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply }) => {
  const {
    filters,
    availableColors,
    availableSizes,
    availableBrands,
    isLoadingColors,
    isLoadingSizes,
    isLoadingBrands,
    setColors,
    setSizes,
    setBrands,
    setGenders,
    setPriceRange,
    setAvailableColors,
    setAvailableSizes,
    setAvailableBrands,
    setLoadingColors,
    setLoadingSizes,
    setLoadingBrands,
    clearFilters,
    getActiveFilterCount,
  } = useFilterStore();

  // Local state for temp selections
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<number[]>([]);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');

  // Search states
  const [colorSearch, setColorSearch] = useState('');
  const [sizeSearch, setSizeSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  // Load initial data
  useEffect(() => {
    if (visible) {
      loadFilterOptions();
      // Set temp state from store
      setSelectedColors(filters.colors);
      setSelectedSizes(filters.sizes);
      setSelectedBrands(filters.brands);
      setSelectedGenders(filters.genders);
      setPriceMin(filters.priceMin || '');
      setPriceMax(filters.priceMax || '');
    }
  }, [visible]);

  // Load filter options with search (debounced)
  useEffect(() => {
    if (visible && colorSearch.length > 0) {
      const timer = setTimeout(() => loadColors(colorSearch), 300);
      return () => clearTimeout(timer);
    } else if (visible && colorSearch.length === 0) {
      loadColors();
    }
  }, [colorSearch, visible]);

  useEffect(() => {
    if (visible && sizeSearch.length > 0) {
      const timer = setTimeout(() => loadSizes(sizeSearch), 300);
      return () => clearTimeout(timer);
    } else if (visible && sizeSearch.length === 0) {
      loadSizes();
    }
  }, [sizeSearch, visible]);

  useEffect(() => {
    if (visible && brandSearch.length > 0) {
      const timer = setTimeout(() => loadBrands(brandSearch), 300);
      return () => clearTimeout(timer);
    } else if (visible && brandSearch.length === 0) {
      loadBrands();
    }
  }, [brandSearch, visible]);

  const loadFilterOptions = async () => {
    await Promise.all([loadColors(), loadSizes(), loadBrands()]);
  };

  const loadColors = async (search: string = '') => {
    setLoadingColors(true);
    const response = await backendService.getColors(search, 1);
    setAvailableColors(response.results || []);
    setLoadingColors(false);
  };

  const loadSizes = async (search: string = '') => {
    setLoadingSizes(true);
    const response = await backendService.getSizes(search, 1);
    setAvailableSizes(response.results || []);
    setLoadingSizes(false);
  };

  const loadBrands = async (search: string = '') => {
    setLoadingBrands(true);
    const response = await backendService.getBrands(search, 1);
    setAvailableBrands(response.results || []);
    setLoadingBrands(false);
  };

  const toggleSelection = (id: string, selectedList: string[], setSelected: (list: string[]) => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedList.includes(id)) {
      setSelected(selectedList.filter(item => item !== id));
    } else {
      setSelected([...selectedList, id]);
    }
  };

  const toggleGender = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedGenders.includes(id)) {
      setSelectedGenders(selectedGenders.filter(item => item !== id));
    } else {
      setSelectedGenders([...selectedGenders, id]);
    }
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Get labels for selected items
    const colorLabels = availableColors
      .filter(c => selectedColors.includes(c.id))
      .map(c => c.text);

    const sizeLabels = availableSizes
      .filter(s => selectedSizes.includes(s.id))
      .map(s => s.text);

    const brandLabels = availableBrands
      .filter(b => selectedBrands.includes(b.id))
      .map(b => b.text);

    const genderLabels = GENDERS
      .filter(g => selectedGenders.includes(g.id))
      .map(g => g.text);

    // Update store
    setColors(selectedColors, colorLabels);
    setSizes(selectedSizes, sizeLabels);
    setBrands(selectedBrands, brandLabels);
    setGenders(selectedGenders, genderLabels);
    setPriceRange(priceMin || undefined, priceMax || undefined);

    onApply();
    onClose();
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSelectedGenders([]);
    setPriceMin('');
    setPriceMax('');
    setColorSearch('');
    setSizeSearch('');
    setBrandSearch('');
    clearFilters();
  };

  const renderFilterChip = (
    id: string,
    text: string,
    count: string,
    selected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={id}
      style={[styles.filterChip, selected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
        {text}
      </Text>
      <Text style={[styles.filterChipCount, selected && styles.filterChipCountSelected]}>
        {parseInt(count).toLocaleString('tr-TR')}
      </Text>
    </TouchableOpacity>
  );

  const renderGenderChip = (id: number, text: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={id}
      style={[styles.filterChip, selected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
        {text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={28} color={colors.gray900 || colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtreler</Text>
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.clearButton}>Temizle</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Color Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Renk</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Renk ara..."
              placeholderTextColor={colors.gray400 || colors.gray500}
              value={colorSearch}
              onChangeText={setColorSearch}
            />
            {isLoadingColors ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
            ) : (
              <View style={styles.chipContainer}>
                {availableColors.slice(0, 20).map(color =>
                  renderFilterChip(
                    color.id,
                    color.text,
                    color.count,
                    selectedColors.includes(color.id),
                    () => toggleSelection(color.id, selectedColors, setSelectedColors)
                  )
                )}
              </View>
            )}
          </View>

          {/* Size Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Beden</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Beden ara..."
              placeholderTextColor={colors.gray400 || colors.gray500}
              value={sizeSearch}
              onChangeText={setSizeSearch}
            />
            {isLoadingSizes ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
            ) : (
              <View style={styles.chipContainer}>
                {availableSizes.slice(0, 20).map(size =>
                  renderFilterChip(
                    size.id,
                    size.text,
                    size.count,
                    selectedSizes.includes(size.id),
                    () => toggleSelection(size.id, selectedSizes, setSelectedSizes)
                  )
                )}
              </View>
            )}
          </View>

          {/* Brand Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Marka</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Marka ara..."
              placeholderTextColor={colors.gray400 || colors.gray500}
              value={brandSearch}
              onChangeText={setBrandSearch}
            />
            {isLoadingBrands ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
            ) : (
              <View style={styles.chipContainer}>
                {availableBrands.slice(0, 20).map(brand =>
                  renderFilterChip(
                    brand.id,
                    brand.text,
                    brand.count,
                    selectedBrands.includes(brand.id),
                    () => toggleSelection(brand.id, selectedBrands, setSelectedBrands)
                  )
                )}
              </View>
            )}
          </View>

          {/* Gender Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Cinsiyet</Text>
            <View style={styles.chipContainer}>
              {GENDERS.map(gender =>
                renderGenderChip(
                  gender.id,
                  gender.text,
                  selectedGenders.includes(gender.id),
                  () => toggleGender(gender.id)
                )
              )}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Fiyat Aralığı</Text>
            <View style={styles.priceContainer}>
              <TextInput
                style={styles.priceInput}
                placeholder="En Az"
                placeholderTextColor={colors.gray400 || colors.gray500}
                value={priceMin}
                onChangeText={setPriceMin}
                keyboardType="numeric"
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="En Fazla"
                placeholderTextColor={colors.gray400 || colors.gray500}
                value={priceMax}
                onChangeText={setPriceMax}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <Ionicons name="stats-chart" size={16} color={colors.gray600 || colors.gray700} />
            <Text style={styles.statsText}>1.2M+ Ürün, 4.5K+ Marka</Text>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Ionicons name="search" size={20} color={colors.white} />
            <Text style={styles.applyButtonText}>
              Filtrele {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l || 16,
    paddingTop: Platform.OS === 'ios' ? 60 : (spacing.l || 16),
    paddingBottom: spacing.m || 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900 || colors.black,
  },
  clearButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l || 16,
  },
  filterSection: {
    marginTop: spacing.l || 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900 || colors.black,
    marginBottom: spacing.m || 12,
  },
  searchInput: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: spacing.m || 12,
    paddingVertical: spacing.s || 10,
    fontSize: 16,
    color: colors.gray900 || colors.black,
    marginBottom: spacing.m || 12,
  },
  loader: {
    marginVertical: spacing.l || 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s || 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m || 12,
    paddingVertical: spacing.s || 8,
    backgroundColor: colors.gray100,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
    gap: spacing.xs || 6,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.gray900 || colors.black,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  filterChipCount: {
    fontSize: 12,
    color: colors.gray500,
  },
  filterChipCountSelected: {
    color: colors.white,
    opacity: 0.8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m || 12,
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: spacing.m || 12,
    paddingVertical: spacing.s || 10,
    fontSize: 16,
    color: colors.gray900 || colors.black,
  },
  priceSeparator: {
    fontSize: 18,
    color: colors.gray500,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.l || 16,
    gap: spacing.xs || 6,
  },
  statsText: {
    fontSize: 14,
    color: colors.gray600 || colors.gray700,
  },
  footer: {
    padding: spacing.l || 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingBottom: Platform.OS === 'ios' ? 34 : (spacing.l || 16),
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.m || 12,
    gap: spacing.s || 8,
    ...shadows.medium,
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});

export default FilterModal;
