# Bug Report: Incident Git & Perte de Données (2026-03-05)

## 🚨 The Issue
Lors d'un commit massif sur la branche `feature/page-artistes`, un verrou Git (`index.lock`) a provoqué l'échec de l'opération. Suite à des tentatives de forçage, Git a marqué ~30 fichiers comme supprimés, entraînant une perte de code sur le disque local (modèles Artistes, pages Frontend).

**Logs / Erreurs :**
- `fatal: Unable to create '.../.git/index.lock': File exists.`
- `deleted: backend/apps/artists/models.py` (alors que le fichier était censé être commité).

## 🕵️‍♂️ Investigation
- **Cause Racine** : Un processus tiers (IDE ou indexeur Windows) tenait un lock sur l'index Git pendant que l'agent AI tentait un commit.
- **Aggravation** : L'utilisation de `git commit -a` a inclus les fichiers "disparus" (lockés) comme des suppressions volontaires dans l'index.
- **Échec de Restauration** : Le `git reset --hard` n'a pas suffi car les fichiers n'avaient jamais été commités avec succès auparavant.

## ✅ The Solution
1. **Nettoyage forcé** : Suppression manuelle de `index.lock` via CMD (PowerShell échouait parfois).
2. **Ré-implémentation** : L'agent a dû ré-écrire les fichiers `models.py`, `views.py` et les pages Frontend à partir de sa mémoire de session.
3. **Push direct** : Utilisation de `git push origin feature/page-artistes:main` pour contourner les problèmes de checkout local.

## 🧠 Post-Mortem: Prévention
- **Règle BMAD** : Ne plus faire de commits massifs (>10 fichiers modifiés sans commit intermédiaire).
- **Vérification** : Toujours faire `git status` avant de valider un commit automatique.
- **Workspace** : S'assurer que le backend et le frontend sont lancés depuis leurs dossiers respectifs pour éviter les erreurs `ENOENT`.
