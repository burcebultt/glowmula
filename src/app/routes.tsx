import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./pages/Home";
import { Skin101 } from "./pages/Skin101";
import { KendinYap } from "./pages/KendinYap";
import { Gunlugum } from "./pages/Gunlugum";
import { CiltTipiniOgren } from "./pages/CiltTipiniOgren";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "skin101", Component: Skin101 },
      { path: "kendin-yap", Component: KendinYap },
      { path: "gunlugum", Component: Gunlugum },
      { path: "cilt-tipini-ogren", Component: CiltTipiniOgren },
      { path: "*", Component: Home },
    ],
  },
]);
