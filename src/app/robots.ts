import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Deliberately no per-bot rules: nothing here blocks AI crawlers
// (GPTBot, ClaudeBot, etc.) or search engines. Only genuinely private
// surfaces are disallowed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/studio", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
