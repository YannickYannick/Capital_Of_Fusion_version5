# Connexion avec Google (OAuth) — Avantages / Inconvénients

**Objectif :** permettre « Se connecter avec Gmail » en plus du login classique (username/mot de passe). Le compte utilisateur du site est alors **lié** à un compte Google (même User, même token API).

---

## Impact sur le code

| Zone | Modification | Importance |
|------|--------------|------------|
| **Backend** | 1 nouvelle vue (`POST /api/auth/google/`), 1 dépendance (`google-auth`), 1 variable d’env (`GOOGLE_OAUTH_CLIENT_ID`). Login classique **inchangé**. | Faible |
| **Frontend** | 1 dépendance (`@react-oauth/google`), bouton « Google » sur la page login, 1 fonction API `loginWithGoogle(id_token)`. Formulaire actuel **inchangé**. | Faible |
| **User / BDD** | Aucune migration obligatoire (on peut identifier l’utilisateur par email). Optionnel : champ `google_id` pour éviter doublons. | Nul à faible |

**En résumé :** on **ajoute** un chemin de connexion parallèle. Le flux token (stockage, logout, `/api/auth/me/`) reste identique.

---

## Avantages

- **UX** : un clic pour se connecter, pas de mot de passe à retenir ; beaucoup d’utilisateurs préfèrent « Se connecter avec Google ».
- **Sécurité** : pas de stockage de mot de passe pour ces utilisateurs ; la vérification est faite par Google (id_token).
- **Corrélation Gmail ↔ compte** : l’email Google est utilisé pour créer ou retrouver le User ; un même Gmail = un même compte à chaque fois.
- **Moins de support** : moins de « mot de passe oublié » pour les utilisateurs qui passent par Google.

---

## Inconvénients

- **Dépendance à Google** : si tu désactives l’option plus tard, les utilisateurs « Google only » devront définir un mot de passe (flux « réinitialiser mot de passe » à prévoir).
- **Configuration** : il faut créer un projet dans la [Google Cloud Console](https://console.cloud.google.com/) et configurer l’écran de consentement OAuth (Client ID pour appli Web).
- **Environnements** : tu dois déclarer les origines autorisées (localhost en dev, domaine Vercel en prod) dans la config Google ; à faire une fois.
- **Vie privée** : tu reçois au minimum l’email (et optionnellement nom, photo) selon les scopes demandés ; à mentionner en RGPD / politique de confidentialité si besoin.

---

## Résumé

- **Ça ne modifie pas beaucoup le code** : ajout d’un endpoint et d’un bouton, le reste du flux (token, déconnexion, `/me`) reste tel quel.
- **Avantages** : meilleure UX, moins de mots de passe à gérer, lien clair Gmail ↔ compte.
- **Inconvénients** : config Google une fois, dépendance à Google, à documenter pour la confidentialité.

---

## Implémentation réalisée

- **Backend :** `POST /api/auth/google/` (body `id_token`), dépendance `google-auth`, variable d’env `GOOGLE_OAUTH_CLIENT_ID`. Création ou récupération du User par email ; même format de réponse `{ "token": "..." }` que le login classique.
- **Frontend :** `@react-oauth/google`, bouton « Continuer avec Google » sur la page login (affiché seulement si `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` est défini), fonction `loginWithGoogle(id_token)` dans `api.ts`.
- **Configuration :** créer un projet et des identifiants OAuth 2.0 (type « Application Web ») dans [Google Cloud Console](https://console.cloud.google.com/apis/credentials), renseigner le même Client ID côté front (variable `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID`) et côté back (variable `GOOGLE_OAUTH_CLIENT_ID`), et ajouter les origines autorisées (localhost, domaine Vercel).
