/**
 * Contenu de repli FR / EN / ES pour `/festival/acces-venue`
 * et l’overlay Explore de la planète Access & Venue
 * lorsque `festival_acces_venue_markdown` / description nœud sont vides.
 * Images : `public/images/area1.png`, `public/images/area2.png`, `public/images/area1-2.png`.
 */

export type AccesVenueLocale = "fr" | "en" | "es";

/** Page festival dédiée — CTA overlay « En savoir plus ». */
export const FESTIVAL_ACCES_VENUE_PAGE_HREF = "/festival/acces-venue";

/** Teaser vidéo overlay / hero (converti depuis le .mov source, portrait). */
export const FESTIVAL_ACCES_VENUE_TEASER_VIDEO_SRC = "/video/acces-venue-teaser.mp4";

/** Accroche courte pour l’overlay Explore (colonne droite). */
export const FESTIVAL_ACCES_VENUE_OVERLAY_HOOK: Record<AccesVenueLocale, string> = {
  en: "10,000 m² · 2 areas — La Palmeraie & Aquaboulevard. Official address, maps and practical info for the weekend.",
  fr: "10 000 m² · 2 zones — La Palmeraie & Aquaboulevard. Adresse officielle, plans et infos pratiques pour le week-end.",
  es: "10.000 m² · 2 áreas — La Palmeraie y Aquaboulevard. Dirección oficial, mapas e info práctica para el fin de semana.",
};

