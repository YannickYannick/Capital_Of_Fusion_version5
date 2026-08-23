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

---

## 🔥 INSCRIPCIÓN

**Categoría profesional**  
${JACK_N_JILL_REGISTRATION_LINKS.professional}

**Categoría amateur**  
${JACK_N_JILL_REGISTRATION_LINKS.amateur}

Dos divisiones. Dos competiciones. Un fin de semana final. 🏆`,
};

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
