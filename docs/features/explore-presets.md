# Feature : Explore — Presets 3D

Les presets permettent de sauvegarder et recharger une configuration complète de la scène 3D (orbites, planètes, caméra, etc.) et de définir le preset utilisé au chargement de `/explore`.

---

## Où c’est dans le code

| Rôle | Emplacement |
|------|-------------|
| Modèle | `backend/apps/core/models.py` — `ExplorePreset` (options 3D + `camera_x/y/z`, `camera_target_x/y/z`) |
| Admin | `backend/apps/core/admin.py` — CRUD presets ; lien depuis `SiteConfiguration` (`active_explore_preset`) |
| API | `GET/POST/PATCH/DELETE /api/core/presets/` — `ExplorePresetViewSet` dans `backend/apps/core/views.py` |
| Config site | `GET /api/config/` — inclut `active_explore_preset` (objet preset ou null) |
| Frontend types | `frontend/src/types/explore.ts` — `ExplorePresetApi` |
| Appels API | `frontend/src/lib/api.ts` — `getSiteConfig()`, `createExplorePreset()` |
| Contexte 3D | `frontend/src/contexts/PlanetsOptionsContext.tsx` — chargement preset initial depuis config, sync options |
| Panneau options | `frontend/src/components/features/explore/components/OptionsPanel.tsx` — sauvegarde preset (nom + caméra) |
| Scène 3D | `frontend/src/components/features/explore/canvas/ExploreScene.tsx` — application position caméra du preset |

---

## Comportement

1. **Au chargement de `/explore`** : le front appelle `getSiteConfig()`. Si `active_explore_preset` est défini, ses champs (options + caméra) sont appliqués au contexte et à la scène.
2. **Sauvegarde d’un preset** : depuis le panneau d’options, l’utilisateur peut enregistrer l’état actuel (y compris la position de la caméra) sous un nom ; `createExplorePreset()` envoie les données à `POST /api/core/presets/`.
3. **Choix du preset par défaut** : dans l’admin Django, `Site configuration` → champ « Active explore preset » ; le preset sélectionné est celui chargé au démarrage de la page Explore.

---

## Migrations

- `backend/apps/core/migrations/0002_explorepreset_and_more.py`
- `backend/apps/core/migrations/0003_explorepreset_camera_target_x_and_more.py` (position caméra)

Après pull ou changement de modèle : `python manage.py migrate core`.
