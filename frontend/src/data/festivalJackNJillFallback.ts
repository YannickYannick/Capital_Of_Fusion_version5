/**
 * Contenu de repli FR / EN / ES pour `/festival/jack-n-jill`
 * et le nœud Explore `jack-n-jill-vibe` lorsque `festival_jack_n_jill_markdown` est vide.
 */

export type JackNJillLocale = "fr" | "en" | "es";

export const FESTIVAL_JACK_N_JILL_PAGE_HREF = "/festival/jack-n-jill";

/** Texte court overlay Explore (section DESCRIPTION) — Jack n' Jill Vibe amateur. */
export const FESTIVAL_JACK_N_JILL_OVERLAY_DESCRIPTION: Record<JackNJillLocale, string> = {
  en: `This Jack & Jill is independent and does not grant access to the Social World Cup.

It is reserved for the amateur category only.

If you are a professional dancer, please check the section:
Bachata Social French Cup`,
  fr: `Ce Jack & Jill est indépendant et ne donne pas accès à la Social World Cup.

Il est réservé à la catégorie amateur uniquement.

Si vous êtes danseur professionnel, consultez la section :
Bachata Social French Cup`,
  es: `Este Jack & Jill es independiente y no da acceso a la Social World Cup.

Está reservado exclusivamente a la categoría amateur.

Si eres bailarín profesional, consulta la sección:
Bachata Social French Cup`,
};

export const JACK_N_JILL_REGISTRATION_LINKS = {
  professional:
    "https://bachatasocialworldcup.com/qualifiers/pre-selection-finale-pro-2026",
  amateur:
    "https://bachatasocialworldcup.com/qualifiers/pre-selection-finale-amateur-2026",
} as const;

