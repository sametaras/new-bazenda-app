# 📱 Notifications API Documentation

> **⚠️ ÖNEMLI:** Bu dokümantasyon **BACKEND PROJESİ** için hazırlanmıştır.
> Bu mobil uygulama projesinde sadece referans amaçlıdır.
> Backend ekibi bu dokümana göre PHP API'lerini ve database'i güncelleyecektir.

Bildirimler sistemi - Kullanıcılar geçmiş bildirimlerini görebilir, tıklayıp ürüne gidebilir.

## 🎯 Backend Ekibi Ne Yapacak?

1. **Database:** `push_notifications` tablosunu oluştur (SQL aşağıda)
2. **Model:** `app/Models/PushNotificationModel.php` ekle
3. **Controller:** `app/Controllers/NApi/NotificationController.php`'ye 5 yeni metot ekle
4. **Routes:** `app/Config/Routes.php`'ye yeni endpoint'leri ekle
5. **Cron Job:** Mevcut fiyat kontrolü yapan script'i güncelle (bildirim göndermeden önce DB'ye kaydet)

---

## 📋 Özellikler

- ✅ **Bildirim Geçmişi**: Tüm geçmiş bildirimler listelenir
- ✅ **Okunmamış Badge**: Tab bar'da okunmamış bildirim sayısı gösterilir
- ✅ **Bildirime Tıklama**: Direkt ürün linkine gider
- ✅ **Okundu İşaretleme**: Tıklayınca otomatik okundu olarak işaretlenir
- ✅ **device_id Persistence**: Uygulama silinmedikçe değişmez

---

## 🗄️ Veritabanı Tablosu

### `push_notifications` Tablosu

