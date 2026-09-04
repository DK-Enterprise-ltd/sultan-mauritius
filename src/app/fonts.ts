import { Sora, Inter } from "next/font/google";

// Shared across the two independent root layouts (storefront + admin) so
// both resolve to the same --font-display/--font-body variables.
export const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});
