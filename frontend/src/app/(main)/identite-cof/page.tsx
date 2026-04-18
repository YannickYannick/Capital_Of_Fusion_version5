import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getMenuItems } from "@/lib/api";
import { identiteHubCardTranslationKeys, normalizeNavPath } from "@/lib/navMenuLabels";
import type { MenuItemApi } from "@/types/menu";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.identiteHub");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

function findIdentiteCofChildren(menu: MenuItemApi[]): MenuItemApi[] {
  for (const root of menu) {
    if (root.slug === "identite-cof") {
      return root.children ?? [];
    }
    const href = normalizeNavPath(root.url || "");
    if (href === "/identite-cof") {
      return root.children ?? [];
    }
  }
  return [];
}

function cardHref(child: MenuItemApi): string {
  const raw = (child.url || "/").split("?")[0].split("#")[0];
  const n = normalizeNavPath(raw);
  return n || "/";
}

export default async function IdentiteCofHubPage() {
  const t = await getTranslations("pages.identiteHub");

  let apiChildren: MenuItemApi[] = [];
  try {
    const menu = await getMenuItems();
    apiChildren = findIdentiteCofChildren(menu);
  } catch {
    apiChildren = [];
  }

  const cards =
    apiChildren.length > 0
      ? apiChildren.map((child) => {
          const keys = identiteHubCardTranslationKeys(child.url);
          return {
            href: cardHref(child),
            title: keys ? t(keys.titleKey) : child.name,
            desc: keys ? t(keys.descKey) : "",
          };
        })
      : [
          { href: "/identite-cof/notre-vision", title: t("cardVisionTitle"), desc: t("cardVisionDesc") },
          { href: "/identite-cof/notre-histoire", title: t("cardHistoryTitle"), desc: t("cardHistoryDesc") },
          { href: "/identite-cof/adn-du-festival", title: t("cardAdnTitle"), desc: t("cardAdnDesc") },
          { href: "/identite-cof/bulletins", title: t("cardBulletinsTitle"), desc: t("cardBulletinsDesc") },
        ];

  return (
    <div className="text-white">
      <p className="text-xs uppercase tracking-widest text-purple-300/90">{t("eyebrow")}</p>
      <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">{t("title")}</h1>
      <p className="mt-4 text-white/60">{t("subtitle")}</p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(({ href, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <div className="text-sm font-semibold">{title}</div>
            {desc ? <div className="mt-1 text-xs text-white/55">{desc}</div> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