```sql
CREATE TABLE `push_notifications` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `device_id` VARCHAR(255) NOT NULL,
  `expo_push_token` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NOT NULL,
  `data` JSON DEFAULT NULL,
  `notification_type` ENUM('price_drop', 'price_increase', 'general', 'promo') DEFAULT 'price_drop',
  `product_id` VARCHAR(100) DEFAULT NULL,
  `product_link` TEXT DEFAULT NULL,
  `old_price` DECIMAL(10,2) DEFAULT NULL,
  `new_price` DECIMAL(10,2) DEFAULT NULL,
  `sent_at` DATETIME NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `read_at` DATETIME DEFAULT NULL,
  `expo_response` JSON DEFAULT NULL,
  `status` ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_sent_at` (`sent_at`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🔌 API Endpoints

### 1. **POST** `/api/notifications/send-notification`

Bildirim gönder (önce veritabanına kaydet, sonra Expo'ya gönder)

**Request Body:**
```json
{
  "device_id": "ios_1234567890_abc",
  "expo_push_token": "ExponentPushToken[xxxxx]",
  "title": "🎉 Fiyat Düştü!",
  "body": "Defacto Erkek Pantolon\n100 ₺ düştü (25%)",
  "notification_type": "price_drop",
  "product_id": "12345",
  "product_link": "https://bazenda.com/product/12345",
  "old_price": 399.99,
  "new_price": 299.99,
  "data": {
    "type": "price_drop",
    "product_id": "12345",
    "screen": "Favorites"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "notification_id": 123,
  "expo_response": {
    "status": "ok",
    "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
  }
}
```

---

### 2. **GET** `/api/notifications/get-notifications`

Cihazın tüm bildirimlerini getir

**Query Parameters:**
- `device_id` (required): Cihaz ID
- `limit` (optional, default: 50): Kaç bildirim
- `offset` (optional, default: 0): Sayfalama
- `unread_only` (optional, default: false): Sadece okunmamışlar

**Request:**
```
GET /api/notifications/get-notifications?device_id=ios_1234567890_abc&limit=50&offset=0
```

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 123,
      "title": "🎉 Fiyat Düştü!",
      "body": "Defacto Erkek Pantolon\n100 ₺ düştü (25%)",
      "notification_type": "price_drop",
      "product_id": "12345",
      "product_link": "https://bazenda.com/product/12345",
      "old_price": 399.99,
      "new_price": 299.99,
      "sent_at": "2025-01-15 14:30:00",
      "is_read": 0,
      "read_at": null,
      "data": {
        "type": "price_drop",
        "product_id": "12345"
      }
    }
  ],
  "total_count": 156,
  "unread_count": 12
}
```

---

### 3. **POST** `/api/notifications/mark-as-read`

Bildirimi okundu olarak işaretle

**Request Body:**
```json
{
  "notification_id": 123,
  "device_id": "ios_1234567890_abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 4. **POST** `/api/notifications/mark-all-read`

Tüm bildirimleri okundu olarak işaretle

**Request Body:**
```json
{
  "device_id": "ios_1234567890_abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "updated_count": 12
}
```

---

### 5. **DELETE** `/api/notifications/delete-notification`

Bildirimi sil

**Request Body:**
```json
{
  "notification_id": 123,
  "device_id": "ios_1234567890_abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## 🔧 Controller: `NotificationController.php`

### Güncellenecek Fonksiyonlar:

#### `sendNotification()` - YENİ

```php
/**
 * POST /api/notifications/send-notification
 * Bildirim gönder (önce DB'ye kaydet, sonra Expo'ya gönder)
 */
public function sendNotification()
{
    $json = $this->request->getJSON(true);

    $validation = \Config\Services::validation();
    $validation->setRules([
        'device_id' => 'required',
        'expo_push_token' => 'required',
        'title' => 'required|max_length[255]',
        'body' => 'required',
        'notification_type' => 'permit_empty|in_list[price_drop,price_increase,general,promo]',
    ]);

    if (!$validation->run($json)) {
        return $this->response->setJSON([
            'success' => false,
            'errors' => $validation->getErrors()
        ])->setStatusCode(400);
    }

    try {
        // 1. Önce veritabanına kaydet
        $notificationModel = new PushNotificationModel();
        $notificationId = $notificationModel->insert([
            'device_id' => $json['device_id'],
            'expo_push_token' => $json['expo_push_token'],
            'title' => $json['title'],
            'body' => $json['body'],
            'data' => json_encode($json['data'] ?? []),
            'notification_type' => $json['notification_type'] ?? 'general',
            'product_id' => $json['product_id'] ?? null,
            'product_link' => $json['product_link'] ?? null,
            'old_price' => $json['old_price'] ?? null,
            'new_price' => $json['new_price'] ?? null,
            'sent_at' => date('Y-m-d H:i:s'),
            'status' => 'pending',
        ]);

        // 2. Expo'ya gönder
        $expoPushService = new ExpoPushService();
        $result = $expoPushService->sendNotification(
            $json['expo_push_token'],
            [
                'title' => $json['title'],
                'body' => $json['body'],
                'data' => $json['data'] ?? [],
            ]
        );

        // 3. Sonucu güncelle
        $status = $result['success'] ? 'sent' : 'failed';
        $notificationModel->update($notificationId, [
            'status' => $status,
            'expo_response' => json_encode($result),
        ]);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Notification sent successfully',
            'notification_id' => $notificationId,
            'expo_response' => $result,
        ]);

    } catch (\Exception $e) {
        log_message('error', 'Send notification error: ' . $e->getMessage());
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Failed to send notification'
        ])->setStatusCode(500);
    }
}
```

#### `getNotifications()` - YENİ

```php
/**
 * GET /api/notifications/get-notifications
 * Cihazın bildirimlerini getir
 */
public function getNotifications()
{
    $deviceId = $this->request->getGet('device_id');
    $limit = $this->request->getGet('limit') ?? 50;
    $offset = $this->request->getGet('offset') ?? 0;
    $unreadOnly = $this->request->getGet('unread_only') ?? false;

    if (!$deviceId) {
        return $this->response->setJSON([
            'success' => false,
            'message' => 'device_id is required'
        ])->setStatusCode(400);
    }

    try {
        $notificationModel = new PushNotificationModel();

        $builder = $notificationModel->where('device_id', $deviceId);

        if ($unreadOnly) {
            $builder->where('is_read', 0);
        }

        // Toplam sayı
        $totalCount = $builder->countAllResults(false);
        $unreadCount = $notificationModel->where('device_id', $deviceId)
                                        ->where('is_read', 0)
                                        ->countAllResults();

        // Bildirimleri getir (en yeni önce)
        $notifications = $builder->orderBy('sent_at', 'DESC')
                               ->limit($limit, $offset)
                               ->find();

        // JSON data'yı decode et
        foreach ($notifications as &$notification) {
            $notification['data'] = json_decode($notification['data'], true);
            $notification['expo_response'] = json_decode($notification['expo_response'], true);
        }

        return $this->response->setJSON([
            'success' => true,
            'notifications' => $notifications,
            'total_count' => $totalCount,
            'unread_count' => $unreadCount,
        ]);

    } catch (\Exception $e) {
        log_message('error', 'Get notifications error: ' . $e->getMessage());
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Failed to get notifications'
        ])->setStatusCode(500);
    }
}
```

#### `markAsRead()` - YENİ

```php
/**
 * POST /api/notifications/mark-as-read
 * Bildirimi okundu olarak işaretle
 */
