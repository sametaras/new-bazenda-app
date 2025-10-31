# 🐛 Backend 404 Debug Guide - bazenda.com

Routes dosyanız doğru ama yine 404 alıyorsunuz. İşte adım adım debug rehberi:

---

## 🔍 Sorun Tespiti

### 1. Controller Dosyası Nerede? (En Önemli!)

```bash
# Kontrol et:
ls -la app/Controllers/Api/NotificationController.php

# Olması gereken:
✅ app/Controllers/Api/NotificationController.php

# YANLIŞ olabilecek:
❌ app/Controllers/NotificationController.php
❌ app/Controllers/Notifications/NotificationController.php
```

**Namespace routes'da:** `'namespace' => 'App\Controllers\Api'`
**Controller lokasyonu:** `app/Controllers/Api/NotificationController.php`

### 2. Controller Namespace Doğru mu?

```php
// app/Controllers/Api/NotificationController.php

<?php
namespace App\Controllers\Api;  // ✅ DOĞRU

use CodeIgniter\RESTful\ResourceController;

class NotificationController extends ResourceController
{
    public function registerDevice()
    {
        // ...
    }
}
```

**Yanlış namespace örnekleri:**
```php
❌ namespace App\Controllers;  // Api eksik
❌ namespace App\Controllers\Notifications;  // Yanlış klasör
```

---

## ✅ Hızlı Test

### Test 1: Basit Endpoint Ekle
```php
// app/Config/Routes.php - En üste ekle
$routes->get('api/test', function() {
    return 'API works!';
});
```

```bash
curl https://bazenda.com/api/test

# Beklenen: "API works!"
# Alınan: 404 -> mod_rewrite veya .htaccess sorunu
```

### Test 2: Home Route Test
```bash
curl https://bazenda.com

# Çalışıyor mu?
# ✅ Evet -> API routes sorunu
# ❌ Hayır -> Web server sorunu
```

---

## 🔧 Çözüm 1: .htaccess Kontrolü

### .htaccess Dosyası (public/.htaccess veya root/.htaccess)

```apache
# public/.htaccess veya root/.htaccess

<IfModule mod_rewrite.c>
    RewriteEngine On

    # Redirect www to non-www (optional)
    # RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
    # RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

    # Redirect to public folder if not already there
    RewriteCond %{REQUEST_URI} !^/public/
    RewriteRule ^(.*)$ /public/$1 [L]
</IfModule>

# public/.htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Redirect Trailing Slashes...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Handle Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.php [L]
</IfModule>

<IfModule !mod_rewrite.c>
    # If mod_rewrite is not available, all requests
    # will be sent to index.php.
    FallbackResource /index.php
</IfModule>
```

---

## 🔧 Çözüm 2: Apache mod_rewrite Aktif mi?

```bash
# Apache modules kontrol
apachectl -M | grep rewrite

# Beklenen output:
# rewrite_module (shared)

# Yoksa aktif et:
sudo a2enmod rewrite
sudo systemctl restart apache2
```

---

## 🔧 Çözüm 3: Base URL Ayarla

```php
// app/Config/App.php

public string $baseURL = 'https://bazenda.com/';  // ✅ Sonunda / var

// YANLIŞ:
public string $baseURL = 'https://bazenda.com';  // ❌ / yok
public string $baseURL = 'http://localhost';  // ❌ Yanlış domain
```

---

## 🔧 Çözüm 4: Controller Dosyasını Doğru Yere Taşı

```bash
# Eğer şuradaysa:
mv app/Controllers/NotificationController.php \
   app/Controllers/Api/NotificationController.php

# Namespace'i değiştir:
sed -i 's/namespace App\\Controllers;/namespace App\\Controllers\\Api;/' \
  app/Controllers/Api/NotificationController.php
```

---

## 🔧 Çözüm 5: Nginx (Eğer Nginx Kullanıyorsanız)

```nginx
# /etc/nginx/sites-available/bazenda.com

server {
    listen 80;
    server_name bazenda.com www.bazenda.com;
    root /var/www/bazenda/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

```bash
# Nginx reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🧪 Debug Test - Detaylı

