# Yapılan değişiklikler ve doğrulama

## Üç ajanın görevleri

Tasarım ajanı admin arayüzünü düzenledi. Yazılım ajanı API ve site davranışlarını düzeltti. Denetim ajanı değişiklikleri bağımsız inceledi; bulgularını ilgili ajana gönderdi, düzeltmelerden sonra kontrolleri tekrarladı. Ana ajan çalıştırma ortamını, yerel derlemeyi ve teslim paketini hazırladı.

## Yönetim paneli

- Gruplanmış ve aranabilir gezinme, işlem kısayolları ve ekranlara ait açıklamalar eklendi.
- Taslak durumunu gösteren alanlar ve mobil işlem çubuğu düzenlendi.
- Mobil menüye dış alanla kapanma, Escape, klavye odak yönetimi eklendi; aç/kapat kontrolleri erişilebilir switch durumlarını bildiriyor.
- Kayıt/yayın sırasında düzenlemeler kilitlenerek verinin işlem sırasında değişmesi önlendi. Çıkışta kaydedilmemiş değişiklik uyarısı ve sunucu oturumunun iptali eklendi.
- Ürün kategori bilgileri, site yapılandırmasındaki iç içe metin/sayı/liste alanları ve footer bağlantıları form alanlarıyla düzenlenebilir hale getirildi. Varlık kayıtları kendi ekranlarında tutuldu.
- Gelen mesajların ayrıntıları gösteriliyor; boş medya alanları daha anlaşılır.

## İşlevler ve güvenli işlem

- Tüm bölümler veya menü öğeleri kapatıldığında varsayılanların yanlışlıkla tekrar görünmesi düzeltildi.
- Ürün, proje, hizmet ve hotspot sıralamalarının sitede uygulanması düzeltildi.
- İletişim formu artık sahte başarı yerine API üzerinden mesajı gelen taleplere kaydediyor. Otomatik e-posta gönderimi eklenmedi.
- Yayındaki içerikte kullanılan medya, taslaktan çıkarılsa bile silinmeye karşı korunuyor.
- Bozuk JSON ve eksik CMS yapısı kabul edilmiyor; önceki içerik korunuyor.
- Yeni SVG yüklemeleri DOM ile inceleniyor; betik, olay özellikleri ve güvensiz bağlantılar reddediliyor. Dosya verisi ile belirtilen türün uyumu kontrol ediliyor.
- CMS bağlantılarında güvensiz URL şemaları ve yapılandırma birleştirmesinde prototip kirletme yolları engellendi.
- Video oynatma/durdurma ve ses düğmeleri video öğesine bağlandı. Bu kontrollerin gerçek video dosyasıyla her tarayıcıda oynatma uyumluluğu kapsamlı test edilmedi.
- Footer ve gezinmede marka/bağlantı ayarlarının sitede kullanılması genişletildi.
- Dil sisteminin React güncellemelerini eski metinle geri değiştirmesi düzeltildi.

## Yerel derleme

React, ikonlar ve Tailwind dış JavaScript CDN'lerinden yüklenmek yerine `assets/app.js` ve `assets/tailwind.css` içine derleniyor. Sürümü sabitlenmiş bağımlılıklar ve kilit dosyası eklendi. Paket derlenmiş dosyaları içerir; üretim sunucusunda Node.js gerekmez. Google Fonts isteğe bağlı olarak dışarıdan yüklenir ve sistem fontu yedeği bulunur.

## Doğrulama kapsamı

- PHP 8.4.24 + MariaDB 11.8.6 ile ayrı yerel veritabanı kullanıldı; gerçek sunucuya bağlanılmadı.
- PHP dosyalarında sözdizimi kontrolü ve üretim derlemesi yapıldı.
- Çalışma zamanı regresyonları: kapalı bölüm/menü, sıralama, URL güvenliği, varlık seçimi ve prototip güvenliği.
- Gerçek API regresyonları: yetkisiz erişim, giriş/çıkış, bozuk JSON, geçersiz CMS durumunda veri korunması, güvenli/güvensiz SVG, yayındaki medya koruması, iletişim mesajı kaydı ve zorunlu alan kontrolleri.
- API yanıtları taklit edilen tarayıcı testi: 320/390/768/1440 px admin yerleşimi, taslak/yayın ayrımı ve kapalı bölümler.
- Gerçek tarayıcı + API + MySQL testi: giriş, marka düzenleme, taslak kaydetme, ziyaretçi içeriğinin değişmemesi, yetkili önizleme, yayınlama ve ziyaretçi sayfasında yeni markanın görünmesi.
- Ek tarayıcı senaryoları: farklı kategoriye ait teklif modelinin seçili kalması ve tüm ürün kategorileri boşken hatasız sayfa gösterimi.
- İlave arayüz kontrolleri: kategori ve ayrıntılı ayar düzenlemesi, menü araması, mobil kapanma ve değişiklik sonrası yerleşim.

Testler uygulamanın her özelliğinin her koşulda kusursuz olduğunu kanıtlamaz. E-posta gönderimi, üretim sunucusuna dağıtım, gerçek video dosyaları ve kapsamlı performans/yük testleri bu çalışmanın dışında kaldı.

## Korunan dosyalar ve teslim sınırları

Orijinal görseller, başlangıç CMS verisi ve veritabanı şeması korunmuştur. GitHub teslimatında gerçek `config/database.php` dışarıda tutulur; ZIP kurulum şablonu içerir. Mevcut sitenizi güncellerken sunucudaki veritabanı bağlantısı, yüklenen dosyalar ve kurulum kilidini koruyun. Canlı veritabanının içeriği yüklenen ZIP içinde bulunmadığından yerel test başlangıç verileriyle yapıldı.

İçerik ve görünüm alanları geniş ölçüde düzenlenebilir; yeni işlevler, tamamen yeni şablonlar ve yapılandırmada bulunmayan sabit arayüz metinleri hâlâ kod değişikliği gerektirir. Çalışma gerçek sunucuya yüklenmedi. Kullanıcının isteğiyle GitHub üzerinden teslimat hazırlandı.

## XAMPP alt klasör ve başlangıç düzeltmesi

`asayenergy1` gibi alt klasörlerde JavaScript/CSS, API, medya, admin ve önizleme yolları kurulum köküne göre çözülür. Apache PHP giriş sayfası doğru temel yolu belirtir; doğrudan `index.html` için de destek vardır. Apache CGI/FastCGI oturum başlığının iletilmesi düzeltildi. Açılış hatası ve API zaman aşımı artık sonsuz yükleme yerine açıklanır. Gerçek Apache alt klasör, giriş, taslak/önizleme/yayın, iletişim, güvenli yükleme ve oturum testleri geçti.
