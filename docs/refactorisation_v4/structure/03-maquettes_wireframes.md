# Maquettes et wireframes – Explication et usage V5

Ce document définit ce que sont les maquettes et les wireframes, à quoi ils servent dans le projet et comment les utiliser pour la V5.

---

## 1. Définitions

### Wireframe (fil de fer)

- **Quoi** : schéma simplifié d'une interface (page ou composant). Pas ou peu de couleurs, pas de visuels finaux ; surtout des blocs, du texte factice (lorem), des boutons et des liens.
- **Objectif** : fixer la **structure** (zonage, hiérarchie, emplacement des éléments) et les **parcours** (où va un clic, quelles infos sont affichées). On valide l'UX avant de passer au design.
- **Niveau de détail** : bas (low-fidelity). Souvent en noir et blanc ou niveaux de gris.
- **Quand** : en amont du design et du dev, pour aligner tout le monde sur la structure des écrans.

### Maquette (mock-up)

- **Quoi** : représentation plus fidèle de l'interface finale : couleurs, typographies, images de synthèse, composants réalistes. Souvent issue d'un outil de design (Figma, etc.) ou d'une maquette HTML/CSS statique.
- **Objectif** : valider le **rendu visuel** (chartes, composants, responsive) et servir de référence aux développeurs et aux clients.
- **Niveau de détail** : moyen à élevé (high-fidelity). Peut inclure états (hover, focus, erreur).
- **Quand** : après ou en parallèle des wireframes, avant ou pendant le développement.

En résumé : **wireframe = structure et parcours** ; **maquette = rendu visuel et détail**.

---

## 2. À quoi ça sert dans le projet BachataVibe

- **Cadrer les écrans V5** : s'assurer que le groupe de routes `(main)` et les zones (navbar, contenu, overlay, etc.) sont clairement définis. (V5 : 1 layout unique.)
- **Éviter les allers-retours** : valider la structure (wireframes) puis le visuel (maquettes) avant de coder réduit les refontes.
- **Référence commune** : les maquettes servent de spec visuelle pour le front (composants, breakpoints, états).
- **Accessibilité et fallback** : pour la scène 3D (explore), les wireframes rappellent qu'il faut prévoir un **équivalent textuel** (arbre, liste) pour les petits écrans et l'accessibilité.

---

## 3. Où sont les maquettes du projet

La référence actuelle est :

- **[05-maquettes_ui.md](05-maquettes_ui.md)** : maquettes conceptuelles V4 avec :
  - zoning ASCII (landing, hero, visualisation 3D, arbre textuel, highlights),
  - design system (couleurs, typo),
  - composants clés (navbar, dropdowns, visualisation planétaire, fiche détaillée, arbre en accordéon),
  - responsive (desktop / tablette / mobile),
  - liste des sections par page (accueil, cours, détail cours, organisation, shop),
  - animations et micro-interactions.

Pour la **V5**, ces maquettes restent une base ; les adapter aux **routes** (voir [01-arborescence.md](01-arborescence.md)) et aux évolutions de contenu (produits par noeud, etc.).

---

## 4. Bonnes pratiques pour la V5

| Pratique | Description |
|----------|-------------|
| **Wireframe avant maquette** | Valider la structure et les parcours (wireframes) avant de détailler le visuel (maquettes). |
| **Par zone ou par page** | Travailler par écran ou par zone (ex. "Explore", "Liste cours", "Checkout") pour garder des livrables lisibles. |
| **États et cas limites** | Prévoir états vides, erreur, chargement, et variantes mobile dans les wireframes/maquettes. |
| **Lien avec les routes** | Faire correspondre chaque wireframe/maquette à une route (ex. `/cours/`, `/explore/`). |
| **Design system** | Réutiliser la palette et la typo de 05-maquettes_ui ; les faire évoluer dans un seul endroit (ce fichier ou 08). |
| **Scène 3D** | Toujours prévoir un fallback (arbre textuel / liste) pour mobile et accessibilité, comme dans 08. |

---

## 5. Outils possibles

- **Wireframes** : Figma (frames basse définition), Miro, Balsamiq, ou même schémas ASCII (comme dans 05-maquettes_ui).
- **Maquettes** : Figma, Adobe XD, Sketch ; ou maquettes HTML/CSS statiques pour un rendu très proche du site.
- **Prototypage** : Figma, Framer, ou prototype cliquable en HTML pour valider les parcours.

Aucun outil n'est imposé ; l'essentiel est d'avoir une **référence partagée** (fichier ou lien) pour chaque écran important.

---

## 6. Synthèse

- **Wireframe** = structure et parcours (low-fi).  
- **Maquette** = rendu visuel (mid/high-fi).  
- Pour la V5 : s'appuyer sur [05-maquettes_ui.md](05-maquettes_ui.md), les aligner sur l'arborescence et les routes V5, et garder une maquette ou un wireframe par écran clé pour éviter les ambiguïtés en développement.

---

*Copié depuis refactorisation_V5_Structuré (V4) — 2025-02-10 — référence 08 mise à jour (relative).*
