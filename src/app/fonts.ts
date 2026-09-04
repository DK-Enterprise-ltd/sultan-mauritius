import { Sora, Inter } from "next/font/google";

// Primary brand faces (Cabinet Grotesk / Satoshi) load from Fontshare via a
// <link> in each root layout's <head>, referenced by name directly in
// globals.css. These two stay as the --font-display/--font-body fallback
// chain if that request is slow or blocked, and as local variables shared
// across the two independent root layouts (storefront + admin).
export const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});
