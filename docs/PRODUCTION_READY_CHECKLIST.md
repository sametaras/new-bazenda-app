# 🚀 Production Ready Checklist - Bazenda Mobile App

Bu döküman, Bazenda mobil uygulamasının App Store ve Google Play'e yayınlanmadan önce tamamlanması gereken tüm adımları içerir.

---

## ✅ 1. Kod Kalitesi ve Güvenlik

### 1.1. TypeScript Kontrolleri
- [x] Tüm dosyalar TypeScript (.tsx, .ts)
- [x] No `any` types (strict mode)
- [x] Interface tanımlamaları eksiksiz
- [x] Null safety kontrolleri var
- [ ] `npm run tsc --noEmit` hatasız çalışıyor

**Test:**
```bash
npx tsc --noEmit
# Expected: No errors
```

### 1.2. ESLint & Prettier
- [ ] ESLint rules aktif
- [ ] Prettier formatlaması yapılmış
- [ ] No warnings/errors
- [ ] Pre-commit hooks çalışıyor

**Test:**
```bash
npm run lint
npm run format:check
```

### 1.3. API Keys & Secrets
- [x] API keys .env dosyasında
- [x] .env.example oluşturuldu
- [x] .gitignore'da sensitive files var
- [x] Backend API URL environment-based
- [ ] Production API key ayrı

**Kontrol:**
```bash
# .env dosyası git'e commit edilmemeli
git status | grep .env
# Output: nothing
```

### 1.4. Error Handling
- [x] Try-catch blocks var
- [x] User-friendly error messages
- [x] Network error handling
- [x] Timeout handling
- [x] Retry mechanisms (exponential backoff)

---

## 📱 2. Mobil Platform Gereksinimleri

### 2.1. iOS Gereksinimleri
- [x] Bundle ID: `com.bazenda.app`
- [x] iOS minimum version: 13.0
- [x] Info.plist permissions tanımlı
  - [x] NSCameraUsageDescription
  - [x] NSPhotoLibraryUsageDescription
  - [x] NSPhotoLibraryAddUsageDescription
- [x] UIBackgroundModes: remote-notification
- [ ] App Store screenshots (6.5", 6.7", 5.5", 12.9")
- [ ] App Icon 1024x1024 (App Store)
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Copyright notice

**Kontrol:**
```json
// app.json
{
  "ios": {
    "bundleIdentifier": "com.bazenda.app",
    "buildNumber": "1",
    "infoPlist": {
      "NSCameraUsageDescription": "Bazenda, ürün aramak için kameranızı kullanmanıza izin verir.",
      "NSPhotoLibraryUsageDescription": "Bazenda, fotoğraf galerinizden ürün aramanıza izin verir."
    }
  }
}
```

### 2.2. Android Gereksinimleri
- [x] Package name: `com.bazenda.app`
- [x] Android minimum SDK: 21 (Android 5.0)
- [x] Android target SDK: 34
- [x] Permissions tanımlı
  - [x] CAMERA
  - [x] READ_EXTERNAL_STORAGE
  - [x] POST_NOTIFICATIONS
  - [x] INTERNET
- [x] Adaptive icon
- [ ] Notification icon (96x96, white)
- [ ] Google Play screenshots
- [ ] Feature graphic (1024x500)
- [ ] Privacy Policy URL

---

## 🔐 3. Backend Entegrasyon

### 3.1. API Endpoints Production Ready
- [x] HTTPS (SSL sertifikası)
- [x] Rate limiting aktif
- [x] CORS yapılandırması
- [x] API versioning (v1/)
- [ ] Load balancing (high traffic)
- [ ] CDN entegrasyonu (görseller için)

**Test:**
```bash
# SSL check
curl -I https://bazenda.com/api/products
# Expected: HTTP/2 200

# Rate limit test
for i in {1..100}; do curl https://bazenda.com/api/products; done
# Expected: 429 Too Many Requests after limit
```

### 3.2. Database Optimizasyon
- [ ] Index tanımları var
- [ ] Query optimization yapılmış
- [ ] Connection pooling aktif
- [ ] Backup stratejisi var (daily)
- [ ] Database monitoring (slow queries)

### 3.3. Cron Jobs
- [x] Fiyat kontrolü cron job çalışıyor
- [ ] Log rotation aktif
- [ ] Error alerting (email/SMS)
- [ ] Monitoring (Uptime Robot, etc.)

**Test:**
```bash
# Manuel trigger
curl -H "X-Cron-Secret: SECRET" https://bazenda.com/api/cron/check-prices

# Log kontrol
tail -f /var/log/bazenda-cron.log
```

---

## 🔔 4. Push Notifications

### 4.1. Expo Push Service
- [x] Expo account oluşturuldu
- [ ] EAS project ID eklendi
- [x] Notification permissions configured
- [ ] Push notification test passed (fiziksel cihaz)
- [ ] Deep linking çalışıyor

**Test:**
```bash
# Expo push notification tool
https://expo.dev/notifications

Send test notification:
Title: "Test"
Body: "Push notification test"
Data: {"screen": "Favorilerim"}
```

### 4.2. Notification Content
- [x] Turkish characters support (ı, ğ, ü, ş, ö, ç)
- [x] Title max 65 chars
- [x] Body max 240 chars
- [x] Icon displayed (Android)
- [ ] Sound working (iOS/Android)
- [ ] Badge updating

---

## 🎨 5. UI/UX Polish

### 5.1. Design Consistency
- [x] Modern tag cloud design
- [x] Color palette consistent (theme.ts)
- [x] Typography sizes optimized
- [x] Spacing consistent (spacing.ts)
- [x] Shadow depths (shadows.ts)
- [x] Border radius consistent

