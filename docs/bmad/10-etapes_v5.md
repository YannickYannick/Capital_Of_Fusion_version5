# Étapes de migration V4 → V5

**Référence principale :** [../refactorisation_v4/etapes/](../refactorisation_v4/etapes/) (copie locale, source V4)

---

## Index des étapes (à compléter)

| # | Étape | Statut | Fichier source |
|---|--------|--------|----------------|
| 1 | Structure dossiers frontend | À faire | [01-structure_frontend.md](../refactorisation_v4/etapes/01-structure_frontend.md) |
| 2 | … | … | … |

---

## Ordre recommandé (Phase 1)

1. **Structure projet** — frontend (groupes de routes) + backend (apps).
2. **Core** — BaseModel, DanceStyle, Level, DanceProfession, SiteConfiguration, MenuItem.
3. **Users** — User, rôles, auth.
4. **Organization** — OrganizationNode, paramètres 3D, NodeEvent.
5. **Courses** — Course, Schedule, Enrollment.
6. **Events** — Event, EventPass, Registration.
7. **Landing** — page `/`, vidéo fond, CTA.
8. **Explore 3D** — scène Three.js, overlay, fallback liste.
9. **Pages Cours / Événements** — liste, filtres, détail.
10. **Navbar / Menu** — API menu, intégration front.

---

## Notes

- Chaque étape détaillée doit suivre le modèle dans [01-structure_frontend.md](../refactorisation_v4/etapes/01-structure_frontend.md) (objectif, prérequis, tâches, livrables).
- Les étapes Phase 2+ (Shop, Formations, etc.) seront définies après validation de la Phase 1.

---

*Dernière mise à jour : 2025-02-10*
