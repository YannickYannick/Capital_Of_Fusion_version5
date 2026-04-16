# Bug : Widget Go&Dance ne s'affiche pas dans Next.js

**Date** : 2026-04-16  
**Statut** : Résolu  
**Composants** : `GoAndDanceTicketsEmbed`, `/festival/book-your-hotel`, `/explore` (planète ROOT)

## Symptômes

- Le texte "Powered by go&dance" s'affichait, mais **aucune iframe de billetterie** n'apparaissait
- Le même code HTML fonctionnait parfaitement dans une page HTML statique
- Aucune erreur visible dans la console

## Diagnostic

### Hypothèses testées

| ID | Hypothèse | Résultat |
|----|-----------|----------|
| H1 | Composant ne se monte pas | Rejeté (logs présents après fix cache) |
| H2 | `iframeSrc` jamais défini | Rejeté |
| H4 | URL bloquée (CORS/CSP) | Rejeté |
| H7 | Cache webpack corrompu | **Confirmé** |

### Cause racine

Le script officiel `tickets.js` de Go&Dance utilise :

```javascript
window.addEventListener("load", function() {
  // création de l'iframe...
});
```

**Problème** : En navigation client Next.js (App Router), l'événement `load` de la fenêtre est émis **une seule fois** au premier chargement de l'application. Lors des navigations suivantes (ex: `/` → `/festival/book-your-hotel`), l'événement `load` n'est plus émis, donc le callback ne s'exécute jamais.

C'est pourquoi :
- ✅ Le script fonctionne sur une **page HTML statique** (chaque navigation = nouveau `load`)
- ❌ Le script ne fonctionne **pas** en SPA/Next.js (navigation client sans rechargement)

## Solution

Réécriture du composant `GoAndDanceTicketsEmbed` pour reproduire la logique de `tickets.js` dans un `useEffect` React :

```tsx
export function GoAndDanceTicketsEmbed() {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(GOANDANCE_TICKETS_PAGE);
    url.searchParams.set("referer", window.location.href);
    setIframeSrc(url.toString());
  }, []);

  useEffect(() => {
    // Écoute des messages postMessage pour le redimensionnement
    const goandanceIframeResize = (event: MessageEvent) => {
      if (event.origin === "https://www.goandance.com") {
        iframe.style.height = `${event.data}px`;
      }
    };
    window.addEventListener("message", goandanceIframeResize, false);
    return () => window.removeEventListener("message", goandanceIframeResize, false);
  }, [iframeSrc]);

  return iframeSrc ? <iframe src={iframeSrc} ... /> : <Skeleton />;
}
```

## Fichiers modifiés

- `frontend/src/components/features/festival/GoAndDanceTicketsEmbed.tsx` — composant réécrit
- `frontend/src/components/features/explore/components/PlanetOverlay.tsx` — utilise le même composant pour ROOT

## Leçons apprises

1. **Ne pas utiliser de scripts tiers qui dépendent de `window.load`** dans une SPA
2. **Toujours vérifier le cache webpack** (`rm -rf .next`) quand les modifications ne semblent pas prises en compte
3. **Les logs `console.log` dans le corps du composant** sont un bon moyen de vérifier si un composant React est exécuté côté client
