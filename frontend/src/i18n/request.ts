import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import en from "../../messages/en.json";
import es from "../../messages/es.json";
import fr from "../../messages/fr.json";

const locales = ["fr", "en", "es"] as const;
type Locale = (typeof locales)[number];

const messagesByLocale: Record<Locale, typeof fr> = {
  fr,
  en,
  es,
};

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requested = cookieStore.get("locale")?.value;

  const locale: Locale =
    requested && locales.includes(requested as Locale) ? (requested as Locale) : "fr";

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});

