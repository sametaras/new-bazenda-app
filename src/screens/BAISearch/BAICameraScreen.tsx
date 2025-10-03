// src/screens/BAISearch/BAICameraScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../../theme/theme';
import { useBaiStore } from '../../store/baiStore';

export default function BAICameraScreen() {
  const navigation = useNavigation();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const performSearch = useBaiStore(state => state.performSearch);
  const isSearching = useBaiStore(state => state.isSearching);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Kamera yükleniyor...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.gray400} />
          <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
          <Text style={styles.permissionText}>
            BAI ile ürün aramak için kamera erişimine izin verin
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>İzin Ver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

        if (photo?.uri) {
          await handleSearch(photo.uri);
        }
      } catch (error) {
        console.error('Fotoğraf çekme hatası:', error);
        Alert.alert('Hata', 'Fotoğraf çekilemedi');
      }
    }
  };

  const pickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleSearch(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Galeri hatası:', error);
      Alert.alert('Hata', 'Galeri açılamadı');
    }
  };

  const handleSearch = async (imageUri: string) => {
    try {
      await performSearch(imageUri);
      navigation.navigate('BAIResults' as never);
    } catch (error) {
      console.error('Arama hatası:', error);
      Alert.alert(
        'Arama Başarısız',
        error instanceof Error ? error.message : 'Bir hata oluştu'
      );
    }
  };

  const toggleCameraFacing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      >
<SafeAreaView style={styles.header}>
  <TouchableOpacity
    style={styles.closeButton}
    onPress={() => navigation.goBack()}
  >
    <Ionicons name="close" size={28} color={colors.white} />
  </TouchableOpacity>
  
  <Text style={styles.title}>BAI Arama</Text>
  
  <TouchableOpacity
    style={styles.historyButton}
    onPress={() => navigation.navigate('BAIHistory' as never)}
  >
    <Ionicons name="time" size={28} color={colors.white} />
  </TouchableOpacity>
</SafeAreaView>

        <View style={styles.guideContainer}>
          <View style={styles.guideFrame} />
          <Text style={styles.guideText}>
            Ürünü çerçeve içine alın
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickImage}
            disabled={isSearching}
          >
            <Ionicons name="images" size={28} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.captureButton,
              isSearching && styles.captureButtonDisabled
            ]}
            onPress={takePicture}
            disabled={isSearching}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '600',
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  guideText: {
    ...typography.body,
    color: colors.white,
    marginTop: spacing.m,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },
  placeholder: {
    width: 56,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionTitle: {
    ...typography.h3,
    color: colors.black,
    marginTop: spacing.l,
    marginBottom: spacing.m,
  },
  permissionText: {
    ...typography.body,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: 12,
  },
  permissionButtonText: {
    ...typography.button,
    color: colors.white,
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});