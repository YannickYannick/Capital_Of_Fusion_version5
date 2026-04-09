# Fonctionnalités — Site Bachata V5

Documentation par feature : où c’est dans le code, comment ça fonctionne, configuration admin.

---

| Feature | Fichier | Résumé |
|---------|---------|--------|
| [Explore — Presets 3D](explore-presets.md) | `explore-presets.md` | Presets sauvegardables (zoom, caméra, options), API `core/presets`, chargement depuis SiteConfiguration |
| [Identité COF — Notre vision & Bulletins](identite-cof.md) | `identite-cof.md` | Notre vision / histoire (Markdown), bulletins ; édition staff ; API `config`, `GET/PATCH admin/config`, traductions admin |
| [Traduction admin Identité COF](traduction-identite-cof-admin.md) | `traduction-identite-cof-admin.md` | Modale EN/ES, aperçus FR + rappels versions en ligne, `getSiteIdentityTranslationsAdmin` |
| [Organisation — Structure & Nœuds](organisation-noeuds.md) | `organisation-noeuds.md` | Organigramme, annuaire nœuds, fiche par nœud (cours + événements) |
| [Organisation — Pôles & Staff](organisation-poles-staff.md) | `organisation-poles-staff.md` | Pôles (liste + comptage membres), page Notre Staff (grille, filtre par pôle) |
| [Nos partenaires](partenaires.md) | `partenaires.md` | Structures, événements et cours partenaires (app `partners`, APIs dédiées, pages type organisation/événements/cours) |
| [Partenaires — musique fiche structure](partenaires-structure-musique-fond.md) | `partenaires-structure-musique-fond.md` | Musique dédiée sur `/partenaires/structures/[slug]`, priorité sur le son YouTube du site, reprise seulement sur `/` ou `/explore` |
| [Médias artistes & images API](medias-artistes-et-images-api.md) | `medias-artistes-et-images-api.md` | Profils / couvertures : sérialisation API, Cloudinary, Next `Image`, checklist après changement |
| [Landing — i18n + fond vidéo](landing-config.md) | `landing-config.md` | Hero via `messages` (`landing.*`), fond/voile via `GlobalVideoBackground` |
| [Musique fond — mode Accueil (site)](musique-fond-mode-accueil.md) | `musique-fond-mode-accueil.md` | `main_video` seule sur tout le site en mode 🏠 ; exception `/explore` |
| [Navbar & Dashboard](navbar-dashboard.md) | `navbar-dashboard.md` | Logo, avatar connecté, lien DB menu (admins), dashboard sans iframes |
| **i18n / traduction** | [../explication/traduction-i18n.md](../explication/traduction-i18n.md) | Multilingue FR/EN/ES, next-intl + modeltranslation + Gemini ; spec complète dans explication |

---

*Voir aussi : [03-api_docs.md](../bmad/03-api_docs.md) pour les endpoints, [02-tech_specs.md](../bmad/02-tech_specs.md) pour l’architecture.*
