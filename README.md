# ASAY Energy

Geliştirilmiş yönetim paneli ve referans videoya göre düzenlenmiş parallax açılışı.

## İndir

[Güncel kurulum ZIP dosyasını indir](https://github.com/secondpandaonthemoon-sudovat/energy/raw/refs/heads/main/releases/asayenergy.zip)

Alternatif: `releases/asayenergy.zip` dosyasını açıp GitHub üzerindeki **Download raw file** düğmesini kullanın. Özel depolarda GitHub hesabınızla oturum açmanız gerekir.

- [Kurulum ve kullanım](README_TR.md)
- [Parallax karşılaştırması](PARALLAX_KARSILASTIRMA.md)
- [Diğer değişiklikler ve test kapsamı](DEGISIKLIK_RAPORU.md)

## Yapılandırma

Gerçek veritabanı bağlantı bilgileri bu depoya veya dağıtım ZIP'ine dahil edilmemiştir. ZIP yalnızca kurulum şablonu içerir. Yeni kurulum için `install.php` kullanın; mevcut sunucuyu güncellerken sunucudaki `config/database.php`, `data/installed.lock` ve `uploads/` dizinini koruyun. Kurulumu mevcut veritabanına tekrar çalıştırmayın.

Kaynak depoyu klonladıysanız yapılandırmayı `config/database.php.example` dosyasından oluşturabilir veya kurulum aracını kullanabilirsiniz.

## Geliştirme

```sh
npm ci
npm run build
npm test
```

Derlenmiş `assets/app.js` ve `assets/tailwind.css` pakete dahildir; üretim sunucusunda Node.js gerekmez.
