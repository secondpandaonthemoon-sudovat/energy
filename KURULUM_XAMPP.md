# XAMPP: asayenergy1 klasöründe çalıştırma

## Mevcut kopyayı güncelleme

1. Klasörünüzün ve veritabanınızın yedeğini alın.
2. Güncel ZIP'in içeriğini `C:\xampp\htdocs\asayenergy1\` içine çıkarın. `index.php`, `index.html`, `.htaccess`, `assets`, `api` ve `js` bu klasörün doğrudan içinde olmalı; araya ikinci bir proje klasörü girmemeli.
3. Dosyaları birlikte güncelleyin. Sunucudaki `config/database.php`, `data/installed.lock` ve `uploads` içeriklerini koruyun. ZIP gerçek bağlantı dosyasını içermez; bu yüzden mevcut bağlantıyı değiştirmez.
4. XAMPP kontrol panelinden **Apache** ve **MySQL** servislerini başlatın.
5. `http://localhost/asayenergy1/` adresini açın. Eski dosyalar önbellekteyse **Ctrl+F5** kullanın.

Yönetim paneli: `http://localhost/asayenergy1/admin`

## İlk kurulum

Henüz bir veritabanı kurmadıysanız `http://localhost/phpmyadmin/` üzerinden `asay_energy_web_cms` adlı bir veritabanı oluşturun. Ardından `http://localhost/asayenergy1/install.php` adresini açın ve kendi yerel veritabanı bilgilerinizi girin. XAMPP'nin değiştirilmemiş yerel kurulumunda DB kullanıcısı genellikle `root`, parola boş olur; farklı bir parola belirlediyseniz onu kullanın. En az 10 karakterlik bir admin parolası belirleyin.

Mevcut veritabanınız varsa kurulum aracını tekrar çalıştırmayın; başlangıç içeriğini ve admin parolasını yeniden yazabilir. Kurulumdan sonra `install.php` ve `php_test.php` dosyalarını erişime kapatın/kaldırın.

## “Yükleniyor” sorununun nedeni

Önceki sürüm JavaScript, görsel ve API dosyalarını `/assets`, `/src/assets` ve `/api` altında arıyordu. `asayenergy1` alt klasöründe bunların adresi `/asayenergy1/assets`, `/asayenergy1/src/assets` ve `/asayenergy1/api` olmalı. Yeni sürüm kurulum klasörünü otomatik kullanır; klasörün adı sabitlenmemiştir.

JavaScript yüklenmezse açıklayıcı hata gösterilir. API kurulu değilse veya yanıt vermezse örnek site içeriği ve “Site önizleme modunda” bildirimi görünür. Bu modda veritabanına bağlı admin/form özellikleri hazır sayılmaz.

## Kontrol adresleri

- `http://localhost/asayenergy1/` — ana sayfa
- `http://localhost/asayenergy1/admin` — yönetim paneli
- `http://localhost/asayenergy1/api/content` — kurulum tamamlandıysa JSON içerik

API adresi 404 dönerse Apache `mod_rewrite` modülünün ve `.htaccess` desteğinin (`AllowOverride All`) açık olduğundan emin olun. 503 dönerse veritabanı bağlantısını/kurulumunu kontrol edin. API yanıtı bir HTML sayfasıysa dosyaların doğru klasörde olduğundan emin olun.

Dosyayı çift tıklayarak `file:///.../index.html` şeklinde açmayın. Proje PHP/MySQL kullandığından VS Code Live Server tek başına tam uygulamayı çalıştırmaz.

## Bu düzeltmede doğrulananlar

Apache 2.4 + PHP + MariaDB ile `/asayenergy1/` klasör düzeni, ana sayfa, `index.html`, `/admin`, `/admin/`, gerçek görsel/API yüklenmesi, giriş/çıkış, taslak/önizleme/yayın ve iletişim mesajının kaydı test edildi. Kök dizinde PHP sunucusu da kontrol edildi. Eksik JavaScript, geçersiz API yanıtı, 503 ve yanıt vermeyen API durumları için başlangıç testleri geçti.
