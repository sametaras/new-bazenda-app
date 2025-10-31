# 📱 iOS Cihazlarda Fonksiyon Test Checklist

Bu döküman, Bazenda iOS uygulamasının tüm fonksiyonlarının fiziksel cihazlarda test edilmesi için hazırlanmıştır.

---

## 🎯 Test Cihazları

**Minimum iOS Gereksinimleri:**
- iOS 13.0 ve üzeri
- iPhone 6s ve sonrası
- iPad Air 2 ve sonrası

**Test Edilen Cihazlar:**
- ✅ iPhone 12 (iOS 15+)
- ⬜ iPhone 13/14/15 (önerilir)
- ⬜ iPad (landscape mode test)

---

## ✅ 1. Temel Fonksiyonlar

### 1.1. Uygulama Açılışı
- [ ] App icon doğru görünüyor
- [ ] Splash screen görünüyor
- [ ] Ana ekran yükleniyor (< 3 saniye)
- [ ] Trend ürünler listeleniyor
- [ ] Hiçbir crash yok

**Test Komutları:**
```bash
# iPhone'a yükle
npx expo run:ios --device

# Build log kontrol
npx expo start
```

**Beklenen Sonuç:**
```
✅ Tüm servisler başlatıldı
ℹ️ Fiyat kontrolü backend cron job tarafından yapılıyor
```

---

### 1.2. Navigation (Tab Bar)
- [ ] "Keşfet" tab'ı aktif
- [ ] "BAI" tab'ı kamera açıyor
- [ ] "Favorilerim" tab'ı favori ekranını açıyor
- [ ] Tab geçişleri smooth (animasyon)
- [ ] Badge sayısı doğru (favoriler varsa)

**Test Adımları:**
1. Her tab'a tıkla
2. Geri dön
3. Hızlıca tab değiştir (rapid tap test)

---

## 📸 2. BAI (Görsel Arama) Fonksiyonları

### 2.1. Kamera Erişimi
- [ ] İlk açılışta kamera izni soruyor
- [ ] "İzin Ver" tıklandığında kamera açılıyor
- [ ] Ön/arka kamera değişimi çalışıyor
- [ ] Kamera önizlemesi lag yapmıyor

**Test:**
```
Settings -> Bazenda -> Kamera -> Allow
```

### 2.2. Fotoğraf Çekme
- [ ] Fotoğraf çekme butonu çalışıyor
- [ ] Fotoğraf çekme ses efekti (haptic feedback)
- [ ] Çekilen fotoğraf hemen işleniyor
- [ ] Loading animasyonu görünüyor
- [ ] Sonuç ekranına yönlendiriyor

**Test Adımları:**
1. BAI tab'ına bas
2. Bir ürünü çerçeveye al
3. Fotoğraf çek
4. Sonuçları bekle (< 5 saniye)

### 2.3. Galeri Seçimi
- [ ] Galeri butonu çalışıyor
- [ ] Fotoğraf seçme ekranı açılıyor
- [ ] Seçilen fotoğraf işleniyor
- [ ] Sonuç ekranına yönlendiriyor

**Test:**
```
Settings -> Bazenda -> Photos -> Selected Photos/All Photos
```

### 2.4. BAI Sonuçlar
- [ ] Benzer ürünler listeleniyor
- [ ] Similarity score görünüyor (%)
- [ ] Ürün kartları doğru render ediliyor
- [ ] Grid layout düzgün
- [ ] Scroll smooth

**Beklenen:**
- 10-50 benzer ürün
- Relevance sıralaması
- İlk 3 ürün > 80% similarity

---

## ❤️ 3. Favoriler Sistemi

### 3.1. Favori Ekleme
- [ ] Ürün kartındaki kalp ikonu çalışıyor
- [ ] İlk tıklamada ekleniyor (haptic feedback)
- [ ] İkon dolu kalp oluyor
- [ ] Tab bar'da badge sayısı artıyor
- [ ] Favoriler ekranında görünüyor

**Test Senaryoları:**
1. Ana ekranda bir ürünü favoriye ekle
2. Arama sonuçlarında favoriye ekle
3. BAI sonuçlarında favoriye ekle

### 3.2. Favori Çıkarma
- [ ] Dolu kalp ikonuna tıklandığında çıkarıyor
- [ ] Badge sayısı azalıyor
- [ ] Favoriler ekranından kayboluyor
- [ ] AsyncStorage güncelliyor (persist)

