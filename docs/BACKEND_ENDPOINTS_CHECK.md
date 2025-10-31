# 🔍 Backend API Endpoints Quick Check

Bu döküman, mobil uygulama başladığında 404 hatası alınmaması için backend'de olması gereken endpoint'leri listeler.

---

## ❌ Hatayı Gördüyseniz

```
ERROR  ❌ Device registration failed: [AxiosError: Request failed with status code 404]
```

**Neden:** Backend'de `/api/notifications/register-device` endpoint'i yok veya yanlış yapılandırılmış.

**Çözüm:** Aşağıdaki endpoint'lerin backend'de aktif olduğundan emin olun.

---

## ✅ Gerekli Backend Endpoints

### 1. Device Registration (ZORUNLU)
```
POST https://bazenda.com/api/notifications/register-device

Request Body:
{
  "device_id": "ios_1730000000_abc123",
  "expo_push_token": "ExponentPushToken[xxxxx]",
  "platform": "ios" | "android",
  "app_version": "1.0.0"
}

Response:
{
  "success": true,
  "message": "Device registered successfully"
}
```

**CodeIgniter 4 Route:**
```php
// app/Config/Routes.php
$routes->group('api/notifications', function($routes) {
    $routes->post('register-device', 'NotificationController::registerDevice');
});
```

---

### 2. Favorites Sync (ZORUNLU)
```
POST https://bazenda.com/api/notifications/sync-favorites

Request Body:
{
  "device_id": "ios_1730000000_abc123",
  "favorites": [
    {
      "product_id": "123456",
      "current_price": 299.99
    }
  ]
}

Response:
{
  "success": true,
  "message": "Favorites synced"
}
```

**CodeIgniter 4 Route:**
```php
$routes->post('sync-favorites', 'NotificationController::syncFavorites');
```

---

### 3. Add Single Favorite (ZORUNLU)
```
POST https://bazenda.com/api/notifications/add-favorite

Request Body:
{
  "device_id": "ios_1730000000_abc123",
  "product_id": "123456",
  "current_price": 299.99
}

Response:
{
  "success": true
}
```

**CodeIgniter 4 Route:**
```php
$routes->post('add-favorite', 'NotificationController::addFavorite');
```

---

### 4. Remove Favorite (ZORUNLU)
```
POST https://bazenda.com/api/notifications/remove-favorite

Request Body:
{
  "device_id": "ios_1730000000_abc123",
  "product_id": "123456"
}

Response:
{
  "success": true
}
```

**CodeIgniter 4 Route:**
```php
$routes->post('remove-favorite', 'NotificationController::removeFavorite');
```

---

### 5. Cron Job - Price Check (ZORUNLU)
```
GET https://bazenda.com/api/cron/check-prices

Headers:
X-Cron-Secret: YOUR_SECRET_KEY

Response:
{
  "success": true,
  "checked_products": 150,
  "price_changes": 5,
  "notifications_sent": 3
}
```

**CodeIgniter 4 Route:**
```php
// app/Config/Routes.php
$routes->group('api/cron', function($routes) {
    $routes->get('check-prices', 'CronController::checkPrices');
});
```

---

## 🧪 Endpoint Test Komutları

### Test 1: Device Registration
```bash
curl -X POST https://bazenda.com/api/notifications/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device_123",
    "expo_push_token": "ExponentPushToken[test]",
    "platform": "ios",
    "app_version": "1.0.0"
  }'

# Beklenen Output:
# {"success":true,"message":"Device registered successfully"}
```

### Test 2: Add Favorite
```bash
curl -X POST https://bazenda.com/api/notifications/add-favorite \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device_123",
    "product_id": "123456",
    "current_price": 299.99
  }'

# Beklenen Output:
# {"success":true}
```

### Test 3: Cron Job
```bash
curl -H "X-Cron-Secret: YOUR_SECRET_KEY" \
  https://bazenda.com/api/cron/check-prices

# Beklenen Output:
# {"success":true,"checked_products":150,...}
```

---

## 📦 Gerekli Database Tabloları

### 1. device_tokens
```sql
CREATE TABLE device_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  expo_push_token VARCHAR(255) NOT NULL,
  platform ENUM('ios', 'android', 'web') NOT NULL,
  app_version VARCHAR(50),
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_device_id (device_id),
  INDEX idx_expo_token (expo_push_token),
  INDEX idx_is_active (is_active)
);
```

