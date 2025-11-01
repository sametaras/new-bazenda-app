# 🔧 Backend Düzeltmeleri Gerekli

Bu dosya mobile uygulamadan gelen hataları ve backend'de yapılması gereken düzeltmeleri içerir.

---

## 1. ❌ Bildirim Silme 404 Hatası

**Hata:**
```
ERROR ❌ Delete notification failed: [AxiosError: Request failed with status code 404]
```

**Sorun:**
- Mobile'dan `POST /api/notifications/delete-notification` çağrılıyor
- Backend 404 dönüyor (endpoint bulunamıyor)

**Çözüm:**

### a) Route Kontrolü
`app/Config/Routes.php` dosyasında:

```php
$routes->group('api/notifications', ['namespace' => 'App\Controllers\NApi'], function($routes) {
    // ... diğer route'lar

    // ✅ Bu satır MUTLAKA olmalı
    $routes->post('delete-notification', 'NotificationController::deleteNotification');
});
```

### b) Controller Metodu
`app/Controllers/NApi/NotificationController.php` dosyasında:

```php
/**
 * POST /api/notifications/delete-notification
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

### c) Test
```bash
curl -X POST https://bazenda.com/api/notifications/delete-notification \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device_123",
    "notification_id": 1
  }'

# Beklenen Output:
# {"success":true,"message":"Notification deleted"}
```

---

## 2. ❌ Favoriler Sync Boş Array Hatası

**Hata:**
```
ERROR ❌ Favorites sync failed: {
  "data": {
    "errors": {"favorites": "The favorites field is required."},
    "success": false
  },
  "status": 400
}
```

**Sorun:**
- Mobile tüm favorileri sildiğinde `favorites: []` (boş array) gönderiyor
- Backend validation boş array'i kabul etmiyor

**Mobil Workaround:**
Mobile tarafında artık teker teker silme yapıyoruz (düzeltildi ✅)

**Backend Çözümü (Opsiyonel):**

### Validation Düzeltmesi
`app/Controllers/NApi/NotificationController.php` → `syncFavorites()`:

```php
public function syncFavorites()
{
    $json = $this->request->getJSON(true);

    $validation = \Config\Services::validation();
    $validation->setRules([
        'device_id' => 'required',
        // ✅ DÜZELTME: favorites array olabilir, boş da olabilir
        'favorites' => 'permit_empty|is_array',
    ]);

    if (!$validation->run($json)) {
        return $this->response->setJSON([
            'success' => false,
            'errors' => $validation->getErrors()
        ])->setStatusCode(400);
    }

    try {
        $deviceId = $json['device_id'];
        $favorites = $json['favorites'] ?? [];  // ✅ Boş array default

        // Mevcut favorileri sil
        $favoritesModel = new FavoritesTrackingModel();
        $favoritesModel->where('device_id', $deviceId)->delete();

        // ✅ Eğer boş array gönderilmişse, sadece silme işlemi yapıldı
        if (empty($favorites)) {
            return $this->response->setJSON([
                'success' => true,
                'message' => 'All favorites cleared'
            ]);
        }

        // Yeni favorileri ekle
        foreach ($favorites as $fav) {
            $favoritesModel->insert([
                'device_id' => $deviceId,
                'product_id' => $fav['product_id'],
                'initial_price' => $fav['current_price'],
                'last_checked_price' => $fav['current_price'],
            ]);
        }

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Favorites synced'
        ]);

    } catch (\Exception $e) {
        log_message('error', 'Sync favorites error: ' . $e->getMessage());
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Failed to sync favorites'
        ])->setStatusCode(500);
    }
}
```

---

## 3. ⚠️ BAI Görsel Arama (Çözüldü ✅)

**Sorun:**
Web'de çalışıyor ama mobile'da "Görsel analiz edilemedi" hatası

**Neden:**
React Native'de `fetch().blob()` çalışmıyor

**Çözüm:**
Mobile tarafında düzeltildi ✅ (FormData'ya direkt `{uri, type, name}` objesi gönderiliyor)

---

## 📊 Test Checklist

### Bildirim Silme Testi
```bash
# 1. Bildirim listesi al
curl "https://bazenda.com/api/notifications/get-notifications?device_id=test_device_123"

# 2. İlk bildirimin ID'sini not et (örn: 123)

# 3. Bildirimi sil
curl -X POST https://bazenda.com/api/notifications/delete-notification \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device_123",
    "notification_id": 123
  }'

# 4. Tekrar listele (silinmiş olmalı)
curl "https://bazenda.com/api/notifications/get-notifications?device_id=test_device_123"
```

### Favoriler Sync Testi
```bash
# 1. Boş array gönder (tümünü temizle)
curl -X POST https://bazenda.com/api/notifications/sync-favorites \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device_123",
    "favorites": []
  }'

# Beklenen: {"success":true,"message":"All favorites cleared"}
```

---

## 🚨 Öncelik Sırası

1. **YÜKSEK:** Bildirim silme 404 hatası (kullanıcılar bildirim silemiyorlar)
2. **ORTA:** Favoriler sync boş array (mobile'da workaround var ama backend de düzelmeli)
3. **DÜŞÜK:** BAI görsel arama (mobile'da düzeltildi)

---

## 📞 İletişim

Sorular için:
- Email: support@bazenda.com
- Docs: `/docs/NOTIFICATIONS_API.md`
- Backend Integration: `/docs/BACKEND_INTEGRATION.md`