export const FESTIVAL_JACK_N_JILL_FALLBACK: Record<JackNJillLocale, string> = {
  en: `## 🏆 JACK N JILL — FRENCH CUP & EUROPEAN QUALIFIER

Two separate divisions will take place during Paris Bachata Vibe Festival:

### PROFESSIONAL DIVISION

The Jack n Jill Social French Cup & European Qualifier is exclusively reserved for professional dancers.

### AMATEUR DIVISION

The Jack n Jill Vibe is exclusively reserved for amateur dancers.

Both competitions take place during the same time slots but in separate divisions.

---

## 📍 SATURDAY — LAST CHANCE QUALIFIERS

🗓 **Saturday**  
⏰ **7:15 PM – 10:30 PM**  
📍 **18–20 Rue du Colonel Pierre Avia, 75015 Paris**  
**AREA 1 — La Palmeraie | La Casa Room**

This is your last opportunity to qualify for Sunday's National Final.

The **TOP 5** dancers qualified on Saturday will earn their place in the National Final on Sunday.

![Jack and Jill Pre-Selection Final — Saturday 19 September](/images/festival/jack-n-jill-pre-selection-final-saturday.png)

---

## 🏆 SUNDAY — NATIONAL FINALS

🗓 **Sunday**  
⏰ **7:00 PM – 10:30 PM**  
📍 **18–20 Rue du Colonel Pierre Avia, 75015 Paris**  
**AREA 1 — La Casa Room**

⚠️ The Sunday Finals are not open-entry competitions.

Access to the competition is exclusively for dancers who have qualified:

- Through an official French pre-selection during the 2026 season, or
- Through the Saturday qualifiers at Paris Bachata Vibe Festival.

If you are not qualified yet, **Saturday is your LAST CHANCE**.

![Bachata French Social Cup Final — Sunday 20 September](/images/festival/jack-n-jill-french-social-cup-final-sunday.png)

---

## 🔥 REGISTRATION

**Professional category**  
${JACK_N_JILL_REGISTRATION_LINKS.professional}

**Amateur category**  
${JACK_N_JILL_REGISTRATION_LINKS.amateur}

Two divisions. Two competitions. One final weekend. 🏆`,

  fr: `## 🏆 JACK N JILL — SOCIAL FRENCH CUP & QUALIFIER EUROPEEN

Deux divisions distinctes auront lieu pendant le Paris Bachata Vibe Festival :

### DIVISION PROFESSIONNELLE

Le Jack n Jill Social French Cup & European Qualifier est exclusivement réservé aux danseurs professionnels.

### DIVISION AMATEUR

Le Jack n Jill Vibe est exclusivement réservé aux danseurs amateurs.

Les deux compétitions se déroulent sur les mêmes créneaux horaires, mais dans des divisions séparées.

---

## 📍 SAMEDI — DERNIÈRE CHANCE QUALIFICATIVES

🗓 **Samedi**  
⏰ **19h15 – 22h30**  
📍 **18–20 rue du Colonel Pierre Avia, 75015 Paris**  
**ZONE 1 — La Palmeraie | La Casa Room**

C'est votre dernière opportunité de vous qualifier pour la Finale Nationale du dimanche.

Les **5 premiers** danseurs qualifiés le samedi accéderont à la Finale Nationale du dimanche.

![Jack and Jill Pré-sélection Finale — Samedi 19 septembre](/images/festival/jack-n-jill-pre-selection-final-saturday.png)

---

## 🏆 DIMANCHE — FINALES NATIONALES

🗓 **Dimanche**  
⏰ **19h00 – 22h30**  
📍 **18–20 rue du Colonel Pierre Avia, 75015 Paris**  
**ZONE 1 — La Casa Room**

⚠️ Les Finales du dimanche ne sont pas des compétitions ouvertes à tous.

L'accès à la compétition est exclusivement réservé aux danseurs qualifiés :

- via une pré-sélection officielle française durant la saison 2026, ou
- via les qualificatives du samedi au Paris Bachata Vibe Festival.

Si vous n'êtes pas encore qualifié, **le samedi est votre DERNIÈRE CHANCE**.

![Bachata French Social Cup Final — Dimanche 20 septembre](/images/festival/jack-n-jill-french-social-cup-final-sunday.png)

---

## 🔥 INSCRIPTIONS

**Catégorie professionnelle**  
${JACK_N_JILL_REGISTRATION_LINKS.professional}

**Catégorie amateur**  
${JACK_N_JILL_REGISTRATION_LINKS.amateur}

Deux divisions. Deux compétitions. Un week-end final. 🏆`,

  es: `## 🏆 JACK N JILL — SOCIAL FRENCH CUP & QUALIFIER EUROPEO

Dos divisiones separadas tendrán lugar durante el Paris Bachata Vibe Festival:

### DIVISIÓN PROFESIONAL

El Jack n Jill Social French Cup & European Qualifier está reservado exclusivamente para bailarines profesionales.

### DIVISIÓN AMATEUR

El Jack n Jill Vibe está reservado exclusivamente para bailarines amateur.

Ambas competiciones se celebran en los mismos horarios, pero en divisiones separadas.

---

## 📍 SÁBADO — ÚLTIMA OPORTUNIDAD CLASIFICATORIAS

🗓 **Sábado**  
⏰ **19:15 – 22:30**  
📍 **18–20 rue du Colonel Pierre Avia, 75015 Paris**  
**ÁREA 1 — La Palmeraie | La Casa Room**

Esta es tu última oportunidad para clasificarte para la Final Nacional del domingo.

Los **5 primeros** bailarines clasificados el sábado accederán a la Final Nacional del domingo.

![Jack and Jill Pre-Selection Final — Sábado 19 de septiembre](/images/festival/jack-n-jill-pre-selection-final-saturday.png)

---

## 🏆 DOMINGO — FINALES NACIONALES

🗓 **Domingo**  
⏰ **19:00 – 22:30**  
📍 **18–20 rue du Colonel Pierre Avia, 75015 Paris**  
**ÁREA 1 — La Casa Room**

⚠️ Las Finales del domingo no son competiciones abiertas a todos.

El acceso a la competición está reservado exclusivamente a bailarines clasificados:

- mediante una preselección oficial francesa durante la temporada 2026, o
- mediante las clasificatorias del sábado en el Paris Bachata Vibe Festival.

Si aún no estás clasificado, **el sábado es tu ÚLTIMA OPORTUNIDAD**.

![Bachata French Social Cup Final — Domingo 20 de septiembre](/images/festival/jack-n-jill-french-social-cup-final-sunday.png)

---

## 🔥 INSCRIPCIÓN

**Categoría profesional**  
${JACK_N_JILL_REGISTRATION_LINKS.professional}

**Categoría amateur**  
${JACK_N_JILL_REGISTRATION_LINKS.amateur}

Dos divisiones. Dos competiciones. Un fin de semana final. 🏆`,
};

export const JACK_N_JILL_POSTER_SRC = {
  saturday: "/images/festival/jack-n-jill-pre-selection-final-saturday.png",
  sunday: "/images/festival/jack-n-jill-french-social-cup-final-sunday.png",
} as const;

/** Affiches panels juges (Jack & Jill). */
export const JACK_N_JILL_JUDGE_IMAGE_SRC = {
  saturday: "/images/festival/jack-n-jill-judges-saturday.png",
  sundayRounds: "/images/festival/jack-n-jill-judges-sunday-rounds.png",
  sundayFinal: "/images/festival/jack-n-jill-judges-sunday-final.png",
} as const;

export type JackNJillJudgePanel = {
  id: string;
  imageSrc: string;
  title: Record<JackNJillLocale, string>;
  judges: string[];
};

