import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const locales = ["fr", "en", "es"] as const;
type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requested = cookieStore.get("locale")?.value;

  const locale: Locale =
    requested && locales.includes(requested as Locale) ? (requested as Locale) : "fr";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

