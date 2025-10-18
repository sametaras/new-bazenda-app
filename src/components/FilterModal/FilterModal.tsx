// src/components/FilterModal/FilterModal.tsx - PRODUCTION READY
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, shadows } from '../../theme/theme';

interface FilterOptions {
  sortBy: string;
  priceMin: string;
  priceMax: string;
  genders: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
}

const GENDERS = ['Kadın', 'Erkek', 'Unisex', 'Çocuk'];
const SORT_OPTIONS = [
  { value: '0', label: 'Önerilen' },
  { value: '2', label: 'Düşük Fiyat' },
  { value: '1', label: 'Yüksek Fiyat' },
];

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: Props) {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: '0',
    priceMin: '',
    priceMax: '',
    genders: [],
    brands: [],
    colors: [],
    sizes: [],
    ...initialFilters,
  });

  const toggleGender = (gender: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters(prev => ({
      ...prev,
      genders: prev.genders.includes(gender)
        ? prev.genders.filter(g => g !== gender)
        : [...prev.genders, gender]
    }));
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters({
      sortBy: '0',
      priceMin: '',
      priceMax: '',
      genders: [],
      brands: [],
      colors: [],
      sizes: [],
    });
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Sıfırla</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Filtreler</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sort Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sıralama</Text>
              <View style={styles.sortButtons}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortButton,
                      filters.sortBy === option.value && styles.sortButtonActive
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFilters({ ...filters, sortBy: option.value });
                    }}
                  >
                    <Text style={[
                      styles.sortButtonText,
                      filters.sortBy === option.value && styles.sortButtonTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Gender Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cinsiyet</Text>
              <View style={styles.genderButtons}>
                {GENDERS.map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      filters.genders.includes(gender) && styles.genderButtonActive
                    ]}
                    onPress={() => toggleGender(gender)}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      filters.genders.includes(gender) && styles.genderButtonTextActive
                    ]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fiyat Aralığı</Text>
              <View style={styles.priceInputs}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Min</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={filters.priceMin}
                    onChangeText={(text) => setFilters({ ...filters, priceMin: text })}
                  />
                </View>
                
                <View style={styles.priceSeparator}>
                  <View style={styles.separatorLine} />
                </View>
                
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Max</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="∞"
                    keyboardType="numeric"
                    value={filters.priceMax}
                    onChangeText={(text) => setFilters({ ...filters, priceMax: text })}
                  />
                </View>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.info} />
              <Text style={styles.infoText}>
                Daha fazla filtre seçeneği yakında eklenecek
              </Text>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Filtreleri Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  resetText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  section: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '600',
    marginBottom: spacing.m,
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
    backgroundColor: colors.gray100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  genderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  genderButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderButtonText: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.gray600,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  priceInput: {
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  priceSeparator: {
    width: 20,
    alignItems: 'center',
    paddingTop: 20,
  },
  separatorLine: {
    width: 12,
    height: 2,
    backgroundColor: colors.gray400,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.l,
    backgroundColor: colors.gray50,
    padding: spacing.m,
    borderRadius: 10,
    gap: spacing.s,
  },
  infoText: {
    fontSize: 11,
    color: colors.gray700,
    flex: 1,
  },
  footer: {
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.medium,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});