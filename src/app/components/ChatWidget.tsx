import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { supabase } from "../../supabaseClient";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const { data, error } = await supabase.functions.invoke("chatbot", {
      body: { message: text, history: messages },
    });

    setLoading(false);

    if (error || !data) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Bir hata oluştu, tekrar dener misin?" }]);
      return;
    }

    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-xl border border-[#DDD9D4] flex flex-col overflow-hidden">
          <div className="bg-[#1C1A17] text-white px-4 py-3 flex items-center justify-between">
            <span style={{ fontFamily: "Lora", fontSize: 15 }}>Glowmula Asistan</span>
            <button onClick={() => setOpen(false)}><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                  m.role === "user" ? "self-end bg-[#1C1A17] text-white" : "self-start bg-[#F3F1ED] text-[#1C1A17]"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && <div className="self-start text-[#9A948D] text-sm">Yazıyor...</div>}
          </div>
          <div className="p-2 border-t border-[#EAE7E2] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Bir soru sor..."
              className="flex-1 rounded-lg border border-[#DDD9D4] px-3 py-2 text-sm outline-none"
            />
            <button onClick={sendMessage} className="bg-[#1C1A17] text-white rounded-lg px-3">
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-[#1C1A17] text-white flex items-center justify-center shadow-lg"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}