import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatWidget } from "./ChatWidget";

export function Root() {
  const { pathname } = useLocation();

  // Sayfa değişince en üste dön
  useEffect(() => {
    const el = document.getElementById("app-scroll");
    if (el) el.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div
      id="app-scroll"
      className="min-h-screen bg-white overflow-y-auto"
      style={{ fontFamily: "Geist" }}
    >
      <Header />
      <Outlet />
      <Footer />
      <ChatWidget />
    </div>
  );
}