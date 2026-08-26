import { useState, useEffect } from "react";
import { PageHero } from "../components/PageHero";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Clock, Heart, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "../../supabaseClient";

/* ---------------- Dolabım (malzeme deposu) ---------------- */

interface PantryItem {
  name: string;
  emoji: string;
}

const pantry: { group: string; items: PantryItem[] }[] = [
  {
    group: "MUTFAK",
    items: [
      { name: "Bal", emoji: "🍯" },
      { name: "Yoğurt", emoji: "🥛" },
      { name: "Yumurta", emoji: "🥚" },
      { name: "Zeytinyağı", emoji: "🫒" },
      { name: "Limon", emoji: "🍋" },
      { name: "Avokado", emoji: "🥑" },
      { name: "Süt", emoji: "🥛" },
      { name: "Salatalık", emoji: "🥒" },
      { name: "Havuç", emoji: "🥕" },
    ],
  },
  {
    group: "BAHARAT & BİTKİ",
    items: [
      { name: "Zerdeçal", emoji: "🟡" },
      { name: "Tarçın", emoji: "🌿" },
      { name: "Yeşil Çay", emoji: "🍵" },
      { name: "Papatya", emoji: "🌼" },
      { name: "Aloe Vera", emoji: "🪴" },
    ],
  },
  {
    group: "DİĞER MALZEMELER",
    items: [
      { name: "Kahve", emoji: "☕" },
      { name: "Yulaf", emoji: "🌾" },
      { name: "Pirinç Unu", emoji: "🍚" },
      { name: "Hindistan Cevizi Yağı", emoji: "🥥" },
      { name: "Argan Yağı", emoji: "💧" },
    ],
  },
];

/* ---------------- Tarifler ---------------- */

interface Recipe {
  id: string;
  name: string;
  category: string;
  categoryEmoji: string;
  skinType: string;
  image: string;
  time: string;
  prep: string;
  apply: string;
  ingredients: string[];
  ingredientsDetailed: string[];
  howTo: string;
  benefits: string;
  caution: string;
}

/* ---------------- Sayfa ---------------- */

export const FAV_RECIPES_KEY = "growmula_fav_recipes";

// Gunlugum.tsx bu objeyi kullanarak favori tarif id'lerini isim/kategoriye çeviriyor.
// KendinYap sayfası verileri Supabase'den çektiğinde bu obje otomatik doldurulur.
export const recipeInfoById: Record<string, { name: string; category: string }> = {};

