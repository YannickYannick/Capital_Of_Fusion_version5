# Boutons d'édition Admin

## Résumé

Système de boutons d'édition visibles uniquement pour les utilisateurs ADMIN et STAFF, permettant un accès rapide à l'interface d'administration Django.

## Composants

### `AdminEditButton`

Bouton individuel placé sur les éléments éditables (cartes, sections).

**Props :**

| Prop | Type | Description |
|------|------|-------------|
| `editUrl` | `string` | URL interne d'édition (ex: `/dashboard/artistes/edit/slug`) |
| `djangoAdminUrl` | `string` | URL Django Admin (ex: `http://localhost:8000/admin/users/user/uuid/`) |
| `onEdit` | `() => void` | Callback pour modal d'édition inline |
| `position` | `"top-right" \| "bottom-right" \| "inline"` | Position du bouton |
| `label` | `string` | Label personnalisé (défaut: "Modifier") |
| `size` | `"sm" \| "md"` | Taille du bouton |

**Exemple d'utilisation :**

```tsx
import { AdminEditButton } from "@/components/shared/AdminEditButton";

<div className="relative">
  <AdminEditButton
    djangoAdminUrl={`${DJANGO_ADMIN_BASE}/admin/users/user/${user.id}/change/`}
    position="top-right"
    label="Éditer"
  />
  {/* Contenu de la carte */}
</div>
```

### `AdminToolbar`

Barre d'outils flottante affichée en bas à gauche de la page.

**Props :**

| Prop | Type | Description |
|------|------|-------------|
| `pageType` | `string` | Nom de la page (affiché dans la barre) |
| `djangoAdminUrl` | `string` | URL Django Admin de la liste |
| `onRefresh` | `() => void` | Callback pour rafraîchir les données |

**Exemple d'utilisation :**

```tsx
import { AdminToolbar } from "@/components/shared/AdminEditButton";

export default function ArtistesPage() {
  const fetchData = useCallback(() => { /* ... */ }, []);

  return (
    <div>
      <AdminToolbar
        pageType="Artistes"
        djangoAdminUrl={`${DJANGO_ADMIN_BASE}/admin/users/user/`}
        onRefresh={fetchData}
      />
      {/* Contenu de la page */}
    </div>
  );
}
```

## Conditions d'affichage

Les composants s'affichent **uniquement** si :

1. L'utilisateur est connecté (`user !== null`)
2. L'utilisateur a `user_type === "ADMIN"` ou `user_type === "STAFF"`

Sinon, les composants retournent `null` et ne sont pas rendus.

## Pages intégrées

| Page | Composants utilisés |
|------|---------------------|
| `/artistes` | `AdminToolbar` + `AdminEditButton` sur chaque `ArtistCard` |

## Prochaines étapes

- [ ] Intégrer sur `/shop` (ProductCard)
- [ ] Intégrer sur `/care/praticiens` (PractitionerCard)
- [ ] Intégrer sur `/trainings` (SessionCard)
- [ ] Intégrer sur `/cours` (CourseCard)
- [ ] Créer des pages d'édition frontend (alternative à Django Admin)

## Fichiers concernés

```
frontend/src/components/shared/AdminEditButton.tsx  # Composants principaux
frontend/src/app/(main)/artistes/page.tsx           # Intégration AdminToolbar
frontend/src/components/features/artists/ArtistCard.tsx  # Intégration AdminEditButton
```
