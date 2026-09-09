# Glowmula

**Cilt bakımını karmaşıklaştıran bilgi kirliliğine karşı kurulmuş bir cilt bakım rehberi.**

Glowmula; cilt tipini keşfetmen, cilt bakım içeriklerini (aktif maddeler, asitler, doğal özler) anlaşılır bir dille öğrenmen, evindeki malzemelerle doğal bakım tarifleri hazırlaman ve tüm rutinini bir günlükte takip etmen için tasarlanmış bir web uygulaması.

## Özellikler

- **Cilt Tipini Öğren** — Birkaç kısa soruluk bir testle cilt tipini (yağlı, kuru, karma, hassas, normal) belirle ve sana özel bakım tavsiyeleri al.
- **Skin101** — Cilt bakımında kullanılan aktif içerikler, asitler ve doğal özler hakkında bilimsel ve anlaşılır bilgiler. İçerikleri favorilerine ekle.
- **Kendin Yap** — Evindeki malzemelerle hazırlayabileceğin doğal cilt bakım tarifleri. "Dolabım" özelliğiyle elindeki malzemeleri işaretle, hangi tarifleri yapabileceğini anında gör.
- **Günlüğüm** — Sabah/akşam rutinini oluştur ve takip et, takvimden geçmiş günleri görüntüle, cilt gözlemlerini not al, favorilerini tek ekranda topla.

## Kullanılan Teknolojiler

- React + TypeScript + Vite
- Tailwind CSS
- Supabase (veritabanı, kimlik doğrulama)
- Vercel (deploy)
- pnpm

## Kurulum

Gereksinimler: [Node.js](https://nodejs.org/) (v18+) ve [pnpm](https://pnpm.io/installation)

**1. Bağımlılıkları yükle**

```bash
pnpm install
```

**2. Ortam değişkenlerini ayarla**

Proje kök dizininde bir `.env.local` dosyası oluştur ve içine şunları ekle:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**3. Geliştirme sunucusunu başlat**

```bash
pnpm dev
```

Uygulama varsayılan olarak [http://localhost:5173](http://localhost:5173) üzerinde çalışır.

**4. Production build**

```bash
pnpm build
```
## Lisans

Bu proje kişisel/eğitim amaçlı geliştirilmektedir.
