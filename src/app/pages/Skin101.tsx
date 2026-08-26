import { useState, useEffect } from "react";
import { Search, Bookmark } from "lucide-react";
import { PageHero } from "../components/PageHero";
import { supabase } from "../../supabaseClient";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  emoji: string;
  skinType: string;
  short: string;
  whatItDoes: string;
  howToUse: string;
  foundIn: string;
  caution: string;
}

export const FAV_INGREDIENTS_KEY = "growmula_fav_ingredients";
export const ingredientNameById: Record<string, string> = {};

const FAV_KEY = FAV_INGREDIENTS_KEY;
const ImageAcidLabel = "UYGUN CİLT TİPİ";

export function Skin101() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Ingredient | null>(null);
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    async function initData() {
      setLoading(true);

      // 1. Kullanıcı Oturumunu Kontrol Et
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      // 2. İçerikleri Çek
      const { data: ingData, error: ingError } = await supabase.from("ingredients").select("*");
      if (ingError) {
        console.error("İçerikler çekilirken hata:", ingError);
      } else if (ingData) {
        const mapped: Ingredient[] = ingData.map((row: any) => ({
          id: String(row.id),
          name: row.name,
          category: row.category,
          emoji: row.emoji,
          skinType: row.skin_type,
          short: row.short_description,
          whatItDoes: row.what_it_does,
          howToUse: row.how_to_use,
          foundIn: row.found_in,
          caution: row.caution,
        }));
        setIngredients(mapped);
        mapped.forEach((ing) => {
          ingredientNameById[ing.id] = ing.name;
        });
      }

      // 3. Favorileri Çek
      if (currentUser) {
        const { data: favData, error: favError } = await supabase
          .from("favorites")
          .select("item_id")
          .eq("user_id", currentUser.id)
          .eq("item_type", "ingredient");

        if (!favError && favData) {
          const favIds = favData.map((f: any) => String(f.item_id));
          setFavorites(favIds);
          localStorage.setItem(FAV_KEY, JSON.stringify(favIds));
        }
      } else {
        try {
          const localFavs = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
          setFavorites(localFavs.map(String));
        } catch {
          setFavorites([]);
        }
      }

      setLoading(false);
    }

    initData();
  }, []);

  const toggleFavorite = async (id: string) => {
    const stringId = String(id);
    const isFav = favorites.includes(stringId);
    const nextFavorites = isFav
      ? favorites.filter((x) => x !== stringId)
      : [...favorites, stringId];

    // Anlık ekran ve localStorage güncellemesi
    setFavorites(nextFavorites);
    localStorage.setItem(FAV_KEY, JSON.stringify(nextFavorites));

    // Supabase Senkronizasyonu
    if (user) {
      if (isFav) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", stringId)
          .eq("item_type", "ingredient");
      } else {
        await supabase
          .from("favorites")
          .insert([
            {
              user_id: user.id,
              item_id: stringId,
              item_type: "ingredient",
            },
          ]);
      }
    }
  };

  const filtered = ingredients.filter((i) => {
    if (showFavorites && !favorites.includes(i.id)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.skinType.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <PageHero
        title="Skin101"
        subtitle="Cilt bakımında kullanılan aktif içerikler, asitler ve doğal özler hakkında bilmen gereken her şey. Bilimin ışığında doğru formülü keşfet."
        image="https://images.unsplash.com/photo-1772987714654-2df39af2c658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
      />

      <section className="px-6 md:px-[100px] pt-12 md:pt-16 pb-4 bg-[#F3F1ED] flex flex-col items-center gap-5">
        <div className="relative w-full max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5E5954]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İçerik ara... (örn. Niasinamid, Retinol)"
            className="w-full rounded-lg border border-[#DDD9D4] bg-white py-3.5 pl-11 pr-4 text-[#1C1A17] outline-none focus:border-[#1C1A17] transition-colors"
            style={{ fontFamily: "Geist", fontSize: 15 }}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFavorites(false)}
            className={`rounded-full px-4 py-2 border transition-colors ${
              !showFavorites
                ? "bg-[#1C1A17] text-[#F3F1ED] border-[#1C1A17]"
                : "bg-white text-[#5E5954] border-[#DDD9D4] hover:text-[#1C1A17]"
            }`}
            style={{ fontFamily: "Geist", fontSize: 13, fontWeight: 500 }}
          >
            Tüm İçerikler
          </button>
          <button
            onClick={() => setShowFavorites(true)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 border transition-colors ${
              showFavorites
                ? "bg-[#1C1A17] text-[#F3F1ED] border-[#1C1A17]"
                : "bg-white text-[#5E5954] border-[#DDD9D4] hover:text-[#1C1A17]"
            }`}
            style={{ fontFamily: "Geist", fontSize: 13, fontWeight: 500 }}
          >
            <Bookmark size={14} fill={showFavorites ? "currentColor" : "none"} />
            Favorilerim ({favorites.length})
          </button>
        </div>
      </section>

      <section className="px-6 md:px-[100px] pt-4 pb-12 md:pb-16 bg-[#F3F1ED]">
        {loading ? (
          <p className="text-center text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 15 }}>
            Yükleniyor...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 15 }}>
            {showFavorites
              ? "Henüz favori içeriğin yok. Kartlardaki yer imi simgesine dokunarak ekleyebilirsin."
              : "Aramanla eşleşen bir içerik bulunamadı."}
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="text-left bg-white rounded-lg p-6 flex flex-col gap-4 shadow-[0px_8px_16px_rgba(0,0,0,0.05)] hover:shadow-[0px_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#EAE7E2] px-3 py-1 text-[#1C1A17]"
                    style={{ fontFamily: "Geist", fontSize: 12, fontWeight: 500 }}
                  >
                    <span>{item.emoji}</span>
                    {item.category}
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={favorites.includes(item.id) ? "Favorilerden çıkar" : "Favorilere ekle"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }
                    }}
                    className={`transition-colors cursor-pointer ${
                      favorites.includes(item.id)
                        ? "text-[#1C1A17]"
                        : "text-[#5E5954] hover:text-[#1C1A17]"
                    }`}
                  >
                    <Bookmark
                      size={18}
                      fill={favorites.includes(item.id) ? "currentColor" : "none"}
                    />
                  </span>
                </div>
                <h3 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 24, fontWeight: 500 }}>
                  {item.name}
                </h3>
                <p className="text-[#5E5954] flex-1" style={{ fontFamily: "Geist", fontSize: 14, lineHeight: "23px" }}>
                  {item.short}
                </p>
                <div className="pt-4 border-t border-[#EAE7E2] flex flex-col gap-2">
                  <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 11, letterSpacing: 2 }}>
                    {ImageAcidLabel}
                  </span>
                  <span
                    className="self-start rounded-md bg-[#F3F1ED] px-3 py-1 text-[#1C1A17]"
                    style={{ fontFamily: "Geist", fontSize: 13 }}
                  >
                    {item.skinType}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <IngredientModal ingredient={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function IngredientModal({
  ingredient,
  onClose,
}: {
  ingredient: Ingredient;
  onClose: () => void;
}) {
  const sections: { label: string; text: string }[] = [
    { label: "NE İŞE YARAR?", text: ingredient.whatItDoes },
    { label: "NASIL KULLANILIR?", text: ingredient.howToUse },
    { label: "HANGİ ÜRÜNLERDE BULUNUR?", text: ingredient.foundIn },
    { label: "DİKKAT EDİLMESİ GEREKENLER", text: ingredient.caution },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-8 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4 border-b border-[#EAE7E2] pb-5">
          <h2 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 30, fontWeight: 500 }}>
            {ingredient.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-[#EAE7E2] px-3 py-1 text-[#1C1A17]"
              style={{ fontFamily: "Geist", fontSize: 12, fontWeight: 500 }}
            >
              <span>{ingredient.emoji}</span>
              {ingredient.category}
            </span>
            <span
              className="rounded-md bg-[#F3F1ED] px-3 py-1 text-[#1C1A17]"
              style={{ fontFamily: "Geist", fontSize: 12 }}
            >
              {ingredient.skinType}
            </span>
          </div>
        </div>

        {sections.map((s) => (
          <div key={s.label} className="flex flex-col gap-2">
            <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 11, letterSpacing: 2 }}>
              {s.label}
            </span>
            <p className="text-[#1C1A17]" style={{ fontFamily: "Geist", fontSize: 15, lineHeight: "24px" }}>
              {s.text}
            </p>
          </div>
        ))}

        <button
          onClick={onClose}
          className="self-end bg-[#1C1A17] text-[#F3F1ED] px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          style={{ fontFamily: "Geist", fontSize: 14, fontWeight: 500 }}
        >
          Kapat
        </button>
     </div>
    </div>
  );
}