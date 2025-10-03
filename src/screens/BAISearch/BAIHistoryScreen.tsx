// src/screens/BAISearch/BAIHistoryScreen.tsx - YENİ
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../../theme/theme';
import { useSearchHistory, useBaiStore } from '../../store/baiStore';

export default function BAIHistoryScreen() {
  const navigation = useNavigation();
  const searchHistory = useSearchHistory();
  const { retrySearch, removeFromHistory, clearHistory } = useBaiStore();

  const handleRetry = async (historyId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await retrySearch(historyId);
      navigation.navigate('BAIResults' as never);
    } catch (error) {
      Alert.alert('Hata', 'Arama tekrarlanamadı');
    }
  };

  const handleDelete = (historyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Sil',
      'Bu aramayı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => removeFromHistory(historyId),
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (searchHistory.length === 0) return;

    Alert.alert(
      'Tümünü Sil',
      'Tüm arama geçmişini silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tümünü Sil',
          style: 'destructive',
          onPress: () => {
            clearHistory();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const renderHistoryItem = ({ item }: any) => {
    const date = new Date(item.timestamp);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

    return (
      <View style={styles.historyItem}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={() => handleRetry(item.id)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.thumbnail || item.imageUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.retryOverlay}>
            <Ionicons name="search" size={24} color={colors.white} />
          </View>
        </TouchableOpacity>

        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemDate}>{formattedDate}</Text>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.itemStats}>
            <View style={styles.stat}>
              <Ionicons name="basket-outline" size={16} color={colors.primary} />
              <Text style={styles.statText}>{item.results.length} ürün</Text>
            </View>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => handleRetry(item.id)}
            >
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={styles.retryText}>Tekrar Ara</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Arama Geçmişi</Text>

        <TouchableOpacity onPress={handleClearAll}>
          <Text style={styles.clearAll}>Tümünü Sil</Text>
        </TouchableOpacity>
      </View>

      {searchHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={colors.gray400} />
          <Text style={styles.emptyTitle}>Henüz Arama Yok</Text>
          <Text style={styles.emptyText}>
            BAI ile yaptığınız aramalar burada görünecek
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.black,
  },
  clearAll: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.m,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  imageContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray200,
  },
  retryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.m,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  itemDate: {
    ...typography.small,
    color: colors.gray600,
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...typography.caption,
    color: colors.gray700,
    marginLeft: spacing.xs,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  retryText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.black,
    marginTop: spacing.l,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    marginTop: spacing.s,
  },
});