### 3.3. Favoriler Ekranı
- [ ] Tüm favori ürünler listeleniyor
- [ ] Grid layout (2 sütun)
- [ ] Scroll smooth
- [ ] Empty state (favori yoksa)
- [ ] "Koleksiyon Oluştur" butonu görünüyor

**Test:**
```bash
# AsyncStorage kontrol (debug)
npx react-native log-ios | grep "bazenda-favorites"
```

---

## 🔍 4. Arama Fonksiyonları

### 4.1. Text Search
- [ ] Arama çubuğu çalışıyor
- [ ] Keyboard açılıyor
- [ ] Yazarken debounce yok (submit gerekiyor)
- [ ] "Search" tuşu çalışıyor
- [ ] Arama sonuçları geliyor

**Test Queries:**
- "tişört" - çok sonuç
- "nike air max" - specific
- "asdfghjkl" - no results

### 4.2. Popüler Aramalar (Tag Cloud)
- [ ] "Aramalar" butonu toggle çalışıyor
- [ ] Tag cloud görünüyor/gizleniyor
- [ ] Horizontal scroll çalışıyor
- [ ] Tag'lere tıklandığında arama yapıyor
- [ ] Tag renkleri ve boyutları farklı

**Test:**
1. "Aramalar" chevron'a bas
2. Horizontal scroll yap
3. Bir tag'e tıkla
4. Sonuç ekranını kontrol et

---

## 🔔 5. Push Notifications (Fiziksel Cihaz Gerekli)

### 5.1. İlk Kurulum
- [ ] İlk açılışta notification izni soruyor
- [ ] "Allow" seçildiğinde token alınıyor
- [ ] Device backend'e kaydediliyor
- [ ] Console'da token görünüyor

**Beklenen Log:**
```
✅ Notification servisi başlatıldı: ExponentPushToken[xxx]
✅ Device kaydedildi
```

### 5.2. Notification Permission Kontrol
```bash
Settings -> Bazenda -> Notifications

Kontroller:
- [ ] Allow Notifications: ON
- [ ] Lock Screen: ON
- [ ] Notification Center: ON
- [ ] Banners: ON
- [ ] Sounds: ON
- [ ] Badges: ON
```

### 5.3. Test Notification Gönderme
```bash
# Expo Push Notification Tool
https://expo.dev/notifications

Token: ExponentPushToken[YOUR_TOKEN]
Title: "Fiyat Düştü!"
Body: "Nike Air Max - 299 ₺'ye düştü"
Data: {"screen": "Favorilerim"}
```

### 5.4. Notification Davranışları
- [ ] App kapalıyken bildirim geliyor
- [ ] App açıkken bildirim geliyor
- [ ] Bildirime tıklayınca app açılıyor
- [ ] Deep link çalışıyor (Favoriler ekranı)
- [ ] Badge sayısı güncelleniyor

---

## 🛍️ 6. Ürün Kartı Fonksiyonları

### 6.1. Ürün Detayları
- [ ] Ürün görseli yükleniyor
- [ ] Başlık görünüyor (2 satır max)
- [ ] "X zaman önce güncellendi" görünüyor (last_updated)
- [ ] Mağaza adı görünüyor
- [ ] Fiyat görünüyor
- [ ] İndirim badge'i (varsa) görünüyor

**last_updated Test:**
```
API'den gelen: "1 hafta önce"
Beklenen: Italic, gray, 10px
```

### 6.2. Ürün Aksiyonları
- [ ] Favori butonu çalışıyor
- [ ] BAI mini butonu çalışıyor (benzer ürün ara)
- [ ] "Git" butonu mağazaya yönlendiriyor
- [ ] External browser açılıyor (Safari/Chrome)
- [ ] Fiyat Geçmişi butonu çalışıyor (varsa)

**Test:**
1. Bir ürün kartına bas
2. Safari açılmalı
3. Ürün sayfası yüklensin

---

## 🎨 7. UI/UX Kontrolleri

### 7.1. Dark Mode Uyumluluğu
```bash
Settings -> Display & Brightness -> Dark

Kontroller:
- [ ] Tab bar renkleri uyumlu
- [ ] Ürün kartları okunabilir
- [ ] Text contrast yeterli
```

### 7.2. Safe Area (Notch/Dynamic Island)
- [ ] Header safe area içinde
- [ ] Tab bar safe area içinde
- [ ] Modal'lar safe area içinde
- [ ] Landscape mode'da uyumlu

**Test Cihazları:**
- iPhone 12+ (Notch)
- iPhone 14 Pro+ (Dynamic Island)

### 7.3. Haptic Feedback
- [ ] Favori ekleme: Light
- [ ] BAI arama: Medium
- [ ] Button taps: Light
- [ ] Errors: Heavy (notification feedback)

