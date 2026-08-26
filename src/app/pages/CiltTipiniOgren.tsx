import { useState, useEffect } from "react";
import { PageHero } from "../components/PageHero";
import { Check, Sparkles, RefreshCw, ChevronRight } from "lucide-react";
import { supabase } from "../../supabaseClient";

export const SKIN_TYPE_KEY = "glow_skin_type_result";

interface Question {
  id: number;
  question: string;
  subtitle: string;
  options: {
    label: string;
    type: "Yaglı" | "Kuru" | "Karma" | "Hassas" | "Normal";
  }[];
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: "Sabah uyandığınızda cildiniz genellikle nasıl hissettirir?",
    subtitle: "Yüzünüzü yıkamadan önceki ilk hissinizi düşünün.",
    options: [
      { label: "Tüm yüzümde belirgin bir parlama ve yağlılık hissi olur.", type: "Yaglı" },
      { label: "Gergin, mat ve nem ihtiyacı hissederim.", type: "Kuru" },
      { label: "Alın ve burun bölgem parlar, yanaklarım ise normal ya da gergindir.", type: "Karma" },
      { label: "Kızarık, kaşıntılı veya hassas bir hisle uyanırım.", type: "Hassas" },
      { label: "Ne çok yağlı ne çok kuru, dengeli ve rahat hissettirir.", type: "Normal" },
    ],
  },
  {
    id: 2,
    question: "Gün ortasında cildinizdeki gözenek görünümü ve parlama durumu nasıldır?",
    subtitle: "Aynaya baktığınızdaki genel görünümü değerlendirin.",
    options: [
      { label: "Gözeneklerim belirgindir ve gün içinde hızla parlarım.", type: "Yaglı" },
      { label: "Gözeneklerim neredeyse hiç görünmez, cildim mat ve pul pul durabilir.", type: "Kuru" },
      { label: "Sadece T bölgemde (alın, burun, çene) gözenek ve parlama fark ederim.", type: "Karma" },
      { label: "Hava değişimi veya ürün kullanımıyla hemen kızarıklık oluşur.", type: "Hassas" },
      { label: "Gözeneklerim dengelidir, aşırı parlama veya kuruluk olmaz.", type: "Normal" },
    ],
  },
  {
    id: 3,
    question: "Yüzünüzü sadece suyla yıkadıktan 15-20 dakika sonra nasıl hissediyorsunuz?",
    subtitle: "Herhangi bir krem veya ürün sürmeden beklediğinizdeki durum.",
    options: [
      { label: "Kısa sürede tekrar yağlanma ve parlama başlar.", type: "Yaglı" },
      { label: "Cildim ciddi şekilde gerilir ve acil nem ister.", type: "Kuru" },
      { label: "Yanaklarım biraz gerilir ama T bölgem rahat hisseder.", type: "Karma" },
      { label: "Yanma, kaşıntı veya hafif kızarıklık hissi oluşur.", type: "Hassas" },
      { label: "Cildim son derece konforlu ve esnek kalır.", type: "Normal" },
    ],
  },
  {
    id: 4,
    question: "Yeni bir kişisel bakım veya kozmetik ürünü denediğinizde cildinizin tepkisi ne olur?",
    subtitle: "Ürün değişimlerine verdiğiniz genel tepki.",
    options: [
      { label: "Kolayca parlamaya veya sivilcelenmeye yol açabilir.", type: "Yaglı" },
      { label: "Cildim ürünü hemen emer ama yine de kuruluk hissi kalabilir.", type: "Kuru" },
      { label: "T bölgemde sivilce yapabilir ama yanaklarımı iyi nemlendirir.", type: "Karma" },
      { label: "Çoğu ürün kızarıklık, kaşıntı veya batmaya neden olur.", type: "Hassas" },
      { label: "Genellikle sorunsuz uyum sağlar, reaksiyon vermez.", type: "Normal" },
    ],
  },
];

