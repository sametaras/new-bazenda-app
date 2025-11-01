# 📱 App Store Deployment Rehberi (macOS M3)

> **Bazenda Mobil Uygulaması** - v3 için App Store'a deployment rehberi
>
> Bu döküman, mevcut v2 uygulamanın üzerine v3 versiyonunu güncellemek için hazırlanmıştır.

---

## 📋 İçindekiler

1. [Ön Gereksinimler](#ön-gereksinimler)
2. [Apple Developer Hesabı](#apple-developer-hesabı)
3. [Projeyi Hazırlama](#projeyi-hazırlama)
4. [EAS Build Kurulumu](#eas-build-kurulumu)
5. [iOS Build Oluşturma](#ios-build-oluşturma)
6. [App Store Connect](#app-store-connect)
7. [TestFlight ile Test](#testflight-ile-test)
8. [App Store'a Gönderme](#app-storea-gönderme)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Ön Gereksinimler

### 1. Gerekli Yazılımlar

```bash
# Xcode (Mac App Store'dan yükleyin)
# Version: 15.0 veya üzeri
# M3 Mac için optimize edilmiş

# Xcode Command Line Tools
xcode-select --install

# Node.js (zaten yüklü olmalı)
node --version  # 18.x veya üzeri

# EAS CLI
npm install -g eas-cli

# Expo CLI
npm install -g expo-cli
```

### 2. Apple Developer Account

- Apple Developer Program üyeliği (99$/yıl)
- Aktif abonelik kontrolü: https://developer.apple.com/account/

### 3. Mevcut App Bilgileri

Mevcut v2 uygulamanızın bilgileri:

```
Bundle ID: com.yourcompany.bazenda (örnek)
App ID: 1234567890 (App Store Connect'ten bulunur)
Team ID: XXXXXXXXXX (Developer Account'tan bulunur)
```

⚠️ **ÖNEMLİ:** Yeni versiyon için **aynı Bundle ID** kullanılmalıdır!

---

## 🍎 Apple Developer Hesabı

### 1. Developer Portal'a Giriş

1. https://developer.apple.com/account/ adresine gidin
2. Apple ID ile giriş yapın
3. **Team ID**'nizi not edin (sağ üstte)

### 2. App ID Kontrolü

1. **Certificates, Identifiers & Profiles** → **Identifiers**
2. Mevcut App ID'nizi bulun (com.yourcompany.bazenda)
3. **Capabilities** (Yetenekler) kontrol edin:
   - ✅ Push Notifications (Bildirimler için)
   - ✅ Associated Domains (Deep linking için - opsiyonel)

### 3. Certificates (Sertifikalar)

**Distribution Certificate** kontrolü:

```bash
# Mevcut sertifikaları listele
security find-identity -v -p codesigning
```

Eğer yoksa:

1. **Certificates** → **+** → **Apple Distribution**
2. CSR (Certificate Signing Request) oluşturun:
   - **Keychain Access** uygulamasını açın
   - **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
   - Email ve Common Name girin
   - "Saved to disk" seçin
3. CSR'yi yükleyin ve sertifikayı indirin
4. İndirdiğiniz `.cer` dosyasına çift tıklayarak Keychain'e ekleyin

### 4. Provisioning Profiles

EAS Build otomatik olarak yönetir, manuel işlem gerekmez!

---

## 🔧 Projeyi Hazırlama

### 1. app.json / app.config.js Kontrolü

Mevcut ayarlarınızı kontrol edin:

```json
{
  "expo": {
    "name": "Bazenda",
    "slug": "bazenda-app",
    "version": "3.0.0",  // ⚠️ v2'den büyük olmalı (örn: 2.1.5 → 3.0.0)
    "ios": {
      "bundleIdentifier": "com.yourcompany.bazenda",  // ⚠️ V2 ile AYNI
      "buildNumber": "1",  // ⚠️ v2'den büyük olmalı
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "BAI ile ürün aramak için kamera erişimi gerekiyor",
        "NSPhotoLibraryUsageDescription": "Fotoğraflarınızdan ürün aramak için erişim gerekiyor"
      }
    }
  }
}
```

### 2. Version ve Build Number

⚠️ **ÇÖZÜM ÖNERİSİ:**

Eğer mevcut v2 versiyonu:
- Version: `2.1.5`
- Build Number: `25`

Yeni v3 versiyonu:
- Version: `3.0.0`
- Build Number: `30` (veya daha büyük)

```bash
# app.json'da güncelle:
# "version": "3.0.0"
# "buildNumber": "30"
```

### 3. Environment Variables Kontrolü

```bash
# .env dosyanızı kontrol edin
cat .env

# Gerekli değişkenler:
# API_URL=https://bazenda.com/api
# EXPO_PUBLIC_API_URL=https://bazenda.com/api
```

### 4. Dependencies Güncel mi?

```bash
# node_modules temizle ve yeniden yükle
rm -rf node_modules
npm install

# Cache temizle
npx expo start -c
```

---

## 🚀 EAS Build Kurulumu

### 1. EAS CLI Login

```bash
# EAS CLI'a giriş yap
eas login

# Giriş kontrolü
eas whoami
```

### 2. Proje Yapılandırması

```bash
# EAS projesini başlat (ilk defa yapıyorsanız)
eas build:configure

# Bu komut eas.json dosyası oluşturur
```

### 3. eas.json Ayarları

`eas.json` dosyanızı düzenleyin:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "simulator": false,
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      }
    }
  }
}
```

**Doldurmanız gerekenler:**
- `appleId`: Apple ID email adresiniz
- `ascAppId`: App Store Connect'teki App ID (sonraki adımda bulacağız)
- `appleTeamId`: Developer Account'taki Team ID

---

## 📦 iOS Build Oluşturma

### 1. İlk Production Build

```bash
# Production build başlat
eas build --platform ios --profile production

# Veya interaktif mode:
eas build --platform ios
```

### 2. Build Süreci

EAS size şunları soracak:

**1. Apple Team ID:**
```
? Select an iOS distribution certificate to use for code signing:
  › XXXXXXXXXX (Your Company Name)
```
Team ID'nizi seçin.

**2. Distribution Certificate:**
```
? Would you like to use an existing Distribution Certificate?
  › Yes (Eğer yukarıda oluşturduysanız)
```

**3. Provisioning Profile:**
```
? Would you like to use an existing Provisioning Profile?
  › Yes (EAS otomatik oluşturabilir)
```

**4. Push Notification Key:**
```
? Would you like to use an existing Push Notification Key?
  › Yes (Mevcut v2'den kullanabilirsiniz)
  › Create a new one (Veya yeni oluşturun)
```

### 3. Build İzleme

```bash
# Build durumunu izle
eas build:list

# Veya web'den takip et:
# https://expo.dev/accounts/[your-account]/projects/bazenda-app/builds
```

Build süresi: **15-30 dakika** (M3 Mac için optimize edilmiş)

### 4. Build Başarılı Olduktan Sonra

Build tamamlandığında:
- ✅ `.ipa` dosyası oluşturulur
- ✅ EAS Dashboard'da "completed" durumunda görünür
- ✅ İndirme linki alırsınız

---

## 🏪 App Store Connect

### 1. App Store Connect'e Giriş

1. https://appstoreconnect.apple.com/ adresine gidin
2. Apple ID ile giriş yapın
3. **My Apps** (Uygulamalarım) seçin

### 2. Mevcut Uygulamanızı Bulun

1. **Bazenda** uygulamanızı seçin
2. Sol tarafta **App Information** → **General Information**
3. **Apple ID** numarasını not edin (örn: 1234567890)
   - Bu `ascAppId` değeridir, `eas.json`'a ekleyin

### 3. Yeni Versiyon Oluştur

1. Sol tarafta **+** veya **Prepare for Submission** butonuna tıklayın
2. **Version Number**: `3.0.0` girin
3. **What's New in This Version** (Sürüm notları):

```
Bazenda v3.0 - Yenilikler:

🎨 Tamamen Yeni Arayüz
- Modern ve kullanıcı dostu tasarım
- Daha hızlı ürün gezinme
- İyileştirilmiş arama deneyimi

🔔 Akıllı Bildirimler
- Fiyat düşüşlerinde anında bildirim
- Bildirim geçmişi
- Özelleştirilebilir bildirim ayarları

⭐ Gelişmiş Favoriler
- Koleksiyon oluşturma ve paylaşma
- QR kod ile koleksiyon paylaşımı
- Fiyat değişikliği takibi

📸 BAI (Yapay Zeka Arama)
- Fotoğrafla ürün arama
- Daha doğru sonuçlar
- Arama geçmişi

🔍 Gelişmiş Filtreler
- Renk, beden, marka filtreleri
- Fiyat aralığı seçimi
- Cinsiyet filtresi

⚡ Performans İyileştirmeleri
- Daha hızlı yükleme süreleri
- Optimize edilmiş görüntüler
- Geliştirilmiş kararlılık
```

### 4. Build Yükle

**Manuel yükleme (EAS ile):**

```bash
# Build'i App Store Connect'e gönder
eas submit --platform ios --latest

# Veya belirli bir build için:
eas submit --platform ios --id [build-id]
```

**Interaktif mode soruları:**

```
? Which iOS distribution certificate to use?
  › Select the one you created

? Would you like to upload this app to App Store Connect?
  › Yes

? App Store Connect API Key (optional):
  › Skip (manuel login yapacağız)

? Apple ID:
  › your-apple-id@email.com

? App-specific password:
  › (App-specific password oluşturmanız gerekecek)
```

**App-Specific Password Oluşturma:**

1. https://appleid.apple.com/ adresine gidin
2. **Security** → **App-Specific Passwords**
3. **Generate Password**
4. İsim: "EAS Submit"
5. Oluşan şifreyi kopyalayın ve EAS'e girin

### 5. Build İşleme (Processing)

Apple'ın build'i işlemesi: **10-60 dakika**

Durum kontrolü:
- App Store Connect → **TestFlight** → **iOS Builds**
- Status: "Processing" → "Ready to Submit"

---

## 🧪 TestFlight ile Test

### 1. Internal Testing (İç Test)

Build "Ready to Submit" olduğunda:

1. **TestFlight** sekmesine gidin
2. **Internal Testing** altında yeni build görünecek
3. **Add Internal Testers**:
   - Developer hesabınızdaki email'ler (max 100)
   - Otomatik bildirim gönderilir

### 2. TestFlight Uygulaması

**iPhone/iPad'de:**

1. App Store'dan **TestFlight** uygulamasını indirin
2. Gelen davet email'indeki linke tıklayın
3. "Install" butonuna basın
4. Uygulamayı test edin

### 3. External Testing (Dış Test - Opsiyonel)

Daha geniş test grubu için:

1. **External Testing** → **Create New Group**
2. Test grubuna isim verin (örn: "Beta Testers")
3. Test notları yazın
4. **Submit for Review** (Apple incelemesi gerekir, 1-2 gün)

### 4. Test Feedback

TestFlight'ta test ederken:
- Crash raporları otomatik toplanır
- Kullanıcılar screenshot ile feedback gönderebilir
- Tüm feedback App Store Connect'te görünür

---

## 📤 App Store'a Gönderme

### 1. Final Checklist

Gönderim öncesi kontrol:

- [ ] TestFlight'ta en az 2-3 gün test edildi
- [ ] Kritik buglar düzeltildi
- [ ] Sürüm notları hazır
- [ ] Ekran görüntüleri güncellendi (6.7", 6.5", 5.5" ekranlar için)
- [ ] App icon güncellendi (gerekirse)
- [ ] Privacy Policy URL güncel
- [ ] Support URL güncel

### 2. App Store Screenshots

**Gerekli ekran boyutları:**

1. **6.7" (iPhone 14 Pro Max, 15 Pro Max)**
   - Çözünürlük: 1290 x 2796 px
   - En az 3 screenshot

2. **6.5" (iPhone 11 Pro Max, XS Max)**
   - Çözünürlük: 1242 x 2688 px
   - En az 3 screenshot

3. **5.5" (iPhone 8 Plus)**
   - Çözünürlük: 1242 x 2208 px
   - En az 3 screenshot (opsiyonel ama önerilen)

**Screenshot oluşturma:**

```bash
# iOS Simulator'da screenshot al:
# 1. Xcode → Open Developer Tool → Simulator
# 2. Simülatör'de: Cmd + S (screenshot kaydet)
# 3. Desktop'a kaydedilir

# Veya device'dan:
# 1. TestFlight'tan uygulamayı aç
# 2. Volume Up + Power (screenshot)
# 3. Photos app'ten export et
```

**Screenshot öneri sırası:**
1. Ana ekran (Keşfet / Trendler)
2. BAI arama (Kamera ile arama)
3. Arama sonuçları
4. Favoriler listesi
5. Bildirimler

### 3. App Store Listing Bilgileri

**App Store Connect → My Apps → Bazenda → 3.0.0 Prepare for Submission**

**1. App Privacy (Gizlilik)**

- **Data Collection**: Yes
- **Data Types**:
  - Contact Info (email - opsiyonel)
  - Usage Data (analytics)
  - Identifiers (device ID for notifications)
- **Purpose**: App Functionality, Analytics

**2. App Review Information**

```
Contact Information:
  First Name: [Your Name]
  Last Name: [Your Surname]
  Phone: +90 XXX XXX XX XX
  Email: support@bazenda.com

Demo Account (Eğer login gerekiyorsa):
  Username: [demo user]
  Password: [demo password]

Notes:
  Bu uygulama Türkiye'deki e-ticaret sitelerinden ürün fiyatlarını karşılaştırır.
  BAI özelliği için kamera erişimi gereklidir.
  Push notification için kullanıcı izni alınır.
```

**3. Age Rating (Yaş Sınırı)**

- **4+** (Çoğu e-ticaret uygulaması için uygun)

**4. Categories (Kategoriler)**

- **Primary**: Shopping
- **Secondary**: Lifestyle

### 4. Submit for Review

1. Tüm alanları doldurduktan sonra
2. **Save** butonuna basın
3. **Add for Review** butonuna tıklayın
4. Final kontrol ekranı gelecek
5. **Submit to App Review** butonuna basın

**Submission Options:**

```
? Automatically release after approval?
  › Manual release (Önerilen - kontrolünüz sizde)

? Phased Release (Kademeli Yayın)?
  › Yes (Önerilen - 7 gün boyunca %100'e ulaşır)
```

### 5. Review Süreci

**Timeline:**
- **Waiting for Review**: 0-2 gün
- **In Review**: 1-48 saat
- **Toplam**: 1-5 iş günü

**Status takibi:**
- App Store Connect Dashboard
- Email bildirimleri
- Expo Push Notifications (EAS)

**Olası durumlar:**

1. **Approved** ✅
   - Uygulama onaylandı
   - "Release This Version" butonu aktif olur
   - Yayına alabilirsiniz

2. **Rejected** ❌
   - Red nedeni belirtilir
   - Düzeltme yapıp yeniden gönderebilirsiniz
   - Genelde 1-2 gün içinde çözülür

3. **Metadata Rejected** ⚠️
   - Sadece bilgiler reddedildi (kod değil)
   - Build değiştirmeden düzeltip yeniden gönderin

### 6. Yayına Alma

Onaylandıktan sonra:

```
1. App Store Connect → My Apps → Bazenda
2. "Release This Version" butonuna tıklayın
3. Confirm
```

**Yayın süresi:**
- Manuel release: **Anında** (1-2 saat)
- Phased release: **7 gün** boyunca kademeli

---

## 🔄 Update Checklist (Gelecekteki Güncellemeler)

Her yeni versiyon için:

1. **Version bump**:
```bash
# app.json
"version": "3.1.0",  # 3.0.0 → 3.1.0
"buildNumber": "31"   # 30 → 31
```

2. **Build ve gönder**:
```bash
eas build --platform ios --profile production --auto-submit
```

3. **App Store Connect'te yeni versiyon oluştur**
4. **Sürüm notları yaz**
5. **Submit for Review**

---

## 🐛 Troubleshooting

### 1. "Bundle ID already exists"

**Çözüm:**
```bash
# eas.json'da bundle ID'yi kontrol et
# app.json'da aynı bundle ID olmalı
# Mevcut v2 uygulamanızın bundle ID'sini kullanın
```

### 2. "Build failed - Code signing error"

**Çözüm:**
```bash
# Sertifikaları temizle ve yeniden oluştur
eas credentials

# iOS Distribution seçeneğini seç
# Remove credentials
# Build'i tekrar başlat
```

### 3. "Invalid Provisioning Profile"

**Çözüm:**
```bash
# EAS credentials'ı sıfırla
eas credentials --platform ios

# Menüden:
# → Manage credentials
# → Remove provisioning profile
# → Build again (EAS otomatik oluşturur)
```

### 4. "App Review Rejection: 2.1 - App Completeness"

**Anlamı:** Uygulama test edilemedi veya eksik.

**Çözüm:**
- Demo account bilgilerini ekleyin
- Tüm özellikler çalışıyor olmalı
- Network bağlantısı gerekiyorsa açıklama ekleyin

### 5. "App Review Rejection: 4.2 - Minimum Functionality"

**Anlamı:** Uygulama sadece web wrapper gibi görünüyor.

**Çözüm:**
- Native özellikleri vurgulayın (BAI, offline favoriler, push notifications)
- Review notes'a özellik listesi ekleyin

### 6. "App Review Rejection: 5.1.1 - Privacy"

**Anlamı:** Gizlilik politikası eksik veya hatalı.

**Çözüm:**
- Privacy Policy URL ekleyin
- Kamera kullanımı için açıklama ekleyin
- Data collection doğru belirtilmeli

### 7. "Build stuck on 'Waiting for Build to Complete'"

**Çözüm:**
```bash
# EAS build önbelleğini temizle
eas build:cancel

# Yeni build başlat
eas build --platform ios --clear-cache
```

### 8. "Cannot connect to App Store Connect"

**Çözüm:**
```bash
# App-specific password oluşturun
# https://appleid.apple.com/
# Security → App-Specific Passwords → Generate

# EAS submit ile tekrar deneyin
eas submit --platform ios --latest
```

---

## 📊 Build Size Optimization

### 1. Asset Optimization

```bash
# Tüm görselleri optimize et
npx expo-optimize

# Manuel optimizasyon için:
# https://tinypng.com/ (PNG için)
# https://squoosh.app/ (JPG için)
```

### 2. Bundle Analyzer

```bash
# Bundle boyutunu analiz et
npx expo-analyze

# React Native bundle visualizer
npx react-native-bundle-visualizer
```

### 3. Önerilen Optimizasyonlar

```json
// app.json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.bazenda",
      "buildNumber": "30",
      "jsEngine": "hermes",  // ✅ Daha küçük bundle
      "splash": {
        "resizeMode": "cover",
        "backgroundColor": "#f67310"
      }
    }
  }
}
```

---

## 📈 Post-Launch Monitoring

### 1. Analytics

App Store Connect'te:
- **Sales and Trends**: İndirme sayıları
- **App Analytics**: Kullanıcı davranışları
- **Crash Reports**: Hata raporları

### 2. Crash Monitoring

```bash
# Sentry (önerilen)
npm install @sentry/react-native

# Veya Expo's built-in:
# App Store Connect → TestFlight → Crashes
```

### 3. User Reviews

- App Store → Ratings & Reviews
- Email bildirimleri aktif edin
- Negatif yorumlara hızlı yanıt verin

---

## 🎯 Özet Komutlar

```bash
# 1. Login
eas login

# 2. Build oluştur
eas build --platform ios --profile production

# 3. App Store'a gönder
eas submit --platform ios --latest

# 4. Build durumu
eas build:list

# 5. Credentials yönetimi
eas credentials

# 6. Update build (yeni versiyon)
# app.json'da version ve buildNumber güncelle
eas build --platform ios --profile production --auto-submit
```

---

## ✅ Final Checklist

Yayına almadan önce:

- [ ] Version ve build number güncellendi
- [ ] TestFlight'ta test edildi
- [ ] Screenshots hazır (3 boyut için)
- [ ] Sürüm notları yazıldı
- [ ] Privacy Policy güncel
- [ ] Demo account bilgileri eklendi (gerekiyorsa)
- [ ] Crash reports temiz
- [ ] Performance testleri yapıldı
- [ ] Backend API production'da çalışıyor
- [ ] Push notifications test edildi
- [ ] Deep linking test edildi (varsa)

---

## 📞 Destek ve Kaynaklar

**Apple Dokümantasyon:**
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/app-store/submissions/

**Expo Dokümantasyon:**
- https://docs.expo.dev/submit/ios/
- https://docs.expo.dev/build/setup/
- https://docs.expo.dev/distribution/introduction/

**EAS Dokümantasyon:**
- https://docs.expo.dev/eas/
- https://docs.expo.dev/build/introduction/

**Apple Support:**
- https://developer.apple.com/contact/
- Phone: 1-800-633-2152 (US)
- Email: developer-relations@apple.com

**Bazenda İletişim:**
- Email: support@bazenda.com
- Developer: [Your Name]

---

## 🎉 Başarılar!

Uygulamanız App Store'da yayına alındığında:

1. **Marketing:**
   - Social media duyurusu
   - Email newsletter
   - Blog post
   - Press release

2. **Monitoring:**
   - İlk 24-48 saat yakından takip
   - Crash reports kontrol
   - User feedback oku
   - Ratings & Reviews yanıtla

3. **Iterate:**
   - Kullanıcı feedback'leri topla
   - Analytics verilerini analiz et
   - Yeni özellikler planla
   - 2-4 haftada bir güncelleme yap

**İyi şanslar! 🚀**
