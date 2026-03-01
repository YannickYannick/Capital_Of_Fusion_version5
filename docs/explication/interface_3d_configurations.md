# Comprendre l'Interface 3D : Configurations Locales vs Production

Ce document explique le fonctionnement des configurations de l'interface spatiale 3D (la vue Explore) et pourquoi l'affichage peut sembler différent entre votre environnement de développement local (votre ordinateur) et l'environnement de production (Vercel).

## 1. Pourquoi l'interface semble différente en Production ?

L'interface spatiale (composée de planètes, orbites, vitesses, etc.) permet à chaque utilisateur de personnaliser son expérience via le **panneau d'options (roue crantée)**.

Pour conserver ces préférences d'une visite à l'autre sans avoir besoin d'une base de données complexe par utilisateur, **toutes ces valeurs sont sauvegardées dans le navigateur de l'utilisateur** via ce qu'on appelle le `localStorage`.

### Comment fonctionne le LocalStorage ?
Le `localStorage` est lié au **nom de domaine**.
- Votre navigateur a sauvegardé vos ajustements minutieux sous l'adresse locale `http://localhost:3000`.
- Lors du déploiement sur Vercel, l'adresse change (par exemple `https://capital-of-fusion-version5.vercel.app`).
- Pour ce nouveau domaine, le navigateur ne trouve aucun réglage enregistré et charge donc l'interface avec les **réglages par défaut** du code source.

C'est pourquoi, à la première ouverture sur Vercel, l'interface retrouve son état initial, qui n'est pas forcément celui que vous aviez fignolé en local.

## 2. Comment uniformiser l'expérience pour tous les utilisateurs ?

Si vous avez trouvé le "réglage parfait" en local et que vous voulez que tous vos visiteurs découvrent le site avec ces réglages par défaut :

1. Ouvrez votre site en local et notez les valeurs exactes des réglettes dans votre panneau d'options (vitesse globale, espacement des orbites, rayon de la sphère, etc.).
2. Dans le code source, ouvrez le fichier `frontend/src/contexts/PlanetsOptionsContext.tsx`.
3. Repérez l'objet contant `DEFAULTS` :
   ```typescript
   export const DEFAULTS: PlanetsOptionsState = {
       showOrbits: true,
       globalOrbitSpeed: 0.1, // Vitesse par défaut pour tous
       orbitSpacing: 25,      // Distance entre les orbites
       // ... autres paramètres
   };
   ```
4. Remplacez les valeurs dans `DEFAULTS` par vos réglages parfaits.
5. Déployez la mise à jour sur Vercel : tous les nouveaux visiteurs auront désormais ces configurations.

## 3. Le problème du Fond Vidéo (YouTube) manquant

Un autre point de différence fréquent entre local et production est l'absence de la vidéo d'arrière-plan sur Vercel.

**La cause :** La vidéo d'arrière-plan repose sur un identifiant YouTube (ex: `Dqg0oKlXpTE`) configuré dans un fichier caché nommé `.env.local`. Ce fichier contient des données sensibles et **n'est jamais envoyé sur GitHub par sécurité**.
Puisque le fichier est absent sur GitHub, Vercel ne le voit pas et ne peut donc pas lancer la bonne vidéo.

### Comment corriger ce problème sur Vercel ?
Il faut fournir manuellement cette variable à Vercel en suivant ces étapes :

1. Connectez-vous à votre tableau de bord **Vercel**.
2. Allez dans les paramètres de votre projet : **Settings**.
3. Dans la barre latérale gauche, cliquez sur **Environment Variables**.
4. Ajoutez la variable suivante :
   - **Key** : `NEXT_PUBLIC_YOUTUBE_VIDEO_ID`
   - **Value** : `Dqg0oKlXpTE` *(ou l'ID de votre vidéo YouTube)*
5. Cliquez sur le bouton **Save**.
6. Naviguez dans l'onglet **Deployments** de Vercel, cliquez sur le bouton "..." à côté de votre dernier déploiement et choisissez **Redeploy**.

Une fois le redéploiement terminé, la vidéo s'affichera correctement en production.
