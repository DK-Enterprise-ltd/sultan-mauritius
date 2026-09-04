import { defineRouting } from "next-intl/routing";

// Mauritius is officially bilingual: English for business/admin, French for
// everyday commerce. English is the default so a bare "/" resolves without
// a redirect; French lives under "/fr".
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];
