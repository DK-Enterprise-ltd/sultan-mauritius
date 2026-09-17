import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { CONTACT_EMAIL, CONTACT_PHONE_TEL } from "@/lib/contact-info";
import { sora, inter } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    // pageMetadata() sets `title` as a plain string (for its own
    // canonical/OG/twitter fields); override it after spreading so the
    // root layout is the one place establishing the "%s | Sultan
    // Mauritius" template every other page's plain-string title inherits.
    ...pageMetadata({
      locale: locale as Locale,
      path: "",
      title: t("homeTitle"),
      description: t("homeDescription"),
    }),
    title: { default: t("homeTitle"), template: `%s | ${SITE_NAME}` },
  };
}

// address/sameAs are the real registered-office and social data (matches
// the legal notice page and site footer).
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/Assets/Logo/logo-avatar.png`,
  description:
    "Official distributor of Sultan natural spring water and Sultan flavoured sparkling waters in Mauritius since March 2021.",
  areaServed: "MU",
  address: {
    "@type": "PostalAddress",
    streetAddress: "95, La Paix Street",
    addressLocality: "Port Louis",
    addressCountry: "MU",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE_TEL,
    contactType: "customer service",
    areaServed: "MU",
  },
  sameAs: ["https://www.instagram.com/sultan_mauritius/", "https://www.facebook.com/sultandrinkmauritius/"],
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  // Enables static rendering for this locale's server components.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500&f[]=satoshi@400,500,700&display=swap"
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
      </head>
      <body className={`${sora.variable} ${inter.variable}`}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
