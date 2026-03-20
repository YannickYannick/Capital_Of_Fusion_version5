# Fonctionnalités — Site Bachata V5

Documentation par feature : où c’est dans le code, comment ça fonctionne, configuration admin.

---

| Feature | Fichier | Résumé |
|---------|---------|--------|
| [Explore — Presets 3D](explore-presets.md) | `explore-presets.md` | Presets sauvegardables (zoom, caméra, options), API `core/presets`, chargement depuis SiteConfiguration |
| [Identité COF — Notre vision & Bulletins](identite-cof.md) | `identite-cof.md` | Page Notre vision (Markdown config), bulletins d’info ; édition staff depuis le frontend ; API `config`, `identite/bulletins`, `admin/config`, `admin/identite/bulletins` |
| [Organisation — Structure & Nœuds](organisation-noeuds.md) | `organisation-noeuds.md` | Organigramme, annuaire nœuds, fiche par nœud (cours + événements) |
| [Organisation — Pôles & Staff](organisation-poles-staff.md) | `organisation-poles-staff.md` | Pôles (liste + comptage membres), page Notre Staff (grille, filtre par pôle) |
| [Nos partenaires](partenaires.md) | `partenaires.md` | Structures, événements et cours partenaires (app `partners`, APIs dédiées, pages type organisation/événements/cours) |
| [Landing — Config admin](landing-config.md) | `landing-config.md` | Hero et boutons (titres, textes, liens) configurables dans l’admin |
| [Navbar & Dashboard](navbar-dashboard.md) | `navbar-dashboard.md` | Logo, avatar connecté, lien DB menu (admins), dashboard sans iframes |
| **i18n / traduction** | [../explication/traduction-i18n.md](../explication/traduction-i18n.md) | Multilingue FR/EN/ES, next-intl + modeltranslation + Gemini ; spec complète dans explication |

---

*Voir aussi : [03-api_docs.md](../bmad/03-api_docs.md) pour les endpoints, [02-tech_specs.md](../bmad/02-tech_specs.md) pour l’architecture.*
