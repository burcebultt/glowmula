import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router";

const navItems = [
  { label: "Cilt Tipini Öğren", to: "/cilt-tipini-ogren" },
  { label: "Skin101", to: "/skin101" },
  { label: "Kendin Yap", to: "/kendin-yap" },
  { label: "Günlüğüm", to: "/gunlugum" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-20 px-6 md:px-20 bg-[#F3F1ED] border-b border-[#DDD9D4] flex items-center justify-between">
      <Link
        to="/"
        className="text-[#1C1A17]"
        style={{ fontFamily: "Lora", fontSize: 28, fontWeight: 700 }}
      >
        Glowmula
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `py-2 border-b-2 transition-colors ${
                isActive
                  ? "border-[#1C1A17] text-[#1C1A17]"
                  : "border-transparent text-[#5E5954] hover:text-[#1C1A17] hover:border-[#1C1A17]"
              }`
            }
            style={{ fontFamily: "Geist", fontSize: 15, fontWeight: 500 }}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        className="md:hidden text-[#1C1A17]"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menü"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[#F3F1ED] border-b border-[#DDD9D4] flex flex-col px-6 py-4 gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="py-3 text-[#5E5954] hover:text-[#1C1A17] transition-colors"
              style={{ fontFamily: "Geist", fontSize: 15, fontWeight: 500 }}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
