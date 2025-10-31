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

### Tam CronController.php Kodu (Referans)

Eğer backend projenizde henüz CronController yoksa, işte tam kod örneği:

**`app/Controllers/Api/CronController.php`**

```php
<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\FavoritesTrackingModel;
use App\Models\DeviceTokenModel;
use App\Models\PriceChangeNotificationModel;
use App\Models\PushNotificationModel;
use App\Services\ExpoPushService;

class CronController extends BaseController
{
    protected $favoritesModel;
    protected $deviceTokenModel;
    protected $notificationLogModel;
    protected $pushNotificationModel;
    protected $expoPushService;

    public function __construct()
    {
        $this->favoritesModel = new FavoritesTrackingModel();
        $this->deviceTokenModel = new DeviceTokenModel();
        $this->notificationLogModel = new PriceChangeNotificationModel();
        $this->pushNotificationModel = new PushNotificationModel();
        $this->expoPushService = new ExpoPushService();
    }

    /**
     * GET /api/cron/check-prices
     * Fiyatları kontrol et ve bildirim gönder
     *
     * Cron: */15 * * * * (Her 15 dakikada bir)
     * veya
     * Cron: 0 * * * * (Her saat başı)
     */
    public function checkPrices()
    {
        // Güvenlik kontrolü - sadece localhost veya belirli IP'lerden
        if (!$this->isAuthorizedCronRequest()) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Unauthorized'
            ])->setStatusCode(403);
        }

        $startTime = microtime(true);
        $stats = [
            'checked' => 0,
            'price_changed' => 0,
            'notifications_sent' => 0,
            'errors' => 0
        ];

        try {
            // Tüm aktif favorileri al
            $favorites = $this->favoritesModel->getActiveFavorites();

            foreach ($favorites as $favorite) {
                $stats['checked']++;

                try {
                    // Güncel fiyatı API'den al (mevcut get_results endpoint'inizi kullanın)
                    $currentPrice = $this->getCurrentProductPrice($favorite['product_id']);

                    if ($currentPrice === null) {
                        log_message('warning', "Price not found for product: {$favorite['product_id']}");
                        continue;
                    }

                    $oldPrice = (float) $favorite['last_checked_price'];
                    $priceDiff = $currentPrice - $oldPrice;
                    $priceChangePercentage = ($priceDiff / $oldPrice) * 100;

                    // Fiyat güncelle
                    $this->favoritesModel->updatePrice($favorite['id'], $currentPrice);

                    // Önemli değişiklik var mı kontrol et
                    $shouldNotify = $this->shouldSendNotification(
                        $oldPrice,
                        $currentPrice,
                        $favorite['last_notified_price'],
                        (float) $favorite['price_change_threshold']
                    );

                    if ($shouldNotify) {
                        $stats['price_changed']++;

                        // Device token'ı al
                        $deviceTokens = $this->deviceTokenModel->getActiveTokens([
                            $favorite['device_id']
                        ]);

                        if (empty($deviceTokens)) {
                            log_message('warning', "No active tokens for device: {$favorite['device_id']}");
                            continue;
                        }

                        // Ürün bilgilerini al
                        $product = $this->getProductDetails($favorite['product_id']);
                        $productTitle = $product['product_title'] ?? 'Ürün';
                        $productLink = $product['app_product_link'] ?? null;

                        foreach ($deviceTokens as $token) {
                            // ✅ YENİ: Önce DB'ye kaydet
                            $notificationType = $priceDiff < 0 ? 'price_drop' : 'price_increase';
                            $title = $priceDiff < 0 ? '🎉 Fiyat Düştü!' : '📈 Fiyat Değişikliği';
                            $priceDiffAbs = abs($priceDiff);
                            $percentage = round(abs($priceChangePercentage), 1);
                            $body = "{$productTitle}\n{$priceDiffAbs} ₺ " .
                                   ($priceDiff < 0 ? 'düştü' : 'arttı') .
                                   " ({$percentage}%)";

                            $notificationId = $this->pushNotificationModel->insert([
                                'device_id' => $favorite['device_id'],
                                'expo_push_token' => $token['expo_push_token'],
                                'title' => $title,
                                'body' => $body,
                                'data' => json_encode([
                                    'type' => $notificationType,
                                    'product_id' => $favorite['product_id'],
                                    'screen' => 'Favorites'
                                ]),
                                'notification_type' => $notificationType,
                                'product_id' => $favorite['product_id'],
                                'product_link' => $productLink,
                                'old_price' => $oldPrice,
                                'new_price' => $currentPrice,
                                'sent_at' => date('Y-m-d H:i:s'),
                                'status' => 'pending',
                            ]);

                            // Sonra Expo'ya gönder
                            $response = $priceDiff < 0
                                ? $this->expoPushService->sendPriceDropNotification(
                                    $token['expo_push_token'],
                                    $productTitle,
                                    $oldPrice,
                                    $currentPrice,
                                    $favorite['product_id']
                                )
                                : $this->expoPushService->sendPriceIncreaseNotification(
                                    $token['expo_push_token'],
                                    $productTitle,
                                    $oldPrice,
                                    $currentPrice,
                                    $favorite['product_id']
                                );

                            // Sonucu güncelle
                            $this->pushNotificationModel->update($notificationId, [
                                'status' => $response['success'] ? 'sent' : 'failed',
                                'expo_response' => json_encode($response),
                            ]);

                            // Eski log sistemi (price_change_notifications tablosu)
                            $this->logNotification(
                                $favorite['device_id'],
                                $favorite['product_id'],
                                $oldPrice,
                                $currentPrice,
                                $priceDiff,
                                $priceChangePercentage,
                                $response
                            );

                            if ($response['success']) {
                                $stats['notifications_sent']++;

                                // Son bildirim fiyatını güncelle
                                $this->favoritesModel->markNotified($favorite['id'], $currentPrice);
                            }
                        }
                    }

                } catch (\Exception $e) {
                    $stats['errors']++;
                    log_message('error', "Error processing favorite {$favorite['id']}: " . $e->getMessage());
                }

                // Rate limiting - API'yi aşırı yüklememek için
                usleep(100000); // 100ms bekle
            }

            $duration = round(microtime(true) - $startTime, 2);

            return $this->response->setJSON([
                'success' => true,
                'stats' => $stats,
                'duration_seconds' => $duration,
                'timestamp' => date('Y-m-d H:i:s')
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Cron job error: ' . $e->getMessage());

            return $this->response->setJSON([
                'success' => false,
                'message' => $e->getMessage(),
                'stats' => $stats
            ])->setStatusCode(500);
        }
    }

    /**
     * Güncel ürün fiyatını al
     */
    private function getCurrentProductPrice(string $productId)
    {
        // Mevcut get_results API'nizi kullanın
        // Örnek implementasyon:

        $productsModel = new \App\Models\ProductsModel();
        $product = $productsModel->where('product_id', $productId)->first();

        if (!$product) {
            return null;
        }

        // Fiyat string olabilir, temizle
        $price = preg_replace('/[^0-9.]/', '', $product['price']);
        return (float) $price;
    }

    /**
     * Ürün detaylarını al
     */
    private function getProductDetails(string $productId)
    {
        $productsModel = new \App\Models\ProductsModel();
        return $productsModel->where('product_id', $productId)->first();
    }

    /**
     * Bildirim gönderilmeli mi?
     */
    private function shouldSendNotification(
        float $oldPrice,
        float $newPrice,
        ?float $lastNotifiedPrice,
        float $threshold = 5.0
    ): bool {
        // Fiyat değişmedi
        if (abs($newPrice - $oldPrice) < 0.01) {
            return false;
        }

        $priceDiff = $newPrice - $oldPrice;
        $changePercentage = abs(($priceDiff / $oldPrice) * 100);

        // Fiyat düşüşü - her zaman bildir
        if ($priceDiff < 0) {
            // Ama daha önce aynı fiyattan bildirim gönderdiyse tekrar gönderme
            if ($lastNotifiedPrice && abs($newPrice - $lastNotifiedPrice) < 0.01) {
                return false;
            }
            return true;
        }

        // Fiyat artışı - sadece threshold'u geçerse
        if ($changePercentage >= $threshold) {
            if ($lastNotifiedPrice && abs($newPrice - $lastNotifiedPrice) < 0.01) {
                return false;
            }
            return true;
        }

        return false;
    }

    /**
     * Bildirimi logla (eski sistem için - price_change_notifications tablosu)
     */
    private function logNotification(
        string $deviceId,
        string $productId,
        float $oldPrice,
        float $newPrice,
        float $priceDiff,
        float $percentage,
        array $response
    ) {
        $this->notificationLogModel->insert([
            'device_id' => $deviceId,
            'product_id' => $productId,
            'old_price' => $oldPrice,
            'new_price' => $newPrice,
            'price_change' => $priceDiff,
            'price_change_percentage' => $percentage,
            'notification_type' => $priceDiff < 0 ? 'price_drop' : 'price_increase',
            'expo_push_response' => json_encode($response),
            'is_delivered' => $response['success'] ? 1 : 0
        ]);
    }

    /**
     * Cron isteği yetkili mi?
     */
    private function isAuthorizedCronRequest(): bool
    {
        // Localhost kontrolü
        $allowedIps = ['127.0.0.1', '::1', 'localhost'];

        // Kendi sunucu IP'nizi ekleyin
        $allowedIps[] = $_SERVER['SERVER_ADDR'] ?? '';

        // Veya secret key kontrolü
        $secretKey = $this->request->getHeaderLine('X-Cron-Secret');
        $validSecret = env('CRON_SECRET_KEY', 'your-secret-key-here');

        return in_array($_SERVER['REMOTE_ADDR'], $allowedIps) || $secretKey === $validSecret;
    }
}
```

