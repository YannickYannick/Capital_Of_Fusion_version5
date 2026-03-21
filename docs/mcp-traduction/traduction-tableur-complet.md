# Tableau unique pour tableur (export)

Le fichier **[`traduction-tableur-complet.csv`](./traduction-tableur-complet.csv)** contient **un seul tableau** (toutes les lignes d’affilée) :

| Colonne | Contenu |
|---------|---------|
| **Section** | `Parcours visiteur` (zones par page) puis `Inventaire BDD (champ)` (une ligne par champ traduit). |
| **Page ou contexte** | Route ou modèle Django. |
| **Zone visible** | Ce que voit l’utilisateur ou nom du champ. |
| **Type** | statique, dynamique, en dur, etc. |
| **Identifiant technique** | Clé API, champ logique, fichier. |
| **Cible FR / EN / ES** | Colonne BDD ou `messages/*.json`. |
| **Commentaire** | **Vide** — à remplir dans Excel / Sheets. |

- **Encodage** : UTF-8 avec BOM (ouverture correcte dans Excel Windows).
- **Séparateur** : point-virgule `;` (pratique pour Excel en locale française).

Pour les commentaires par zone, filtre ou trie sur la colonne **Section** ou **Page ou contexte**.
