import { useState, useEffect } from "react";
import { PageHero } from "../components/PageHero";
import { Heart, ChevronLeft, ChevronRight, Plus, LogOut, Mail, KeyRound, Trash2 } from "lucide-react";
import { FAV_INGREDIENTS_KEY, ingredientNameById } from "./Skin101";
import { FAV_RECIPES_KEY, recipeInfoById } from "./KendinYap";
import { SKIN_TYPE_KEY } from "./CiltTipiniOgren";
import { supabase } from "../../supabaseClient";

interface RoutineItem {
  id: string;
  label: string;
  done: boolean;
  sort_order: number;
}

const DEFAULT_MORNING = ["Yüz Yıkama", "Tonik", "Serum (Niasinamid)", "Nemlendirici", "SPF 50 Güneş Kremi"];
const DEFAULT_EVENING = ["Makyaj Temizleme", "Yüz Yıkama", "Eksfoliye (Salisilik Asit)", "Serum (Retinol)", "Gece Kremi"];

// Supabase'in İngilizce hata mesajlarını kullanıcıya Türkçe göstermek için
function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "E-posta veya şifre hatalı.",
    "User already registered": "Bu e-posta adresi zaten kayıtlı.",
    "Password should be at least 6 characters": "Şifre en az 6 karakter olmalı.",
    "Email not confirmed": "E-posta adresin henüz onaylanmamış.",
    "Unable to validate email address: invalid format": "Geçerli bir e-posta adresi gir.",
  };
  return map[message] || message;
}

export function Gunlugum() {
  const [session, setSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserName(
          session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Kullanıcı"
        );
      }
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        setUserName(
          session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Kullanıcı"
        );
      }
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    const el = document.getElementById("app-scroll");
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <PageHero
        title="Günlüğüm"
        subtitle="Rutinini ve cildinin değişimini not al; küçük gözlemler büyük farklar yaratır."
        image="https://images.unsplash.com/photo-1581182815808-b6eb627a8798?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
      />

      {checkingSession ? (
        <section className="px-6 md:px-[100px] py-24 bg-[#F3F1ED] flex justify-center">
          <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 15 }}>
            Yükleniyor...
          </p>
        </section>
      ) : session ? (
        <Dashboard userName={userName} userId={session.user.id} onLogout={handleLogout} />
      ) : (
        <AuthGate recoveryMode={recoveryMode} />
      )}
    </>
  );
}

/* ---------------- Giriş / Kaydol ---------------- */

type AuthMode = "login" | "signup" | "forgot" | "sent" | "reset";

