# Feature : Landing — Configuration depuis l’admin

La première page (landing) est configurable via l’admin Django : textes du hero, libellés et liens des deux boutons CTA, texte de pied de bloc.

---

## Où c’est dans le code

| Rôle | Emplacement |
|------|-------------|
| Modèle | `backend/apps/core/models.py` — `SiteConfiguration` : `hero_title`, `hero_top_text`, `hero_descr_1`, `hero_descr_2`, `hero_btn_1_text`, `hero_btn_1_url`, `hero_btn_2_text`, `hero_btn_2_url`, `hero_footer_text` |
| API | `GET /api/config/` — `SiteConfigurationAPIView` ; serializer `SiteConfigurationSerializer` dans `backend/apps/core/serializers.py` |
| Types frontend | `frontend/src/types/config.ts` — `SiteConfigurationApi` |
| Page landing | `frontend/src/app/(main)/page.tsx` (metadata) + `frontend/src/app/(main)/LandingPageClient.tsx` (affichage et liens des boutons) |

---

## Champs configurables (admin)

- **hero_top_text** — Texte au-dessus du titre (ex. « Nouvelle Version Immersive »)
- **hero_title** — Titre principal (ex. « Capital of Fusion »)
- **hero_descr_1** / **hero_descr_2** — Deux lignes de description
- **hero_btn_1_text** / **hero_btn_1_url** — Premier bouton (ex. « Commencer l’Expérience » → `/explore`)
- **hero_btn_2_text** / **hero_btn_2_url** — Second bouton (ex. « Voir les Cours » → `/cours`)
- **hero_footer_text** — Texte en bas du bloc (ex. « Paris, France • École Nationale de Danse »)

Valeurs par défaut définies sur le modèle ; modifiables dans **Admin Django → Core → Site configurations**.
