# Déploiement — médias, Cloudinary et statiques

Complément ciblé du guide général [explication/deploiement.md](explication/deploiement.md). À lire avant un changement touchant aux **photos artistes**, **fichiers uploadés** ou au **build Railway**.

---

## Variables d’environnement — backend (Railway)

| Variable | Rôle |
|----------|------|
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud (avec `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET`, active le stockage médias Cloudinary) |
| `CLOUDINARY_API_KEY` | Clé API |
| `CLOUDINARY_API_SECRET` | Secret |
| Alternative | `CLOUDINARY_URL` seule si tu n’utilises pas le trio ci-dessus (`CLOUDINARY_STORAGE` vide → le SDK peut lire l’URL) |

Sans les identifiants Cloudinary complets, Django utilise le stockage **fichier local** pour les médias : sur Railway le disque est **éphémère** → uploads perdus au redéploiement.

Proxy HTTPS (évite les URLs `http://` dans les réponses) : déjà géré dans `production.py` avec `SECURE_PROXY_SSL_HEADER` et `USE_X_FORWARDED_HOST`.

---

## Build et démarrage Railway

- **Root directory** du service : `backend`.
- Le **Procfile** exécute `collectstatic`, puis `migrate`, puis Gunicorn.
- Ne pas retirer `collectstatic` : l’admin et les statiques Django en dépendent.

Si le build casse sur `collectstatic`, vérifier que l’app `apps.collectstatic_std` est bien **la première** dans `INSTALLED_APPS` (`config/settings/base.py`). Voir [bugs/bug_2026-04_medias_cloudinary_collectstatic_vercel.md](bugs/bug_2026-04_medias_cloudinary_collectstatic_vercel.md).

---

## Statiques vs médias

| Type | Où ça va en prod | Backend |
|------|------------------|---------|
| CSS/JS admin, assets Django | `STATIC_ROOT` → servis par **WhiteNoise** | `STORAGES["staticfiles"]` = `CompressedStaticFilesStorage` |
| Uploads (profils, couvertures, etc.) | **Cloudinary** si credentials OK | `STORAGES["default"]` = `MediaCloudinaryStorage` |

`STATICFILES_STORAGE` est aussi défini explicitement pour compatibilité avec d’anciennes parties de `django-cloudinary-storage` (voir commentaires dans `production.py`).

---

## Frontend (Vercel)

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_API_URL` | URL du backend **sans** slash final en général (ex. `https://xxx.up.railway.app`) |

**Images distantes** : `next/image` n’accepte que les hôtes déclarés dans `frontend/next.config.ts` → `images.remotePatterns`. Pour Cloudinary, `res.cloudinary.com` doit y figurer. Pour les médias servis depuis le domaine Railway, les motifs `*.railway.app` / `*.up.railway.app` couvrent la plupart des cas.

Après ajout d’un nouveau domaine d’images, **redéployer** le front.

---

## CORS / CSRF (rappel)

- Les origines `https://*.vercel.app` sont autorisées par regex côté API en prod.
- Domaine perso : ajouter dans `CORS_ALLOWED_ORIGINS` et `CSRF_TRUSTED_ORIGINS` sur Railway.

---

## Checklist rapide « les images ne s’affichent pas »

1. Railway : les 3 variables Cloudinary (ou `CLOUDINARY_URL`) sont définies et le dernier déploiement est **vert**.
2. Réponse API : l’URL de l’image est une **URL absolue** valide (pas `/media/media/...`, pas `.../media/https://...`). Tester avec les outils réseau du navigateur ou `curl` sur l’endpoint liste/détail.
3. Vercel : `NEXT_PUBLIC_API_URL` pointe bien ce backend ; rebuild après changement.
4. `next.config.ts` : hôte de l’URL d’image présent dans `remotePatterns` (ou `unoptimized` sur le composant `Image` pour Cloudinary si déjà en place).
5. Pas de cache stale : hard refresh ou onglet privé ; vérifier les en-têtes `Cache-Control` sur la réponse JSON.

---

*Incident détaillé : [bugs/bug_2026-04_medias_cloudinary_collectstatic_vercel.md](bugs/bug_2026-04_medias_cloudinary_collectstatic_vercel.md). Flux fonctionnel : [features/medias-artistes-et-images-api.md](features/medias-artistes-et-images-api.md).*
