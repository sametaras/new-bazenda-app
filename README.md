# Bazenda - Mobil Uygulama

Bazenda, kullanıcılara yapay zeka destekli ürün arama, fiyat karşılaştırma ve keşif deneyimi sunan modern bir mobil uygulamadır.

## Özellikler

### 🔍 Akıllı Arama
- **Metin Araması**: Anahtar kelime ile hızlı ürün arama
- **BAI (Bazenda AI)**: Görsel tabanlı yapay zeka ile ürün arama
- **Filtreler**: Fiyat, marka, renk ve beden filtreleme

### 💰 Fiyat Takibi (YENİ!)
- **Otomatik Fiyat Takibi**: Favori ürünlerin fiyatları otomatik olarak kontrol edilir
- **Anlık Bildirimler**: Fiyat değişikliklerinde push notification
- **Fiyat Geçmişi**: Ürünlerin fiyat değişim grafiklerini görüntüleme
- **Çoklu Mağaza**: Farklı e-ticaret platformlarından fiyat karşılaştırma
- **Arka Plan Kontrolü**: Uygulama kapalıyken bile fiyat kontrolü
- **Akıllı Uyarılar**: Sadece önemli fiyat değişikliklerinde bildirim (fiyat düşüşü veya %5+ artış)

### ❤️ Kişisel Koleksiyonlar
- **Favoriler**: Beğenilen ürünleri kaydetme ve fiyat takibi
- **Fiyat Değişiklik Badge'leri**: Fiyat değişen ürünler görsel olarak belirtilir
- **Manuel Güncelleme**: Favori ürünlerin fiyatlarını manuel kontrol etme
- **Koleksiyonlar**: Ürünleri gruplandırma ve QR kod ile paylaşma
- **Arama Geçmişi**: Geçmiş aramaları tekrar kullanma

### 🎯 Radar
- **Trend Ürünler**: Popüler ürünleri keşfetme
- **Öneriler**: Kişiselleştirilmiş ürün önerileri

## Teknoloji Stack

- **Framework**: React Native + Expo
- **State Management**: Zustand (with persistence)
- **Data Fetching**: TanStack Query (React Query)
- **Navigation**: React Navigation v7
- **Type Safety**: TypeScript (Strict Mode)
- **Styling**: StyleSheet + Theme System
- **Animations**: React Native Reanimated
- **Images**: Expo Image + Image Manipulator
- **Notifications**: Expo Notifications
- **Background Tasks**: Expo Background Fetch + Task Manager
- **Code Quality**: ESLint + Prettier

## Başlangıç

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo CLI
- iOS: Xcode 14+ (Mac gerekli)
- Android: Android Studio

### Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/bazenda/bazenda-mobile-app.git
cd bazenda-mobile-app
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Development server'ı başlatın:
```bash
npm start
```

4. Uygulamayı çalıştırın:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Geliştirme Komutları

```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Type Checking
npm run type-check
```

## Proje Yapısı

```
bazenda-app/
├── src/
│   ├── components/          # Yeniden kullanılabilir componentler
│   │   ├── ErrorBoundary/   # Global error handling
│   │   ├── FilterModal/     # Filtreleme modal
│   │   ├── ProductCard/     # Ürün kartı
│   │   └── PriceHistoryModal/
│   ├── config/              # Konfigürasyon dosyaları
│   │   └── env.config.ts    # Environment configuration
│   ├── navigation/          # Navigation yapısı
│   ├── screens/             # Ana ekranlar
│   │   ├── Home/
│   │   ├── Search/
│   │   ├── BAISearch/
│   │   ├── Favorites/
│   │   ├── Collections/
│   │   └── Profile/
│   ├── services/            # API servisleri
│   │   ├── api/
│   │   │   ├── products.api.ts
│   │   │   ├── bai.api.ts
│   │   │   └── collections.api.ts
│   │   └── analytics/
│   ├── store/               # State management (Zustand)
│   ├── theme/               # Theme ve stil tanımları
│   └── types/               # TypeScript type definitions
├── assets/                  # Statik dosyalar (icon, splash)
├── docs/                    # Dokümantasyon
│   ├── PRIVACY_POLICY.md
│   └── TERMS_OF_SERVICE.md
├── .eslintrc.js
├── .prettierrc.js
├── app.json                 # Expo configuration
├── eas.json                 # EAS Build configuration
├── tsconfig.json            # TypeScript configuration
└── package.json
```