export const JACK_N_JILL_JUDGE_PANELS: JackNJillJudgePanel[] = [
  {
    id: "saturday",
    imageSrc: JACK_N_JILL_JUDGE_IMAGE_SRC.saturday,
    title: {
      fr: "Samedi — 1er & 2e tours",
      en: "Saturday — 1st & 2nd rounds",
      es: "Sábado — 1.ª y 2.ª rondas",
    },
    judges: [
      "Owen & Eva",
      "Diger & Marie",
      "Manue & Mika",
      "Christina & Rebecca",
      "Dim & Mathilde",
    ],
  },
  {
    id: "sunday-rounds",
    imageSrc: JACK_N_JILL_JUDGE_IMAGE_SRC.sundayRounds,
    title: {
      fr: "Dimanche — 1er & 2e tours",
      en: "Sunday — 1st & 2nd rounds",
      es: "Domingo — 1.ª y 2.ª rondas",
    },
    judges: [
      "Melonito & Eva",
      "Dario & Christina",
      "Dim & Mathilde",
      "Manue & Mika",
      "Amelie & Bastien",
    ],
  },
  {
    id: "sunday-final",
    imageSrc: JACK_N_JILL_JUDGE_IMAGE_SRC.sundayFinal,
    title: {
      fr: "Dimanche — Finale",
      en: "Sunday — Final",
      es: "Domingo — Final",
    },
    judges: [
      "Melvin & Gatica",
      "Diger & Marie",
      "Dario & Christina",
      "Dim & Mathilde",
      "Amelie & Bastien",
    ],
  },
];

const JACK_N_JILL_POSTER_MARKDOWN: Record<JackNJillLocale, { saturday: string; sunday: string }> = {
  fr: {
    saturday: `![Jack and Jill Pré-sélection Finale — Samedi 19 septembre](${JACK_N_JILL_POSTER_SRC.saturday})`,
    sunday: `![Bachata French Social Cup Final — Dimanche 20 septembre](${JACK_N_JILL_POSTER_SRC.sunday})`,
  },
  en: {
    saturday: `![Jack and Jill Pre-Selection Final — Saturday 19 September](${JACK_N_JILL_POSTER_SRC.saturday})`,
    sunday: `![Bachata French Social Cup Final — Sunday 20 September](${JACK_N_JILL_POSTER_SRC.sunday})`,
  },
  es: {
    saturday: `![Jack and Jill Pre-Selection Final — Sábado 19 de septiembre](${JACK_N_JILL_POSTER_SRC.saturday})`,
    sunday: `![Bachata French Social Cup Final — Domingo 20 de septiembre](${JACK_N_JILL_POSTER_SRC.sunday})`,
  },
};

/**
 * Garantit les affiches dans le corps Markdown (overlay Explore + page éditoriale).
 * Purpose: l'API peut servir un markdown sans images ; on injecte aux bons emplacements.
 */
export function withJackNJillPosters(markdown: string, locale: string): string {
  const body = (markdown ?? "").trim();
  if (!body || body.includes(JACK_N_JILL_POSTER_SRC.saturday)) return body;

  const loc: JackNJillLocale =
    locale === "fr" || locale === "en" || locale === "es" ? locale : "en";
  const posters = JACK_N_JILL_POSTER_MARKDOWN[loc];

  let result = body.replace(
    /(\n---\n\n## 🏆 (?:DIMANCHE|SUNDAY|DOMINGO))/,
    `\n\n${posters.saturday}\n$1`,
  );
  result = result.replace(
    /(\n---\n\n## 🔥 (?:INSCRIPTIONS|REGISTRATION|INSCRIPCIÓN))/i,
    `\n\n${posters.sunday}\n$1`,
  );

  if (!result.includes(JACK_N_JILL_POSTER_SRC.saturday)) {
    result = `${result}\n\n${posters.saturday}\n\n${posters.sunday}`;
  }

  return result;
}

/** Resolve locale → markdown de repli (défaut EN). */
export function getFestivalJackNJillFallback(locale: string): string {
  if (locale === "fr" || locale === "en" || locale === "es") {
    return FESTIVAL_JACK_N_JILL_FALLBACK[locale];
  }
  return FESTIVAL_JACK_N_JILL_FALLBACK.en;
}

/** Resolve locale → description overlay planète (défaut EN). */
export function getFestivalJackNJillOverlayDescription(locale: string): string {
  if (locale === "fr" || locale === "en" || locale === "es") {
    return FESTIVAL_JACK_N_JILL_OVERLAY_DESCRIPTION[locale];
  }
  return FESTIVAL_JACK_N_JILL_OVERLAY_DESCRIPTION.en;
}
