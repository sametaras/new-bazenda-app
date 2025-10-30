# Bazenda Backend Entegrasyonu - Bildirim Sistemi

## 📋 İçindekiler
1. [Veritabanı Yapısı](#veritabanı-yapısı)
2. [CodeIgniter 4 API Endpoints](#codeigniter-4-api-endpoints)
3. [Expo Push Notification Servisi](#expo-push-notification-servisi)
4. [Cron Job Kurulumu](#cron-job-kurulumu)
5. [Deep Linking Yapılandırması](#deep-linking-yapılandırması)
6. [Mobil Uygulama Güncellemeleri](#mobil-uygulama-güncellemeleri)

---

## 1. Veritabanı Yapısı

### Tablo 1: `device_tokens`
Kullanıcı cihazlarının Expo Push Token'larını saklar.

```sql
CREATE TABLE `device_tokens` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) DEFAULT NULL COMMENT 'Kullanıcı ID (opsiyonel, guest kullanıcılar için)',
  `device_id` varchar(255) NOT NULL COMMENT 'Unique device identifier',
  `expo_push_token` varchar(255) NOT NULL COMMENT 'Expo push token',
  `platform` enum('ios','android','web') NOT NULL,
  `app_version` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_used_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_device_token` (`device_id`, `expo_push_token`),
  KEY `idx_expo_token` (`expo_push_token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tablo 2: `user_favorites_tracking`
Favorilere eklenen ürünlerin fiyat takibi için.

```sql
CREATE TABLE `user_favorites_tracking` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `device_id` varchar(255) NOT NULL COMMENT 'Device identifier',
  `product_id` varchar(100) NOT NULL,
  `initial_price` decimal(10,2) NOT NULL COMMENT 'İlk fiyat',
  `last_checked_price` decimal(10,2) NOT NULL COMMENT 'Son kontrol edilen fiyat',
  `last_notified_price` decimal(10,2) DEFAULT NULL COMMENT 'Son bildirim gönderilen fiyat',
  `notification_sent_at` datetime DEFAULT NULL,
  `price_change_threshold` decimal(5,2) DEFAULT 5.00 COMMENT 'Bildirim için minimum değişim yüzdesi',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_device_product` (`device_id`, `product_id`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tablo 3: `price_change_notifications`
Gönderilen bildirimlerin logları.

```sql
CREATE TABLE `price_change_notifications` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `device_id` varchar(255) NOT NULL,
  `product_id` varchar(100) NOT NULL,
  `old_price` decimal(10,2) NOT NULL,
  `new_price` decimal(10,2) NOT NULL,
  `price_change` decimal(10,2) NOT NULL COMMENT 'Fiyat farkı',
  `price_change_percentage` decimal(5,2) NOT NULL,
  `notification_type` enum('price_drop','price_increase') NOT NULL,
  `expo_push_response` text DEFAULT NULL COMMENT 'Expo API response',
  `is_delivered` tinyint(1) DEFAULT 0,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_device_product` (`device_id`, `product_id`),
  KEY `idx_sent_at` (`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 2. CodeIgniter 4 API Endpoints

### Model: `DeviceTokenModel.php`

```php
<?php

namespace App\Models;

use CodeIgniter\Model;

class DeviceTokenModel extends Model
{
    protected $table = 'device_tokens';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'user_id',
        'device_id',
        'expo_push_token',
        'platform',
        'app_version',
        'is_active',
        'last_used_at'
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    /**
     * Token kaydet veya güncelle
     */
    public function saveToken(array $data)
    {
        $existing = $this->where([
            'device_id' => $data['device_id'],
            'expo_push_token' => $data['expo_push_token']
        ])->first();

        if ($existing) {
            // Güncelle
            return $this->update($existing['id'], [
                'is_active' => 1,
                'last_used_at' => date('Y-m-d H:i:s'),
                'app_version' => $data['app_version'] ?? null
            ]);
        }

        // Yeni kayıt
        return $this->insert($data);
    }

    /**
     * Aktif token'ları getir
     */
    public function getActiveTokens(array $deviceIds = [])
    {
        $builder = $this->where('is_active', 1);

        if (!empty($deviceIds)) {
            $builder->whereIn('device_id', $deviceIds);
        }

        return $builder->findAll();
    }

    /**
     * Token'ı deaktif et
     */
    public function deactivateToken(string $deviceId, string $expoPushToken)
    {
        return $this->where([
            'device_id' => $deviceId,
            'expo_push_token' => $expoPushToken
        ])->set(['is_active' => 0])->update();
    }
}
```

### Model: `FavoritesTrackingModel.php`

```php
<?php

namespace App\Models;

use CodeIgniter\Model;

class FavoritesTrackingModel extends Model
{
    protected $table = 'user_favorites_tracking';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'device_id',
        'product_id',
        'initial_price',
        'last_checked_price',
        'last_notified_price',
        'notification_sent_at',
        'price_change_threshold',
        'is_active'
    ];
    protected $useTimestamps = true;

    /**
     * Favori ürün ekle
     */
    public function addFavorite(string $deviceId, string $productId, float $currentPrice)
    {
        $existing = $this->where([
            'device_id' => $deviceId,
            'product_id' => $productId
        ])->first();

        if ($existing) {
            return $this->update($existing['id'], [
                'is_active' => 1,
                'last_checked_price' => $currentPrice
            ]);
        }

        return $this->insert([
            'device_id' => $deviceId,
            'product_id' => $productId,
            'initial_price' => $currentPrice,
            'last_checked_price' => $currentPrice
        ]);
    }

    /**
     * Favori ürün çıkar
     */
    public function removeFavorite(string $deviceId, string $productId)
    {
        return $this->where([
            'device_id' => $deviceId,
            'product_id' => $productId
        ])->delete();
    }

    /**
     * Fiyat güncelle
     */
    public function updatePrice(int $id, float $newPrice)
    {
        return $this->update($id, [
            'last_checked_price' => $newPrice
        ]);
    }

    /**
     * Bildirim gönderildi işaretle
     */
    public function markNotified(int $id, float $price)
    {
        return $this->update($id, [
            'last_notified_price' => $price,
            'notification_sent_at' => date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Aktif favorileri getir
     */
    public function getActiveFavorites()
    {
        return $this->where('is_active', 1)->findAll();
    }
}
```

### Controller: `NotificationController.php`

```php
<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\DeviceTokenModel;
use App\Models\FavoritesTrackingModel;

class NotificationController extends BaseController
{
    protected $deviceTokenModel;
    protected $favoritesModel;

    public function __construct()
    {
        $this->deviceTokenModel = new DeviceTokenModel();
        $this->favoritesModel = new FavoritesTrackingModel();
    }

    /**
     * POST /api/notifications/register-device
     * Cihaz token'ını kaydet
     */
    public function registerDevice()
    {
        $json = $this->request->getJSON(true);

        $validation = \Config\Services::validation();
        $validation->setRules([
            'device_id' => 'required|min_length[10]',
            'expo_push_token' => 'required|min_length[20]',
            'platform' => 'required|in_list[ios,android,web]',
            'app_version' => 'permit_empty|max_length[50]'
        ]);

        if (!$validation->run($json)) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validation->getErrors()
            ])->setStatusCode(400);
        }

        try {
            $data = [
                'device_id' => $json['device_id'],
                'expo_push_token' => $json['expo_push_token'],
                'platform' => $json['platform'],
                'app_version' => $json['app_version'] ?? null,
                'user_id' => $json['user_id'] ?? null
            ];

            $this->deviceTokenModel->saveToken($data);

            return $this->response->setJSON([
                'success' => true,
                'message' => 'Device registered successfully'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Device registration error: ' . $e->getMessage());

            return $this->response->setJSON([
                'success' => false,
                'message' => 'Failed to register device'
            ])->setStatusCode(500);
        }
    }

    /**
     * POST /api/notifications/sync-favorites
     * Favorileri senkronize et
     */
    public function syncFavorites()
    {
        $json = $this->request->getJSON(true);

        $validation = \Config\Services::validation();
        $validation->setRules([
            'device_id' => 'required',
            'favorites' => 'required|is_array'
        ]);

        if (!$validation->run($json)) {
            return $this->response->setJSON([
                'success' => false,
                'errors' => $validation->getErrors()
            ])->setStatusCode(400);
        }

        try {
            $deviceId = $json['device_id'];
            $favorites = $json['favorites'];

            // Mevcut favorileri temizle
            $this->favoritesModel->where('device_id', $deviceId)->delete();

            // Yeni favorileri ekle
            foreach ($favorites as $favorite) {
                if (isset($favorite['product_id']) && isset($favorite['current_price'])) {
                    $this->favoritesModel->addFavorite(
                        $deviceId,
                        $favorite['product_id'],
                        (float) $favorite['current_price']
                    );
                }
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => 'Favorites synced successfully'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Favorites sync error: ' . $e->getMessage());

            return $this->response->setJSON([
                'success' => false,
                'message' => 'Failed to sync favorites'
            ])->setStatusCode(500);
        }
    }

    /**
     * POST /api/notifications/unregister-device
     * Cihazı deaktif et
     */
    public function unregisterDevice()
    {
        $json = $this->request->getJSON(true);

        if (!isset($json['device_id']) || !isset($json['expo_push_token'])) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'device_id and expo_push_token are required'
            ])->setStatusCode(400);
        }

        try {
            $this->deviceTokenModel->deactivateToken(
                $json['device_id'],
                $json['expo_push_token']
            );

            return $this->response->setJSON([
                'success' => true,
                'message' => 'Device unregistered successfully'
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Device unregistration error: ' . $e->getMessage());

            return $this->response->setJSON([
                'success' => false,
                'message' => 'Failed to unregister device'
            ])->setStatusCode(500);
        }
    }
}
```

---

## 3. Expo Push Notification Servisi

### Service: `ExpoPushService.php`

```php
<?php

namespace App\Services;

class ExpoPushService
{
    private $apiUrl = 'https://exp.host/--/api/v2/push/send';
    private $maxBatchSize = 100; // Expo limit

    /**
     * Tek bir bildirim gönder
     */
    public function sendNotification(string $expoPushToken, array $notification)
    {
        return $this->sendBatch([
            [
                'to' => $expoPushToken,
                'sound' => $notification['sound'] ?? 'default',
                'title' => $notification['title'],
                'body' => $notification['body'],
                'data' => $notification['data'] ?? [],
                'priority' => $notification['priority'] ?? 'high',
                'channelId' => $notification['channelId'] ?? 'default'
            ]
        ]);
    }

    /**
     * Toplu bildirim gönder
     */
    public function sendBatch(array $messages)
    {
        // Batch'leri böl
        $batches = array_chunk($messages, $this->maxBatchSize);
        $results = [];

        foreach ($batches as $batch) {
            $response = $this->sendRequest($batch);
            $results[] = $response;
        }

        return $results;
    }

    /**
     * Fiyat düşüşü bildirimi gönder
     */
    public function sendPriceDropNotification(
        string $expoPushToken,
        string $productTitle,
        float $oldPrice,
        float $newPrice,
        string $productId
    ) {
        $priceDrop = $oldPrice - $newPrice;
        $percentage = round(($priceDrop / $oldPrice) * 100, 1);

        $notification = [
            'title' => '🎉 Fiyat Düştü!',
            'body' => "{$productTitle}\n{$priceDrop} ₺ düştü ({$percentage}%)",
            'data' => [
                'type' => 'price_drop',
                'product_id' => $productId,
                'old_price' => $oldPrice,
                'new_price' => $newPrice,
                'screen' => 'Favorites' // Deep link için
            ],
            'sound' => 'default',
            'priority' => 'high',
            'channelId' => 'price-alerts'
        ];

        return $this->sendNotification($expoPushToken, $notification);
    }

    /**
     * Fiyat artışı bildirimi gönder
     */
    public function sendPriceIncreaseNotification(
        string $expoPushToken,
        string $productTitle,
        float $oldPrice,
        float $newPrice,
        string $productId
    ) {
        $priceIncrease = $newPrice - $oldPrice;
        $percentage = round(($priceIncrease / $oldPrice) * 100, 1);

        $notification = [
            'title' => '📈 Fiyat Değişikliği',
            'body' => "{$productTitle}\n{$priceIncrease} ₺ arttı ({$percentage}%)",
            'data' => [
                'type' => 'price_increase',
                'product_id' => $productId,
                'old_price' => $oldPrice,
                'new_price' => $newPrice,
                'screen' => 'Favorites'
            ],
            'sound' => 'default',
            'priority' => 'default',
            'channelId' => 'price-alerts'
        ];

        return $this->sendNotification($expoPushToken, $notification);
    }

    /**
     * HTTP request gönder
     */
    private function sendRequest(array $messages)
    {
        $ch = curl_init($this->apiUrl);

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($messages),
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Accept-Encoding: gzip, deflate',
                'Content-Type: application/json'
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            log_message('error', 'Expo Push Error: ' . $error);
            return [
                'success' => false,
                'error' => $error
            ];
        }

        $responseData = json_decode($response, true);

        return [
            'success' => $httpCode === 200,
            'http_code' => $httpCode,
            'data' => $responseData
        ];
    }

    /**
     * Token geçerliliğini kontrol et
     */
    public function isValidToken(string $token)
    {
        // ExponentPushToken[...] formatında olmalı
        return preg_match('/^ExponentPushToken\[.+\]$/', $token) === 1;
    }
}
```

---

## 4. Cron Job Kurulumu

### Controller: `CronController.php`

```php
<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\FavoritesTrackingModel;
use App\Models\DeviceTokenModel;
use App\Models\PriceChangeNotificationModel;
use App\Services\ExpoPushService;

class CronController extends BaseController
{
    protected $favoritesModel;
    protected $deviceTokenModel;
    protected $notificationLogModel;
    protected $expoPushService;

    public function __construct()
    {
        $this->favoritesModel = new FavoritesTrackingModel();
        $this->deviceTokenModel = new DeviceTokenModel();
        $this->notificationLogModel = new PriceChangeNotificationModel();
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

                        foreach ($deviceTokens as $token) {
                            // Bildirim gönder
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

                            // Log kaydet
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
     * Bildirimi logla
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

### Model: `PriceChangeNotificationModel.php`

```php
<?php

namespace App\Models;

use CodeIgniter\Model;

class PriceChangeNotificationModel extends Model
{
    protected $table = 'price_change_notifications';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'device_id',
        'product_id',
        'old_price',
        'new_price',
        'price_change',
        'price_change_percentage',
        'notification_type',
        'expo_push_response',
        'is_delivered'
    ];
    protected $useTimestamps = false;
}
```

---

## 5. Deep Linking Yapılandırması

### app.json Güncellemeleri

```json
{
  "expo": {
    "scheme": "bazenda",
    "ios": {
      "bundleIdentifier": "com.bazenda.app",
      "associatedDomains": ["applinks:bazenda.com"]
    },
    "android": {
      "package": "com.bazenda.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "bazenda.com",
              "pathPrefix": "/app"
            },
            {
              "scheme": "bazenda"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

---

## 6. Mobil Uygulama Güncellemeleri

Şimdi mobil uygulama tarafını güncelleyelim...

**Devam ediyorum...**