export function KendinYap() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPantry, setSelectedPantry] = useState<string[]>([
    "Bal",
    "Yoğurt",
    "Avokado",
    "Salatalık",
    "Zerdeçal",
    "Aloe Vera",
  ]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof localStorage === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(FAV_RECIPES_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [active, setActive] = useState<Recipe | null>(null);

  useEffect(() => {
    async function fetchRecipes() {
      const { data, error } = await supabase
        .from("recipes")
        .select("*, recipe_ingredients(ingredient_name, detailed_text, sort_order)");
      if (error) {
        console.error("Tarifler yüklenirken hata oluştu:", error);
        setLoading(false);
        return;
      }
      const mapped: Recipe[] = (data || []).map((row: any) => {
        const sorted = [...(row.recipe_ingredients || [])].sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        );
        return {
          id: row.id,
          name: row.name,
          category: row.category,
          categoryEmoji: row.category_emoji,
          skinType: row.skin_type,
          image: row.image,
          time: row.time,
          prep: row.prep,
          apply: row.apply,
          ingredients: sorted.map((i: any) => i.ingredient_name),
          ingredientsDetailed: sorted.map((i: any) => i.detailed_text),
          howTo: row.how_to,
          benefits: row.benefits,
          caution: row.caution,
        };
      });
      setRecipes(mapped);
      mapped.forEach((r) => {
        recipeInfoById[r.id] = { name: r.name, category: r.category };
      });
      setLoading(false);
    }
    fetchRecipes();
  }, []);

  const togglePantry = (name: string) =>
    setSelectedPantry((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );

  const toggleFavorite = (id: string) =>
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(FAV_RECIPES_KEY, JSON.stringify(next));
      return next;
    });

  return (
    <>
      <PageHero
        title="Kendin Yap"
        subtitle="Evindeki malzemelerle hazırlayabileceğin, kimyasallardan uzak ve her biri cildinin farklı bir ihtiyacına hitap eden doğal cilt bakım tariflerini keşfet."
        image="https://images.unsplash.com/photo-1779524477261-12141ccbd8d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
      />

      <section className="px-6 md:px-[100px] py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Tarifler */}
          <div className="flex-1">
            <h2 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 28, fontWeight: 500 }}>
              Sana Uygun Tarifler
            </h2>
            <p className="mt-1 text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 15 }}>
              Dolabındaki malzemelerle hemen hazırlayabileceğin doğal bakım çözümleri
            </p>

            {loading ? (
              <p className="mt-8 text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 15 }}>
                Yükleniyor...
              </p>
            ) : (
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                {recipes.map((r) => {
                  const canMake = r.ingredients.every((ing) => selectedPantry.includes(ing));
                  return (
                    <div
                      key={r.id}
                      className={`bg-white rounded-2xl overflow-hidden border flex flex-col transition-colors ${
                        canMake ? "border-[#7A8B6F] ring-1 ring-[#7A8B6F]" : "border-[#DDD9D4]"
                      }`}
                    >
                      <div className="relative">
                        <ImageWithFallback src={r.image} alt={r.name} className="w-full h-44 object-cover" />
                        {canMake && (
                          <span
                            className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#7A8B6F] px-3 py-1 text-white shadow-sm"
                            style={{ fontFamily: "Geist", fontSize: 12, fontWeight: 600 }}
                          >
                            <CheckCircle2 size={14} /> Yapabilirsin
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex flex-col gap-4 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1 rounded-md bg-[#EAE7E2] px-2.5 py-1 text-[#1C1A17]"
                            style={{ fontFamily: "Geist", fontSize: 12, fontWeight: 500 }}
                          >
                            <span>{r.categoryEmoji}</span>
                            {r.category}
                          </span>
                          <span
                            className="rounded-md bg-[#F3F1ED] px-2.5 py-1 text-[#5E5954]"
                            style={{ fontFamily: "Geist", fontSize: 12 }}
                          >
                            {r.skinType}
                          </span>
                        </div>

                        <h3 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 20, fontWeight: 500 }}>
                          {r.name}
                        </h3>

                        <div className="flex flex-col gap-2">
                          <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 11, letterSpacing: 1.5 }}>
                            GEREKEN MALZEMELER
                          </span>
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                            {r.ingredients.map((ing) => {
                              const have = selectedPantry.includes(ing);
                              return (
                                <span
                                  key={ing}
                                  className={`inline-flex items-center gap-1.5 ${have ? "text-[#1C1A17]" : "text-[#9A948D]"}`}
                                  style={{ fontFamily: "Geist", fontSize: 13 }}
                                >
                                  {have ? (
                                    <CheckCircle2 size={14} className="text-[#1C1A17]" />
                                  ) : (
                                    <Circle size={14} />
                                  )}
                                  {ing}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-[#EAE7E2] flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13 }}>
                            <Clock size={14} /> {r.time}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleFavorite(r.id)}
                              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors ${
                                favorites.includes(r.id)
                                  ? "text-[#1C1A17]"
                                  : "text-[#5E5954] hover:text-[#1C1A17]"
                              }`}
                              style={{ fontFamily: "Geist", fontSize: 13 }}
                            >
                              <Heart size={14} fill={favorites.includes(r.id) ? "currentColor" : "none"} />
                              Kaydet
                            </button>
                            <button
                              onClick={() => setActive(r)}
                              className="rounded-full border border-[#1C1A17] px-3.5 py-1.5 text-[#1C1A17] hover:bg-[#1C1A17] hover:text-white transition-colors"
                              style={{ fontFamily: "Geist", fontSize: 13, fontWeight: 500 }}
                            >
                              Tarifi Gör
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dolabım */}
          <aside className="lg:w-[320px] shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-[#DDD9D4] p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 22, fontWeight: 500 }}>
                  Dolabım
                </h3>
                <span
                  className="rounded-full bg-[#EAE7E2] px-3 py-1 text-[#1C1A17] whitespace-nowrap"
                  style={{ fontFamily: "Geist", fontSize: 12, fontWeight: 500 }}
                >
                  {selectedPantry.length} malzeme seçildi
                </span>
              </div>
              <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13, lineHeight: "21px" }}>
                Evinde bulunan malzemeleri aşağıdan işaretle, elindekilerle yapabileceğin tariflerdeki
                eşleşmeleri anında takip et.
              </p>

              {pantry.map((cat) => (
                <div key={cat.group} className="flex flex-col gap-2">
                  <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 11, letterSpacing: 1.5 }}>
                    {cat.group}
                  </span>
                  {cat.items.map((item) => {
                    const checked = selectedPantry.includes(item.name);
                    return (
                      <label
                        key={item.name}
                        className="flex items-center gap-2.5 cursor-pointer select-none py-0.5"
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            checked ? "bg-[#1C1A17] border-[#1C1A17]" : "border-[#C4BEB6] bg-white"
                          }`}
                        >
                          {checked && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5.2 4 7.5 8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => togglePantry(item.name)}
                        />
                        <span className={checked ? "text-[#1C1A17]" : "text-[#5E5954]"} style={{ fontFamily: "Geist", fontSize: 14 }}>
                          {item.emoji} {item.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {active && (
        <RecipeModal
          recipe={active}
          isFavorite={favorites.includes(active.id)}
          onToggleFavorite={() => toggleFavorite(active.id)}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}

/* ---------------- Modal ---------------- */

function RecipeModal({
  recipe,
  isFavorite,
  onToggleFavorite,
  onClose,
}: {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}) {
  const sections = [
    { label: "NASIL YAPILIR?", text: recipe.howTo },
    { label: "FAYDALARI", text: recipe.benefits },
    { label: "DİKKAT EDİLMESİ GEREKENLER", text: recipe.caution },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-8 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4 border-b border-[#EAE7E2] pb-5">
          <h2 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 26, fontWeight: 500 }}>
            {recipe.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-md bg-[#EAE7E2] px-2.5 py-1 text-[#1C1A17]"
              style={{ fontFamily: "Geist", fontSize: 12, fontWeight: 500 }}
            >
              <span>{recipe.categoryEmoji}</span>
              {recipe.category}
            </span>
            <span className="rounded-md bg-[#F3F1ED] px-2.5 py-1 text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 12 }}>
              {recipe.skinType}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13 }}>
            <Clock size={14} /> Hazırlık: {recipe.prep} · Uygulama: {recipe.apply}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 11, letterSpacing: 1.5 }}>
            MALZEMELER
          </span>
          <ul className="flex flex-col gap-1.5">
            {recipe.ingredientsDetailed.map((ing) => (
              <li key={ing} className="flex items-start gap-2 text-[#1C1A17]" style={{ fontFamily: "Geist", fontSize: 15 }}>
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#D1C7BD] shrink-0" />
                {ing}
              </li>
            ))}
          </ul>
        </div>

        {sections.map((s) => (
          <div key={s.label} className="flex flex-col gap-2">
            <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 11, letterSpacing: 1.5 }}>
              {s.label}
            </span>
            <p className="text-[#1C1A17]" style={{ fontFamily: "Geist", fontSize: 15, lineHeight: "24px" }}>
              {s.text}
            </p>
          </div>
        ))}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onToggleFavorite}
            className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 transition-colors ${
              isFavorite
                ? "border-[#1C1A17] text-[#1C1A17] bg-[#F3F1ED]"
                : "border-[#DDD9D4] text-[#5E5954] hover:text-[#1C1A17] hover:border-[#1C1A17]"
            }`}
            style={{ fontFamily: "Geist", fontSize: 14, fontWeight: 500 }}
          >
            <Heart size={15} fill={isFavorite ? "currentColor" : "none"} />
            Favorilere Kaydet
          </button>
          <button
            onClick={onClose}
            className="bg-[#1C1A17] text-[#F3F1ED] px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
            style={{ fontFamily: "Geist", fontSize: 14, fontWeight: 500 }}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}