public function markAsRead()
{
    $json = $this->request->getJSON(true);

    if (!isset($json['notification_id']) || !isset($json['device_id'])) {
        return $this->response->setJSON([
            'success' => false,
            'message' => 'notification_id and device_id are required'
        ])->setStatusCode(400);
    }

    try {
        $notificationModel = new PushNotificationModel();

        $updated = $notificationModel->where('id', $json['notification_id'])
                                     ->where('device_id', $json['device_id'])
                                     ->set([
                                         'is_read' => 1,
                                         'read_at' => date('Y-m-d H:i:s')
                                     ])
                                     ->update();

        if ($updated) {
            return $this->response->setJSON([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);
        } else {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Notification not found'
            ])->setStatusCode(404);
        }

    } catch (\Exception $e) {
        log_message('error', 'Mark as read error: ' . $e->getMessage());
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Failed to mark as read'
        ])->setStatusCode(500);
    }
}
```

#### `markAllRead()` - YENİ

```php
/**
 * POST /api/notifications/mark-all-read
 * Tüm bildirimleri okundu olarak işaretle
 */
public function markAllRead()
{
    $json = $this->request->getJSON(true);

    if (!isset($json['device_id'])) {
        return $this->response->setJSON([
            'success' => false,
            'message' => 'device_id is required'
        ])->setStatusCode(400);
    }

    try {
        $notificationModel = new PushNotificationModel();

        $updated = $notificationModel->where('device_id', $json['device_id'])
                                     ->where('is_read', 0)
                                     ->set([
                                         'is_read' => 1,
                                         'read_at' => date('Y-m-d H:i:s')
                                     ])
                                     ->update();

        return $this->response->setJSON([
            'success' => true,
            'message' => 'All notifications marked as read',
            'updated_count' => $notificationModel->affectedRows()
        ]);

    } catch (\Exception $e) {
        log_message('error', 'Mark all read error: ' . $e->getMessage());
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Failed to mark all as read'
        ])->setStatusCode(500);
    }
}
```

#### `deleteNotification()` - YENİ

```php
/**
 * DELETE /api/notifications/delete-notification
 * Bildirimi sil
 */
public function deleteNotification()
{
    $json = $this->request->getJSON(true);

    if (!isset($json['notification_id']) || !isset($json['device_id'])) {
        return $this->response->setJSON([
            'success' => false,
            'message' => 'notification_id and device_id are required'
        ])->setStatusCode(400);
    }

    try {
        $notificationModel = new PushNotificationModel();

        $deleted = $notificationModel->where('id', $json['notification_id'])
                                     ->where('device_id', $json['device_id'])
                                     ->delete();

        if ($deleted) {
            return $this->response->setJSON([
                'success' => true,
                'message' => 'Notification deleted'
            ]);
        } else {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Notification not found'
            ])->setStatusCode(404);
        }

    } catch (\Exception $e) {
        log_message('error', 'Delete notification error: ' . $e->getMessage());
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Failed to delete notification'
        ])->setStatusCode(500);
    }
}
```

---

## 📝 Model: `PushNotificationModel.php`

`app/Models/PushNotificationModel.php` oluşturun:

```php
<?php

namespace App\Models;

use CodeIgniter\Model;

class PushNotificationModel extends Model
{
    protected $table = 'push_notifications';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;

