# Procédure de Déploiement Frontend : Vercel

Cette procédure décrit comment déployer l'application frontend Next.js sur Vercel et résoudre les problèmes courants.

## 1. Prérequis
- Un compte Vercel lié à ton compte GitHub.
- Le code frontend localisé dans le dossier `frontend/` du dépôt git.

## 2. Création et Configuration du Projet
1. Sur le dashboard Vercel, clique sur **Add New...** > **Project**.
2. Importe le dépôt GitHub de **Capital of Fusion V5**.
3. Dans la section **Framework Preset**, Vercel devrait détecter automatiquement **Next.js**.
4. Dans **Root Directory**, clique sur "Edit" et sélectionne le dossier `frontend`. C'est l'étape la plus critique.

## 3. Variables d'Environnement (Vercel)
Pour que le frontend puisse communiquer avec le backend, l'URL de l'API doit être définie.
1. Va dans **Settings** > **Environment Variables**.
2. Ajoute la clé `NEXT_PUBLIC_API_URL`.
3. Pour la valeur : metsl'URL publique de ton backend (ex: `https://capitaloffusionversion5-production.up.railway.app`).
4. **Important :** Coche bien tous les environnements (Production, Preview, Development) pour que l'API fonctionne même sur les URLs de prévisualisation générées par Vercel lors d'une Pull Request.

## 4. Troubleshooting Courant

### Erreur TS bloquant le build
Si le build échoue rouge avec une erreur TypeScript (`Type error: Property '...' does not exist`), Vercel bloque le déploiement par sécurité. 
**Solution :** Corrige l'erreur TypeScript en local, vérifie que `npm run build` passe sur ta machine dans le dossier `/frontend`, commite et pousse.

### L'application tourne mais n'affiche aucune donnée du backend (Planètes, Menu)
Si le frontend fonctionne mais qu'il manque des données dynamiques gérées par le backend :
1. Ouvre la console de ton navigateur (F12) et va dans l'onglet **Network (Réseau)**.
2. Vérifie vers quelle URL partent les requêtes API (ex: `https://.../api/config/`).
3. Si les requêtes échouent (CORS ou 404), c'est que la variable `NEXT_PUBLIC_API_URL` est manquante ou erronée dans Vercel, OU que tu es sur un environnement "Preview" et que la variable n'a été rattachée qu'à "Production".

### Erreur de routage Git sur Vercel ("failed to clone repo")
Si un déploiement affiche cette erreur inhabituelle, cela arrive souvent quand la branche sélectionnée par défaut par Vercel a été supprimée ou renommée, ou après un changement de nom du dépôt GitHub.
**Solution :**
1. Va dans **Settings** > **Git**.
2. Déconnecte le dépôt (Disconnect) puis reconnecte-le.
3. Vérifie que la "Production Branch" pointe vers la bonne branche (ex: `main`).
4. Relance le déploiement.
