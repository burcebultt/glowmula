const MODEL = "claude-haiku-5-5";

const ALLOWED_SKIN = ["Yağlı Cilt", "Kuru Cilt", "Karma Cilt", "Hassas Cilt", "Normal Cilt"];
const ALLOWED_STEPS = ["minimal", "standart", "detayli"];
const ALLOWED_BUDGET = ["ekonomik", "orta", "premium"];
const ALLOWED_SENS = ["yok", "hassas"];
const ALLOWED_SUN = ["evet", "hayir"];

const STEP_COUNT: Record<string, string> = {
  minimal: "sabah 3, akşam 3 adım",
  standart: "sabah 4, akşam 4 adım",
  detayli: "sabah 5, akşam 5 adım",
};

const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(userId: string) {
  const now = Date.now();
  const recent = (hits.get(userId) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(userId, recent);
    return true;
  }
  recent.push(now);
  hits.set(userId, recent);
  return false;
}

async function getUserId(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const r = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: auth },
  });
  if (!r.ok) return null;
  const user = await r.json();
  return user?.id ?? null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON bulunamadı");
  return JSON.parse(text.slice(start, end + 1));
}

function cleanSteps(arr: unknown) {
  if (!Array.isArray(arr)) return [];
  return arr
    .slice(0, 8)
    .map((s: any) => ({
      step: String(s?.step ?? "").slice(0, 80),
      product: String(s?.product ?? "").slice(0, 160),
      why: String(s?.why ?? "").slice(0, 300),
    }))
    .filter((s) => s.step && s.product);
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: "Sunucu yapılandırması eksik." }, 500);

  const userId = await getUserId(request);
  if (!userId) return json({ error: "Rutin oluşturmak için giriş yapmalısın." }, 401);

  if (rateLimited(userId)) {
    return json({ error: "Çok fazla deneme yaptın. Lütfen bir süre sonra tekrar dene." }, 429);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Geçersiz istek." }, 400);
  }

  const { skinType, steps, budget, sensitivity, sunscreen } = body || {};
  if (
    !ALLOWED_SKIN.includes(skinType) ||
    !ALLOWED_STEPS.includes(steps) ||
    !ALLOWED_BUDGET.includes(budget) ||
    !ALLOWED_SENS.includes(sensitivity) ||
    !ALLOWED_SUN.includes(sunscreen)
  ) {
    return json({ error: "Geçersiz seçim." }, 400);
  }

  const system = `Sen bir cilt bakımı rehberisin. Kullanıcının cilt tipine ve tercihlerine göre Türkçe, sade ve uygulanabilir bir günlük bakım rutini hazırlarsın.

Kurallar:
- Marka veya ürün adı ASLA verme. Sadece ürün tipi ve aktif içerik öner (örn. "Sülfatsız krem temizleyici", "Seramid içeren nemlendirici").
- Tıbbi teşhis koyma, tedavi vaadi verme.
- Hassas cilt veya hassasiyet seçildiyse güçlü asitleri, retinolü ve parfümü önerme.
- Güneş kremi "hayir" seçilse bile sabah rutininde SPF'in önemini kısa bir adım olarak ekle ama nazikçe.
- Her adımın "why" alanı en fazla 1 cümle olsun.
- "weekly" alanında en fazla 2 haftalık bakım öner (örn. nazik peeling, maske). Gerekmiyorsa boş dizi ver.
- SADECE geçerli JSON döndür. Başına veya sonuna açıklama, markdown, kod bloğu ekleme.

JSON şeması:
{
  "morning": [{ "step": "Adım adı", "product": "Ürün tipi ve aktif içerik", "why": "Kısa neden" }],
  "evening": [{ "step": "...", "product": "...", "why": "..." }],
  "weekly":  [{ "step": "...", "product": "...", "why": "..." }]
}`;

  const userMsg = `Cilt tipi: ${skinType}
Adım sayısı: ${STEP_COUNT[steps]}
Bütçe: ${budget}
Hassasiyet: ${sensitivity === "hassas" ? "Cildim hassas, tahrişe yatkın" : "Özel bir hassasiyet yok"}
Güneş kremi kullanımı: ${sunscreen === "evet" ? "Kullanıyorum" : "Kullanmıyorum"}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!r.ok) {
      console.error("Anthropic API hatası:", r.status, await r.text());
      return json({ error: "Rutin şu an oluşturulamadı. Lütfen tekrar dene." }, 502);
    }

    const data = await r.json();
    const text = (data.content || [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    const parsed = extractJson(text);
    const routine = {
      morning: cleanSteps(parsed.morning),
      evening: cleanSteps(parsed.evening),
      weekly: cleanSteps(parsed.weekly),
    };

    if (routine.morning.length === 0 && routine.evening.length === 0) {
      return json({ error: "Rutin oluşturulamadı. Lütfen tekrar dene." }, 502);
    }

    return json({ routine });
  } catch (e) {
    console.error("Rutin oluşturma hatası:", e);
    return json({ error: "Beklenmedik bir hata oluştu." }, 500);
  }
}