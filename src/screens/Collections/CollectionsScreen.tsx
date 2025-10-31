// src/screens/Collections/CollectionsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme/theme';

export default function CollectionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Koleksiyonlarım</Text>
      </View>
      
      <View style={styles.content}>
        <Ionicons name="bookmark-outline" size={64} color={colors.gray400} />
        <Text style={styles.emptyTitle}>Henüz koleksiyon yok</Text>
        <Text style={styles.emptyText}>
          Beğendiğiniz ürünleri koleksiyonlara ekleyerek düzenleyin
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    ...typography.h3,
    color: colors.black,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.black,
    marginTop: spacing.l,
    marginBottom: spacing.m,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
  },
});