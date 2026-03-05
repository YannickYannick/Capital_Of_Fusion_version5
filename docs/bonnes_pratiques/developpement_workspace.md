# Bonnes Pratiques - Développement & Workspace

Ce document regroupe les règles de sécurité et d'organisation pour garantir la stabilité du projet V5.

## 🛠️ Workspace & Commandes
Le projet est un monorepo hybride. **Ne jamais lancer de commandes de build à la racine.**

- **Frontend (Next.js)** :
  - Localisation : `/frontend/`
  - Commande : `cd frontend ; npm run dev`
- **Backend (Django)** :
  - Localisation : `/backend/`
  - Commande : `cd backend ; .\.venv\Scripts\python.exe manage.py runserver`

## 🛡️ Protocole Git (Anti-Corruption)
Pour éviter les verrous `index.lock` et les pertes de fichiers sur Windows :

1. **Fréquence des Commits** : Faire des petits commits par fonctionnalité technique (ex: "feat: model artist", puis "feat: api artist").
2. **Vérification de l'Index** : Toujours exécuter `git status` avant un commit.
3. **Gestion du Verrou** : Si Git bloque, arrêter tous les terminaux (Node/Python) et supprimer `.git/index.lock`.
4. **Fins de Ligne** : Garder `git config core.autocrlf true` pour éviter les conflits de format entre Windows et le serveur de déploiement.

## 📂 Organisation des Docs
- **Bugs** : Toujours documenter dans `/docs/bugs/<branch_name>/`.
- **Procédures** : Les guides d'installation ou de déploiement vont dans `/docs/procedures/`.
- **Compte-rendus** : Centralisés dans `/docs/bmad/01-project_log.md`.
