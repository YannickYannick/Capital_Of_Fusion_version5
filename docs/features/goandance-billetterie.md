# Feature : Intégration billetterie Go&Dance

**Date** : 2026-04-16  
**Statut** : Actif  
**Pages** : `/festival/book-your-hotel`, `/explore` (overlay planète ROOT)

## Description

Intégration du widget de billetterie Go&Dance permettant aux visiteurs de réserver leurs billets directement depuis le site, sans redirection externe.

## Fonctionnalités

- **Affichage des tarifs** : Pass, packs hôtel+festival, options
- **Code promo** : Champ pour entrer un code promotionnel
- **Redimensionnement automatique** : L'iframe s'adapte à la hauteur du contenu via `postMessage`
- **Lien de référent** : L'URL du site est passée en paramètre pour le tracking

## Composant

### `GoAndDanceTicketsEmbed`

**Chemin** : `frontend/src/components/features/festival/GoAndDanceTicketsEmbed.tsx`

```tsx
import { GoAndDanceTicketsEmbed } from "@/components/features/festival/GoAndDanceTicketsEmbed";

// Dans votre composant :
<GoAndDanceTicketsEmbed />
```

### Props

Aucune prop requise. L'ID de l'événement est configuré en constante dans le fichier.

### Configuration

Pour changer l'événement Go&Dance, modifier la constante :

```tsx
const GOANDANCE_EVENT_ID = "73c5a8cb-15a5-41bf-8903-6c76f3cc0bfa";
```

## Utilisation actuelle

### Page `/festival/book-your-hotel`

Le widget est affiché sous le contenu markdown éditable de la page "Book Your Hotel".

```tsx
// FestivalBookYourHotelClient.tsx
<EditableConfigMarkdownPage ... />
<div className="mt-16">
  <GoAndDanceTicketsEmbed />
</div>
```

### Overlay planète ROOT (`/explore`)

Le widget est affiché dans la section "Réservez vos billets" de l'overlay de la planète centrale (ROOT).

```tsx
// PlanetOverlay.tsx
{showCenterTeaser && !showEditForm ? (
  <GoAndDanceTicketsEmbed />
) : ...}
```

## Notes techniques

- **Pas de dépendance à `tickets.js`** : Le script officiel Go&Dance utilise `window.load` qui ne fonctionne pas en navigation client Next.js
- **Écoute `postMessage`** : Go&Dance envoie la hauteur du contenu via `postMessage` pour le redimensionnement
- **Origine vérifiée** : Seuls les messages de `https://www.goandance.com` sont acceptés

## Style

- Container avec bordure arrondie et fond semi-transparent (`bg-white/5`)
- Iframe avec fond blanc et coins arrondis
- Texte "Powered by go&dance" en bas

## Voir aussi

- [Bug fix : Widget Go&Dance dans Next.js](../bugs/debug/bug_2026-04-16_goandance_embed_nextjs.md)
