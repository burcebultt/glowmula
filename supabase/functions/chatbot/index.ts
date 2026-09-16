import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SYSTEM_PROMPT = `Sen Glowmula adlı cilt bakımı web sitesinin asistanısın.

KURALLAR:
- SADECE cilt bakımı, cilt tipi, cilt bakım içerikleri (aktif maddeler, asitler, doğal özler), doğal/ev yapımı cilt bakım tarifleri ve Glowmula'nın kendi özellikleri hakkında sorulara cevap ver.
- Bu konuların dışındaki HERHANGİ bir soruya (genel sohbet, hava durumu, siyaset, kod yazma, başka ürün kategorileri vb.) kibarca "Ben sadece cilt bakımı konularında yardımcı olabilirim" diyerek cevap ver ve konuyu değiştirmeye çalış.
- Tıbbi teşhis koyma, ciddi cilt rahatsızlıkları için mutlaka bir dermatologa danışılmasını öner.
- Kısa, samimi ve Türkçe cevap ver.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { message, history } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("API anahtarı bulunamadı");
    }

    const messages = [
      ...(history || []),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Üzgünüm, şu an cevap veremiyorum.";

    return new Response(JSON.stringify({ reply, debug: data }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});