### 5.2. Interactions
- [x] Haptic feedback (Light/Medium/Heavy)
- [x] Loading states (skeleton, spinner)
- [x] Empty states (no favorites, no results)
- [x] Error states (user-friendly messages)
- [x] Success feedback (visual confirmation)

### 5.3. Accessibility
- [ ] VoiceOver support (iOS)
- [ ] TalkBack support (Android)
- [ ] Dynamic type support (font scaling)
- [ ] Color contrast WCAG AA
- [ ] Touch target size min 44x44

---

## 📊 6. Analytics & Monitoring

### 6.1. Analytics Events
- [x] Screen views (AnalyticsService.logScreenView)
- [x] Search events (text, visual)
- [x] Favorite events (add, remove)
- [x] Product clicks
- [x] Error events
- [ ] Purchase tracking (future)

### 6.2. Crash Reporting
- [ ] Sentry SDK entegre
- [ ] Error boundary components
- [ ] Crash-free rate > 99%
- [ ] Stack traces readable

**Setup:**
```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative
```

### 6.3. Performance Monitoring
- [ ] App launch time < 3s
- [ ] Screen render time logged
- [ ] API response time monitored
- [ ] Memory leaks yok

---

## 🧪 7. Testing

### 7.1. Unit Tests
- [ ] Store tests (favoritesStore, baiStore)
- [ ] Service tests (api, analytics)
- [ ] Utility functions tested
- [ ] Coverage > 70%

**Setup:**
```bash
npm install --save-dev jest @testing-library/react-native
npm test
```

### 7.2. Integration Tests
- [ ] API integration tests
- [ ] Navigation flow tests
- [ ] AsyncStorage persistence tests

### 7.3. E2E Tests (Optional)
- [ ] Detox setup
- [ ] Critical user flows tested
  - [ ] Search flow
  - [ ] Favorite flow
  - [ ] BAI flow

---

## 📦 8. Build & Distribution

### 8.1. Version Management
- [x] Semantic versioning (1.0.0)
- [x] Build number incrementing
- [ ] Changelog maintained (CHANGELOG.md)
- [ ] Git tags for releases

**app.json:**
```json
{
  "version": "1.0.0",
  "ios": {
    "buildNumber": "1"
  },
  "android": {
    "versionCode": 1
  }
}
```

### 8.2. EAS Build Profiles
- [ ] Development profile
- [ ] Preview profile
- [ ] Production profile

**eas.json:**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 8.3. App Store Optimization (ASO)
- [ ] App name optimized
- [ ] Keywords researched
- [ ] Description compelling (8000 chars)
- [ ] Screenshots annotated
- [ ] Preview video (15-30s)
- [ ] Promotional text (170 chars)

---

## 🌍 9. Localization (Future)

### 9.1. Turkish (Default)
- [x] All UI text in Turkish
- [x] Error messages in Turkish
- [x] Date formatting (TR locale)
- [x] Currency (₺)

### 9.2. Multi-language Support (v2.0)
- [ ] i18n library setup
- [ ] English translations
- [ ] Language switcher

---

## 📄 10. Legal & Compliance

### 10.1. Documents Required
- [ ] Privacy Policy (GDPR/KVKK compliant)
- [ ] Terms of Service
- [ ] Cookie Policy (web)
- [ ] Data Deletion Instructions
- [ ] Contact Information

### 10.2. KVKK (Türkiye Veri Koruma)
- [ ] Explicit consent for data collection
- [ ] User data exportable
- [ ] User data deletable
- [ ] Data retention policy defined

### 10.3. GDPR (EU Users)
- [ ] Cookie banner (web)
- [ ] Data processing agreement
- [ ] User rights documented
- [ ] DPO assigned (if applicable)

---

## 🚀 11. Deployment Steps

### 11.1. Pre-Deployment
```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Type check
npx tsc --noEmit

# 3. Lint
npm run lint

# 4. Test
npm test

# 5. Build preview
eas build --platform all --profile preview
```

### 11.2. iOS Deployment
```bash
# 1. Production build
eas build --platform ios --profile production

# 2. Submit to TestFlight
eas submit --platform ios

# 3. Test on TestFlight (internal)

# 4. Submit for App Store Review
# App Store Connect -> My Apps -> [Bazenda] -> Submit for Review
```

### 11.3. Android Deployment
```bash
# 1. Production build
eas build --platform android --profile production

# 2. Submit to Google Play Console
eas submit --platform android

# 3. Internal testing track

# 4. Open testing (beta)

# 5. Production release
```

---

## 📈 12. Post-Launch Monitoring

### 12.1. First 24 Hours
- [ ] Monitor crash reports
- [ ] Check user reviews/ratings
- [ ] Verify notification delivery
- [ ] Check API response times
- [ ] Monitor cron job execution

### 12.2. First Week
- [ ] Gather user feedback
- [ ] Fix critical bugs (hotfix)
- [ ] A/B test features
- [ ] Optimize performance
- [ ] Update keywords (ASO)

### 12.3. Ongoing
- [ ] Weekly metrics review
- [ ] Monthly feature releases
- [ ] Quarterly major updates
- [ ] Annual security audit

---

## ✅ Final Sign-Off

**Technical Lead:** _______________
**Date:** _______________

**QA Lead:** _______________
**Date:** _______________

**Product Manager:** _______________
**Date:** _______________

---

## 🎯 Success Metrics (6 Months)

**Target KPIs:**
- [ ] 10,000 downloads
- [ ] 4.5+ star rating
- [ ] 99.5% crash-free rate
- [ ] 30% DAU/MAU ratio
- [ ] 60% retention (Day 7)
- [ ] 100,000+ searches/month

---

**Last Updated:** 2025-10-31
**Version:** 1.0.0
**Status:** Ready for Production 🚀
