# Sources — refactorisation V4

**Provenance :** `C:\Users\yannb\Documents\1. Programmation\3. Bachata\Projet - site bachata V4\refactorisation_V5_Structuré\`

**Date de copie :** 2025-02-10

**Contenu copié (après réorganisation 2025-02-10) :**
- `structure/01-arborescence.md` (adapté depuis 01-ARBORESCENCE_V5)
- `structure/02-mcd_modele_donnees.md` (depuis 03-MCD, avec phasage)
- `structure/03-maquettes_wireframes.md` (depuis 04-MAQUETTES_ET_WIREFRAMES)
- `structure/04-maquettes_ui_jour.md` (depuis 05-MAQUETTES_UI_A_JOUR)
- `structure/05-maquettes_ui.md` (depuis V4 docs/architecture/08-MAQUETTES_UI)
- `etapes/00-index.md`, `etapes/01-structure_frontend.md` (adaptés à (main), arborescence V5)

**Fichiers non copiés :**
- `structure/02-CONVENTIONS_V5.md` — conventions dans tech_specs
- `REPONSES_QUESTIONNAIRE_V5.md` — déjà intégré dans `meetings.md` et `product_brief.md`
- `README.md` — redondant

**Adaptations appliquées :**
- `01-arborescence` : 1 layout unique `(main)` au lieu de `(site)/(app)/(auth)/(dashboard)` ; monorepo conservé.
- `02-mcd_modele_donnees` : table de phasage (Phase 1 vs Phase 2) ajoutée en tête.
- `03-maquettes_wireframes` : références vers `05-maquettes_ui` ; mention (main) au lieu de (site)/(app).
- `04-maquettes_ui_jour` : routes (site) → (main), ref. vers `05-maquettes_ui`.
- `05-maquettes_ui` : copié depuis V4 `docs/architecture/08-MAQUETTES_UI.md`.
- `etapes/` : index + 01-structure_frontend avec tâches concrètes (structure `(main)`, composants, routes).
