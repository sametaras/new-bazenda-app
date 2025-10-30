# Cron Job Kurulum Rehberi

## 1. Routes Yapılandırması (CodeIgniter 4)

`app/Config/Routes.php` dosyanıza ekleyin:

```php
<?php

// Notification API endpoints
$routes->group('api/notifications', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->post('register-device', 'NotificationController::registerDevice');
    $routes->post('unregister-device', 'NotificationController::unregisterDevice');
    $routes->post('sync-favorites', 'NotificationController::syncFavorites');
    $routes->post('add-favorite', 'NotificationController::addFavorite');
    $routes->post('remove-favorite', 'NotificationController::removeFavorite');
});

// Cron endpoints
$routes->group('api/cron', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->get('check-prices', 'CronController::checkPrices');
});
```

## 2. Cron Job Kurulumu

### Yöntem 1: cPanel Cron Jobs

1. cPanel'e giriş yapın
2. "Cron Jobs" bölümüne gidin
3. Yeni bir cron job ekleyin:

**Her saat başı çalıştır:**
```bash
0 * * * * /usr/bin/curl -H "X-Cron-Secret: YOUR_SECRET_KEY" https://bazenda.com/api/cron/check-prices
```

**15 dakikada bir çalıştır:**
```bash
*/15 * * * * /usr/bin/curl -H "X-Cron-Secret: YOUR_SECRET_KEY" https://bazenda.com/api/cron/check-prices
```

### Yöntem 2: SSH ile Crontab

```bash
# Crontab'ı düzenle
crontab -e

# Aşağıdaki satırı ekleyin (her saat başı)
0 * * * * /usr/bin/curl -H "X-Cron-Secret: YOUR_SECRET_KEY" https://bazenda.com/api/cron/check-prices >> /var/log/bazenda-cron.log 2>&1
```

### Yöntem 3: PHP CLI ile

```bash
# Her saat başı
0 * * * * cd /path/to/bazenda && php spark cron:check-prices >> /var/log/bazenda-cron.log 2>&1
```

İçin `app/Commands/CheckPrices.php` oluşturun:

```php
<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use App\Controllers\Api\CronController;

class CheckPrices extends BaseCommand
{
    protected $group = 'Cron';
    protected $name = 'cron:check-prices';
    protected $description = 'Check product prices and send notifications';

    public function run(array $params)
    {
        CLI::write('Starting price check...', 'yellow');

        $controller = new CronController();
        $result = $controller->checkPrices();

        CLI::write('Price check completed!', 'green');
        CLI::write(json_encode($result), 'cyan');
    }
}
```

## 3. Environment Variables (.env)

```env
# Cron Security
CRON_SECRET_KEY=your-very-secret-key-here-change-this

# Expo Push Notification
EXPO_PUSH_URL=https://exp.host/--/api/v2/push/send
```

## 4. Test Etme

### Manuel Test:

```bash
# cURL ile
curl -H "X-Cron-Secret: YOUR_SECRET_KEY" \
     https://bazenda.com/api/cron/check-prices

# veya tarayıcıdan (geliştirme ortamında)
https://bazenda.com/api/cron/check-prices
```

### Cron Loglarını Kontrol:

```bash
# Cron log dosyasını izle
tail -f /var/log/bazenda-cron.log

# Son 100 satırı göster
tail -n 100 /var/log/bazenda-cron.log
```

## 5. Performans Optimizasyonu

### Rate Limiting

CronController'da rate limiting ekleyin:

```php
// Her ürün için 100ms bekle
usleep(100000);
```

### Batch Processing

```php
// 100 ürün sonra 1 saniye bekle
if ($stats['checked'] % 100 === 0) {
    sleep(1);
}
```

### Database Connection Pooling

```php
// Her 50 işlemde bir reconnect
if ($stats['checked'] % 50 === 0) {
    $this->db->reconnect();
}
```

## 6. Monitoring

### Cron Job Monitoring Servisi (Opsiyonel)

```bash
# https://cronitor.io veya https://healthchecks.io kullanın

# Örnek: Healthchecks.io
0 * * * * /usr/bin/curl https://bazenda.com/api/cron/check-prices && curl -fsS --retry 3 https://hc-ping.com/YOUR-UUID-HERE
```

### Log Rotation

`/etc/logrotate.d/bazenda` oluşturun:

```
/var/log/bazenda-cron.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

## 7. Troubleshooting

### Cron çalışmıyor:

```bash
# Cron servisini kontrol et
sudo service cron status

# Cron servisini yeniden başlat
sudo service cron restart

# Cron loglarını kontrol et
sudo tail -f /var/log/syslog | grep CRON
```

### Permission hatası:

```bash
# Script'e execute yetkisi ver
chmod +x /path/to/script.sh

# Log dosyasına yazma yetkisi ver
chmod 666 /var/log/bazenda-cron.log
```

### Timeout hatası:

```php
// CronController'da timeout'u artır
set_time_limit(300); // 5 dakika
ini_set('max_execution_time', 300);
```

## 8. Production Checklist

- [ ] Cron secret key'i .env'de ayarlandı
- [ ] Routes yapılandırıldı
- [ ] Veritabanı tabloları oluşturuldu
- [ ] Cron job cPanel'de ayarlandı
- [ ] Test edildi ve çalışıyor
- [ ] Log rotation ayarlandı
- [ ] Monitoring kuruldu (opsiyonel)
- [ ] Error notification ayarlandı

## 9. Örnek Cron Log Çıktısı

```json
{
  "success": true,
  "stats": {
    "checked": 150,
    "price_changed": 12,
    "notifications_sent": 12,
    "errors": 0
  },
  "duration_seconds": 45.23,
  "timestamp": "2025-01-15 10:00:03"
}
```
