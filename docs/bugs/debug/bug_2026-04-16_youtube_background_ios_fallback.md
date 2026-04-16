# Incident — fond vidéo YouTube potentiellement instable sur iPhone

## Statut

- Statut final : **symptôme disparu**, cause exacte **non prouvée**
- Date : **2026-04-16**
- Impact : doute sur le lancement automatique du fond vidéo YouTube sur iPhone / Safari mobile

## Symptôme observé

- Le fond vidéo YouTube semblait ne pas se lancer sur iPhone dans certains cas.
- Le problème n'était pas reproduit partout.
- Après plusieurs changements et vérifications, les vidéos YouTube se sont remises à fonctionner.

## Hypothèses étudiées

### 1. Intégration React / YouTube IFrame API

Le site n'utilise pas un simple snippet HTML collé dans la page, mais un composant React :

- `frontend/src/components/shared/YouTubeVideoBackground.tsx`

Ce composant :

- charge `https://www.youtube.com/iframe_api`
- attend `window.onYouTubeIframeAPIReady`
- crée un `YT.Player`
- force `autoplay`, `mute`, `loop`, `playsinline`
- détruit proprement le player au démontage React

Conclusion :

- l'intégration est plus robuste qu'un snippet brut
- le problème n'était pas un oubli évident de `muted` ou `playsinline`

### 2. Hébergement Vercel / Railway

Hypothèse envisagée :

- Vercel pourrait casser le chargement du front
- Railway pourrait casser les appels API et empêcher l'hydratation

Conclusion :

- **Railway est peu probable** pour ce bug précis : YouTube ne passe pas par Railway
- **Vercel n'est pas impossible**, mais surtout si le JS de la page ne charge pas ou si le MP4 statique est lent
- pour un problème de lecture YouTube pur, la cause la plus probable reste **Safari iPhone / autoplay / iframe / réseau**

### 3. Comportement iPhone / Safari

Hypothèses crédibles :

- autoplay plus strict sur iOS
- comportement variable en mode économie d'énergie
- `saveData` / réseau mobile / trackers / délai de chargement de l'API YouTube
- problème transitoire de cache, de réseau ou de chargement du script YouTube

## Décision retenue

Même si le bug a disparu, on a gardé une **stratégie défensive** :

- fallback MP4 local si appareil iOS
- fallback MP4 local si `prefers-reduced-motion`
- fallback MP4 local si `navigator.connection.saveData === true`
- fallback MP4 local si l'API YouTube n'est pas prête après environ **4,5 secondes**

Cela évite qu'un visiteur iPhone voie un fond noir ou un player YouTube non démarré.

## Implémentation

### Code

Fichier principal :

- `frontend/src/components/shared/YouTubeVideoBackground.tsx`

Comportement ajouté :

- état `useMp4Fallback`
- détection iOS
- timeout de repli si `YT.Player` ne devient pas prêt
- rendu `<video>` local à la place du conteneur YouTube

### Média fallback

Fichier utilisé :

- `frontend/public/aftermovie-vibe-2025-fallback.mp4`

Source :

- `C:\Users\yannb\Documents\1. Programmation\3. Bachata\Projet bachata\Videos after movie\aftermovie vibe 2025 youtube.mp4`

## Démarche suivie

1. Vérification du composant existant et comparaison avec un snippet YouTube IFrame API classique.
2. Analyse de l'hypothèse “bug Vercel / Railway”.
3. Choix d'un fallback MP4 comme solution la plus fiable sur iPhone.
4. Copie initiale du MP4 source dans `frontend/public/`.
5. Installation de `ffmpeg` sur Windows via `winget`.
6. Ré-encodage d'une version plus légère pour le fallback.
7. Conservation du fallback même si le bug YouTube a ensuite cessé de se reproduire.

## Commandes utiles

### Installation FFmpeg

```powershell
winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
```

### Encodage du fallback MP4

```powershell
ffmpeg -y -hide_banner -i "C:\Users\yannb\Documents\1. Programmation\3. Bachata\Projet bachata\Videos after movie\aftermovie vibe 2025 youtube.mp4" -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 28 -preset medium -pix_fmt yuv420p -an -movflags +faststart "C:\Users\yannb\Documents\1. Programmation\3. Bachata\Projet - site bachata V5\frontend\public\aftermovie-vibe-2025-fallback.mp4"
```

## Résultat du ré-encodage

- vidéo source : 1920x1080, audio AAC
- fallback final : 1280x720, H.264, **sans audio**
- taille finale approximative : **27,3 Mo**

## Pourquoi garder cette doc alors que “ça marche maintenant”

Parce que le bug était :

- intermittent
- peu reproductible
- potentiellement lié au device / réseau / politique autoplay

Sans trace écrite, il serait facile de :

- oublier pourquoi le fallback MP4 a été ajouté
- retirer le fallback plus tard en pensant qu'il est inutile
- perdre les commandes d'encodage et les hypothèses déjà testées

## Recommandation future

- Ne pas supprimer le fallback MP4 sans campagne de tests iPhone.
- Si le bug réapparaît, vérifier d'abord :
  - Safari iPhone réel
  - mode économie d'énergie
  - vitesse réseau
  - délai de chargement de `iframe_api`
  - accès direct à `/aftermovie-vibe-2025-fallback.mp4`