export const FESTIVAL_ACCES_VENUE_FALLBACK: Record<AccesVenueLocale, string> = {
  en: `## OFFICIAL VENUE & AREAS

Get ready for a unique festival experience in the heart of Paris! 🔥

The Paris Bachata Vibe Festival will take place across a huge **10,000 m² (1 hectare)** complex, divided into **2 main areas**, each offering a different atmosphere and experience throughout the festival.

### 📍 Official Address

**18–19 rue du Colonel Pierre Avia, 75015 Paris**

![Area 1 & 2 — Venue overview](/images/area1-2.png)

### ⚠️ BEFORE YOU ARRIVE

The different areas, rooms and spaces will open at different times depending on the festival schedule.

Please check the official schedule, venue map and on-site signage to find your way around the complex.

📱 We also strongly recommend downloading the official **Paris Bachata Vibe Festival** mobile app before the festival (available first week of September). It will help you access schedules and practical information and navigate the festival more easily throughout the weekend.

---

## 🌴 AREA 1 — LA PALMERAIE

![Area 1 — La Palmeraie](/images/area1.png)

**Venue:** La Palmeraie

Area 1 is the main indoor festival space, hosting workshops, competitions, special events and night parties.

### ROOMS

- 🏠 **La Casa Room**
- 🎓 **La Escuela Room**
- ✨ **La Vibe Room**

### 🏆 SPECIAL EVENTS — LA CASA ROOM

**FRIDAY**  
🔥 Street Bachata Battle All Stars

**SATURDAY**  
🇫🇷 Social French Cup — Pre-Selection

**SUNDAY**  
🏆 Social French Cup — Final  
🌍 World Cup Qualifier

### 🌙 NIGHT PARTIES

**THURSDAY**  
🔥 Urban Vibe Party

**FRIDAY**  
🥃 Añejo Vibe Party

**SATURDAY — AFTER PARTY**  
After Capital of Fusion Vibe at Aquaboulevard, the party continues from **5:00 AM** in La Casa Room at La Palmeraie.

**SUNDAY**  
✨ Smooth Vibe Party

---

## 🌊 AREA 2 — AQUABOULEVARD

![Area 2 — Aquaboulevard](/images/area2.png)

**Venue:** Aquaboulevard

Welcome to the aquatic side of the Paris Bachata Vibe Festival.

Area 2 combines dancing, workshops, social experiences and an incredible pool-party atmosphere inside the Aquaboulevard complex.

### ROOMS & SPACES

- 🌴 **El Patio Room** — Workshops & open-air social dancing
- 🏝️ **Antille Beach**
- 🌿 **Mangrove Area**
- 🌊 **Caribbean Beach**
- 🏄 **Surf Pool**
- ✨ **Jonas**

---

## 💦 SATURDAY — CAPITAL OF FUSION VIBE

The highlight of Saturday night takes place inside the Aquaboulevard aquatic complex.

🔥 **Capital of Fusion Vibe**  
📍 Area 2 — Aquaboulevard  
🕥 **10:30 PM → 5:00 AM**

Dance, enjoy the aquatic spaces and experience one of the most unique nights of the festival.

### THE NIGHT DOESN'T END AT 5 AM…

At the end of the Aquaboulevard party, we move back to:

📍 **AREA 1 — LA PALMERAIE**  
🏠 La Casa Room

🔥 **Official After Party: 5:00 AM → 8:00 AM**

From Aquaboulevard to La Palmeraie, the vibe continues until sunrise.

---

## 📲 PLAN YOUR FESTIVAL

With 2 areas, multiple rooms, aquatic spaces, workshops, competitions, social dancing and parties, make sure you plan your movements throughout the weekend.

Check the schedule. Check the map. Follow the on-site signage. Download the official app.

And most importantly…

Enjoy the full Paris Bachata Vibe Festival experience. 🔥🌴🌊
`,

  fr: `## VENUE OFFICIEL & ZONES

Prépare-toi pour une expérience festival unique au cœur de Paris ! 🔥

Le Paris Bachata Vibe Festival se déroule sur un immense complexe de **10 000 m² (1 hectare)**, divisé en **2 zones principales**, chacune offrant une atmosphère et une expérience différentes tout au long du festival.

### 📍 Adresse officielle

**18–19 rue du Colonel Pierre Avia, 75015 Paris**

![Zones 1 & 2 — Vue d'ensemble du venue](/images/area1-2.png)

### ⚠️ AVANT D'ARRIVER

Les différentes zones, salles et espaces n'ouvrent pas toutes aux mêmes horaires : cela dépend du planning du festival.

Consulte le programme officiel, le plan du venue et la signalétique sur place pour te repérer dans le complexe.

📱 On te recommande aussi fortement de télécharger l'application mobile officielle **Paris Bachata Vibe Festival** avant le festival (disponible la première semaine de septembre). Elle t'aidera à accéder aux horaires et infos pratiques, et à te déplacer plus facilement tout le week-end.

---

## 🌴 ZONE 1 — LA PALMERAIE

![Zone 1 — La Palmeraie](/images/area1.png)

**Lieu :** La Palmeraie

La Zone 1 est l'espace indoor principal du festival : workshops, compétitions, événements spéciaux et night parties.

### SALLES

- 🏠 **La Casa Room**
- 🎓 **La Escuela Room**
- ✨ **La Vibe Room**

### 🏆 ÉVÉNEMENTS SPÉCIAUX — LA CASA ROOM

**VENDREDI**  
🔥 Street Bachata Battle All Stars

**SAMEDI**  
🇫🇷 Social French Cup — Pré-sélections

**DIMANCHE**  
🏆 Social French Cup — Finale  
🌍 World Cup Qualifier

### 🌙 NIGHT PARTIES

**JEUDI**  
🔥 Urban Vibe Party

**VENDREDI**  
🥃 Añejo Vibe Party

**SAMEDI — AFTER PARTY**  
Après le Capital of Fusion Vibe à l'Aquaboulevard, la fête continue dès **5 h 00** dans La Casa Room à La Palmeraie.

**DIMANCHE**  
✨ Smooth Vibe Party

---

## 🌊 ZONE 2 — AQUABOULEVARD

![Zone 2 — Aquaboulevard](/images/area2.png)

**Lieu :** Aquaboulevard

Bienvenue du côté aquatique du Paris Bachata Vibe Festival.

La Zone 2 combine danse, workshops, expériences social et une ambiance pool-party unique au sein du complexe Aquaboulevard.

### SALLES & ESPACES

- 🌴 **El Patio Room** — Workshops & social open air
- 🏝️ **Antille Beach**
- 🌿 **Mangrove Area**
- 🌊 **Caribbean Beach**
- 🏄 **Surf Pool**
- ✨ **Jonas**

---

## 💦 SAMEDI — CAPITAL OF FUSION VIBE

Le clou de la soirée du samedi a lieu dans le complexe aquatique Aquaboulevard.

🔥 **Capital of Fusion Vibe**  
📍 Zone 2 — Aquaboulevard  
🕥 **22 h 30 → 5 h 00**

Danse, profite des espaces aquatiques et vis l'une des nuits les plus uniques du festival.

### LA NUIT NE S'ARRÊTE PAS À 5 H…

À la fin de la soirée Aquaboulevard, on rejoint :

📍 **ZONE 1 — LA PALMERAIE**  
🏠 La Casa Room

🔥 **After Party officielle : 5 h 00 → 8 h 00**

D'Aquaboulevard à La Palmeraie, la vibe continue jusqu'au lever du soleil.

---

## 📲 PLANIFIE TON FESTIVAL

Avec 2 zones, plusieurs salles, des espaces aquatiques, des workshops, des compétitions, du social et des soirées, pense à anticiper tes déplacements tout le week-end.

Consulte le planning. Regarde le plan. Suis la signalétique. Télécharge l'appli officielle.

Et surtout…

Profite pleinement de l'expérience Paris Bachata Vibe Festival. 🔥🌴🌊
`,

  es: `## VENUE OFICIAL Y ÁREAS

¡Prepárate para una experiencia de festival única en el corazón de París! 🔥

El Paris Bachata Vibe Festival se celebra en un enorme complejo de **10.000 m² (1 hectárea)**, dividido en **2 áreas principales**, cada una con una atmósfera y una experiencia distintas a lo largo del festival.

### 📍 Dirección oficial

**18–19 rue du Colonel Pierre Avia, 75015 París**

![Áreas 1 & 2 — Vista general del venue](/images/area1-2.png)

### ⚠️ ANTES DE LLEGAR

Las distintas áreas, salas y espacios abren a horarios diferentes según el programa del festival.

Consulta el horario oficial, el mapa del venue y la señalización in situ para orientarte en el complejo.

📱 También te recomendamos encarecidamente descargar la app móvil oficial **Paris Bachata Vibe Festival** antes del festival (disponible la primera semana de septiembre). Te ayudará a acceder a horarios e información práctica y a moverte con más facilidad durante el fin de semana.

---

## 🌴 ÁREA 1 — LA PALMERAIE

![Área 1 — La Palmeraie](/images/area1.png)

**Venue:** La Palmeraie

El Área 1 es el espacio indoor principal del festival: workshops, competiciones, eventos especiales y night parties.

### SALAS

- 🏠 **La Casa Room**
- 🎓 **La Escuela Room**
- ✨ **La Vibe Room**

### 🏆 EVENTOS ESPECIALES — LA CASA ROOM

**VIERNES**  
🔥 Street Bachata Battle All Stars

**SÁBADO**  
🇫🇷 Social French Cup — Preselección

**DOMINGO**  
🏆 Social French Cup — Final  
🌍 World Cup Qualifier

### 🌙 NIGHT PARTIES

**JUEVES**  
🔥 Urban Vibe Party

**VIERNES**  
🥃 Añejo Vibe Party

**SÁBADO — AFTER PARTY**  
Tras el Capital of Fusion Vibe en Aquaboulevard, la fiesta continúa desde las **5:00** en La Casa Room en La Palmeraie.

**DOMINGO**  
✨ Smooth Vibe Party

---

## 🌊 ÁREA 2 — AQUABOULEVARD

![Área 2 — Aquaboulevard](/images/area2.png)

**Venue:** Aquaboulevard

Bienvenido al lado acuático del Paris Bachata Vibe Festival.

El Área 2 combina baile, workshops, experiencias social y una increíble atmósfera de pool party dentro del complejo Aquaboulevard.

### SALAS Y ESPACIOS

- 🌴 **El Patio Room** — Workshops y social al aire libre
- 🏝️ **Antille Beach**
- 🌿 **Mangrove Area**
- 🌊 **Caribbean Beach**
- 🏄 **Surf Pool**
- ✨ **Jonas**

---

## 💦 SÁBADO — CAPITAL OF FUSION VIBE

El momento estrella del sábado por la noche tiene lugar en el complejo acuático Aquaboulevard.

🔥 **Capital of Fusion Vibe**  
📍 Área 2 — Aquaboulevard  
🕥 **22:30 → 5:00**

Baila, disfruta de los espacios acuáticos y vive una de las noches más únicas del festival.

### LA NOCHE NO TERMINA A LAS 5…

Al final de la fiesta en Aquaboulevard, volvemos a:

📍 **ÁREA 1 — LA PALMERAIE**  
🏠 La Casa Room

🔥 **After Party oficial: 5:00 → 8:00**

De Aquaboulevard a La Palmeraie, la vibe continúa hasta el amanecer.

---

## 📲 PLANIFICA TU FESTIVAL

Con 2 áreas, varias salas, espacios acuáticos, workshops, competiciones, social y fiestas, planifica bien tus desplazamientos durante el fin de semana.

Consulta el horario. Mira el mapa. Sigue la señalización. Descarga la app oficial.

Y, sobre todo…

Disfruta al máximo de la experiencia Paris Bachata Vibe Festival. 🔥🌴🌊
`,
};

/** Resolve locale → markdown de repli (défaut EN). */
export function getFestivalAccesVenueFallback(locale: string): string {
  if (locale === "fr" || locale === "en" || locale === "es") {
    return FESTIVAL_ACCES_VENUE_FALLBACK[locale];
  }
  return FESTIVAL_ACCES_VENUE_FALLBACK.en;
}
