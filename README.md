# Glowmula

**Cilt bakımını karmaşıklaştıran bilgi kirliliğine karşı kurulmuş bir cilt bakım rehberi.**

Glowmula; cilt tipini keşfetmen, cilt bakım içeriklerini (aktif maddeler, asitler, doğal özler) anlaşılır bir dille öğrenmen, evindeki malzemelerle doğal bakım tarifleri hazırlaman ve tüm rutinini bir günlükte takip etmen için tasarlanmış bir web uygulaması.

---

## Özellikler

### Cilt Tipini Öğren
Birkaç kısa soruluk bir testle cilt tipini (yağlı, kuru, karma, hassas, normal) belirle ve sana özel bakım tavsiyeleri al. Giriş yapmış kullanıcılar için sonuç hesaba kaydedilir.

### Skin101
Cilt bakımında kullanılan aktif içerikler, asitler ve doğal özler hakkında bilimsel ve anlaşılır bilgiler. İçerikleri favorilerine ekleyip daha sonra tekrar bakabilirsin.

### Kendin Yap
Evindeki malzemelerle hazırlayabileceğin, kimyasallardan uzak doğal cilt bakım tarifleri. "Dolabım" özelliğiyle elindeki malzemeleri işaretle, hangi tarifleri hemen yapabileceğini anında gör.

### Günlüğüm
- Sabah ve akşam cilt bakım rutinini oluştur, güne özel takip et
- Takvim üzerinden geçmiş günlerde hangi rutinleri tamamladığını görüntüle
- Cilt gözlemlerini not olarak kaydet
- Favori tariflerin ve içeriklerin tek bir profil ekranında toplanır

---

##  Kullanılan Teknolojiler

- **Frontend:** React + TypeScript + Vite
- **Stil:** Tailwind CSS
- **Backend / Veritabanı / Auth:** Supabase
- **Deploy:** Vercel
- **Paket Yöneticisi:** pnpm

---

## Projeyi Çalıştırma

### Gereksinimler
- [Node.js](https://nodejs.org/) (v18 veya üzeri önerilir)
- [pnpm](https://pnpm.io/installation)

### Kurulum

# Bağımlılıkları yükle
pnpm install

# Ortam değişkenlerini ayarla
# .env.local dosyasına Supabase URL ve anon key'ini ekle
.env.local dosyası örneği:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key


### Geliştirme sunucusunu başlat
pnpm dev

Uygulama varsayılan olarak http://localhost:5173 üzerinde çalışır.
### Production build
pnpm build ya da npm run dev 
---

## Lisans

Bu proje kişisel/eğitim amaçlı geliştirilmektedir.
