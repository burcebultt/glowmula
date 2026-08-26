export function Footer() {
  return (
    <footer className="px-6 md:px-20 pt-20 pb-[60px] bg-[#1C1A17] flex flex-col items-center gap-8">
      <p
        className="text-center text-[#F3F1ED] max-w-3xl"
        style={{ fontFamily: "Lora", fontSize: 28, fontStyle: "italic", fontWeight: 400 }}
      >
        "Bize göre bakımın en güzel hali, sana yük olmayanıdır."
      </p>
      <div className="w-[120px] h-px bg-[#5E5954]" />
      <p className="text-center text-[#5E5954]" style={{ fontFamily: "Geist", fontSize: 14 }}>
        © 2026 Glowmula. Tüm Hakları Saklıdır.
      </p>
    </footer>
  );
}
