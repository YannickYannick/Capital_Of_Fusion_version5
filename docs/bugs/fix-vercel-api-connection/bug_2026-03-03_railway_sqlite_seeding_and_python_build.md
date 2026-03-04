# Résolution Finale : Base de données SQLite sur Railway et Seeding

## Résumé du Problème
Le frontend Next.js déployé sur Vercel ne parvenait pas à afficher les planètes 3D (Noeuds d'organisation) alors que le backend Django tournait correctement sur Railway. Bien que l'API réponde avec un statut `200 OK`, elle retournait un tableau de noeuds vide `[]`. 

Ce diagnostic a révélé trois problèmes majeurs imbriqués liés à l'architecture de Railway et ses builders.

### 1. L'illusion de `railway run`
- **Tentatives :** Utilisation de `railway run python manage.py loaddata` ou de scripts personnalisés d'insertion.
- **Constat :** La commande affichait "Success", mais la base Railway restait vide. 
- **Cause :** La CLI `railway run` télécharge les variables d'environnement de production mais **exécute le code sur la machine locale**. Ainsi, toutes les commandes de seeding modifiaient le fichier local `db.sqlite3` et non celui qui tournait dans le cloud sur Railway.

### 2. Le comportement éphémère de SQLite sur Railway
- **Problème :** Railway utilise des conteneurs éphémères. Lors de chaque nouveau déploiement, le conteneur est détruit et recréé à partir du code source de GitHub.
- **Conséquence :** Si on utilise SQLite (base basée sur un fichier `db.sqlite3`), **le fichier de base de données est supprimé à chaque déploiement**. Toutes les données injectées (planètes, comptes utilisateurs) sont perdues dès que le code est mis à jour.
- *Note : Ce comportement disparaît si une vraie base de données PostgreSQL est rattachée au service, mais en l'absence de base externe, Railway utilise SQLite en mémoire volatile.*

### 3. Erreur de build Railpack (Python 3.12.13)
- **Problème :** Pendant qu'on essayait de contourner le point 2, le build Railway s'est mis à crasher complètement : `mise ERROR Failed to install core:python@3.12.13: no precompiled python found`.
- **Cause :** L'application spécifiait `python-3.12` dans le fichier historique `runtime.txt`. Le nouveau builder Railway (nommé Railpack/mise) a tenté de télécharger la toute dernière itération (3.12.13) pour l'architecture x86_linux, qui ne possédait pas encore d'exécutable précompilé.

---

## Solutions mises en place

### A. Correction du Build Python
- **Action :** Suppression de l'ancien `runtime.txt` propre à Heroku.
- **Action :** Création du fichier standard moderne `.python-version` à la racine contenant la version stable : `3.11`.
- **Résultat :** Le builder `mise` télécharge correctement Python 3.11 et le déploiement réussit sans erreur.

### B. Gestion des données éphémères (Le système de Seeding HTTP)
Puisque les données SQLite disparaissent et que `railway run` ne peut pas injecter de données dans le conteneur distant, l'approche a été modifiée : les données doivent être injectées **par le serveur lui-même alors qu'il tourne**.

1. **Génération d'un fichier Seed (Fixtures en code) :**
   Un script extrait les 19 planètes locales et génère une commande de management : `backend/apps/organization/management/commands/seed_nodes.py` qui contient les données JSON *en dur* sous forme de listes Python (pour éviter les problèmes d'encodage).
   
2. **Création d'un Endpoint API de Seed :**
   Une route spéciale `POST /api/seed/` ajoutée dans `backend/apps/core/views.py`.
   - Cet endpoint est protégé par un token : `?key=SECRET_KEY`.
   - Lorsqu'il est appelé, il exécute les commandes internes de Django : `call_command('seed_nodes')` et `call_command('create_admin')`.

3. **Le Processus de Déploiement :**
   Désormais, après un déploiement ou redémarrage sur Railway, la base SQLite est vierge. Il suffit de faire un appel HTTP extérieur pour que le serveur la remplisse instantanément depuis ses propres fichiers.

   **Commande magique exécutée pour injecter l'admin et les planètes en production :**
   ```bash
   Invoke-RestMethod -Uri "https://capitaloffusionversion5-production.up.railway.app/api/seed/?key=change-me-in-prod"
   ```

### C. Le Compte Super Administrateur
La commande Django automatisée crée ou vérifie un compte administrateur à chaque appel de l'API de seed.
- **URL :** `https://capitaloffusionversion5-production.up.railway.app/admin/`
- **Username :** `admin`
- **Password :** `admin`

---

## Leçons Apprises
- Il ne faut pas s'attendre à ce que la base locale `db.sqlite3` soit sauvegardée en production sur des plateformes de Container-as-a-Service comme Railway ou Heroku.
- La commande `railway run` est un outil de debug local, ce n'est pas un SSH vers le conteneur de production. Pour exécuter une ligne de commande en production (comme les migrations de DB durables), le `Procfile` ou les endpoints d'API isolés sont les uniques sas d'entrée valides.
- Préférer le fichier `.python-version` aux vieux standards `runtime.txt`.