### Crontab Kurulumu

Sunucunuzda crontab'e ekleyin:

```bash
# Her 15 dakikada bir fiyat kontrolü
*/15 * * * * curl -H "X-Cron-Secret: your-secret-key-here" https://bazenda.com/api/cron/check-prices

# VEYA her saat başı
0 * * * * curl -H "X-Cron-Secret: your-secret-key-here" https://bazenda.com/api/cron/check-prices
```

### Önemli Değişiklikler (Eski → Yeni)

#### ❌ ESKİ YOL (Sadece Expo'ya gönderiyordu):
```php
// Bildirim gönder
$response = $this->expoPushService->sendPriceDropNotification(
    $token['expo_push_token'],
    $productTitle,
    $oldPrice,
    $currentPrice,
    $favorite['product_id']
);
```

#### ✅ YENİ YOL (Önce DB'ye kaydet, sonra gönder):
```php
// 1. Önce DB'ye kaydet
$notificationId = $this->pushNotificationModel->insert([
    'device_id' => $favorite['device_id'],
    'expo_push_token' => $token['expo_push_token'],
    'title' => '🎉 Fiyat Düştü!',
    'body' => "{$productTitle}\n...",
    'notification_type' => 'price_drop',
    'product_id' => $favorite['product_id'],
    'product_link' => $productLink,
    'old_price' => $oldPrice,
    'new_price' => $currentPrice,
    'sent_at' => date('Y-m-d H:i:s'),
    'status' => 'pending',
]);

// 2. Sonra Expo'ya gönder
$response = $this->expoPushService->sendPriceDropNotification(...);

// 3. Sonucu güncelle
$this->pushNotificationModel->update($notificationId, [
    'status' => $response['success'] ? 'sent' : 'failed',
    'expo_response' => json_encode($response),
]);
```

### Avantajları

1. ✅ Her bildirim veritabanında saklanır (geçmiş için)
2. ✅ Kullanıcılar uygulamadan bildirim geçmişlerini görebilir
3. ✅ Expo hatası olsa bile kayıt DB'de kalır
4. ✅ Analytics ve raporlama için veri var
5. ✅ Okundu/okunmadı takibi mümkün

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