const skinTypeDescriptions: Record<string, { title: string; desc: string; tips: string[] }> = {
  Yaglı: {
    title: "Yağlı Cilt",
    desc: "Cildiniz fazla sebum ürettiği için parlamaya ve gözenek tıkanıklıklarına meyillidir. Hafif yapılı, su bazlı ürünler ve gözenek arındırıcı içerikler sizin için idealdir.",
    tips: [
      "Jel formunda ve salisilik asit (BHA) içeren temizleyiciler tercih edin.",
      "Ağır kremler yerine yağsız, su bazlı nemlendiriciler kullanın.",
      "Haftada 1-2 kez kil maskesi ile gözeneklerinizi arındırın.",
    ],
  },
  Kuru: {
    title: "Kuru Cilt",
    desc: "Cildinizin doğal nem ve yağ bariyeri desteğe ihtiyaç duyuyor. Yoğun nem veren, bariyer güçlendirici besleyici içerikler cildinize iyi gelecektir.",
    tips: [
      "Krem yapıda, nazik ve sülfatsız temizleyiciler kullanın.",
      "Hyalüronik asit ve seramid içeren nemlendiricileri aksatmayın.",
      "Cilt bariyerini korumak için aşırı sıcak suyla yüzünüzü yıkamayın.",
    ],
  },
  Karma: {
    title: "Karma Cilt",
    desc: "T bölgeniz (alın, burun, çene) yağlı ve parlamaya meyilliyken, yanaklarınız kuru veya normal yapıdadır. Dengeli ve bölgeye özel bakım en iyi sonucu verir.",
    tips: [
      "T bölgesine sebum dengeleyici, yanaklara daha yoğun nemlendirici uygulayabilirsiniz.",
      "Niasinamid (B3 Vitamini) içeren serumlar ile cilt dengenizi koruyun.",
      "Nazik, köpüren jellerle cildinizi yormadan temizleyin.",
    ],
  },
  Hassas: {
    title: "Hassas Cilt",
    desc: "Cildiniz dış etkenlere, hava değişimlerine ve ağır kimyasallara karşı hızlı reaksiyon veriyor. Parfümsüz, yatıştırıcı ve sade formüller tercih etmelisiniz.",
    tips: [
      "Parfüm, alkol ve sert asitler içeren ürünlerden uzak durun.",
      "Centella Asiatica (Cica) ve Aloe Vera içeren yatıştırıcı ürünler seçin.",
      "Yeni bir ürünü tüm yüzünüze uygulamadan önce mutlaka bileğinizde test edin.",
    ],
  },
  Normal: {
    title: "Normal Cilt",
    desc: "Cildinizin nem ve yağ dengesi oldukça ideal durumda. Mevcut sağlıklı bariyerinizi korumak ve yaşlanma karşıtı koruma sağlamak yeterlidir.",
    tips: [
      "Dengeli temizleme ve nemlendirme rutininizi sürdürün.",
      "Güneş koruyucu (SPF) kullanımını yaz-kış ihmal etmeyin.",
      "C Vitamini gibi antioksidan serumlarla ışıltınızı destekleyin.",
    ],
  },
};

