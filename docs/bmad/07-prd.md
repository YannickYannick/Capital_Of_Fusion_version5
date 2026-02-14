# Product Requirements Document — Site Bachata V5

**Projet :** BachataVibe / Capital of Fusion — École Nationale de Danse  
**Date :** 2025-02-10  
**Source :** Product Brief, Tech Specs, meetings, refactorisation_V5_Structuré (V4).

---

## 1. Résumé exécutif

Mettre en avant l'école Capital of Fusion et vendre des cours de bachata, tout en mettant en avant les événements et en créant une communauté autour de la danse, via une expérience distinctive (landing immersive, expérience 3D Explore).

**Public cible prioritaire :** Danseurs de tous niveaux (débutants → avancés).  
**Public secondaire :** Organisateurs et professeurs.

---

## 2. Critères de succès

| Critère | Mesure cible | Priorité |
|---------|--------------|----------|
| Trafic organique | Score SEO Lighthouse > 90 ; visibilité « cours / événements bachata » | P0 |
| Adoption catalogue cours | Affichage catalogue, filtres utilisés | P0 |
| Adoption calendrier événements | Consultation agenda, lieux, passes | P0 |
| Identité Explore 3D | Expérience Explore chargée, navigation fluide | P1 |
| Mobile-first | Responsive, expérience mobile satisfaisante | P0 |
| Inscriptions / réservations | À définir (Stripe, etc.) | P2 |

---

## 3. Epics & exigences fonctionnelles

### Epic 1 — Landing & présentation école

| ID | Exigence | Critères d'acceptation (résumé) |
|----|----------|--------------------------------|
| FR-1.1 | Page d'accueil immersive | Landing met en avant Capital of Fusion, École Nationale ; vidéo fond ; design moderne, chargement fluide. |
| FR-1.2 | Navigation vers les modules | Liens clairs vers Cours, Événements, Explore ; CTA « Commencer l'Expérience » → Explore. |
| FR-1.3 | Navbar dynamique | Menu piloté par API `GET /api/menu/items/` (MenuItem) ; ordre et sous-menus selon maquettes V4. |
| FR-1.4 | Branding cohérent | Marque, logos, ton visuel homogène (design system [04-maquettes_ui_jour](../refactorisation_v4/structure/04-maquettes_ui_jour.md)). |

### Epic 2 — Catalogue des cours

| ID | Exigence | Critères d'acceptation (résumé) |
|----|----------|--------------------------------|
| FR-2.1 | Liste des cours | Affichage des cours avec infos clés (titre, style, niveau, prof, horaire). |
| FR-2.2 | Filtres | Filtrage par style, niveau (beginner → professional), prof. |
| FR-2.3 | Recherche | Recherche texte (cours, prof). |
| FR-2.4 | Détail cours | Page détail avec infos complètes. |

### Epic 3 — Calendrier / agenda événements

| ID | Exigence | Critères d'acceptation (résumé) |
|----|----------|--------------------------------|
| FR-3.1 | Liste événements | Affichage dates, lieux, types (festival, soirée, etc.). |
| FR-3.2 | Filtres événements | Par date, lieu, type. |
| FR-3.3 | Passes | Affichage des passes si applicable. |
| FR-3.4 | Détail événement | Page détail avec infos complètes. |

### Epic 4 — Expérience Explore (3D)

| ID | Exigence | Critères d'acceptation (résumé) |
|----|----------|--------------------------------|
| FR-4.1 | Navigation 3D | Environnement 3D (Three.js) avec « planètes » = OrganizationNode ; paramètres 3D (orbites, type, etc.). |
| FR-4.2 | Découverte acteurs | Clic → zoom ; second clic / CTA → overlay détail (PlanetOverlay) avec NodeEvent. |
| FR-4.3 | Fallback mobile / a11y | Vue liste ou arbre pour petits écrans et accessibilité. |
| FR-4.4 | Fluidité | Performance acceptable sur mobile et desktop. |

### Epic 5 — Auth & rôles (base)

| ID | Exigence | Critères d'acceptation (résumé) |
|----|----------|--------------------------------|
| FR-5.1 | Rôles | Participant, artiste, admin (modèle User). |
| FR-5.2 | Connexion / déconnexion | Flux basique login/logout pour profs/admins. |
| FR-5.3 | Gestion profils | Profils basiques (artistes, admins). |

### Epic 6 — Fonctionnalités optionnelles (backlog)

| ID | Exigence | Priorité |
|----|----------|----------|
| FR-6.1 | Formulaire de contact | P2 |
| FR-6.2 | Page profs / équipe | P2 |
| FR-6.3 | Réservation / paiement (Stripe) | P2 |
| FR-6.4 | Blog (SEO, fidélisation) | P3 |

---

## 4. Exigences non fonctionnelles

| ID | Exigence | Cible |
|----|----------|-------|
| NFR-1 | SEO | SSR Next.js ; score Lighthouse > 90 sur pages publiques. |
| NFR-2 | Mobile-first | Conception prioritaire mobile ; responsive obligatoire. |
| NFR-3 | Performance | Temps de chargement raisonnable ; Explore 3D fluide. |
| NFR-4 | Accessibilité | Sémantique HTML, contrastes, navigation clavier. |
| NFR-5 | Stack | Django + DRF + PostgreSQL (backend) ; Next.js 15 + Tailwind + Three.js (frontend). |

---

## 5. Phasage et vision complète (réf. refactorisation_V5_Structuré)

### Phase 1 — MVP (Top 3 + Auth)

- Landing, Explore 3D, Catalogue cours, Calendrier événements, Auth.
- Correspond aux Epics 1–5 ci-dessus.

### Phase 2+ — Vision complète V4

Scope documenté dans `refactorisation_V5_Structuré/structure/` :
- **Boutique / Shop** : ProductCategory, Product, Order.
- **Formations** : FormationCategory, FormationContent (contenu en ligne, vidéothèque).
- **Trainings** : TrainingSession, adhérents.
- **Artistes** : annuaire, profils, booking, avis.
- **Théorie** : cours théoriques, quiz, progression.
- **Care** : soins, praticiens, réservation.
- **Projets** : incubation, initiatives.
- **Organisation** : structure, pôles (vues détaillées).

Voir [09-analyse_alignement.md](09-analyse_alignement.md) pour le détail des écarts et recommandations.

---

## 6. Périmètre hors V5 (explicite)

- Application mobile native (React Native/Expo) : hors périmètre initial.
- Paiement en ligne : backlog (priorité P2).
- Blog : backlog (priorité P3).
- Gestion avancée des inscriptions / places : à préciser ultérieurement.

---

*Dernière mise à jour : 2025-02-10*
