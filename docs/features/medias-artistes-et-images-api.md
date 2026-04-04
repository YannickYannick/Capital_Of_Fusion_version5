# Feature — médias artistes, staff et exposition API / Next.js

Comment les **images de profil et couvertures** circulent du stockage (local ou Cloudinary) jusqu’aux cartes et pages publiques, et quoi vérifier quand tu ajoutes des champs fichier ou de nouveaux écrans.

---

## Modèles et admin

- Les champs concernés sont des `ImageField` sur les modèles utilisateurs / artistes / staff (profil, bannière, etc.), configurés avec un `max_length` suffisant pour les noms longs ou les URLs stockées selon le backend de stockage.
- En **local** (`config.settings.local`) : fichiers souvent sous `MEDIA_ROOT` (ex. `backend/media/...`).
- En **production** avec Cloudinary : le même champ est enregistré via `MediaCloudinaryStorage` ; la valeur en base peut être un chemin relatif Cloudinary ou, selon historique, une URL absolue.

---

## Règle d’or côté API

**Ne jamais** reconstruire une URL média en concaténant `/media/` + `nom_de_fichier` à la main pour l’API publique.

Utiliser l’helper partagé :

- `serialize_image_field_for_api(field_file, request)` dans `backend/apps/users/image_field_api_url.py`.

Il :

- appelle `field_file.url` quand c’est un vrai `FieldFile` ;
- détecte si la valeur stockée est déjà une URL (`http`, `https`, `//`) et la renvoie proprement ;
- applique `https_media_url` pour éviter le mixed content derrière Railway ;
- corrige les cas où une URL absolue a été mal enchaînée (`strip_embedded_absolute_url`).

Les serializers **artistes** et **staff** doivent s’aligner sur cette fonction pour tout champ image exposé au front.

---

## Frontend

- Les types TypeScript (`ArtistApi`, etc.) doivent inclure les clés d’image renvoyées par l’API (`profile_picture`, `cover_image`, …) pour que le build Vercel passe.
- **next/image** : domaines autorisés dans `frontend/next.config.ts` (`remotePatterns`). Cloudinary : `res.cloudinary.com`. Médias servis depuis le backend Railway : motifs `*.up.railway.app` / `*.railway.app` selon ton URL.
- Pour les cartes artistes qui consomment des URLs Cloudinary, le composant peut utiliser `unoptimized` sur `Image` pour éviter des soucis avec l’optimiseur sur certaines URLs.
- Normaliser les URLs `//exemple.com/...` en `https://...` avant affichage si une vieille donnée les contient encore.
- Fetch des listes sensibles au cache : utiliser `cache: "no-store"` là où le back envoie des en-têtes non cacheables, pour éviter un JSON obsolète (images ou titres).

---

## Partenaires et autres apps

- L’app **partners** (structures, événements, cours) peut avoir ses propres images ; même principe : exposer une URL absolue cohérente via le storage Django ou le même type de helper si les champs sont analogues.
- Voir aussi [partenaires.md](partenaires.md) pour les routes et pages.

---

## Après une modification « images »

1. Migration si nouveau champ ou changement `max_length`.
2. Vérifier en local une création / mise à jour via l’admin ou l’API.
3. Contrôler le JSON d’un GET liste + GET détail (URL absolue, schéma `https`).
4. Déployer le back (Railway) puis le front (Vercel) si tu touches à `next.config.ts` ou aux variables.

---

*Déploiement et variables : [deploiement-medias-et-statiques.md](../deploiement-medias-et-statiques.md). Historique d’erreurs : [bugs/bug_2026-04_medias_cloudinary_collectstatic_vercel.md](../bugs/bug_2026-04_medias_cloudinary_collectstatic_vercel.md).*
