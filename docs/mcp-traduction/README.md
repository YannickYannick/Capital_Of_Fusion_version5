# MCP — Gestion des données & traductions

Extension documentaire pour tout ce qui concerne **les données multilingues** (FR / EN / ES), les workflows de traduction et le repérage **côté visiteur** vs **côté technique**.

À utiliser comme référence pour des outils (MCP, scripts, IA) qui doivent savoir *où* sont stockées les variantes de langue.

## Fichiers

| Fichier | Contenu |
|---------|---------|
| [**`traduction-tableur-complet.csv`**](./traduction-tableur-complet.csv) | **Un seul tableau** (parcours visiteur + inventaire BDD), séparateur `;`, colonne **Commentaire** vide — à ouvrir dans Excel / LibreOffice / Google Sheets. |
| [`traduction-tableur-complet.md`](./traduction-tableur-complet.md) | Notice sur l’usage du CSV (colonnes, encodage). |
| [`traduction-pages-et-champs.md`](./traduction-pages-et-champs.md) | Statique vs dynamique, workflow, **inventaire exhaustif** des colonnes `*_fr` / `*_en` / `*_es` par modèle Django. |
| [`traduction-par-page.md`](./traduction-par-page.md) | Même information **triée par route / page** (parcours URL). |
| [`traduction-visiteur-par-page-fr-en-es.md`](./traduction-visiteur-par-page-fr-en-es.md) | Version Markdown du tableau visiteur (découpé par sections). |
| [**`strategie-traduction-decisions.md`**](./strategie-traduction-decisions.md) | Décisions produit (CSV « Etats des traductions 2 »), exceptions lieux/personnes, priorité BDD, politique page nœuds organisation. |

## Code source associé

- Frontend : `frontend/messages/{fr,en,es}.json`, `frontend/src/i18n/request.ts`, `frontend/src/lib/api.ts` (`?lang=`).
- Backend : `backend/apps/*/translation.py`, `backend/apps/core/middleware_translation.py`.

## Maintenance

Quand tu ajoutes un champ traduit ou une page : mets à jour les trois documents concernés pour rester aligné avec le code.
