/**
 * Repli pour l’overlay Explore quand les champs API du nœud sont vides ou que le slug
 * diffère de `all-star-street-bachata-battle` avant migration admin.
 * Aligné sur backend/.../planet_all_star_street_battle_overlay.json (FR / EN / ES).
 */
export type OverlayLocale = "fr" | "en" | "es";

export const ALL_STAR_STREET_BATTLE_OVERLAY_FALLBACK: Record<
  OverlayLocale,
  { hook: string; description: string; rules: string; cta: string }
> = {
  fr: {
    hook: "Le clash ultime entre musicalité, attitude et créativité. Pré-sélections 45 s, tableau final avec guests, 1000 € cash prize. 100 % impro, musiques aléatoires.",
    description:
      "🔥 STREET BACHATA BATTLE 🔥\n\nLe clash ultime entre musicalité, attitude et créativité.\n\nLes meilleurs danseurs vont s’affronter dans une battle où la technique seule ne suffira pas. Ici, il faudra du style, du caractère, de l’interprétation… et surtout une vraie identité.\n\n![Street Bachata Battle — Paris Bachata Vibe Festival, 18 septembre 2026](/images/street-bachata-battle-18-sept-26.jpg)\n\n⚡ Pré-sélections explosives — 45 secondes pour convaincre les juges.\n⚔️ Tableau final — 8 danseurs vs guests : 8èmes → quarts → demi-finales → finale.\n\n⏱️ Format : jusqu’aux demi-finales, 1 minute par danseur ; en finale, 2 passages par danseur.\n\n💰 1000 € cash prize pour le vainqueur.\n\n🎭 Fusion autorisée : la bachata reste au cœur de chaque passage.\n⚠️ 100 % improvisation. Musiques aléatoires, jamais communiquées à l’avance.\n\nPlus qu’une battle. Une scène. Une identité. Une guerre d’énergie. Qui sera capable de marquer le public… et repartir avec le titre ?",
    rules:
      "🔥 RÈGLEMENT – STREET BACHATA BATTLE 🔥\n\n🟥 1. Pré-sélections face aux juges\nChaque danseur passe devant les juges individuellement.\nDurée de passage : 45 secondes par danseur.\nÀ l’issue des passages, 8 danseurs seront sélectionnés. Ils rejoignent le tableau final aux côtés des guests déjà qualifiés.\n\n🟥 2. Tableau final\nDès les 8èmes de finale, chaque danseur sélectionné affronte un guest.\nProgression : 8èmes → quarts → demi-finales → finale.\nDurée des passages :\n• Jusqu’en demi-finale : 1 passage de 1 minute par danseur\n• En finale : 2 passages de 1 minute par danseur\n\n💰 3. Récompense\nLe vainqueur remporte un gain de 1000 €.\n\n⚠️ 4. Style et règles artistiques\nLa fusion est autorisée (mélange de styles). Cependant, la bachata doit rester dominante.\nSi les juges estiment que la bachata n’est pas suffisamment présente,\n👉 le passage pourra être pénalisé.\n\nQui va récupérer le titre ? 🥊👀",
    cta: "Voir la fiche complète",
  },
  en: {
    hook: "The ultimate clash of musicality, attitude and creativity. 45s prelims, final bracket with guests, €1000 cash prize. 100% improv, random tracks.",
    description:
      "🔥 STREET BACHATA BATTLE 🔥\n\nThe ultimate clash of musicality, attitude, and creativity.\n\nThe best dancers go head-to-head in a battle where technique alone won’t be enough. You’ll need style, character, interpretation… and a real identity.\n\n![Street Bachata Battle — Paris Bachata Vibe Festival, September 18, 2026](/images/street-bachata-battle-18-sept-26.jpg)\n\n⚡ Explosive prelims — 45 seconds to convince the judges.\n⚔️ Final bracket — 8 dancers vs guests: round of 8 → quarters → semis → final.\n\n⏱️ Format: up to semis, 1 minute per dancer; in the final, 2 rounds per dancer.\n\n💰 €1,000 cash prize for the winner.\n\n🎭 Fusion allowed: bachata stays at the heart of every round.\n⚠️ 100% improv. Random tracks, never shared in advance.\n\nMore than a battle. A stage. An identity. A war of energy. Who will move the crowd… and take the title?",
    rules:
      "🔥 RULES – STREET BACHATA BATTLE 🔥\n\n🟥 1. Prelims in front of the judges\nEach dancer performs individually for the judges.\nSet length: 45 seconds per dancer.\nAfter all rounds, 8 dancers are selected. They join the final bracket alongside guests who are already qualified.\n\n🟥 2. Final bracket\nFrom the round of 8, each selected dancer faces a guest.\nProgression: Round of 8 → quarter-finals → semi-finals → final.\nSet lengths:\n• Up to semi-final: one 1-minute round per dancer\n• Final: two 1-minute rounds per dancer\n\n💰 3. Prize\nThe winner takes home €1,000.\n\n⚠️ 4. Style & artistic rules\nFusion is allowed (mixing styles). However, bachata must remain dominant.\nIf the judges feel bachata is not present enough,\n👉 the round may be penalized.\n\nWho’s taking the title? 🥊👀",
    cta: "See full details",
  },
  es: {
    hook: "El choque definitivo entre musicalidad, actitud y creatividad. Preselección 45 s, cuadro final con invitados, 1000 € en premio. 100 % improvisación, música al azar.",
    description:
      "🔥 STREET BACHATA BATTLE 🔥\n\nEl choque definitivo entre musicalidad, actitud y creatividad.\n\nLos mejores bailarines se enfrentan en una battle donde la técnica sola no basta. Hace falta estilo, carácter, interpretación… y una identidad real.\n\n![Street Bachata Battle — Paris Bachata Vibe Festival, 18 de septiembre de 2026](/images/street-bachata-battle-18-sept-26.jpg)\n\n⚡ Preselecciones explosivas — 45 segundos para convencer al jurado.\n⚔️ Cuadro final — 8 vs guests: octavos → cuartos → semifinales → final.\n\n⏱️ Formato: hasta semifinales, 1 minuto por bailarín; en la final, 2 pasadas por bailarín.\n\n💰 1000 € en premio en metálico para el ganador.\n\n🎭 Fusión permitida: la bachata sigue en el centro de cada pasada.\n⚠️ 100 % improvisación. Música al azar, nunca comunicada de antemano.\n\nMás que una battle. Un escenario. Una identidad. Una guerra de energía. ¿Quién marcará al público… y se llevará el título?",
    rules:
      "🔥 REGLAMENTO – STREET BACHATA BATTLE 🔥\n\n🟥 1. Preselección ante el jurado\nCada bailarín pasa individualmente ante el jurado.\nDuración: 45 segundos por bailarín.\nAl cerrar los pasajes, se seleccionan 8 bailarines. Pasan al cuadro final junto a los guests ya clasificados.\n\n🟥 2. Cuadro final\nDesde octavos, cada seleccionado se enfrenta a un guest.\nProgresión: Octavos → cuartos → semifinales → final.\nDuración:\n• Hasta semifinal: 1 pasada de 1 minuto por bailarín\n• En la final: 2 pasadas de 1 minuto por bailarín\n\n💰 3. Premio\nEl ganador se lleva 1000 €.\n\n⚠️ 4. Estilo y normas artísticas\nLa fusión está permitida (mezcla de estilos). Pero la bachata debe seguir dominando.\nSi el jurado considera que la bachata no está suficientemente presente,\n👉 el pasaje podrá ser penalizado.\n\n¿Quién se lleva el título? 🥊👀",
    cta: "Ver la ficha completa",
  },
};

