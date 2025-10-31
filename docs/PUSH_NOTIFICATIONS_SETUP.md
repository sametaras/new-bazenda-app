# 📱 Push Notifications Setup - Bazenda iOS & Android

Bu dokümantasyon, Bazenda mobil uygulamasında push notification sistemini production'a hazırlamak için adım adım talimatlar içerir.

---

## 🎯 Genel Bakış

**Bazenda Push Notification Sistemi:**
- ✅ Backend (CodeIgniter 4) cron job ile saatlik fiyat kontrolü
- ✅ Fiyat değişikliği tespit edildiğinde otomatik bildirim
- ✅ Deep linking ile Favoriler ekranına yönlendirme
- ✅ Expo Push Notification Service kullanımı
- ✅ iOS ve Android desteği

---

## 📋 Önkoşullar

1. **Expo Hesabı**: [https://expo.dev](https://expo.dev) ücretsiz hesap
2. **EAS CLI**: `npm install -g eas-cli`
3. **Backend API**: CodeIgniter 4 notification endpoints hazır olmalı
4. **Fiziksel Cihaz**: Push notifications simulatörde çalışmaz

---

## 🚀 Adım 1: Expo Project ID Alma

### 1.1. Expo'ya Giriş Yap
```bash
npx expo login
```

### 1.2. Mevcut Projeye EAS Ekle
```bash
# Proje klasörüne git
cd /path/to/new-bazenda-app

# EAS build başlat
eas build:configure
```

### 1.3. Project ID Otomatik Oluşturulur
Bu komut çalıştırıldığında:
- `app.json` otomatik güncellenecek
- `extra.eas.projectId` alanı eklenecek
- Expo Dashboard'da proje görünecek

### 1.4. Project ID'yi Doğrula
```bash
# app.json'ı kontrol et
cat app.json | grep projectId
```

Çıktı şuna benzer olmalı:
```json
"eas": {
  "projectId": "a1b2c3d4-e5f6-7890-1234-56789abcdef0"
}
```

---

## 📱 Adım 2: iOS Development Build

### 2.1. Apple Developer Account Gerekli
- Apple Developer hesabınıza giriş yapın: [https://developer.apple.com](https://developer.apple.com)
- Bundle ID: `com.bazenda.app`

### 2.2. iOS Development Build Oluştur
```bash
# Development build (test için)
eas build --platform ios --profile development

# Bu komut:
# 1. Expo projesi build edilir
# 2. Push notification capabilities eklenir
# 3. .ipa dosyası oluşturulur
# 4. TestFlight'a veya doğrudan cihaza yüklenebilir
```

### 2.3. Build'i Cihaza Yükle

**Seçenek 1: TestFlight (Önerilen)**
```bash
# Build tamamlandıktan sonra:
eas submit --platform ios

# App Store Connect'te:
# 1. TestFlight sekmesine git
# 2. Internal Testing'e ekle
# 3. iPhone'unuzda TestFlight app ile yükle
```

**Seçenek 2: Doğrudan Yükleme**
```bash
# .ipa dosyasını indir
# Xcode'dan Devices and Simulators -> "+" -> .ipa seç
```

---

## 🤖 Adım 3: Android Development Build

### 3.1. Android Build Oluştur
```bash
# Development build
eas build --platform android --profile development

# Bu komut:
# 1. .apk veya .aab dosyası oluşturur
# 2. FCM (Firebase Cloud Messaging) otomatik yapılandırılır
# 3. Push notification permissions eklenir
```

### 3.2. APK'yı Cihaza Yükle
```bash
# Build tamamlandıktan sonra .apk'yı indir
# Android cihazda: Ayarlar -> Güvenlik -> Bilinmeyen kaynaklar -> İzin ver
# .apk dosyasına tıkla ve yükle
```

---

## 🔧 Adım 4: app.json Konfigürasyonu

### 4.1. Güncel app.json
```json
{
  "expo": {
    "name": "Bazenda",
    "slug": "bazenda-app",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.bazenda.app",
      "infoPlist": {
        "UIBackgroundModes": [
          "fetch",
          "remote-notification"
        ]
      }
    },
    "android": {
      "package": "com.bazenda.app",
      "permissions": [
        "POST_NOTIFICATIONS",
        "RECEIVE_BOOT_COMPLETED",
        "WAKE_LOCK"
      ]
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#f67310"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID_HERE"
      }
    }
  }
}
```

### 4.2. Notification Icon (Android)
```bash
# 96x96 PNG dosyası oluştur
# assets/notification-icon.png
# Şeffaf arka plan, beyaz icon (Material Design standartları)
```

---

## 🔐 Adım 5: Backend API Endpoints

### 5.1. Device Registration
```bash
POST https://bazenda.com/api/notifications/register-device

Headers:
Content-Type: application/json

Body:
{
  "device_id": "unique-device-uuid",
  "expo_push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios" | "android",
  "app_version": "1.0.0"
}

Response:
{
  "success": true,
  "message": "Cihaz başarıyla kaydedildi"
}
```

### 5.2. Favorites Sync
```bash
POST https://bazenda.com/api/notifications/sync-favorites

Body:
{
  "device_id": "unique-device-uuid",
  "favorites": [
    {
      "product_id": "123456",
      "current_price": 299.99
    }
  ]
}
```

### 5.3. Cron Job Trigger
```bash
GET https://bazenda.com/api/cron/check-prices

Headers:
X-Cron-Secret: YOUR_SECRET_KEY

# Bu endpoint:
# 1. Tüm favorileri kontrol eder
# 2. Fiyat değişikliklerini tespit eder
# 3. Expo Push API'ye bildirim gönderir
```

---

## ⏰ Adım 6: Cron Job Kurulumu

### 6.1. Linux/Unix Server (Önerilen)
```bash
# Crontab'ı düzenle
crontab -e

# Her saat başı çalıştır
0 * * * * /usr/bin/curl -H "X-Cron-Secret: SECRET_KEY" https://bazenda.com/api/cron/check-prices >> /var/log/bazenda-cron.log 2>&1

# Her 30 dakikada bir
*/30 * * * * /usr/bin/curl -H "X-Cron-Secret: SECRET_KEY" https://bazenda.com/api/cron/check-prices >> /var/log/bazenda-cron.log 2>&1
```

### 6.2. cPanel (Shared Hosting)
```
Command: /usr/bin/curl -H "X-Cron-Secret: SECRET_KEY" https://bazenda.com/api/cron/check-prices
Interval: Every 1 hour (veya özel)
```

### 6.3. Cron Job Test
```bash
# Manuel trigger
curl -H "X-Cron-Secret: YOUR_SECRET_KEY" https://bazenda.com/api/cron/check-prices

# Log kontrol
tail -f /var/log/bazenda-cron.log
```

---

## 🧪 Adım 7: Test Etme

### 7.1. Notification Permission Test
```bash
# Uygulamayı aç
# Console'da şu logları görmelisin:
✅ Notification servisi başlatıldı: ExponentPushToken[xxx]
✅ Device kaydedildi: {device_id}
```

### 7.2. Favori Ekle/Çıkar Test
```bash
# Bir ürünü favorilere ekle
# Backend'de kontrol et:
SELECT * FROM user_favorites_tracking WHERE device_id = 'YOUR_DEVICE_ID';
```

### 7.3. Fiyat Değişikliği Simülasyonu
```sql
-- Backend database'de fiyat güncelle
UPDATE products SET price = 199.99 WHERE product_id = '123456';

-- Cron job'ı manuel tetikle
curl -H "X-Cron-Secret: SECRET_KEY" https://bazenda.com/api/cron/check-prices

-- Bildirimi cihazda kontrol et
```

### 7.4. Deep Link Test
```bash
# Bildirme tıklandığında Favoriler ekranı açılmalı
# NotificationService.handleNotificationResponse kontrol et
```

---

## 🐛 Sorun Giderme

### Sorun 1: "projectId Invalid UUID"
```bash
Çözüm:
1. eas build:configure çalıştır
2. app.json'da projectId var mı kontrol et
3. Expo login yap: npx expo login
```

### Sorun 2: "Push Token Alınamadı"
```bash
Neden: Simulator kullanıyorsunuz
Çözüm: Fiziksel cihaz kullanın (iPhone/Android)
```

### Sorun 3: "Bildirim Gelmiyor"
```bash
Kontroller:
1. Device token doğru kaydedildi mi? -> Backend database
2. Cron job çalışıyor mu? -> Log dosyası
3. Expo Push API response: -> Backend log
4. iOS: Settings -> Bazenda -> Notifications -> Allow
5. Android: Settings -> Apps -> Bazenda -> Notifications -> Enabled
```

### Sorun 4: "Deep Link Çalışmıyor"
```bash
Kontrol:
- notification.service.ts -> handleNotificationResponse
- navigation.navigate('Favorilerim') doğru çalışıyor mu?
```

---

## 🎯 Production Checklist

### iOS Production
- [ ] Apple Developer hesabı aktif
- [ ] App Store Connect'te app oluşturuldu
- [ ] Bundle ID: `com.bazenda.app`
- [ ] Privacy Policy URL eklendi
- [ ] Screenshots hazırlandı
- [ ] App Icon (1024x1024) hazırlandı
- [ ] TestFlight beta test tamamlandı

### Android Production
- [ ] Google Play Console hesabı ($25 one-time)
- [ ] Package name: `com.bazenda.app`
- [ ] App signing by Google Play aktif
- [ ] Store listing tamamlandı
- [ ] Content rating alındı
- [ ] Privacy policy URL eklendi

### Backend Production
- [ ] HTTPS zorunlu (SSL sertifikası)
- [ ] Cron job production server'da çalışıyor
- [ ] Database backups aktif
- [ ] API rate limiting yapılandırıldı
- [ ] Error logging (Sentry, Rollbar, etc.)
- [ ] Monitoring (Uptime checks)

### Mobil App Production
- [ ] Analytics entegrasyonu (Firebase, Mixpanel)
- [ ] Crash reporting (Sentry)
- [ ] Environment variables production'a set edildi
- [ ] API_BASE_URL production endpoint
- [ ] Version number güncellendi
- [ ] Build number arttırıldı

---

## 📚 İlgili Dökümanlar

- `docs/BACKEND_INTEGRATION.md` - Backend API detayları
- `docs/CRON_SETUP.md` - Cron job kurulum detayları
- `docs/IMPLEMENTATION_CHECKLIST.md` - Genel checklist

---

## 🔗 Faydalı Linkler

- Expo Push Notifications: https://docs.expo.dev/push-notifications/overview/
- EAS Build: https://docs.expo.dev/build/introduction/
- App Store Connect: https://appstoreconnect.apple.com
- Google Play Console: https://play.google.com/console
- Expo Dashboard: https://expo.dev/accounts/[username]/projects

---

## 🆘 Destek

Sorun yaşıyorsanız:
1. Expo Community: https://forums.expo.dev
2. Stack Overflow: [expo-notifications]
3. GitHub Issues: https://github.com/anthropics/claude-code/issues

---

**Son Güncelleme:** 2025-10-31
**Versiyon:** 1.0.0
**Durum:** Production Ready ✅
