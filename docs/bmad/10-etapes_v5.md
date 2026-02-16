# Étapes de migration V4 → V5

**Référence principale :** [../refactorisation_v4/etapes/](../refactorisation_v4/etapes/) (copie locale, source V4)

---

## Index des étapes (Phase 1)

| # | Étape | Statut | Fichier source |
|---|--------|--------|----------------|
| 1 | Structure projet (frontend + backend) | Fait | [01-structure_frontend.md](../refactorisation_v4/etapes/01-structure_frontend.md) |
| 2 | Core (BaseModel, DanceStyle, Level, etc.) | Fait | — |
| 3 | Users (User, auth) | Fait | — |
| 4 | Organization (OrganizationNode, NodeEvent) | Fait | — |
| 5 | Courses (Course, Schedule, Enrollment) | Fait | — |
| 6 | Events (Event, EventPass, Registration) | Fait | — |
| 7 | Landing (page `/`, vidéo, CTA) | Fait | — |
| 8 | Explore 3D (Three.js, overlay, vue liste) | Fait | — |
| 9 | Pages Cours / Événements (liste, filtres, détail) | Fait | — |
| 10 | Navbar / Menu (API menu, intégration front) | Fait | — |

---

## Ordre recommandé (Phase 1)

1. **Structure projet** — frontend (groupes de routes) + backend (apps). ✅
2. **Core** — BaseModel, DanceStyle, Level, DanceProfession, SiteConfiguration, MenuItem. ✅
3. **Users** — User, rôles, auth. ✅
4. **Organization** — OrganizationNode, paramètres 3D, NodeEvent. ✅
5. **Courses** — Course, Schedule, Enrollment. ✅
6. **Events** — Event, EventPass, Registration. ✅
7. **Landing** — page `/`, vidéo fond, CTA. ✅
8. **Explore 3D** — scène Three.js, overlay, fallback liste. ✅
9. **Pages Cours / Événements** — liste, filtres, détail. ✅
10. **Navbar / Menu** — API menu, intégration front. ✅

---

## Notes

- Chaque étape détaillée doit suivre le modèle dans [01-structure_frontend.md](../refactorisation_v4/etapes/01-structure_frontend.md) (objectif, prérequis, tâches, livrables).
- Les étapes Phase 2+ (Shop, Formations, etc.) seront définies après validation de la Phase 1.

## Suite après Phase 1

- **Accessibilité** : contrastes, navigation clavier, aria, fallback Explore (vue liste).
- **Déploiement** : Vercel (front) + Railway ou Render (back) — voir [explication/hebergement.md](../explication/hebergement.md).
- **Phase 2** : Boutique, Formations, etc. (à prioriser selon le produit).

---

*Dernière mise à jour : 2025-02-10*
