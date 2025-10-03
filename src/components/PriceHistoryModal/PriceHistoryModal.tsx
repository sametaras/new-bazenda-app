// src/components/PriceHistoryModal/PriceHistoryModal.tsx - YENİ
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, typography } from '../../theme/theme';

interface PriceHistory {
  date: string;
  price: number;
}

interface Props {
  visible: boolean;
  productId: string;
  productTitle: string;
  onClose: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PriceHistoryModal({
  visible,
  productId,
  productTitle,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible && productId) {
      loadPriceHistory();
    }
  }, [visible, productId]);

  const loadPriceHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://bazenda.com/api/get_history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `current_id=${productId}`,
      });

      const data = await response.json();

      if (data.status && data.results) {
        const formattedHistory: PriceHistory[] = data.results.keys.map(
          (date: string, index: number) => ({
            date,
            price: data.results.values[index],
          })
        );
        setHistory(formattedHistory);
      } else {
        setError('Fiyat geçmişi bulunamadı');
      }
    } catch (err) {
      setError('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (history.length === 0) return null;

    const prices = history.map(h => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    return (
      <>
        <LineChart
          data={{
            labels: history.map(h => {
              const date = new Date(h.date);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }),
            datasets: [{ data: prices }],
          }}
          width={SCREEN_WIDTH - spacing.xl * 2}
          height={220}
          chartConfig={{
            backgroundColor: colors.white,
            backgroundGradientFrom: colors.white,
            backgroundGradientTo: colors.white,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(246, 115, 16, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>En Düşük</Text>
            <Text style={styles.statValue}>{minPrice.toFixed(2)} ₺</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Ortalama</Text>
            <Text style={styles.statValue}>{avgPrice.toFixed(2)} ₺</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>En Yüksek</Text>
            <Text style={styles.statValue}>{maxPrice.toFixed(2)} ₺</Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Fiyat Geçmişi</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {productTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={colors.gray400} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : history.length > 0 ? (
              renderChart()
            ) : (
              <View style={styles.errorContainer}>
                <Ionicons name="trending-down" size={48} color={colors.gray400} />
                <Text style={styles.errorText}>
                  Henüz fiyat geçmişi bulunmuyor
                </Text>
              </View>
            )}
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
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    ...typography.h4,
    color: colors.black,
  },
  subtitle: {
    ...typography.caption,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.l,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.m,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.gray600,
    marginTop: spacing.m,
    textAlign: 'center',
  },
  chart: {
    marginVertical: spacing.m,
    borderRadius: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.l,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.small,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h4,
    color: colors.primary,
  },
});