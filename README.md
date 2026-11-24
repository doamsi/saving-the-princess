# Saving the Princess — kesintisiz koşu prototipi

## V21 güncellemesi

- Ana menü yalnızca **Run** ve **Characters** düğmelerinden oluşur.
- Run, kullanıcının verdiği `kling_20261101_VIDEO_Kling_AI_C_1441_0.mp4` videosunun yerel kopyasıyla başlar. Video bitince koşu otomatik başlar; **Skip** ile geçilebilir.
- Video ile oynanış arasında 0,78 saniyelik çapraz solma bulunur; köprü ve koşu video kaybolurken arkada hareket etmeye başlar.
- Prens, kral ve muhafızlar dört kareli koşu animasyonu kullanır.
- Köprü yeni yüksek çözünürlüklü bir sahneyle tamamen yenilendi: düz, geniş, simetrik ve üç şerit ile tüm engeller korkulukların içinde kalır.
- Toplanan coin hemen sahneden kaldırılır ve cüzdana yazılır; `+1 coin` bildirimi gösterilmez.
- Köpek, kılıç ve kabarık çiçekler zıplayarak aşılabilir. Muhafızdan şerit değiştirerek kaçılır.
- Zıplama süresi kısa tutuldu ve dikey yükselme artırıldı; prens köpek, kılıç ve çiçeğin görsel olarak üzerinde kalır.
- Koşu hızı ve engel sıklığı zaman ilerledikçe kademeli olarak artar.
- Köpek, kılıç, çiçek ve coin; tek ışık ve malzeme stilinde yeni yüksek kaliteli görsellerle değiştirildi.
- Gardiyan büyütüldü; köpek, çiçek ve kılıç küçültülerek birbirleriyle tutarlı ölçeğe getirildi. Bütün cisimler aynı yaklaşma hızını kullanır.
- Kral, prens sağa veya sola geçtiğinde aynı şeridi hafif gecikmeyle takip eder; prens ortadayken kral da ortada kalır.
- Kılıç artık köprü üzerinde yatmaz; sapı zemine yakın, ucu havaya bakacak biçimde dik ve hafif perspektifli üç boyutlu bir engel olarak çizilir.
- Cisimler yaklaşırken, oyuncunun altından geçerken ve ekran dışına sürüklenirken aynı hareket adımını korur. Kare düşüşlerinde zaman telafisi artırıldı; engeller köprünün alt kenarına ulaşmadan kaldırılmaz.
- Prensin havadayken geçtiği köpek ve çiçek `cleared` olarak işaretlenir; inişin son anından önce geride bırakılır. Prens böylece engelin üstüne değil doğrudan boş köprü zeminine iner.
- Zıplanabilir engeller yalnızca köpek ve çiçektir. Gardiyan ve dik kılıç havadayken de çarpışma sayılır; bunlardan şerit değiştirerek kaçmak gerekir.
- Prens köprü üzerinde yaklaşık 40 piksel daha ileride koşar; çarpışma çizgisi de yeni görsel konumuna taşındı.
- Zorluk süreyle birlikte belirgin biçimde artar: cisimlerin yaklaşma hızı yükselir, engel dalgaları 1,9 saniyeden 0,5 saniyeye kadar sıklaşır. 20. saniyeden sonra artan ihtimalle iki şerit aynı anda kapanır; her dalgada en az bir güvenli şerit korunur.
- Arka plan müziği olarak Pixabay'den “Middle Ages happynes” — Land_of_Books_YouTube kullanılır (`assets/middle-ages-happynes.mp3`). Parça döngüde, ana menüde ve oynanış boyunca devam eder. Kaynak: https://pixabay.com/music/folk-middle-ages-happynes-432859/ — Pixabay Content License.
- Ana menüde kalıcı **Mute music / Unmute music** seçeneği bulunur; tercih yerel kayıtta saklanır. Mute ayrıca köpek sesini ve video sesini de susturur.
- Engeller ve alınmayan coinler prensi geçtikten yaklaşık 0,1 derinlik sonra kaldırılır. Böylece prensin hemen arkasında kaybolur ve kralın bulunduğu alt bölgeye ulaşmaz.
- Satın alınan ve **Select** yapılan karakterin özel yeteneği oynanışta aktif olur. Karakter kartları yetenek açıklamasını gösterir.
- James ilk çiçeği etkisiz bırakır; David koşu başına bir gardiyan/kılıç çarpışmasını engeller; Eren daha hızlı şerit değiştirir; Lucas güvenli şeridi yeşil ışıkla önceden gösterir; William coin gelirini %15 artırır.
- Sophia ilk köpek çarpışmasını engeller; Ava daha hızlı/yüksek zıplar ve havadayken gardiyan ile kılıcı aşabilir; Aria çiçeğe bastığında 10 bonus coin kazanır; Nora'nın devam ücreti 75, Olivia'nın devam ücreti 50 coindir.
- Cüzdan altın oyun coin'iyle ekranın sağ üstünde sabit görünür. Oyun HUD'ı `SCORE: değer · altın coin + bu koşuda kazanılan miktar` biçimindedir. Koşu sonu ekranı yalnızca SCORE, koşuda kazanılan coin ve BEST SCORE gösterir.
- SCORE ve BEST SCORE yanındaki `m` kaldırıldı. İşletim sistemine göre gümüş görünen coin emojisi yerine cüzdan, HUD, sonuç ekranı ve mağazada tutarlı altın renkli oyun coin'i kullanılır.
- Ana menüde **Türkçe / English** seçici bulunur ve tercih yerel kayıtta saklanır. Dil yalnızca ana menüdeki Run/Characters/Mute-Unmute etiketlerini ve karakter yetenek açıklamalarını değiştirir.
- Characters ekranında kullanıcının verdiği 5 prens ve 5 prenses tasarımı bulunur. Her iki grupta fiyatlar 100.000, 150.000, 200.000, 250.000 ve 350.000 coindir.
- Coin mağazası 10.000/$0.99, 50.000/$4.99 ve 100.000/$7.99 paketlerini gösterir. Prototip ödeme almaz; gerçek sürüm StoreKit gerektirir.

