import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const heroImg =
  "https://images.unsplash.com/photo-1581182800629-7d90925ad072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600";
const productImg1 =
  "https://images.unsplash.com/photo-1743309026555-97f545a08490?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const productImg2 =
  "https://images.unsplash.com/photo-1779228900994-5b055597a0ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";

const categories = [
  {
    title: "Cilt Tipini Öğren",
    to: "/cilt-tipini-ogren",
    img: "https://images.unsplash.com/photo-1637851497145-0faa2e456081?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
  },
  {
    title: "Skin101",
    to: "/skin101",
    img: "https://images.unsplash.com/photo-1777840347880-747242e0db00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
  },
  {
    title: "Kendin Yap",
    to: "/kendin-yap",
    img: "https://images.unsplash.com/photo-1782607514063-c3a632c2aece?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
  },
];

export function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[600px] md:h-[900px] flex flex-col items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={heroImg}
          alt="Cildini önemseyen bir kadın portresi"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative px-6 md:px-20 flex flex-col items-center gap-7 py-20">
          <h1
            className="text-center text-white max-w-4xl"
            style={{ fontFamily: "Lora", fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 400, lineHeight: 1.15 }}
          >
            Cildin Hikayeni Anlatır
          </h1>
          <p
            className="max-w-[680px] text-center text-white/85"
            style={{ fontFamily: "Geist", fontSize: 20, lineHeight: "32px" }}
          >
            Karmaşık rutinlere değil, işe yarayana inanıyoruz.
          </p>
          <Link
            to="/skin101"
            className="px-10 py-3.5 outline outline-1 outline-white text-white hover:bg-white hover:text-[#1C1A17] transition-colors"
            style={{ fontFamily: "Geist", fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: 3 }}
          >
            KEŞFET →
          </Link>
        </div>
      </section>

      {/* Neden Glowmula */}
      <section className="px-6 md:px-[100px] py-16 md:py-[100px] bg-[#EAE7E2] flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 flex items-start gap-6 md:gap-8 justify-center w-full">
          {[productImg1, productImg2].map((img, i) => (
            <div
              key={i}
              className="pt-4 pb-8 px-4 bg-white rounded shadow-[0px_8px_16px_rgba(0,0,0,0.05)]"
            >
              <ImageWithFallback
                src={img}
                alt="Glowmula cilt bakım ürünü"
                className="w-[140px] md:w-[220px] h-[200px] md:h-[270px] object-cover"
              />
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col items-start gap-6">
          <h2 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 40, fontWeight: 400 }}>
            Neden Glowmula?
          </h2>
          <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 16, lineHeight: "26px" }}>
            Glowmula, cilt bakımını karmaşıklaştıran bilgi kirliliğine karşı kuruldu.
          </p>
          <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 16, lineHeight: "26px" }}>
            Amacımız basit: her içeriğin ne işe yaradığını anlaşılır kılmak, evde hazırlanabilecek gerçek
            alternatifler sunmak ve insanları daha bilinçli seçimler yapmaya teşvik etmek.
          </p>
        </div>
      </section>

      {/* Hoş geldin */}
      <section className="px-6 md:px-[100px] py-14 md:py-[60px] bg-[#D1C7BD] flex">
        <div className="flex-1 flex flex-col items-start gap-4">
          <h3 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 36, fontWeight: 400 }}>
            Hoş geldin!
          </h3>
          <p className="text-[#1C1A17] max-w-2xl" style={{ fontFamily: "Geist", fontSize: 16, lineHeight: "26px" }}>
            İçerikleri keşfetmek, kendi karışımını hazırlamak ya da rutinini takip etmek için{" "}
            <Link to="/gunlugum" className="underline underline-offset-4">
              günlüğüm
            </Link>{" "}
            kısmından giriş yap.
          </p>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="px-6 md:px-[100px] py-16 md:py-[100px] flex flex-col md:flex-row items-stretch gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            to={cat.to}
            className="group relative flex-1 h-[320px] rounded-2xl overflow-hidden flex items-center justify-center p-8"
          >
            <ImageWithFallback
              src={cat.img}
              alt={cat.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/45" />
            <span
              className="relative text-center text-white"
              style={{ fontFamily: "Lora", fontSize: 32, fontWeight: 700 }}
            >
              {cat.title}
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