### 7.4. Loading States
- [ ] Skeleton screens (ürün yüklenirken)
- [ ] Spinner animations
- [ ] Progress indicators (BAI loading)
- [ ] Empty states
- [ ] Error states

---

## 🔌 8. Network Senaryoları

### 8.1. İyi Bağlantı (WiFi/4G/5G)
- [ ] Ürünler hızlı yükleniyor (< 2 saniye)
- [ ] BAI arama hızlı (< 5 saniye)
- [ ] Görseller yükleniyor

### 8.2. Yavaş Bağlantı (3G/2G)
- [ ] Loading indicator görünüyor
- [ ] Timeout handling çalışıyor
- [ ] Retry butonu var
- [ ] Error mesajı user-friendly

### 8.3. Offline Mode
```bash
Settings -> Airplane Mode -> ON

Kontroller:
- [ ] "No internet" mesajı gösteriliyor
- [ ] Favoriler görünüyor (cached)
- [ ] App crash etmiyor
- [ ] Reconnect sonrası sync oluyor
```

**Test:**
1. Airplane mode aç
2. Uygulamayı kapat/aç
3. Favorileri kontrol et (cached olmalı)
4. Airplane mode kapat
5. Pull to refresh yap

---

## 🐛 9. Edge Cases & Error Handling

### 9.1. Empty States
- [ ] Favori yoksa: "Henüz favori ürününüz yok"
- [ ] Arama sonuç bulunamadı: "Ürün bulunamadı"
- [ ] BAI sonuç yok: "Benzer ürün bulunamadı"

### 9.2. API Hataları
- [ ] 404 Not Found
- [ ] 500 Server Error
- [ ] Network timeout
- [ ] Rate limiting (429)

**Test:**
```bash
# Backend'i kapat
# App'te arama yap
# Error mesajı görmelisin
```

### 9.3. Memory Management
- [ ] Çok ürün scroll edildiğinde lag yok
- [ ] Favori ekle/çıkar 100 kez (memory leak test)
- [ ] BAI arama 10 kez art arda
- [ ] App background/foreground geçişi

---

## 📊 10. Performance Metrikleri

### 10.1. App Açılış Süresi
- **Hedef:** < 3 saniye (cold start)
- **Hedef:** < 1 saniye (warm start)

### 10.2. Screen Render Süresi
- **Home Screen:** < 1 saniye
- **Search Results:** < 2 saniye
- **BAI Results:** < 5 saniye
- **Favorites:** < 500 ms

### 10.3. Memory Usage
- **İdeal:** < 150 MB
- **Maksimum:** < 300 MB

**Test:**
```bash
# Xcode'da
Instruments -> Time Profiler
Instruments -> Allocations
```

---

## ✅ Final Checklist (Production Release)

### Pre-Release
- [ ] Tüm yukarıdaki testler passed
- [ ] Crash-free rate > 99%
- [ ] No console errors/warnings
- [ ] Analytics working (Firebase/Mixpanel)
- [ ] Sentry crash reporting active

### App Store Submission
- [ ] Screenshots prepared (all devices)
- [ ] App preview video (optional)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Keywords optimized
- [ ] Age rating set
- [ ] In-app purchases configured (if any)

### Post-Release
- [ ] Monitor crash reports (first 24h)
- [ ] Check reviews/ratings
- [ ] Monitor backend logs (cron jobs)
- [ ] Check notification delivery rate
- [ ] A/B test conversion rates

---

## 🆘 Yaygın Sorunlar ve Çözümler

### Sorun: "Push token alınamadı"
```
Neden: Simulator kullanılıyor
Çözüm: Fiziksel iPhone kullan
```

### Sorun: "Favoriye eklemiyor"
```
Neden: toggleFavorite product_id yerine product objesi bekliyor
Çözüm: toggleFavorite(product) şeklinde çağır
```

### Sorun: "last_updated görünmüyor"
```
Neden: API'den gelmiyor
Çözüm: Backend'de Product response'a ekle
```

### Sorun: "BAI çalışmıyor"
```
Kontroller:
1. API endpoint çalışıyor mu?
2. Internet bağlantısı var mı?
3. Product ID doğru mu?
4. Backend logs kontrol et
```

---

**Test Tarihi:** _______________
**Test Eden:** _______________
**Cihaz:** _______________
**iOS Version:** _______________
**App Version:** _______________
**Durum:** ⬜ Passed / ⬜ Failed

---

**Son Güncelleme:** 2025-10-31
**Versiyon:** 1.0.0
