# Bazenda Mobil App - Deployment Guide

Bu rehber, Bazenda mobil uygulamasının production ortamına deploy edilmesi için gerekli tüm adımları içerir.

## İçindekiler

1. [Ön Hazırlık](#ön-hazırlık)
2. [EAS Build Kurulumu](#eas-build-kurulumu)
3. [iOS Deployment](#ios-deployment)
4. [Android Deployment](#android-deployment)
5. [OTA Updates](#ota-updates)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Troubleshooting](#troubleshooting)

---

## Ön Hazırlık

### 1. Gerekli Hesaplar

- **Expo Account**: https://expo.dev
- **Apple Developer Account**: $99/yıl (iOS için)
- **Google Play Console**: $25 (bir kerelik, Android için)

### 2. Geliştirici Araçları

```bash
# Node.js ve npm kurulu olmalı
node --version  # v18+
npm --version

# EAS CLI yükleyin
npm install -g eas-cli

# Expo CLI (opsiyonel ama önerilen)
npm install -g expo-cli
```

### 3. Proje Hazırlığı

```bash
# Bağımlılıkları güncelleyin
npm install

# Testleri çalıştırın
npm run type-check
npm run lint

# Build'i test edin (local)
npm start
```

---

## EAS Build Kurulumu

### 1. EAS Projesi Oluşturma

```bash
# Expo hesabınızla giriş yapın
eas login

# Projeyi configure edin
eas build:configure

# EAS project ID alın
eas project:info
```

### 2. app.json Güncelleme

`app.json` dosyasındaki `YOUR_EAS_PROJECT_ID` değerlerini güncelleyin:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    },
    "updates": {
      "url": "https://u.expo.dev/your-actual-project-id"
    }
  }
}
```

### 3. Credentials Yönetimi

```bash
# iOS credentials
eas credentials

# Android keystore oluşturma (otomatik)
eas build --platform android --profile production
```

---

## iOS Deployment

### Adım 1: Apple Developer Hesabı Hazırlığı

1. **App ID Oluşturma**
   - Apple Developer Portal → Certificates, IDs & Profiles
   - Identifier oluştur: `com.bazenda.app`
   - Capabilities: Push Notifications (gelecek için)

2. **App Store Connect'te Uygulama Oluşturma**
   - App Store Connect → My Apps → + (New App)
   - Platform: iOS
   - Name: Bazenda
   - Bundle ID: `com.bazenda.app`
   - SKU: `bazenda-ios`

### Adım 2: Build Oluşturma

```bash
# Production build
eas build --platform ios --profile production

# Build durumunu kontrol et
eas build:list

# Build tamamlandığında download et (opsiyonel)
eas build:download --platform ios
```

### Adım 3: App Store Bilgileri

**eas.json** dosyasını güncelleyin:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

### Adım 4: Submit

```bash
# Otomatik submit
eas submit --platform ios --latest

# Manuel submit için build'i indir ve Xcode ile yükle
```

### Adım 5: App Store Connect Bilgileri

**Gerekli Bilgiler:**
- App Name: Bazenda
- Subtitle: Akıllı Ürün Arama
- Description: (250+ kelime detaylı açıklama)
- Keywords: moda, alışveriş, fiyat karşılaştırma, yapay zeka
- Support URL: https://bazenda.com/support
- Marketing URL: https://bazenda.com
- Privacy Policy URL: https://bazenda.com/privacy

**Medya:**
- App Icon: 1024x1024 PNG
- Screenshots:
  - iPhone 6.7" (3 adet minimum)
  - iPhone 5.5" (3 adet minimum)
  - iPad Pro 12.9" (opsiyonel)

**App Privacy:**
- Data Collection: Arama geçmişi, favoriler
- Data Usage: Kullanıcı deneyimi iyileştirme
- Privacy Policy linki ekle

### Adım 6: Review Süreci

- Demo account bilgileri (gerekirse)
- Review notes: "Ürün arama için kamera kullanımı gereklidir"
- Test için örnek arama kelimeleri

**Ortalama Review Süresi:** 1-3 gün

---

## Android Deployment

### Adım 1: Google Play Console Hazırlığı

1. **Uygulama Oluşturma**
   - Play Console → All Apps → Create App
   - App Name: Bazenda
   - Default Language: Türkçe
   - App/Game: App
   - Free/Paid: Free

2. **Store Listing**
   - Short Description (80 karakter max)
   - Full Description (4000 karakter max)
   - App Icon: 512x512 PNG
   - Feature Graphic: 1024x500 JPG/PNG
   - Screenshots: Minimum 2 (telefon için)

### Adım 2: Build Oluşturma

```bash
# Production AAB (Play Store için)
eas build --platform android --profile production

# Preview APK (test için)
eas build --platform android --profile preview
```

### Adım 3: App Signing

Google Play App Signing kullanılacak:
- Play Console → Release → Setup → App Integrity
- Google Play App Signing'i enable et
- Upload key certificate'i yükle (EAS otomatik yapar)

### Adım 4: Submit

```bash
# Otomatik submit için service account gerekli
# 1. Google Cloud Console'dan service account oluştur
# 2. JSON key indir
# 3. Play Console'da API access ver

# Submit
eas submit --platform android --latest
```

**Manuel Submit:**
1. Build'i indir: `eas build:download`
2. Play Console → Production → Create Release
3. AAB dosyasını yükle
4. Release notes ekle
5. Review ve publish

### Adım 5: Store Listing Detayları

**Kategori:**
- Category: Shopping
- Tags: E-commerce, Fashion, Price Comparison

**Contact Details:**
- Email: support@bazenda.com
- Phone: (Opsiyonel)
- Website: https://bazenda.com

**Privacy Policy:**
- URL: https://bazenda.com/privacy

**Target Audience:**
- Target age: 13+ (COPPA uyumlu)
- Content rating: Everyone

**Data Safety:**
- Data collection: Yes
- Data sharing: No
- Data deletion: Available on request

**Medya Gereksinimleri:**
```
App Icon: 512x512 PNG
Feature Graphic: 1024x500
Screenshots: Min 2, Max 8 (telefon)
  - Recommended: 1080x1920 veya 720x1280
Promo Video: YouTube URL (opsiyonel)
```

### Adım 6: Testing

**Internal Testing:**
```bash
# Internal test track
eas submit --platform android --track internal
```

**Closed Testing:**
- Email listesi ile test grubu oluştur
- Feedback topla

**Open Testing:**
- Kamuya açık beta
- Minimum 14 gün test süresi önerilir

**Production:**
```bash
eas submit --platform android --track production
```

---

## OTA Updates

Over-The-Air updates ile app store review'siz güncelleme.

### Setup

```bash
# Update publish et
eas update --branch production --message "Bug fixes"

# Spesifik channel
eas update --channel production --message "Performance improvements"
```

### Update Stratejisi

**app.json:**
```json
{
  "expo": {
    "updates": {
      "fallbackToCacheTimeout": 0,
      "checkAutomatically": "ON_LOAD",
      "url": "https://u.expo.dev/your-project-id"
    }
  }
}
```

**Update Policy:**
- **Minor fixes:** OTA update (1-2 gün)
- **Features:** OTA update (1 hafta test)
- **Breaking changes:** Full build (app store)
- **Native changes:** Full build gerekli

---

## Monitoring & Analytics

### 1. Sentry (Error Tracking)

```bash
npm install @sentry/react-native
```

**sentry.properties:**
```properties
defaults.url=https://sentry.io/
defaults.org=your-org
defaults.project=bazenda-mobile
auth.token=YOUR_AUTH_TOKEN
```

### 2. Firebase Analytics

```bash
expo install @react-native-firebase/app @react-native-firebase/analytics
```

### 3. App Store Analytics

- **iOS:** App Store Connect → Analytics
- **Android:** Play Console → Statistics

**Önemli Metrikler:**
- DAU/MAU (Daily/Monthly Active Users)
- Retention rate (1, 7, 30 gün)
- Crash-free users
- App store rating
- Conversion rate

---

## Environment Variables

**Production için .env:**
```bash
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_API_URL=https://bazenda.com/api
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_ERROR_REPORTING=true
```

**EAS Secrets:**
```bash
# Secret ekle
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value your-token

# Secrets listele
eas secret:list
```

---

## Checklist: Pre-Launch

### Code Quality
- [ ] All tests passing
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)

### Functionality
- [ ] All features working
- [ ] Camera permissions working
- [ ] Image search working
- [ ] API calls successful
- [ ] Deep linking configured
- [ ] Push notifications ready

### Assets
- [ ] App icons (all sizes)
- [ ] Splash screen
- [ ] Screenshots (all devices)
- [ ] Feature graphic (Android)
- [ ] Promo materials

### Legal
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] COPPA compliance (13+)
- [ ] GDPR compliance
- [ ] KVKK compliance

### Metadata
- [ ] App name finalized
- [ ] Description written
- [ ] Keywords optimized
- [ ] Categories selected
- [ ] Age rating assigned

### Analytics
- [ ] Sentry configured
- [ ] Firebase configured
- [ ] Analytics events defined
- [ ] Crash reporting tested

### Post-Launch Monitoring
- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Track download stats
- [ ] Monitor API performance
- [ ] Customer support ready

---

## Troubleshooting

### Build Hatası

```bash
# Cache temizle
npm cache clean --force
rm -rf node_modules
npm install

# EAS build logs
eas build:list
eas build:view <build-id>
```

### Credentials Problemi

```bash
# Credentials reset
eas credentials --platform ios
eas credentials --platform android
```

### Submit Başarısız

```bash
# Manuel submit
eas build:download --platform ios
# Xcode ile Organizer → Upload to App Store

# Android
eas build:download --platform android
# Play Console → Upload AAB
```

### Update Çalışmıyor

```bash
# Update channel kontrol
eas channel:list

# Update view
eas update:list --branch production
```

---

## Useful Commands

```bash
# Build durumu
eas build:list --platform all --status finished

# Credentials görüntüle
eas credentials

# Project info
eas project:info

# Update rollback
eas update:republish --branch production --group <group-id>

# Build cancel
eas build:cancel <build-id>
```

---

## Support

- **EAS Docs**: https://docs.expo.dev/eas/
- **App Store**: https://developer.apple.com/app-store/
- **Play Console**: https://play.google.com/console/
- **Bazenda Support**: support@bazenda.com

---

**Son Güncelleme:** 30 Ekim 2025
**Version:** 1.0.0
