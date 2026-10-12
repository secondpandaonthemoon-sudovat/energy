# ASAY Energy — geliştirilmiş yönetim paneli

Bu paket mevcut PHP/MySQL API ve React sitesini korur. Admin paneli `/admin` adresindedir.

## Panel kullanımı

- **İçerik:** Sayfa bölümleri, hakkımızda, ürünler/kategoriler, projeler, hizmetler ve teknik görsel noktaları.
- **Görünüm:** Medya, menüler, marka/iletişim bilgileri, tema ve ayrıntılı site ayarları.
- **Yönetim:** Gelen talepler, SEO ve sürüm geçmişi.
- Menü aramasıyla istediğiniz ekranı bulun. Mobilde menü düğmesiyle paneli açın; Escape veya dış alana tıklama kapatır.
- **Taslak Kaydet** değişiklikleri saklar; ziyaretçilere hemen göstermez. **Önizle** kaydedilmiş taslağı gösterir. **Yayınla** kaydedilmiş taslağı canlı siteye geçirir.
- **Ayrıntılı Site Ayarları** alanında gruplar halinde metin, sayı, aç/kapat ve liste alanları düzenlenebilir. Ürün ve proje kayıtlarını kendi ekranlarından düzenleyin.

## Mevcut sunucuya güncelleme

Önce dosyaları ve MySQL veritabanını yedekleyin. Güncellenen uygulama dosyalarını yükleyin; sunucunuzdaki `config/database.php`, `data/installed.lock` ve `uploads/` içeriklerini koruyun. Mevcut kuruluma yeniden `install.php` çalıştırmayın: başlangıç verileri ve admin parolası yeniden yazılabilir. Bu güncelleme için mevcut şema yeterlidir.

`assets/app.js`, `assets/tailwind.css` ve lisans dosyaları önceden derlenmiştir; sunucuda Node.js gerekmez. Yeni JavaScript kaynaklarını değiştirirseniz yeniden derleyip bu dosyaları da yükleyin. Eski dosyalar tarayıcıda görünüyorsa önbelleği temizleyin.

## Yeni kurulum

Apache + mod_rewrite, PHP 7.4 veya üstü, PDO MySQL, DOM, mbstring ve MySQL/MariaDB gerekir. PHP 8.4 + MariaDB 11.8 ile test edildi. Alan adı köküne veya `asayenergy1` gibi bir alt klasöre yükleyin; `.htaccess` dosyaları dahil olsun. Veritabanını oluşturun, `config/`, `data/`, `uploads/` dizinlerine uygun yazma yetkisi verin. `install.php` üzerinden veritabanı bağlantısını ve en az 10 karakterlik admin parolasını belirleyin. Kurulumdan sonra `install.php` ve `php_test.php` dosyalarını sunucudan kaldırın.

DOM, SVG yüklemelerini güvenli incelemek için gerekir. Mevcut SVG dosyaları korunur; güvenli olmayan yeni SVG dosyaları reddedilir.

## Yerel geliştirme

Node.js 20 veya üstüyle:

```sh
npm ci
npm run build
```

Veritabanını kurulum aracıyla hazırladıktan sonra:

```sh
php -S 127.0.0.1:8080 -t . scripts/dev-router.php
```

Üretim bağlantı dosyasını değiştirmeden ayrı bir yerel veritabanı kullanılabilir: `ASAY_DB_HOST`, `ASAY_DB_PORT`, `ASAY_DB_NAME`, `ASAY_DB_USER`, `ASAY_DB_PASSWORD` ortam değişkenleri bağlantı ayarlarını geçersiz kılar. Gizli değerleri kaynak dosyalarına veya sürüm kontrolüne eklemeyin.

React, ikonlar ve Tailwind uygulama dosyaları yereldir. Google Fonts kullanılamazsa sistem fontları devreye girer.

## Sınırlar

Panelde içerik, listeler, medya, tema, menü ve SEO alanları düzenlenebilir. Yeni uygulama işlevleri, tüm pencere/form arayüzündeki sabit etiketler ve tamamen yeni sayfa şablonları hâlâ kod değişikliği gerektirir. Bu paket bir görsel sayfa tasarım aracı değildir. İletişim mesajları gelen taleplere kaydedilir; otomatik e-posta gönderimi eklenmemiştir. Yayınlama sadece CMS verisini yayınlar; bu çalışma gerçek sunucunuza dağıtım yapmaz.

## Kontrolleri yeniden çalıştırma

`npm test` tarayıcı gerektirmeyen CMS çalışma zamanı regresyonlarını çalıştırır. `npm run build` üretim dosyalarını yeniden üretir.

`tests/api-regression.mjs` ve `tests/browser-integration.cjs` yalnızca ayrı, silinebilir bir test veritabanıyla çalıştırılmalıdır; taslak/yayın verisini değiştirir ve yayın sürümünü artırır. Testler gerçek sunucuda çalıştırılmamalıdır. API testi için `ASAY_TEST_URL` ve `ASAY_TEST_LOGIN_FILE`, tarayıcı entegrasyonu için `TEST_BASE_URL` ve `TEST_LOGIN_FILE` ayarlayın. Giriş dosyası yerel JSON biçiminde `username` ve `password` alanlarını içerir; gizli dosyayı bu pakete veya sürüm kontrolüne eklemeyin.

`tests/browser-regression.cjs` API yanıtlarını taklit ederek admin arayüzünü ve taslak/yayın sözleşmesini doğrular. Bu test tek başına veritabanı entegrasyonunu kanıtlamaz. Tarayıcı testleri Playwright gerektirir; `PLAYWRIGHT_MODULE` ile kurulu modülün yolunu, `CHROMIUM_PATH` ile Chromium yolunu belirtin.

`tests/browser-edge.cjs` taklit CMS verisiyle kategoriler arası teklif seçimini ve tamamen boş ürün listesini doğrular.

## Parallax güncellemesi

Açılış bölümü referans videoya göre katmanlı kaydırma sahnesine dönüştürüldü. Mobil ve “hareketi azalt” tercihinde normal akış kullanılır. Ayrıntılı karşılaştırma ve sınırlar `PARALLAX_KARSILASTIRMA.md` dosyasındadır. `tests/parallax-regression.cjs` ile kaydırma, boyut değiştirme, bölüm sıralaması ve erişilebilirlik kontrolleri yapılabilir. Yeni dosyaları yüklerken `assets/app.js`, `assets/tailwind.css`, `assets/site.css` ve `index.html` birlikte güncellenmelidir.

## Localhost açılış düzeltmesi

XAMPP alt klasör kurulumu desteklenir. `http://localhost/asayenergy1/` ve `http://localhost/asayenergy1/admin` adreslerini kullanın. Ayrıntılar `KURULUM_XAMPP.md` dosyasındadır. Güncel dağıtım gerçek `config/database.php` dosyasını içermez; mevcut bağlantınız korunur. Yeni kurulumda kurulum aracı bu dosyayı oluşturur.