`index.html` dosyasını Safari veya Chrome'da açın. `game.js` ve `assets` klasörünü aynı dizinde tutun. Harici ağ bağımlılığı yoktur. Ok tuşları veya dokunarak kaydırma ile oynanır. Yerel kayıt, tarayıcının depolama iznine bağlıdır.

## Oynanış

- Bölüm haritası kaldırıldı; hız ve engel sıklığı zamanla artar.
- Açılış `assets/opening-cinematic-v8.mp4` dosyasından oynatılan gerçek MP4 videodur.
- Ardından kamera prensi ve arkasındaki kralı arkadan gösterir. Asma köprüde koşulur.
- Muhafızdan şerit değiştirerek kaçılır; köpek, kılıç ve kabarık çiçeklerin üzerinden atlanır.
- Çiçeğe basınca kral yaklaşır; 5 saniye başka hata yapılmazsa uzaklaşır. Kral yakındayken tekrar çiçeğe basmak koşuyu bitirir. Diğer engellere çarpma da koşuyu bitirir.
- Coinler alındıkları anda cüzdana kaydedilir. Ölünce kaybolmaz.
- Çarpınca 5 gerçek saniyelik, 100 coin karşılığında devam teklifi çıkar. Süre dolarsa veya coin yetmezse koşu biter. Devam sırasında 2 saniyelik koruma vardır.
- Characters ekranında beş prens ve beş prenses bulunur; fiyatları her grupta 100.000, 150.000, 200.000, 250.000 ve 350.000 coindir.
- Coin paketleri arayüzde gösterilir ancak prototip ödeme almaz. App Store sürümünde StoreKit entegrasyonu gerekir.

## Görsel üretim

Yerleşik ImageGen aracı kullanıldı. Referans storyboard kullanıcı tarafından sağlandı.

Arka plan prompt özeti: “Portrait cinematic fairytale forest, mossy trees, golden sunlight, turquoise ravine river, centered suspension bridge, realistic materials, no people or UI.”

Karakter atlası prompt özeti: “Transparent 4×2 atlas; four rear-view running poses of teal prince, rear-view ivory princess, rear-view burgundy king, front-view guard and dog; detailed cinematic fairytale rendering.”

Düzeltme: “Remove entire background to genuine transparent alpha; preserve characters, grid and poses.”

V7 köprü prompt özeti: “Portrait mobile endless-runner background; very wide, straight and level wooden suspension bridge; three broad lanes; symmetrical one-point perspective; premium animated-feature 3D environment; empty deck; no text or characters.” Sonuç `assets/bridge-v7.jpg` olarak kullanıldı.

V7 engel prompt özeti: “Transparent four-object game sprite sheet: running medieval hound, polished sword, raised colorful forest flower patch and embossed gold coin; consistent premium animated-feature 3D materials and lighting; no text.” Sonuç `assets/obstacles-v7.png` olarak kullanıldı.

Tam görsel kalite ve doğal animasyon için rig'lenmiş 3D karakterler veya temizlenmiş çok kareli animasyon setleri ve gerçek açılış video dosyası gerekir. Bu sürüm 2.5D çizim tabanlı prototiptir; App Store paketi değildir.

## Kontroller

Yeni MP4 açılış, videodan koşuya çapraz geçiş, dengelenmiş engel ölçekleri ve kralın sağ/orta/sol şerit takibi canlı tarayıcıda kontrol edildi. Tarayıcı konsolunda hata bulunmadı. Çiçek/5 saniye toparlanma, coin kaydı, 100 coin düşümü, teklif süresi, zıplanabilir engeller, muhafızdan kaçma ve sonsuz koşu mantığı doğrulandı.
