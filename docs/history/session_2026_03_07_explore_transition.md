# Session 2026-03-07 — Transition Accueil → Explore

## Contexte

Implémentation d'une transition fluide entre la page d'accueil (`/`) et la page Explore (`/explore`) avec affichage d'une modale d'aide pendant le chargement de la scène 3D.

## Problème initial

L'utilisateur souhaitait :
1. Que le clic sur "Explorer" masque le contenu de la landing page
2. Qu'une modale d'aide (navigation 3D) s'affiche pendant le chargement
3. Que la modale reste visible jusqu'à validation manuelle par l'utilisateur

## Bug rencontré

La modale `ExploreLoadingModal` apparaissait une fraction de seconde puis disparaissait immédiatement.

### Cause racine

**React 18 Strict Mode** (activé par défaut en développement avec Next.js) monte, démonte, puis remonte les composants pour détecter les effets secondaires. Le `useEffect` de cleanup dans `/explore/page.tsx` s'exécutait lors du premier démontage et remettait les flags `isTransitioningToExplore` et `showExploreLoadingModal` à `false`.

### Solution

Utilisation d'un `useRef` pour tracker si le composant a vraiment été monté (après un délai de 50ms qui survit au cycle Strict Mode). Le cleanup ne réinitialise les flags que si `isMountedRef.current === true`.

```tsx
const isMountedRef = useRef(false);
useEffect(() => {
  const timer = setTimeout(() => {
    isMountedRef.current = true;
  }, 50);
  return () => {
    clearTimeout(timer);
    if (isMountedRef.current) {
      setBatch({ isTransitioningToExplore: false, showExploreLoadingModal: false });
    }
  };
}, [setBatch]);
```

## Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| `frontend/src/app/(main)/LandingPageClient.tsx` | Ajout du `setBatch` pour activer les flags de transition au clic sur "Explorer" |
| `frontend/src/app/(main)/explore/page.tsx` | Gestion du cycle Strict Mode avec `useRef`, callback `handleDismissModal` pour fermeture manuelle |
| `frontend/src/components/features/explore/components/ExploreLoadingModal.tsx` | Nouveau composant avec bouton "Compris" pour fermeture manuelle |
| `frontend/src/contexts/PlanetsOptionsContext.tsx` | Ajout du flag `showExploreLoadingModal` dans l'état global |
| `frontend/src/types/explore.ts` | Typage du nouveau flag |
| `frontend/messages/{fr,en,es}.json` | Traductions pour la modale (titre, instructions, bouton) |

## Traductions ajoutées

Namespace `exploreTransition` :
- `title` : Titre de la modale
- `loadingHint` : Message de chargement
- `lineRotate/linePan/lineZoom/lineClick/lineDoubleClick` : Instructions de navigation
- `dismissButton` : Texte du bouton de fermeture ("Compris" / "Got it" / "Entendido")
- `nonBlockingHint` : Note indiquant que le menu reste accessible

## UX finale

1. Utilisateur sur `/` clique sur "Explorer"
2. Le contenu de la landing disparaît, la vidéo de fond reste visible
3. Une modale s'affiche avec les instructions de navigation 3D
4. La scène 3D charge en arrière-plan
5. L'utilisateur clique "Compris" pour fermer la modale
6. Les planètes 3D sont visibles et interactives

## Notes techniques

- La modale est `pointer-events-none` sur son conteneur externe pour permettre les clics sur la navbar
- Le panneau interne est `pointer-events-auto` pour le bouton
- Un timeout de sécurité de 45s ferme automatiquement la modale si la scène ne charge jamais
