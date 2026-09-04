import type { Locale } from "@/i18n/routing";

// ponytail: flat lookup instead of a nameFr/flavorFr migration. The SKU
// lineup is small and rarely changes. Add a schema column if it grows past
// a couple dozen entries.
const FLAVOR_FR: Record<string, string> = {
  "Watermelon Strawberry": "Pastèque Fraise",
  "Pomegranate": "Grenade",
  "Black Mulberry & Blackcurrant": "Mûre Noire & Cassis",
  "Lemon": "Citron",
  "Apple": "Pomme",
  "Mandarin": "Mandarine",
  "Strawberry": "Fraise",
  "Gazoz": "Gazoz",
  "Mango & Pineapple": "Mangue & Ananas",
  "Mojito": "Mojito",
  "Berry & Hibiscus": "Fruits rouges & Hibiscus",
};

const NAME_FR: Record<string, string> = {
  "Sultan Sparkling": "Sultan Gazeuse",
  "Sultan Spring Water": "Sultan Eau de Source",
  "Sultan Prime": "Sultan Prime",
};

export function localizeFlavor(flavor: string | null, locale: Locale): string | null {
  if (!flavor) return flavor;
  return locale === "fr" ? FLAVOR_FR[flavor] ?? flavor : flavor;
}

export function localizeProductName(name: string, locale: Locale): string {
  return locale === "fr" ? NAME_FR[name] ?? name : name;
}
