# Referans video ve ASAY ana sayfası

İncelenen referans: kullanıcının yüklediği 28 saniyelik `harrywebdeveloper_ssspin.io_1791543792.mp4`. Video dikey olsa da içinde yatay bir masaüstü sitesi gösteriliyor; bu, referans sitenin mobil görünümü değildir.

## Karşılaştırma

| Videodaki hareket | Önceki ASAY davranışı | Bu sürüm |
| --- | --- | --- |
| İlk sahnede büyük yazılar ve ürün ayrı katmanlarda | Jeneratör genel sayfa kaydırmasına göre sabit 520 px aşağı taşınıyordu | Yazılar karşı yönlerde ayrılırken jeneratör kısa bir kaydırma sahnesinde merkezde kalıyor |
| Yaklaşık 4–7. saniyede kırmızı panel ürünün önünden geçiyor | Bölüm sınırında görsel kırpılıyor, benzer bir katman geçişi oluşmuyordu | Marka rengindeki ön panel, mevcut ürün açıklamasıyla görselin önünden geçiyor; ardından ürün açığa çıkıyor |
| Ürün farklı açılardan ve yüzey değişimleriyle gösteriliyor | Tek şeffaf PNG vardı | Sınırlı ölçek, konum ve eğim kullanılıyor; gerçek üç boyutlu dönüş eklenmedi |
| Yaklaşık 11–19. saniyede fotoğraf üzerinde kartlar üst üste geçiyor | Hizmet kartları kendi etkileşimleriyle çalışıyordu | Bu bölümün mevcut davranışı korundu; videodaki kaydırmalı kart yığını kopyalanmadı |
| Proje listesi ve büyük görsel kapanış | ASAY'nin kendi proje ve CTA bölümleri | İçerik ve işlevler korundu; referansın tüm sayfası birebir yeniden oluşturulmadı |

## Uygulanan düzeltmeler

- Hareket ilerlemesi artık tüm belgenin başından değil, ilgili hero bölümünün konumundan hesaplanıyor. CMS'de bölüm sırası değişince yanlış zamanda başlamıyor.
- Kaydırma işlemi React'i her olayda yeniden çizdirmek yerine `requestAnimationFrame` ile CSS değişkenlerini güncelliyor.
- Ekran boyutu, yeniden boyutlandırma ve sayfa gösterimi dikkate alınıyor. Başlangıçta mevcut olan kaydırma konumu okunuyor.
- Masaüstünde sahne 220 ekran yüksekliği kaplıyor; bunun 120 ekran yüzdesi, sahne sabitken katman geçişine ayrılıyor. Kontroller hareketli görselden bağımsız kalıyor.
- Panelin arkasında kalan bilgi kartı görünmezken tıklama ve klavye odağı almıyor. Ana teklif/video kontrolleri erişilebilir kalıyor.
- 768 px altındaki ekranlarda uzun sabitleme kaldırılıyor. Görsel, ürün kartı, istatistikler ve düğmeler okunabilir normal akışta gösteriliyor.
- İşletim sisteminde “hareketi azalt” tercihinde kaydırma animasyonu, nabız ve sıçrama efektleri kapatılıyor.
- Mobil kart/istatistik çakışması ve üst menü düğmesinin dar ekranda kırpılması düzeltildi.
- CMS bölüm boşlukları sahnenin hesaplarını bozmuyor; bölüm arka planı iç sahneye aktarılıyor. Mevcut görsel, başlık ve dekor ayarları korunuyor.

## Doğrulama

Tarayıcı testleri 320, 390, 768 ve 1440 px genişlikleri kapsar. Kontroller: ileri/geri kaydırma, yerel ilerleme, sahne sabitliği, ön panel katman sırası, görselin kadrajda kalması, mobil öğelerin çakışmaması, teklif düğmesi, hareket azaltma tercihinin canlı değişimi, yeniden boyutlandırma ve CMS bölüm sırasının değiştirilmesi.

“Önceden kaydırılmış sayfa” testi, mevcut kaydırma konumunun kullanıcı hareketi beklenmeden okunmasını doğrular. Tarayıcının gerçek yeniden yüklemede eski konumu koruması garanti edilmez; uygulamanın asenkron başlangıcı bazı durumlarda sayfayı başa döndürebilir.

Bu inceleme masaüstü Chromium otomasyonu ve görsel kontrole dayanır. Gerçek telefon donanımındaki kare hızı, Safari ve Firefox için ayrı performans testi yapılmadı. Ekran kaydı bir görünüm örneğidir, performans ölçümü değildir.

## Kullanım ve sınırlar

Dosyalar derlenmiş olarak teslim edilir. Kaynak değişikliklerinden sonra `npm run build` çalıştırılmalıdır. `tests/parallax-regression.cjs`, çalışan yerel sunucuya karşı Playwright ile yeniden çalıştırılabilir. Çıktı konumu `PARALLAX_RESULTS_DIR`, sunucu adresi `TEST_BASE_URL` ile belirtilebilir.

Referansa benzer açılış katman geçişi sağlandı; birebir aynı animasyon veya tüm site kopyası değildir. Gerçek üç boyutlu jeneratör dönüşü için farklı açılardan hazırlanmış görüntüler veya uygun bir 3B model gerekir. Bu çalışma canlı sunucuya dağıtılmadı.