### 2. user_favorites_tracking
```sql
CREATE TABLE user_favorites_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  last_checked_price DECIMAL(10,2),
  price_change_amount DECIMAL(10,2),
  last_notification_sent DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_device_product (device_id, product_id),
  INDEX idx_device_id (device_id),
  INDEX idx_product_id (product_id)
);
```

### 3. price_change_notifications
```sql
CREATE TABLE price_change_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  old_price DECIMAL(10,2) NOT NULL,
  new_price DECIMAL(10,2) NOT NULL,
  price_change DECIMAL(10,2) NOT NULL,
  notification_sent TINYINT(1) DEFAULT 0,
  push_response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_device_id (device_id),
  INDEX idx_notification_sent (notification_sent)
);
```

---

## 🚦 Backend Hazır mı Kontrol Et

```bash
# 1. Tüm endpoint'leri test et
bash test_endpoints.sh

# 2. Database tablolarını kontrol et
mysql -u root -p bazenda_db -e "SHOW TABLES LIKE '%notif%'"

# Beklenen Output:
# device_tokens
# user_favorites_tracking
# price_change_notifications

# 3. Routes dosyasını kontrol et
cat app/Config/Routes.php | grep notifications

# 4. Controller'ı kontrol et
ls -la app/Controllers/NotificationController.php

# 5. Cron job çalışıyor mu?
curl -H "X-Cron-Secret: SECRET" https://bazenda.com/api/cron/check-prices
```

---

## 🔧 Hızlı Kurulum (Backend)

### 1. Controller Oluştur
```bash
cd /path/to/bazenda-backend
cp docs/BACKEND_INTEGRATION.md app/Controllers/NotificationController.php
```

### 2. Routes Ekle
```php
// app/Config/Routes.php
$routes->group('api', function($routes) {
    $routes->group('notifications', function($routes) {
        $routes->post('register-device', 'NotificationController::registerDevice');
        $routes->post('sync-favorites', 'NotificationController::syncFavorites');
        $routes->post('add-favorite', 'NotificationController::addFavorite');
        $routes->post('remove-favorite', 'NotificationController::removeFavorite');
    });

    $routes->group('cron', function($routes) {
        $routes->get('check-prices', 'CronController::checkPrices');
    });
});
```

### 3. Database Migration
```bash
php spark migrate:create create_notification_tables
# Edit migration file
php spark migrate
```

### 4. Test
```bash
curl -X POST https://bazenda.com/api/notifications/register-device \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test","expo_push_token":"test","platform":"ios","app_version":"1.0.0"}'
```

---

## ⚠️ Mobil Uygulama Davranışı

### Backend Endpoint Yoksa:
```javascript
// Mobil uygulama şunu gösterir:
⚠️  Backend notification endpoint not found (404)
⚠️  Please check: https://bazenda.com/api/notifications/register-device
⚠️  Notification system will be disabled until backend is ready

// Ama uygulama çalışmaya devam eder!
✅ Tüm servisler başlatıldı
ℹ️  Fiyat kontrolü backend cron job tarafından yapılıyor
```

**Önemli:** Mobil uygulama backend endpoints olmasa bile çalışır! Sadece bildirimler devre dışı kalır.

---

## 📚 İlgili Dökümanlar

- `docs/BACKEND_INTEGRATION.md` - Tam backend implementasyon kodu
- `docs/CRON_SETUP.md` - Cron job kurulum detayları
- `docs/PUSH_NOTIFICATIONS_SETUP.md` - Push notification kurulumu

---

## 🆘 Sorun Giderme

### 404 Hatası Alıyorum
- [ ] Backend'de Routes.php kontrol et
- [ ] Controller dosyası var mı?
- [ ] Apache/Nginx rewrite rules aktif mi?
- [ ] .htaccess dosyası doğru mu?

### 500 Internal Server Error
- [ ] PHP error log kontrol et
- [ ] Database bağlantısı çalışıyor mu?
- [ ] Tablolar oluşturulmuş mu?

### Backend Ready Ama 404
- [ ] CodeIgniter environment (development/production)?
- [ ] Base URL doğru mu? (app/Config/App.php)
- [ ] mod_rewrite aktif mi?

---

**Son Güncelleme:** 2025-10-31
**Mobil App Version:** 1.0.0
**Backend Requirement:** CodeIgniter 4.x