function AuthGate({ recoveryMode }: { recoveryMode: boolean }) {
  const [mode, setMode] = useState<AuthMode>(recoveryMode ? "reset" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

  useEffect(() => {
    if (recoveryMode) setMode("reset");
  }, [recoveryMode]);

  const inputCls =
    "w-full rounded-lg border border-[#DDD9D4] bg-white px-4 py-3 text-[#1C1A17] outline-none focus:border-[#1C1A17] transition-colors";

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) return;
    if (mode === "signup" && !name.trim()) return;

    setLoading(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      });
      setLoading(false);
      if (error) {
        setError(translateAuthError(error.message));
        return;
      }
      if (data.user) {
        await supabase.from("profiles").upsert({ id: data.user.id, name: name.trim() });
      }
      if (!data.session) {
        setSentMessage(
          "Hesabını doğrulaman için sana bir e-posta gönderdik. Gelen kutunu kontrol edip bağlantıya tıkla."
        );
        setMode("sent");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (error) {
        setError(translateAuthError(error.message));
        return;
      }
    }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) {
      setError(translateAuthError(error.message));
      return;
    }
    setSentMessage(
      `${email.trim()} adresine şifre sıfırlama bağlantısı gönderdik. Bağlantıya tıklayarak yeni şifreni belirleyebilirsin.`
    );
    setMode("sent");
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newPassword.trim() || newPassword.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (newPassword !== newPassword2) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setError(translateAuthError(error.message));
      return;
    }
  };

  return (
    <section className="px-6 md:px-[100px] py-16 md:py-24 bg-[#F3F1ED] flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#DDD9D4] p-8 flex flex-col gap-6">
        {(mode === "login" || mode === "signup") && (
          <>
            <div className="text-center flex flex-col gap-2">
              <h2 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 28, fontWeight: 500 }}>
                {mode === "login" ? "Tekrar hoş geldin" : "Aramıza katıl"}
              </h2>
              <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 14 }}>
                Günlüğünü görmek için {mode === "login" ? "giriş yap" : "hesap oluştur"}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1 bg-[#F3F1ED] rounded-lg p-1">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                  className={`rounded-md py-2 transition-colors ${
                    mode === m ? "bg-white text-[#1C1A17] shadow-sm" : "text-[#5E5954]"
                  }`}
                  style={{ fontFamily: "Geist", fontSize: 14, fontWeight: 500 }}
                >
                  {m === "login" ? "Giriş" : "Kaydol"}
                </button>
              ))}
            </div>

            <form onSubmit={submitAuth} className="flex flex-col gap-4">
              {mode === "signup" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13 }}>
                    Ad Soyad
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ayşe Yılmaz"
                    className={inputCls}
                    style={{ fontFamily: "Geist", fontSize: 15 }}
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13 }}>
                  E-posta
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                  className={inputCls}
                  style={{ fontFamily: "Geist", fontSize: 15 }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13 }}>
                    Şifre
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setMode("forgot");
                      }}
                      className="text-[#1C1A17] underline underline-offset-2"
                      style={{ fontFamily: "Geist", fontSize: 12 }}
                    >
                      Şifremi unuttum
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                  style={{ fontFamily: "Geist", fontSize: 15 }}
                />
              </div>

              {error && (
                <span className="text-[#C0392B]" style={{ fontFamily: "Geist", fontSize: 13 }}>
                  {error}
                </span>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-[#1C1A17] text-[#F3F1ED] py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ fontFamily: "Geist", fontSize: 15, fontWeight: 500 }}
              >
                {loading ? "Lütfen bekle..." : mode === "login" ? "Giriş Yap" : "Kaydol"}
              </button>
            </form>

            <p className="text-center text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13 }}>
              {mode === "login" ? "Hesabın yok mu? " : "Zaten üye misin? "}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                }}
                className="text-[#1C1A17] underline underline-offset-2"
                style={{ fontFamily: "Geist", fontSize: 13, fontWeight: 500 }}
              >
                {mode === "login" ? "Kaydol" : "Giriş yap"}
              </button>
            </p>
          </>
        )}

        {mode === "forgot" && (
          <>
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EAE7E2] flex items-center justify-center text-[#1C1A17]">
                <Mail size={22} />
              </div>
              <h2 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 26, fontWeight: 500 }}>
                Şifreni mi unuttun?
              </h2>
              <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 14, lineHeight: "21px" }}>
                E-posta adresini gir; sana bir şifre sıfırlama bağlantısı gönderelim.
              </p>
            </div>

            <form onSubmit={submitForgot} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13 }}>
                  E-posta
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                  className={inputCls}
                  style={{ fontFamily: "Geist", fontSize: 15 }}
                />
              </div>
              {error && (
                <span className="text-[#C0392B]" style={{ fontFamily: "Geist", fontSize: 13 }}>
                  {error}
                </span>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1C1A17] text-[#F3F1ED] py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ fontFamily: "Geist", fontSize: 15, fontWeight: 500 }}
              >
                {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
              </button>
            </form>

            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className="text-center text-[#1C1A17] underline underline-offset-2"
              style={{ fontFamily: "Geist", fontSize: 13, fontWeight: 500 }}
            >
              Girişe dön
            </button>
          </>
        )}

        {mode === "sent" && (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EAE7E2] flex items-center justify-center text-[#1C1A17]">
              <Mail size={22} />
            </div>
            <h2 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 26, fontWeight: 500 }}>
              E-postanı kontrol et
            </h2>
            <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 14, lineHeight: "21px" }}>
              {sentMessage}
            </p>
            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className="text-[#1C1A17] underline underline-offset-2"
              style={{ fontFamily: "Geist", fontSize: 13, fontWeight: 500 }}
            >
              Girişe dön
            </button>
          </div>
        )}

        {mode === "reset" && (
          <>
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EAE7E2] flex items-center justify-center text-[#1C1A17]">
                <KeyRound size={22} />
              </div>
              <h2 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 26, fontWeight: 500 }}>
                Yeni şifre belirle
              </h2>
              <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 14 }}>
                Hesabın için yeni bir şifre oluştur.
              </p>
            </div>

            <form onSubmit={submitReset} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13 }}>
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                  style={{ fontFamily: "Geist", fontSize: 15 }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13 }}>
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={newPassword2}
                  onChange={(e) => setNewPassword2(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                  style={{ fontFamily: "Geist", fontSize: 15 }}
                />
              </div>
              {error && (
                <span className="text-[#C0392B]" style={{ fontFamily: "Geist", fontSize: 13 }}>
                  {error}
                </span>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1C1A17] text-[#F3F1ED] py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ fontFamily: "Geist", fontSize: 15, fontWeight: 500 }}
              >
                {loading ? "Kaydediliyor..." : "Şifreyi Sıfırla"}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

/* ---------------- Bakım Günlüğüm ---------------- */

function Dashboard({ userName, userId, onLogout }: { userName: string; userId: string; onLogout: () => void }) {
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [favIngredients, setFavIngredients] = useState<string[]>([]);
  const [favRecipes, setFavRecipes] = useState<{ name: string; category: string }[]>([]);
  const [skinType, setSkinType] = useState<{ title: string; desc: string } | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const [morning, setMorning] = useState<RoutineItem[]>([]);
  const [evening, setEvening] = useState<RoutineItem[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState(true);

  const [noteDraft, setNoteDraft] = useState("");
  const [notes, setNotes] = useState<{ id: string; date: string; text: string }[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const [monthStatus, setMonthStatus] = useState<Record<string, "full" | "partial">>({});
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    loadUserData();
    loadRoutinesForToday();
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    loadMonthStatus(calendarDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarDate]);

  const loadUserData = async () => {
    // 1. Supabase'den veya localStorage'dan favori içerikleri çek
    try {
      const { data: ingData } = await supabase
        .from("favorites")
        .select("item_id")
        .eq("user_id", userId)
        .eq("item_type", "ingredient");

      if (ingData && ingData.length > 0) {
        const names = ingData.map((d) => ingredientNameById[d.item_id]).filter(Boolean);
        setFavIngredients(names);
      } else if (typeof localStorage !== "undefined") {
        const ids: string[] = JSON.parse(localStorage.getItem(FAV_INGREDIENTS_KEY) || "[]");
        setFavIngredients(ids.map((id) => ingredientNameById[id]).filter(Boolean));
      } else {
        setFavIngredients([]);
      }
    } catch {
      if (typeof localStorage !== "undefined") {
        try {
          const ids: string[] = JSON.parse(localStorage.getItem(FAV_INGREDIENTS_KEY) || "[]");
          setFavIngredients(ids.map((id) => ingredientNameById[id]).filter(Boolean));
        } catch {
          setFavIngredients([]);
        }
      } else {
        setFavIngredients([]);
      }
    }

    // 2. Supabase'den veya localStorage'dan favori tarifleri çek
    try {
      const { data: recData } = await supabase
        .from("favorites")
        .select("item_id")
        .eq("user_id", userId)
        .eq("item_type", "recipe");

      if (recData && recData.length > 0) {
        const recipes = recData.map((d) => recipeInfoById[d.item_id]).filter(Boolean);
        setFavRecipes(recipes);
      } else if (typeof localStorage !== "undefined") {
        const ids: string[] = JSON.parse(localStorage.getItem(FAV_RECIPES_KEY) || "[]");
        setFavRecipes(ids.map((id) => recipeInfoById[id]).filter(Boolean));
      } else {
        setFavRecipes([]);
      }
    } catch {
      if (typeof localStorage !== "undefined") {
        try {
          const ids: string[] = JSON.parse(localStorage.getItem(FAV_RECIPES_KEY) || "[]");
          setFavRecipes(ids.map((id) => recipeInfoById[id]).filter(Boolean));
        } catch {
          setFavRecipes([]);
        }
      } else {
        setFavRecipes([]);
      }
    }

    // 3. Cilt tipini Supabase'den veya localStorage'dan çek
    try {
      const { data: quizData } = await supabase
        .from("quiz_results")
        .select("result_title, result_desc")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (quizData && quizData.result_title) {
        setSkinType({ title: quizData.result_title, desc: quizData.result_desc });
      } else if (typeof localStorage !== "undefined") {
        const saved = localStorage.getItem(SKIN_TYPE_KEY);
        if (saved) {
          setSkinType(JSON.parse(saved));
        } else {
          setSkinType(null);
        }
      } else {
        setSkinType(null);
      }
    } catch {
      if (typeof localStorage !== "undefined") {
        try {
          const saved = localStorage.getItem(SKIN_TYPE_KEY);
          if (saved) {
            setSkinType(JSON.parse(saved));
          } else {
            setSkinType(null);
          }
        } catch {
          setSkinType(null);
        }
      } else {
        setSkinType(null);
      }
    }
  };

  const goPrevMonth = () =>
    setCalendarDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () =>
    setCalendarDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  function applyRoutineRows(rows: any[]) {
    setMorning(
      rows
        .filter((r) => r.period === "morning")
        .map((r) => ({ id: r.id, label: r.label, done: r.done, sort_order: r.sort_order }))
    );
    setEvening(
      rows
        .filter((r) => r.period === "evening")
        .map((r) => ({ id: r.id, label: r.label, done: r.done, sort_order: r.sort_order }))
    );
  }

  async function loadRoutinesForToday() {
    setLoadingRoutines(true);
    const { data, error } = await supabase
      .from("routine_items")
      .select("*")
      .eq("user_id", userId)
      .eq("entry_date", todayStr)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Rutin yüklenirken hata:", error);
      setLoadingRoutines(false);
      return;
    }

    if (!data || data.length === 0) {
      const seedRows = [
        ...DEFAULT_MORNING.map((label, i) => ({
          user_id: userId,
          entry_date: todayStr,
          period: "morning",
          label,
          done: false,
          sort_order: i,
        })),
        ...DEFAULT_EVENING.map((label, i) => ({
          user_id: userId,
          entry_date: todayStr,
          period: "evening",
          label,
          done: false,
          sort_order: i,
        })),
      ];
      const { data: inserted, error: insertError } = await supabase
        .from("routine_items")
        .insert(seedRows)
        .select();
      if (insertError) {
        console.error("Varsayılan rutin oluşturulurken hata:", insertError);
      } else {
        applyRoutineRows(inserted || []);
      }
    } else {
      applyRoutineRows(data);
    }
    setLoadingRoutines(false);
  }

  async function toggleRoutineItem(id: string, period: "morning" | "evening") {
    const list = period === "morning" ? morning : evening;
    const item = list.find((it) => it.id === id);
    if (!item) return;
    const newDone = !item.done;
    const updater = period === "morning" ? setMorning : setEvening;
    updater((prev) => prev.map((it) => (it.id === id ? { ...it, done: newDone } : it)));

    const { error } = await supabase.from("routine_items").update({ done: newDone }).eq("id", id);
    if (error) console.error("Rutin güncellenirken hata:", error);
    loadMonthStatus(calendarDate);
  }

  async function addRoutineItem(period: "morning" | "evening", label: string) {
    const list = period === "morning" ? morning : evening;
    const { data, error } = await supabase
      .from("routine_items")
      .insert({
        user_id: userId,
        entry_date: todayStr,
        period,
        label,
        done: false,
        sort_order: list.length,
      })
      .select()
      .single();
    if (error) {
      console.error("Rutin eklenirken hata:", error);
      return;
    }
    const updater = period === "morning" ? setMorning : setEvening;
    updater((prev) => [...prev, { id: data.id, label: data.label, done: data.done, sort_order: data.sort_order }]);
    loadMonthStatus(calendarDate);
  }

  async function loadNotes() {
    setLoadingNotes(true);
    const { data, error } = await supabase
      .from("journal_notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Notlar yüklenirken hata:", error);
      setLoadingNotes(false);
      return;
    }
    setNotes(
      (data || []).map((n: any) => ({
        id: n.id,
        date: new Date(n.created_at).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        text: n.text,
      }))
    );
    setLoadingNotes(false);
  }

  const addNote = async () => {
    const text = noteDraft.trim();
    if (!text) return;
    const { data, error } = await supabase
      .from("journal_notes")
      .insert({ user_id: userId, entry_date: todayStr, text })
      .select()
      .single();
    if (error) {
      console.error("Not eklenirken hata:", error);
      return;
    }
    setNotes((prev) => [
      {
        id: data.id,
        date: new Date(data.created_at).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        text: data.text,
      },
      ...prev,
    ]);
    setNoteDraft("");
  };

  const deleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    const { error } = await supabase.from("journal_notes").delete().eq("id", id);
    if (error) console.error("Not silinirken hata:", error);
  };

  async function loadMonthStatus(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const start = new Date(year, month, 1).toISOString().slice(0, 10);
    const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("routine_items")
      .select("entry_date, done")
      .eq("user_id", userId)
      .gte("entry_date", start)
      .lte("entry_date", end);

    if (error) {
      console.error("Takvim durumu yüklenirken hata:", error);
      return;
    }

    const byDate: Record<string, { total: number; done: number }> = {};
    (data || []).forEach((row: any) => {
      if (!byDate[row.entry_date]) byDate[row.entry_date] = { total: 0, done: 0 };
      byDate[row.entry_date].total += 1;
      if (row.done) byDate[row.entry_date].done += 1;
    });

    const status: Record<string, "full" | "partial"> = {};
    Object.entries(byDate).forEach(([date, { total, done }]) => {
      if (total > 0 && done === total) status[date] = "full";
      else if (done > 0) status[date] = "partial";
    });
    setMonthStatus(status);
  }

  return (
    <section className="px-6 md:px-[100px] py-16 md:py-20 bg-[#F3F1ED]">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profil */}
        <aside className="lg:w-[320px] shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-[#DDD9D4] p-6 flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div
                className="w-16 h-16 rounded-full bg-[#C7BDAE] flex items-center justify-center text-[#1C1A17]"
                style={{ fontFamily: "Lora", fontSize: 20, fontWeight: 600 }}
              >
                {initials}
              </div>
              <div className="flex flex-col gap-2 items-center">
                <span className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 22, fontWeight: 500 }}>
                  {userName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#EAE7E2] px-2.5 py-1 text-[#1C1A17]" style={{ fontFamily: "Geist", fontSize: 12 }}>
                    {skinType ? skinType.title : "Cilt Tipi Belirlenmedi"}
                  </span>
                  <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 12 }}>
                    Üye: Ağustos 2026
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-b border-[#EAE7E2] py-4">
              {[
                { n: notes.length, l: "Günlük Kayıt" },
                { n: favRecipes.length, l: "Favori Tarif" },
                { n: favIngredients.length, l: "Favori İçerik" },
              ].map((s) => (
                <div key={s.l} className="flex flex-col items-center text-center gap-1">
                  <span className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 22, fontWeight: 500 }}>
                    {s.n}
                  </span>
                  <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 11 }}>
                    {s.l}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 11, letterSpacing: 1.5 }}>
                CİLT TİPİM
              </span>
              <div className="rounded-lg bg-[#F3F1ED] p-4 flex flex-col gap-1.5">
                <span className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 16, fontWeight: 500 }}>
                  {skinType ? `${skinType.title} Analizi` : "Cilt Tipi Testi"}
                </span>
                <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13, lineHeight: "20px" }}>
                  {skinType ? skinType.desc : "Cilt tipini öğrenmek ve sana özel analizini görmek için 'Cilt Tipini Öğren' testini çözebilirsin."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 11, letterSpacing: 1.5 }}>
                FAVORİ TARİFLERİM
              </span>
              {favRecipes.length > 0 ? (
                favRecipes.map((t) => (
                  <div key={t.name} className="rounded-lg border border-[#EAE7E2] p-3 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 10, letterSpacing: 1 }}>
                        {t.category.toLocaleUpperCase("tr-TR")}
                      </span>
                      <span className="text-[#1C1A17]" style={{ fontFamily: "Geist", fontSize: 13, fontWeight: 500 }}>
                        {t.name}
                      </span>
                    </div>
                    <Heart size={16} className="text-[#C77] shrink-0" fill="#C77" />
                  </div>
                ))
              ) : (
                <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13, lineHeight: "20px" }}>
                  Kendin Yap'ta "Kaydet"e dokunarak favori tariflerini buraya ekleyebilirsin.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 11, letterSpacing: 1.5 }}>
                FAVORİ İÇERİKLERİM
              </span>
              {favIngredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {favIngredients.map((c) => (
                    <span key={c} className="rounded-md bg-[#EAE7E2] px-3 py-1.5 text-[#1C1A17]" style={{ fontFamily: "Geist", fontSize: 12 }}>
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13, lineHeight: "20px" }}>
                  Skin101'de yer imi simgesine dokunarak favori içeriklerini buraya ekleyebilirsin.
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Ana içerik */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 34, fontWeight: 600 }}>
                Bakım Günlüğüm
              </h2>
              <p className="mt-1 text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 15 }}>
                Günlük cilt bakım rutinini kaydet ve düzenli takip et
              </p>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 shrink-0 rounded-full border border-[#DDD9D4] px-4 py-2.5 text-[#5E5954] hover:text-[#1C1A17] hover:border-[#1C1A17] transition-colors"
              style={{ fontFamily: "Geist", fontSize: 13, fontWeight: 500 }}
            >
              <LogOut size={15} /> Çıkış Yap
            </button>
          </div>

          <Calendar
            monthStatus={monthStatus}
            calendarDate={calendarDate}
            onPrev={goPrevMonth}
            onNext={goNextMonth}
          />

          <div>
            <h3 className="text-[#1C1A17] mb-4" style={{ fontFamily: "Lora", fontSize: 22, fontWeight: 500 }}>
              Bugünün Rutini
            </h3>
            {loadingRoutines ? (
              <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 14 }}>
                Yükleniyor...
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <RoutineCard
                  title="Sabah Rutini"
                  emoji="☀️"
                  items={morning}
                  onToggle={(id) => toggleRoutineItem(id, "morning")}
                  onAdd={(label) => addRoutineItem("morning", label)}
                />
                <RoutineCard
                  title="Akşam Rutini"
                  emoji="🌙"
                  items={evening}
                  onToggle={(id) => toggleRoutineItem(id, "evening")}
                  onAdd={(label) => addRoutineItem("evening", label)}
                />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-[#1C1A17] mb-4" style={{ fontFamily: "Lora", fontSize: 22, fontWeight: 500 }}>
              Notlarım
            </h3>
            <div className="bg-white rounded-2xl border border-[#DDD9D4] p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 11, letterSpacing: 1.5 }}>
                  BUGÜNKÜ CİLT GÖZLEMLERİM
                </span>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                  placeholder="Bugün cildinle ilgili gözlemlerini yaz..."
                  className="w-full resize-none rounded-lg border border-[#EAE7E2] bg-[#F3F1ED] p-4 text-[#1C1A17] outline-none focus:border-[#1C1A17] transition-colors"
                  style={{ fontFamily: "Geist", fontSize: 14, lineHeight: "22px" }}
                />
                <button
                  onClick={addNote}
                  className="self-end inline-flex items-center gap-1.5 bg-[#1C1A17] text-[#F3F1ED] px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ fontFamily: "Geist", fontSize: 14, fontWeight: 500 }}
                >
                  <Plus size={15} /> Not Ekle
                </button>
              </div>

              {loadingNotes ? (
                <p className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 13 }}>
                  Yükleniyor...
                </p>
              ) : notes.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-[#EAE7E2] pt-4">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-lg bg-[#F3F1ED] p-4 flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 12 }}>
                          {n.date}
                        </span>
                        <p className="text-[#1C1A17]" style={{ fontFamily: "Geist", fontSize: 14, lineHeight: "22px" }}>
                          {n.text}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNote(n.id)}
                        className="text-[#5E5954] hover:text-[#C0392B] transition-colors shrink-0"
                        aria-label="Notu sil"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Calendar({
  monthStatus,
  calendarDate,
  onPrev,
  onNext,
}: {
  monthStatus: Record<string, "full" | "partial">;
  calendarDate: Date;
  onPrev: () => void;
  onNext: () => void;
}) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const todayStr = new Date().toISOString().slice(0, 10);

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylul", "Ekim", "Kasım", "Aralık",
  ];

  const jsWeekday = new Date(year, month, 1).getDay(); // 0 = Pazar
  const firstWeekdayOffset = (jsWeekday + 6) % 7; // Pzt = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekdays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekdayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white rounded-2xl border border-[#DDD9D4] p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 20, fontWeight: 500 }}>
          {monthNames[month]} {year}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="w-8 h-8 rounded-full border border-[#DDD9D4] flex items-center justify-center text-[#5E5954] hover:text-[#1C1A17] hover:border-[#1C1A17] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={onNext}
            className="w-8 h-8 rounded-full border border-[#DDD9D4] flex items-center justify-center text-[#5E5954] hover:text-[#1C1A17] hover:border-[#1C1A17] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {weekdays.map((w) => (
          <span key={w} className="pb-3 text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 12 }}>
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const status = monthStatus[dateStr];
          return (
            <div key={d} className="flex flex-col items-center gap-1 py-1.5">
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[#1C1A17] ${
                  isToday ? "border border-[#1C1A17]" : ""
                }`}
                style={{ fontFamily: "Geist", fontSize: 14 }}
              >
                {d}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: status === "full" ? "#7A8B6F" : status === "partial" ? "#C7A15A" : "transparent",
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 pt-4 border-t border-[#EAE7E2]">
        <Legend color="#7A8B6F" label="Yeşil = Tam Rutin" />
        <Legend color="#C7A15A" label="Turuncu = Kısmi Rutin" />
        <span className="inline-flex items-center gap-2 text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 12 }}>
          <span className="w-3 h-3 rounded-full border border-[#1C1A17]" />
          Halka = Bugün
        </span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 12 }}>
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function RoutineCard({
  title,
  emoji,
  items,
  onToggle,
  onAdd,
}: {
  title: string;
  emoji: string;
  items: RoutineItem[];
  onToggle: (id: string) => void;
  onAdd: (label: string) => void;
}) {
  const [value, setValue] = useState("");

  const doneCount = items.filter((it) => it.done).length;
  const total = items.length;
  const statusLabel =
    total === 0 ? "Henüz ürün yok" : doneCount === total ? "Tamamlandı" : doneCount === 0 ? "Başlanmadı" : "Devam Ediyor";
  const statusColor = total > 0 && doneCount === total ? "#7A8B6F" : doneCount === 0 ? "#9A948D" : "#C7A15A";

  const add = () => {
    const label = value.trim();
    if (!label) return;
    onAdd(label);
    setValue("");
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DDD9D4] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[#1C1A17]" style={{ fontFamily: "Lora", fontSize: 18, fontWeight: 500 }}>
          {title} {emoji}
        </span>
        <span
          className="rounded-full px-3 py-1"
          style={{ fontFamily: "Geist", fontSize: 11, fontWeight: 500, background: `${statusColor}22`, color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((it) => (
          <label key={it.id} className="flex items-center gap-2.5 cursor-pointer select-none">
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                it.done ? "bg-[#1C1A17] border-[#1C1A17]" : "border-[#C4BEB6] bg-white"
              }`}
            >
              {it.done && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5.2 4 7.5 8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <input type="checkbox" className="sr-only" checked={it.done} onChange={() => onToggle(it.id)} />
            <span
              className={it.done ? "text-[#1C1A17]" : "text-[#5E5954]"}
              style={{ fontFamily: "Geist", fontSize: 14 }}
            >
              {it.label}
            </span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Ürün adı yazın..."
          className="flex-1 min-w-0 rounded-lg border border-[#DDD9D4] bg-[#F3F1ED] px-3 py-2 text-[#1C1A17] outline-none focus:border-[#1C1A17] transition-colors"
          style={{ fontFamily: "Geist", fontSize: 13 }}
        />
        <button
          onClick={add}
          className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap bg-[#7A8B6F] text-white px-3.5 py-2 rounded-lg hover:opacity-90 transition-opacity"
          style={{ fontFamily: "Geist", fontSize: 13, fontWeight: 500 }}
        >
          <Plus size={14} /> Ekle
        </button>
      </div>
    </div>
  );
}