    protected $allowedFields = [
        'device_id',
        'expo_push_token',
        'title',
        'body',
        'data',
        'notification_type',
        'product_id',
        'product_link',
        'old_price',
        'new_price',
        'sent_at',
        'is_read',
        'read_at',
        'expo_response',
        'status',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    // Validation
    protected $validationRules = [];
    protected $validationMessages = [];
    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert = [];
    protected $afterInsert = [];
    protected $beforeUpdate = [];
    protected $afterUpdate = [];
    protected $beforeFind = [];
    protected $afterFind = [];
    protected $beforeDelete = [];
    protected $afterDelete = [];

    /**
     * Cihazın okunmamış bildirim sayısını getir
     */
    public function getUnreadCount(string $deviceId): int
    {
        return $this->where('device_id', $deviceId)
                    ->where('is_read', 0)
                    ->countAllResults();
    }

    /**
     * Eski bildirimleri temizle (30 günden eski)
     */
    public function cleanOldNotifications(int $daysOld = 30): int
    {
        $date = date('Y-m-d H:i:s', strtotime("-{$daysOld} days"));

        return $this->where('sent_at <', $date)
                    ->delete();
    }
}
```

---

## 🔄 Routes Ekle

`app/Config/Routes.php` dosyasına ekleyin:

```php
$routes->group('api/notifications', ['namespace' => 'App\Controllers\NApi'], function($routes) {
    // Mevcut route'lar
    $routes->post('register-device', 'NotificationController::registerDevice');
    $routes->post('unregister-device', 'NotificationController::unregisterDevice');
    $routes->post('sync-favorites', 'NotificationController::syncFavorites');
    $routes->post('add-favorite', 'NotificationController::addFavorite');
    $routes->post('remove-favorite', 'NotificationController::removeFavorite');

    // YENİ ROUTE'LAR
    $routes->post('send-notification', 'NotificationController::sendNotification');
    $routes->get('get-notifications', 'NotificationController::getNotifications');
    $routes->post('mark-as-read', 'NotificationController::markAsRead');
    $routes->post('mark-all-read', 'NotificationController::markAllRead');
    $routes->delete('delete-notification', 'NotificationController::deleteNotification');
});
```

---

## ⚙️ Cron Job Güncelleme

**NOT:** Backend projesindeki mevcut cron job kodunu (fiyat kontrolü yapan scripti) güncellemeniz gerekiyor.

### Değişiklik Nedir?

Şu anda cron job muhtemelen bildirim gönderirken sadece Expo Push API'yi kullanıyordur. Artık **önce veritabanına kaydetmeli, sonra göndermelidir**.

### Örnek Güncelleme:

Mevcut cron job kodunuzda bildirim gönderen kısımda:

```php
// ❌ ESKİ YOL: Direkt Expo'ya gönderiyordunuz
$expoPushService = new ExpoPushService();
$expoPushService->sendPriceDropNotification(
    $device['expo_push_token'],
    $product['product_title'],
    $oldPrice,
    $newPrice,
    $product['product_id']
);

// ✅ YENİ YOL: Önce DB'ye kaydet, sonra gönder
// sendNotification endpoint'ini kullan (yukarıdaki fonksiyon otomatik olarak önce DB'ye kaydeder)

// Seçenek 1: Controller metodunu kullan
$notificationController = new \App\Controllers\NApi\NotificationController();
$request = new \CodeIgniter\HTTP\IncomingRequest(); // Mock request
$notificationController->sendNotification();

// VEYA Seçenek 2: HTTP request at (daha güvenli)
$client = \Config\Services::curlrequest();
$response = $client->post('http://localhost/api/notifications/send-notification', [
    'json' => [
        'device_id' => $device['device_id'],
        'expo_push_token' => $device['expo_push_token'],
        'title' => '🎉 Fiyat Düştü!',
        'body' => "{$product['product_title']}\n{$priceDrop} ₺ düştü ({$percentage}%)",
        'notification_type' => 'price_drop',
        'product_id' => $product['product_id'],
        'product_link' => $product['app_product_link'],
        'old_price' => $oldPrice,
        'new_price' => $newPrice,
        'data' => [
            'type' => 'price_drop',
            'product_id' => $product['product_id'],
            'screen' => 'Favorites'
        ]
    ]
]);

// VEYA Seçenek 3: Model'i direkt kullan (en basit)
$notificationModel = new \App\Models\PushNotificationModel();
$notificationId = $notificationModel->insert([
    'device_id' => $device['device_id'],
    'expo_push_token' => $device['expo_push_token'],
    'title' => '🎉 Fiyat Düştü!',
    'body' => "{$product['product_title']}\n{$priceDrop} ₺ düştü ({$percentage}%)",
    'notification_type' => 'price_drop',
    'product_id' => $product['product_id'],
    'product_link' => $product['app_product_link'],
    'old_price' => $oldPrice,
    'new_price' => $newPrice,
    'sent_at' => date('Y-m-d H:i:s'),
    'status' => 'pending',
]);

// Sonra Expo'ya gönder
$expoPushService = new ExpoPushService();
$result = $expoPushService->sendPriceDropNotification(...);

// Sonucu güncelle
$notificationModel->update($notificationId, [
    'status' => $result['success'] ? 'sent' : 'failed',
    'expo_response' => json_encode($result),
]);
```

### Hangi Yöntemi Kullanmalıyım?

- **Seçenek 3 (Model direkt)** - En basit ve hızlı, cron job içinde kullanmak için ideal
- **Seçenek 2 (HTTP)** - Daha güvenli, rate limiting varsa iyi
- **Seçenek 1 (Controller)** - Karmaşık, önerilmez

---

## 🔐 Device ID Persistence

### Evet, `device_id` DEĞİŞMEZ! ✅

**Neden:**
```javascript
// src/services/backend/backend.service.ts
const DEVICE_ID_KEY = 'bazenda_device_id';

async getDeviceId(): Promise<string> {
  // 1. Memory'den kontrol
  if (this.deviceId) {
    return this.deviceId;
  }

  // 2. AsyncStorage'dan kontrol
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) {
    this.deviceId = stored;
    return stored; // ✅ VARSA DÖNDÜR (kalıcı!)
  }

