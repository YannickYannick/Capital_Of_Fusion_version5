# Structures partenaires — musique de fond (priorité sur YouTube du site)

## Objectif

Sur une fiche structure (`/partenaires/structures/<slug>`), permettre une **musique dédiée** (lien YouTube ou fichier audio) qui **remplace le son** des vidéos d’accueil du site (`GlobalVideoBackground`). En quittant cette fiche (ou la page d’édition staff), le son des vidéos YouTube / MP4 du site **ne reprend pas** tant que l’utilisateur ne repasse pas par **`/`** (accueil) ou **`/explore`**.

## Comportement (résumé)

| Étape | Comportement |
|--------|----------------|
| Fiche ou édition avec musique configurée | `PlanetMusicOverride` = YouTube ou fichier ; lecteurs main/cycle **muets** (comme pour une planète sur Explore). |
| Quitter la fiche / l’édition | `override` effacé ; flag **`youtubeAmbientSuspended`** = true → main/cycle **restent muets** sur le reste du site. |
| Aller sur `/` ou `/explore` | `youtubeAmbientSuspended` remis à **false** → l’utilisateur peut réactiver le son avec le bouton habituel en bas à droite. |

**Priorité des sources** sur un même nœud : URL YouTube si non vide, sinon fichier uploadé.

## Backend

| Élément | Emplacement |
|---------|-------------|
| Modèle | `PartnerNode.background_music` (`FileField`), `PartnerNode.background_music_youtube_url` (`URLField`, vide autorisé) |
| Stockage Cloudinary | `apps/partners/storage.py` — `PartnerBackgroundMusicStorage` avec `resource_type=raw` (sinon Cloudinary renvoie « Invalid image file » pour un MP3) |
| Migrations | `0003_partnernode_background_music`, `0004_partnernode_background_music_raw_storage` |
| API publique | `GET /api/partners/nodes/<slug>/` — champs inclus dans `PartnerNodeSerializer` ; `background_music` exposé en URL absolue (même logique que les images) |
| API admin | `PATCH /api/admin/partners/nodes/<slug>/` — multipart : `background_music` (fichier), `background_music_youtube_url` (texte), `clear_background_music` = `1` pour supprimer le fichier |

## Frontend

| Élément | Emplacement |
|---------|-------------|
| Types | `PartnerNodeApi` dans `frontend/src/types/partner.ts` |
| Contexte musique | `PlanetMusicOverrideContext` : `youtubeAmbientSuspended` + `setYoutubeAmbientSuspended` |
| Helper | `partnerNodeBackgroundMusicOverride()` — `frontend/src/lib/partnerStructureMusic.ts` |
| Fond vidéo sur la fiche | `isPartnerStructureVideoBackgroundPath()` — `frontend/src/lib/routeSegments.ts` ; utilisé par `ClientLayoutWrapper` pour monter `GlobalVideoBackground` + providers sur `/partenaires/structures/<slug>` et `/…/edit` |
| Lecteur global | `GlobalVideoBackground` — `frontend/src/components/features/explore/canvas/ExploreVideos.tsx` : lève la suspension sur `/` et `/explore` ; impose le mute ambiant si `youtubeAmbientSuspended` sans override |
| Fiche publique | `partenaires/structures/[slug]/page.tsx` — `useEffect` branche / débranche l’override et la suspension au montage / démontage |
| Édition staff | `partenaires/structures/[slug]/edit/page.tsx` — champs URL YouTube, fichier, case « supprimer le fichier » ; même logique d’écoute que la fiche (aperçu à partir des données enregistrées) |

## Étapes d’implémentation (historique)

1. Champs Django + migration + sérialisation + `PATCH` admin (fichier, URL, clear).
2. Extension du contexte React (`youtubeAmbientSuspended`) et logique dans `GlobalVideoBackground` (mute forcé + désactivation du bouton « Activer le son » tant que suspendu sans override).
3. Inclusion des routes fiche / édit structure partenaire dans le layout « avec vidéo de fond ».
4. Branchement fiche + page d’édition sur `setOverride` / cleanup avec `setYoutubeAmbientSuspended(true)`.
5. Formulaire d’édition et documentation.

## Voir aussi

- [partenaires.md](partenaires.md) — vue d’ensemble partenaires  
- [landing-config.md](landing-config.md) — fond vidéo global  