export function CiltTipiniOgren() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{ title: string; desc: string; tips: string[] } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem(SKIN_TYPE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (skinTypeDescriptions[parsed.title]) {
            setResult(skinTypeDescriptions[parsed.title]);
          }
        }
      } catch {}
    }
  }, []);

  const handleSelectOption = (optionType: string) => {
    const updatedAnswers = { ...answers, [currentStep]: optionType };
    setAnswers(updatedAnswers);

    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(updatedAnswers);
    }
  };

  const calculateResult = async (finalAnswers: Record<number, string>) => {
    setSaving(true);
    const counts: Record<string, number> = {};
    Object.values(finalAnswers).forEach((type) => {
      counts[type] = (counts[type] || 0) + 1;
    });

    let highestType = "Karma";
    let maxCount = 0;
    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        highestType = type;
      }
    });

    const finalResultData = skinTypeDescriptions[highestType] || skinTypeDescriptions["Karma"];
    setResult(finalResultData);

    const resultPayload = {
      title: finalResultData.title,
      desc: finalResultData.desc,
    };

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(SKIN_TYPE_KEY, JSON.stringify(resultPayload));
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from("quiz_results").insert({
          user_id: session.user.id,
          result_skin_type: finalResultData.title,
          created_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error("Test sonucu Supabase'e kaydedilirken hata oluştu:", e);
    } finally {
      setSaving(false);
    }
  };

  const restartQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  const currentQ = quizQuestions[currentStep];

  return (
    <>
      <PageHero
        title="Cilt Tipini Öğren"
        subtitle="Birkaç kısa soruyla cildinin ihtiyaçlarını keşfet ve sana en uygun bakımı planla."
        image="https://images.unsplash.com/photo-1556228720-195a672e8a03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
      />

      <section className="px-6 md:px-[100px] py-16 md:py-24 bg-[#F3F1ED]">
        <div className="max-w-3xl mx-auto">
          {result ? (
            <div className="bg-white rounded-2xl border border-[#DDD9D4] p-8 md:p-12 flex flex-col gap-8 shadow-sm">
              <div className="flex items-center gap-3 text-[#7A8B6F]">
                <Sparkles size={28} />
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "Geist" }}>
                  Test Sonucun Hazır
                </span>
              </div>

              <div>
                <h2 className="text-[#1C1A17] text-3xl md:text-4xl font-semibold" style={{ fontFamily: "Lora" }}>
                  {result.title}
                </h2>
                <p className="mt-4 text-[#5E5954] text-base md:text-lg leading-relaxed" style={{ fontFamily: "Geist" }}>
                  {result.desc}
                </p>
              </div>

              <div className="bg-[#F8F7F4] rounded-xl p-6 border border-[#EAE7E2] flex flex-col gap-4">
                <h3 className="text-[#1C1A17] text-lg font-medium" style={{ fontFamily: "Lora" }}>
                  Sana Özel Tavsiyeler
                </h3>
                <ul className="flex flex-col gap-3">
                  {result.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#5E5954] text-sm md:text-base" style={{ fontFamily: "Geist" }}>
                      <span className="w-5 h-5 rounded-full bg-[#7A8B6F] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EAE7E2] pt-6">
                <p className="text-xs text-[#8C857B]" style={{ fontFamily: "Geist" }}>
                  {saving ? "Günlüğünle senkronize ediliyor..." : "Bu bilgi Günlüğüm sayfandaki profiline otomatik kaydedildi."}
                </p>
                <button
                  onClick={restartQuiz}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#1C1A17] hover:text-[#7A8B6F] transition-colors"
                  style={{ fontFamily: "Geist" }}
                >
                  <RefreshCw size={16} /> Testi Tekrar Çöz
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#DDD9D4] p-8 md:p-12 flex flex-col gap-8 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8C857B] uppercase tracking-wider" style={{ fontFamily: "Geist" }}>
                  Soru {currentStep + 1} / {quizQuestions.length}
                </span>
                <div className="flex items-center gap-1.5">
                  {quizQuestions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep ? "w-8 bg-[#1C1A17]" : i < currentStep ? "w-3 bg-[#7A8B6F]" : "w-3 bg-[#EAE7E2]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-[#1C1A17] text-2xl md:text-3xl font-semibold leading-tight" style={{ fontFamily: "Lora" }}>
                  {currentQ.question}
                </h2>
                <p className="mt-2 text-[#5E5954] text-sm md:text-base" style={{ fontFamily: "Geist" }}>
                  {currentQ.subtitle}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentStep] === opt.type;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt.type)}
                      className={`w-full text-left p-4 md:p-5 rounded-xl border transition-all flex items-center justify-between group ${
                        isSelected
                          ? "border-[#1C1A17] bg-[#F8F7F4] text-[#1C1A17]"
                          : "border-[#EAE7E2] bg-white text-[#5E5954] hover:border-[#8C857B] hover:text-[#1C1A17]"
                      }`}
                    >
                      <span className="text-sm md:text-base pr-4 font-medium" style={{ fontFamily: "Geist" }}>
                        {opt.label}
                      </span>
                      <ChevronRight size={18} className="text-[#8C857B] group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}