  // 3. Sadece ilk seferde yeni ID oluştur
  const newId = this.generateDeviceId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
  this.deviceId = newId;

  return newId;
}
```

**Değişme Durumları:**
- ❌ Uygulama kapatılınca: DEĞİŞMEZ (AsyncStorage kalıcı)
- ❌ Telefon yeniden başlatılınca: DEĞİŞMEZ
- ❌ Uygulama güncellenince: DEĞİŞMEZ
- ✅ **Sadece uygulama silinip yeniden yüklenince DEĞİŞİR**

---

## 📊 Test Senaryoları

### Test 1: Bildirim Gönder ve Kaydet
```bash
curl -X POST https://bazenda.com/api/notifications/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "ios_1234567890_abc",
    "expo_push_token": "ExponentPushToken[xxxxx]",
    "title": "Test Bildirimi",
    "body": "Test mesajı",
    "notification_type": "general"
  }'
```

### Test 2: Bildirimleri Getir
```bash
curl "https://bazenda.com/api/notifications/get-notifications?device_id=ios_1234567890_abc&limit=20"
```

### Test 3: Okundu İşaretle
```bash
curl -X POST https://bazenda.com/api/notifications/mark-as-read \
  -H "Content-Type: application/json" \
  -d '{
    "notification_id": 123,
    "device_id": "ios_1234567890_abc"
  }'
```

---

## ✅ Checklist

Backend tarafında yapılması gerekenler:

- [ ] `push_notifications` tablosunu oluştur
- [ ] `PushNotificationModel.php` ekle
- [ ] `NotificationController.php` güncelle
  - [ ] `sendNotification()` fonksiyonu
  - [ ] `getNotifications()` fonksiyonu
  - [ ] `markAsRead()` fonksiyonu
  - [ ] `markAllRead()` fonksiyonu
  - [ ] `deleteNotification()` fonksiyonu
- [ ] Routes'a yeni endpoint'leri ekle
- [ ] Cron job'u güncelle (DB'ye kayıt)
- [ ] Test et!

---

## 🎯 Sonuç

Bu sistem ile:
- ✅ Her bildirim veritabanına kaydedilir
- ✅ Kullanıcılar geçmiş bildirimlerini görebilir
- ✅ Okunmamış badge gösterilir
- ✅ Tıklayınca ürün linkine gider
- ✅ device_id kalıcıdır (uygulama silinmedikçe)
- ✅ Bildirimler organize ve yönetilebilir!

Şimdi mobil tarafı kodlayalım! 🚀
