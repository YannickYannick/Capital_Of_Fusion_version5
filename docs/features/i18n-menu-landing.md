# Internationalisation du Menu et de la Page d'Accueil

> Date : 2026-04-16

## Résumé

Ajout de la traduction multilingue (FR/EN/ES) pour :
- Les boutons de la page d'accueil
- Les items du menu principal (Navbar)
- Les sous-menus (Festival, Support, etc.)
- La page index `/festival`

## Fichiers modifiés

### Messages de traduction
- `frontend/messages/fr.json` - Traductions françaises
- `frontend/messages/en.json` - Traductions anglaises
- `frontend/messages/es.json` - Traductions espagnoles

### Composants
- `frontend/src/app/(main)/LandingPageClient.tsx` - Boutons traduits + logo agrandi x2
- `frontend/src/app/(main)/festival/page.tsx` - Page index traduite avec 6 cartes
- `frontend/src/components/shared/Navbar.tsx` - Application des traductions aux items API
- `frontend/src/lib/navMenuLabels.ts` - Fonctions de mapping URL → clé de traduction

### Nouvelles pages
- `frontend/src/app/(main)/festival/jack-n-jill/page.tsx`
- `frontend/src/app/(main)/festival/all-star-street-battle/page.tsx`

## Clés de traduction ajoutées

### `landing.*`
| Clé | FR | EN | ES |
|-----|----|----|-----|
| `ctaBookHotel` | Book your hôtel | Book your hotel | Reservar hotel |
| `ctaBookPass` | Book your pass | Book your pass | Reservar pase |
| `ctaProgram` | Notre programme | Our programme | Nuestro programa |

### `navbar.menu.*`
| Clé | FR | EN | ES |
|-----|----|----|-----|
| `festival` | Festival | Festival | Festival |
| `bookYourHotel` | Book your hôtel | Book your hotel | Reservar hotel |
| `bookYourPass` | Book your pass | Book your pass | Reservar pase |
| `support` | Support | Support | Soporte |
| `planningNavettes` | Planning & Navettes | Schedule & Shuttles | Horario y lanzaderas |
| `accesVenue` | Accès & Venue | Access & Venue | Acceso y Venue |
| `notreProgramme` | Notre programme | Our programme | Nuestro programa |
| `jackNJill` | Jack N Jill | Jack N Jill | Jack N Jill |
| `allStarStreetBattle` | All Star Street Battle | All Star Street Battle | All Star Street Battle |
| `nosArtistes` | Nos artistes | Our artists | Nuestros artistas |

### `pages.festivalIndex.*`
Traductions pour la page `/festival` : titre, sous-titre, et les 6 cartes de navigation.

## Architecture de traduction du menu

Le menu vient de l'API Django (`GET /api/menu/items/`). Les labels sont traduits côté frontend via :

1. `menuTranslationKeyForRootUrl(url)` - Pour les items racines (Festival, Support...)
2. `menuTranslationKeyForChildUrl(url)` - Pour les sous-items (Planning, Venue, Jack N Jill...)

Ces fonctions mappent les URLs vers les clés `navbar.menu.*` de next-intl.

```typescript
// Exemple : /festival/book-your-hotel → menu.bookYourHotel
const key = menuTranslationKeyForChildUrl("/festival/book-your-hotel");
// key = "menu.bookYourHotel"
const label = t(key); // "Reservar hotel" (si ES)
```

## Widget Go&Dance compact

Ajout d'une prop `compact` au composant `GoAndDanceTicketsEmbed` :
- `compact={false}` (défaut) : taille normale pour `/festival/book-your-hotel`
- `compact={true}` : taille réduite de 25% pour la planète ROOT dans `/explore`

## Notes techniques

- Les traductions sont chargées côté serveur via `getTranslations()` pour les Server Components
- Les traductions sont chargées côté client via `useTranslations()` pour les Client Components
- Le sélecteur de langue (FR/EN/ES) dans la Navbar change la locale globale
