# Backend Entegrasyon Kontrol Listesi

## ✅ Veritabanı (CodeIgniter 4)

- [ ] `device_tokens` tablosunu oluştur
- [ ] `user_favorites_tracking` tablosunu oluştur
- [ ] `price_change_notifications` tablosunu oluştur
- [ ] Indexleri kontrol et (performance için önemli)

## ✅ Models

- [ ] `DeviceTokenModel.php` oluştur
- [ ] `FavoritesTrackingModel.php` oluştur
- [ ] `PriceChangeNotificationModel.php` oluştur

## ✅ Services

- [ ] `ExpoPushService.php` oluştur
- [ ] Expo API URL'ini doğrula
- [ ] Token validation ekle

## ✅ Controllers

- [ ] `NotificationController.php` oluştur
  - [ ] `registerDevice()` endpoint
  - [ ] `unregisterDevice()` endpoint
  - [ ] `syncFavorites()` endpoint
  - [ ] `addFavorite()` endpoint (opsiyonel)
  - [ ] `removeFavorite()` endpoint (opsiyonel)

- [ ] `CronController.php` oluştur
  - [ ] `checkPrices()` endpoint
  - [ ] Security kontrolü (secret key veya IP whitelist)
  - [ ] Rate limiting
  - [ ] Error handling

## ✅ Routes

- [ ] `app/Config/Routes.php` güncelle
- [ ] API endpoints test et

## ✅ Environment

- [ ] `.env` dosyasına `CRON_SECRET_KEY` ekle
- [ ] Production ve development ortamlarını ayır

## ✅ Cron Job

- [ ] cPanel'de cron job ekle VEYA
- [ ] SSH crontab yapılandır
- [ ] Log rotation ayarla
- [ ] Test et ve çalıştığını doğrula

## ✅ Mobil Uygulama (React Native)

- [ ] `backend.service.ts` ekle
- [ ] `NotificationService` güncelle - backend entegrasyonu
- [ ] `favoritesStore.ts` güncelle - backend sync
- [ ] `App.tsx` güncelle - deep linking
- [ ] `app.json` güncelle - deep link scheme

## ✅ Testing

- [ ] Device registration test et
- [ ] Favorite sync test et
- [ ] Cron job manuel çalıştır
- [ ] Notification gönderimini test et
- [ ] Deep linking test et
- [ ] End-to-end test yap

## ✅ Monitoring

- [ ] Cron log dosyası oluştur
- [ ] Error notification sistemi kur (mail, Slack, vb.)
- [ ] Expo push receipt kontrolü ekle
- [ ] Database performance monitoring

## ✅ Security

- [ ] Cron endpoint'ini koru (secret key)
- [ ] SQL injection koruması
- [ ] Rate limiting ekle
- [ ] HTTPS kullan (production'da zorunlu)

## ✅ Production

- [ ] Tüm endpoint'leri test et
- [ ] Load testing yap
- [ ] Error handling kontrol et
- [ ] Backup stratejisi oluştur
- [ ] Rollback planı hazırla

---

## Hızlı Test Komutları

### Backend Test:
```bash
# Device registration
curl -X POST https://bazenda.com/api/notifications/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device_123",
    "expo_push_token": "ExponentPushToken[xxxxxxxxxxxxx]",
    "platform": "ios",
    "app_version": "1.0.0"
  }'

# Favorites sync
curl -X POST https://bazenda.com/api/notifications/sync-favorites \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device_123",
    "favorites": [
      {
        "product_id": "12345",
        "current_price": 199.99
      }
    ]
  }'

# Cron test
curl -H "X-Cron-Secret: YOUR_SECRET_KEY" \
     https://bazenda.com/api/cron/check-prices
```

### Expo Push Test:
```bash
curl -H "Content-Type: application/json" \
  -X POST https://exp.host/--/api/v2/push/send \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxxxxx]",
    "sound": "default",
    "title": "Test",
    "body": "Test notification",
    "data": {"test": true}
  }'
```

---

## Önemli Notlar

1. **Expo Push Token Format**: `ExponentPushToken[xxxx]` formatında olmalı
2. **Device ID**: Her cihaz için unique olmalı, AsyncStorage'da saklanmalı
3. **Cron Frequency**: Başlangıçta 1 saat, sonra ihtiyaca göre ayarlayın
4. **Rate Limiting**: API'yi aşırı yüklememek için her istek arasında bekleme ekleyin
5. **Error Handling**: Cron job hata verse bile devam etmeli
6. **Notification Threshold**: Sadece önemli fiyat değişikliklerinde bildir

---

## Sonraki Adımlar

1. Backend kodu hazırla ve test et
2. Mobil uygulamayı güncelle
3. Test cihazlarda dene
4. Production'a deploy et
5. Monitoring ve log'ları takip et
6. Kullanıcı feedback'ine göre optimize et