## Production Build

### EAS Build ile Deploy

1. EAS CLI'yi yükleyin:
```bash
npm install -g eas-cli
```

2. Expo hesabınızla giriş yapın:
```bash
eas login
```

3. Projeyi konfigüre edin:
```bash
eas build:configure
```

4. Build oluşturun:

```bash
# Development build
eas build --profile development --platform android

# Preview build (Internal testing)
eas build --profile preview --platform android

# Production build
eas build --profile production --platform android
eas build --profile production --platform ios
```

### App Store / Play Store Deployment

#### iOS (App Store)

1. Apple Developer hesabı oluşturun
2. App Store Connect'te uygulama oluşturun
3. Production build yapın:
```bash
eas build --profile production --platform ios
```

4. App Store'a submit edin:
```bash
eas submit --platform ios
```

5. Gerekli bilgileri doldurun:
   - App ikonu (1024x1024)
   - Screenshots (farklı cihazlar için)
   - Açıklama ve anahtar kelimeler
   - Privacy Policy URL
   - Support URL

#### Android (Play Store)

1. Google Play Console hesabı oluşturun
2. Uygulama oluşturun
3. Keystore oluşturun (ilk seferinde):
```bash
eas credentials
```

4. Production build yapın:
```bash
eas build --profile production --platform android
```

5. Play Store'a submit edin:
```bash
eas submit --platform android
```

6. Gerekli bilgileri doldurun:
   - App ikonu (512x512)
   - Feature graphic (1024x500)
   - Screenshots (çeşitli cihazlar)
   - Açıklama ve kategori
   - Privacy Policy URL
   - Content rating

### Environment Variables

Production için environment değişkenlerini ayarlayın:

```bash
# .env.production (oluşturun)
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_API_URL=https://bazenda.com/api
```

### Monitoring ve Analytics

Production'da hata izleme için:

1. **Sentry** (Önerilen):
```bash
npm install @sentry/react-native
eas build:configure
```

2. **Firebase Crashlytics**:
```bash
expo install @react-native-firebase/app @react-native-firebase/crashlytics
```

## Önemli Notlar

### API Yapılandırması

API URL'leri `src/config/env.config.ts` dosyasında merkezi olarak yönetilir:

- Development: Debug mode aktif, detaylı logging
- Staging: Test ortamı
- Production: Optimize edilmiş, minimal logging

### Güvenlik

- API keys environment variables'da saklanmalı
- Sensitive data AsyncStorage'da değil, Secure Store'da tutulmalı
- HTTPS zorunlu
- TypeScript strict mode aktif

### Performance

- Images lazy load edilir
- React Query ile akıllı cache yönetimi
- Error boundary ile crash prevention
- Optimized builds (Hermes engine)

### Testing

Test komutları (eklenecek):
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## Versiyonlama

Semantic versioning kullanılır: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: Yeni özellikler (backward compatible)
- **PATCH**: Bug fixes

Version güncellemesi:
```json
// app.json
{
  "expo": {
    "version": "1.1.0",
    "ios": { "buildNumber": "2" },
    "android": { "versionCode": 2 }
  }
}
```

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Mesaj Formatı

```
feat: Yeni özellik
fix: Bug düzeltme
docs: Dokümantasyon
style: Kod formatı
refactor: Kod iyileştirme
test: Test ekleme/düzenleme
chore: Genel işler (dependencies vb.)
```

## Lisans

Bu proje Bazenda'ya aittir. Tüm hakları saklıdır.

## İletişim

- **Website**: https://bazenda.com
- **Support**: support@bazenda.com
- **Twitter**: @bazenda

## Teşekkürler

- React Native & Expo team
- TanStack Query
- React Navigation
- Zustand
- Tüm açık kaynak katkıda bulunanlar

---

**Hazırlayan**: Bazenda Geliştirme Ekibi
**Son Güncelleme**: 30 Ekim 2025
**Version**: 1.0.0