### Test 1: Direct Index.php Access
```bash
curl https://bazenda.com/index.php/api/notifications/register-device \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test","expo_push_token":"test","platform":"ios","app_version":"1.0.0"}'

# Çalışıyor mu?
# ✅ Evet -> mod_rewrite çalışmıyor
# ❌ Hayır -> Controller veya Route sorunu
```

### Test 2: Environment Check
```php
// Geçici test dosyası: public/test.php
<?php
echo 'PHP Version: ' . phpversion() . "\n";
echo 'Document Root: ' . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo 'Request URI: ' . $_SERVER['REQUEST_URI'] . "\n";
echo 'Script Filename: ' . $_SERVER['SCRIPT_FILENAME'] . "\n";
echo 'mod_rewrite: ' . (in_array('mod_rewrite', apache_get_modules()) ? 'YES' : 'NO') . "\n";
?>
```

```bash
curl https://bazenda.com/test.php
```

### Test 3: CodeIgniter Environment
```bash
# app/.env dosyası var mı?
ls -la app/.env

# Environment değişkenleri
cat app/.env | grep CI_ENVIRONMENT

# Production olmalı:
CI_ENVIRONMENT = production
```

---

## 🎯 Hızlı Çözüm Adımları

### Adım 1: Controller Yerini Kontrol Et
```bash
# Olması gereken:
app/Controllers/Api/NotificationController.php

# İçinde:
namespace App\Controllers\Api;
```

### Adım 2: Routes Dosyasını Kontrol Et
```php
// app/Config/Routes.php

$routes->group('api/notifications', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->post('register-device', 'NotificationController::registerDevice');
});
```

### Adım 3: .htaccess'i Kontrol Et
```bash
cat public/.htaccess

# mod_rewrite olmalı:
RewriteEngine On
```

### Adım 4: Base URL Kontrol Et
```php
// app/Config/App.php

public string $baseURL = 'https://bazenda.com/';
```

### Adım 5: Apache Restart
```bash
sudo systemctl restart apache2
# veya
sudo service apache2 restart
```

### Adım 6: Test Et
```bash
curl -X POST https://bazenda.com/api/notifications/register-device \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test","expo_push_token":"test","platform":"ios","app_version":"1.0.0"}'

# Beklenen:
# {"success":true,"message":"Device registered successfully"}
```

---

## 📋 Checklist

- [ ] Controller dosyası `app/Controllers/Api/NotificationController.php`'de
- [ ] Namespace `App\Controllers\Api`
- [ ] Routes'ta namespace tanımlı
- [ ] .htaccess dosyası mevcut ve doğru
- [ ] mod_rewrite aktif
- [ ] Base URL doğru (`https://bazenda.com/`)
- [ ] Apache/Nginx restart edildi
- [ ] Environment production
- [ ] Database bağlantısı çalışıyor

---

## 🆘 Hala Çalışmıyor?

### Son Çare: Debug Route Ekle

```php
// app/Config/Routes.php - En üste ekle

$routes->get('api/debug', function() {
    return json_encode([
        'status' => 'ok',
        'php_version' => phpversion(),
        'ci_version' => \CodeIgniter\CodeIgniter::CI_VERSION,
        'environment' => ENVIRONMENT,
        'base_url' => base_url(),
    ]);
});

$routes->post('api/debug-post', function() {
    return json_encode([
        'status' => 'ok',
        'method' => 'POST',
        'input' => file_get_contents('php://input'),
    ]);
});
```

```bash
# Test GET
curl https://bazenda.com/api/debug

# Test POST
curl -X POST https://bazenda.com/api/debug-post \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

**Sonuçlar:**
- ✅ Çalışıyor: Controller sorunlu, routes doğru
- ❌ 404: mod_rewrite veya .htaccess sorunlu

---

## 📞 Bize Bildirin

Sorun devam ediyorsa şu bilgileri paylaşın:

```bash
# 1. Apache version
apache2 -v

# 2. PHP version
php -v

# 3. CodeIgniter version
cat composer.json | grep codeigniter4

# 4. Document root
pwd

# 5. .htaccess content
cat public/.htaccess

# 6. Routes.php (ilgili kısım)
cat app/Config/Routes.php | grep -A 10 "notifications"
```

---

**Son Güncelleme:** 2025-10-31
**CodeIgniter Version:** 4.x
**Mobil App:** Ready to work when backend is fixed!
