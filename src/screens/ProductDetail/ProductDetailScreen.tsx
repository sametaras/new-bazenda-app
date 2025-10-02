// src/screens/ProductDetail/ProductDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, typography } from '../../theme/theme';

export default function ProductDetailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Product Detail Screen</Text>
        <Text style={styles.subtext}>Yakında...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...typography.h3,
    color: colors.black,
  },
  subtext: {
    ...typography.body,
    color: colors.gray500,
    marginTop: spacing.s,
  },
});