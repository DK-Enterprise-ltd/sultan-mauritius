import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as (typeof routing.locales)[number])
    ? requested!
    : routing.defaultLocale;

  try {
    return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
  } catch {
    notFound();
  }
});
