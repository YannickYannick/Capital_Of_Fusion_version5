# Journal des bugs et incidents — index

Fiches par incident (symptômes, cause, correctif). Les correctifs sont dans le code ; ces fichiers servent de mémo pour ne pas refaire les mêmes erreurs.

---

## Production — base de données & environnement

| Fichier | Sujet |
|---------|--------|
| [production-database/bug_2026-03-07_railway_db_env_override.md](production-database/bug_2026-03-07_railway_db_env_override.md) | `.env` dans l’image qui écrase `DATABASE_URL` Railway |

## Réseau / Vercel / API

| Fichier | Sujet |
|---------|--------|
| [fix-vercel-api-connection/bug_2026-02-19_vercel_appel_api_railway.md](fix-vercel-api-connection/bug_2026-02-19_vercel_appel_api_railway.md) | Front Vercel qui n’atteint pas l’API Railway |
| [debug/bug_2026-02-19_disallowed_host_railway.md](debug/bug_2026-02-19_disallowed_host_railway.md) | `DisallowedHost` |
| [debug/bug_2026-02-19_csrf_et_static_admin.md](debug/bug_2026-02-19_csrf_et_static_admin.md) | CSRF et admin en prod |

## Médias, Cloudinary, statiques (avril 2026)

| Fichier | Sujet |
|---------|--------|
| [bug_2026-04_medias_cloudinary_collectstatic_vercel.md](bug_2026-04_medias_cloudinary_collectstatic_vercel.md) | 502 collectstatic, double `/media/`, URLs Cloudinary cassées, cache liste artistes, `next/image` |

## Autres

| Fichier | Sujet |
|---------|--------|
| [feature/page-artistes/2026-03-05_git_lock_data_loss.md](feature/page-artistes/2026-03-05_git_lock_data_loss.md) | Verrou Git / perte de données locale |

---

*Guides associés : [Déploiement — médias et statiques](../deploiement-medias-et-statiques.md), [Feature — médias artistes & API](../features/medias-artistes-et-images-api.md).*
