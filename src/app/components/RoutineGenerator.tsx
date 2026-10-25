import { useState } from "react";
import { Sparkles, Sun, Moon, CalendarDays, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "../../supabaseClient";

interface RoutineStep {
  step: string;
  product: string;
  why: string;
}

interface Routine {
  morning: RoutineStep[];
  evening: RoutineStep[];
  weekly: RoutineStep[];
}

interface Props {
  skinType: string;
  isLoggedIn: boolean;
}

type StepCount = "minimal" | "standart" | "detayli";

const stepOptions: { value: StepCount; label: string; hint: string }[] = [
  { value: "minimal", label: "Minimal", hint: "3 adım" },
  { value: "standart", label: "Standart", hint: "4 adım" },
  { value: "detayli", label: "Detaylı", hint: "5 adım" },
];

function StepList({ title, icon, items }: { title: string; icon: React.ReactNode; items: RoutineStep[] }) {
  if (items.length === 0) return null;
  return (
    <div className="bg-[#F8F7F4] rounded-xl p-6 border border-[#EAE7E2] flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[#1C1A17]">
        {icon}
        <h4 className="text-lg font-medium" style={{ fontFamily: "Lora" }}>
          {title}
        </h4>
      </div>
      <ol className="flex flex-col gap-4">
        {items.map((s, i) => (
          <li key={i} className="flex items-start gap-3" style={{ fontFamily: "Geist" }}>
            <span className="w-6 h-6 rounded-full bg-[#7A8B6F] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[#1C1A17] text-sm md:text-base font-medium">{s.step}</span>
              <span className="text-[#5E5954] text-sm md:text-base">{s.product}</span>
              <span className="text-[#8C857B] text-xs md:text-sm">{s.why}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RoutineGenerator({ skinType, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<StepCount>("standart");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Rutin oluşturmak için giriş yapmalısın.");
        return;
      }

      const res = await fetch("/api/routine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ skinType, steps }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Rutin oluşturulamadı. Lütfen tekrar dene.");
        return;
      }
      setRoutine(data.routine);
    } catch (e) {
      console.error(e);
      setError("Bağlantı hatası. İnternetini kontrol edip tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  if (routine) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#7A8B6F]">
            <Sparkles size={20} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "Geist" }}>
              Sana Özel Rutin
            </span>
          </div>
          <button
            onClick={() => setRoutine(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1C1A17] hover:text-[#7A8B6F] transition-colors"
            style={{ fontFamily: "Geist" }}
          >
            <RefreshCw size={14} /> Yeniden Oluştur
          </button>
        </div>

        <StepList title="Sabah Rutini" icon={<Sun size={18} />} items={routine.morning} />
        <StepList title="Akşam Rutini" icon={<Moon size={18} />} items={routine.evening} />
        <StepList title="Haftalık Bakım" icon={<CalendarDays size={18} />} items={routine.weekly} />

        <p className="text-xs text-[#8C857B] leading-relaxed" style={{ fontFamily: "Geist" }}>
          Bu öneriler yapay zekâ ile hazırlanmış genel bilgilendirme amaçlıdır, tıbbi tavsiye yerine geçmez. Cilt
          hastalığı veya kalıcı sorunlar için bir dermatoloğa danış. Yeni ürünleri önce küçük bir alanda test et.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#1C1A17] text-white rounded-xl py-4 px-6 text-sm md:text-base font-medium hover:bg-[#7A8B6F] transition-colors"
        style={{ fontFamily: "Geist" }}
      >
        <Sparkles size={18} /> AI ile Kişisel Rutinimi Oluştur
      </button>
    );
  }

  return (
    <div className="bg-[#F8F7F4] rounded-xl p-6 border border-[#EAE7E2] flex flex-col gap-6">
      <div className="flex items-center gap-2 text-[#1C1A17]">
        <Sparkles size={18} className="text-[#7A8B6F]" />
        <h4 className="text-lg font-medium" style={{ fontFamily: "Lora" }}>
          Kaç adımlık rutin istersin?
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stepOptions.map((o) => {
          const selected = steps === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setSteps(o.value)}
              className={`flex flex-col items-center gap-0.5 py-4 px-4 rounded-xl border transition-all ${
                selected
                  ? "border-[#1C1A17] bg-[#1C1A17] text-white"
                  : "border-[#EAE7E2] bg-white text-[#5E5954] hover:border-[#8C857B]"
              }`}
              style={{ fontFamily: "Geist" }}
            >
              <span className="text-sm md:text-base font-medium">{o.label}</span>
              <span className={`text-xs ${selected ? "text-white/70" : "text-[#8C857B]"}`}>{o.hint}</span>
            </button>
          );
        })}
      </div>

      {!isLoggedIn && (
        <p className="text-xs text-[#8C857B]" style={{ fontFamily: "Geist" }}>
          Rutin oluşturmak için giriş yapmalısın.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-700" style={{ fontFamily: "Geist" }}>
          {error}
        </p>
      )}

      <button
        onClick={generate}
        disabled={loading || !isLoggedIn}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#1C1A17] text-white rounded-xl py-3.5 px-6 text-sm md:text-base font-medium hover:bg-[#7A8B6F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: "Geist" }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Rutinin hazırlanıyor...
          </>
        ) : (
          <>
            <Sparkles size={18} /> Rutinimi Oluştur
          </>
        )}
      </button>
    </div>
  );
}