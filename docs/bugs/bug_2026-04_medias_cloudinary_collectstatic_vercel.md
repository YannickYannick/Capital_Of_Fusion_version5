# Incident — médias Cloudinary, collectstatic Railway, images Vercel (2026-04)

Synthèse des symptômes rencontrés en production / préprod, causes probables et correctifs déjà intégrés dans le dépôt.

---

## 1. Build Railway / 502 au démarrage — `collectstatic` / `FileNotFoundError`

**Symptômes**

- Déploiement échoue pendant ou juste après `python manage.py collectstatic --noinput`.
- Erreurs liées à WhiteNoise / post-processing sur des fichiers introuvables.

**Cause**

- Le package `django-cloudinary-storage` enregistre une commande `collectstatic` personnalisée. Quand `STATICFILES_STORAGE` pointe vers WhiteNoise (fichiers locaux) et non vers le stockage Cloudinary des statiques, cette commande peut ne pas copier correctement vers `STATIC_ROOT` tout en laissant le pipeline de post-traitement s’exécuter → chemins attendus absents.

**Correctif dans le repo**

- App `apps.collectstatic_std` en **première** position dans `INSTALLED_APPS` ; elle fournit la commande Django standard `collectstatic` qui gagne sur celle de `cloudinary_storage`.
- Fichier : `backend/apps/collectstatic_std/management/commands/collectstatic.py` (docstring explicative).
- `production.py` : `STORAGES["staticfiles"]` = `whitenoise.storage.CompressedStaticFilesStorage` (pas la variante *Manifest* si des références manquent).

---

## 2. Admin / API — URLs images du type `/media/media/...` ou 404 médias

**Symptômes**

- JSON API avec `profile_picture` ou `cover_image` en chemin dupliqué ou incorrect.
- Images qui ne s’affichent pas alors que le fichier existe côté stockage.

**Cause**

- Serializer qui reconstruisait une URL en préfixant systématiquement `/media/` à partir du nom de fichier, au lieu d’utiliser `field_file.url` du storage (local ou Cloudinary).

**Correctif**

- Utilitaire `serialize_image_field_for_api` dans `backend/apps/users/image_field_api_url.py` : utilise `.url`, gère les noms déjà absolus (`http://`, `https://`, `//`), normalise le mixed content Railway (`https_media_url`), et corrige les URLs « embarquées » aberrantes (`strip_embedded_absolute_url`).

---

## 3. URLs Cloudinary cassées : `.../media/https://...`

**Symptômes**

- Lien d’image ressemble à une URL Cloudinary contenant `media/https%3A%2F%2F...`.

**Cause**

- Valeur en base déjà une URL complète, traitée comme un `public_id` relatif par le storage.

**Correctif**

- Même module `image_field_api_url.py` : si `raw_name` commence par `http`, renvoyer cette URL (après nettoyage) plutôt que de repasser par le storage ; `strip_embedded_absolute_url` pour les cas déjà mal formés.

---

## 4. Liste artistes / staff « figée » ou incohérente entre requêtes

**Symptômes**

- Modifications en admin visibles une fois sur deux, ou anciennes données après refresh.

**Cause**

- Cache applicatif (ex. LocMem) sur une vue liste avec plusieurs workers Gunicorn → chaque processus a son cache.
- Cache navigateur ou CDN sur des réponses JSON.

**Correctif**

- Retrait du cache côté liste concernée.
- Réponses JSON avec en-têtes non cacheables où nécessaire (`json_response_no_store` dans `apps/core/api_response.py`).
- Côté front : `cache: "no-store"` sur les fetch des listes / détails concernés ; pages Next `force-dynamic` si besoin.

---

## 5. Cartes artistes sans image sur Vercel (alors que l’URL API est bonne)

**Symptômes**

- `next/image` ne charge pas ; erreur domaine non autorisé ou optimisation qui échoue.

**Causes possibles**

- Domaine absent de `images.remotePatterns` dans `frontend/next.config.ts`.
- Optimiseur par défaut incompatible avec certaines URLs Cloudinary ou redirections.

**Correctif**

- Ajout de `res.cloudinary.com` (et hôtes Railway déjà listés) dans `remotePatterns`.
- Sur les cartes qui affichent des médias Cloudinary : `unoptimized` sur `Image` quand c’est pertinent (`ArtistCard`).
- URLs protocol-relative `//` normalisées en `https:` côté affichage si besoin.

---

## Fichiers utiles pour debugger

| Zone | Fichiers |
|------|----------|
| Prod Django | `backend/config/settings/production.py` |
| URLs images API | `backend/apps/users/image_field_api_url.py`, serializers artistes / staff |
| collectstatic | `backend/apps/collectstatic_std/`, `INSTALLED_APPS` dans `base.py` |
| Front images | `frontend/next.config.ts`, `frontend/src/components/features/artists/ArtistCard.tsx` |

---

*Voir aussi : [Déploiement — médias et statiques](../deploiement-medias-et-statiques.md), [Feature — médias artistes & API](../features/medias-artistes-et-images-api.md).*