export const ALL_STAR_STREET_BATTLE_NODE_HREF = "/organisation/noeuds/all-star-street-bachata-battle";

/** Vidéo hero (fichier statique `public/video/`, pré-traitée rotation 270° horaire). */
export const ALL_STAR_STREET_BATTLE_PAGE_HERO_VIDEO_SRC = "/video/street-bachata-battle-hero.mp4";

/** Fallback = même passerelle billetterie que `GoAndDanceTicketsEmbed`. */
const DEFAULT_STREET_BATTLE_REGISTER_URL =
  "https://my.weezevent.com/sbb-all-star";
const DEFAULT_STREET_BATTLE_FESTIVAL_URL =
  "https://www.goandance.com/en/event/8924/paris-bachata-vibe-festival-2026";

function trimmedEnv(url: string | undefined): string | null {
  const s = typeof url === "string" ? url.trim() : "";
  return s.length > 0 ? s : null;
}

/** [ inscription battle / pass préféré, page événement festival ] — surcharge via `NEXT_PUBLIC_*`. */
export function getStreetBattleRegistrationLinks(): readonly [primary: string, secondary: string] {
  const primary =
    trimmedEnv(process.env.NEXT_PUBLIC_STREET_BATTLE_REGISTER_URL) ?? DEFAULT_STREET_BATTLE_REGISTER_URL;
  const secondary =
    trimmedEnv(process.env.NEXT_PUBLIC_STREET_BATTLE_FESTIVAL_URL) ?? DEFAULT_STREET_BATTLE_FESTIVAL_URL;
  return [primary, secondary];
}
