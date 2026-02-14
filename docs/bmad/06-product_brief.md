# 📄 Product Brief — Site Bachata V5

**But :** document court et clair décrivant le produit « Site Bachata V5 » (BachataVibe / Capital of Fusion).

---

## 1. Vision produit

- **Phrase de vision :**  
  Mettre en avant l'école (Capital of Fusion) et vendre des cours, tout en mettant en avant les événements et en créant une communauté autour de la bachata, avec une expérience distinctive (landing immersive, expérience 3D Explore).

---

## 2. Public cible

- **Segments principaux :**
  - **Prioritaire :** danseurs de tous niveaux (débutants à avancés) qui veulent trouver des cours et événements.
  - **Secondaire :** organisateurs et professeurs qui proposent cours et événements et veulent promouvoir leur activité.

---

## 3. Problèmes à résoudre

- Centraliser la découverte des cours (catalogue, filtres par style/niveau) et des événements (agenda, lieux, passes).
- Donner une identité forte à l'école (landing + Explore 3D) et renforcer la dimension communauté.
- Répondre aux attentes mobile-first et SEO pour le trafic « cours / événements bachata ».

---

## 4. Proposition de valeur

- **École + vente de cours** : catalogue de cours avec recherche et filtres (style, prof).
- **Événements** : calendrier, festivals, passes, lieux = ne manquer aucun beat.
- **Communauté** : expérience 3D Explore (navigation « planétaire » des organisations/partenaires), rôles participant/artiste/admin.
- **Marque** : Capital of Fusion, École Nationale de Danse, landing immersive.

---

## 5. Fonctionnalités clés (V5)

- **Top 3 priorités V5 :**
  1. **Planning / catalogue des cours** — cœur « vente de cours » et découverte des profs (filtres, recherche).
  2. **Calendrier / agenda d'événements** — dates, lieux, passes, types (festivals, vie de la communauté).
  3. **Présentation école + expérience Explore (3D)** — landing + navigation 3D des acteurs/organisations pour identité premium et communautaire.

- **À considérer selon temps / budget :** formulaire de contact, page profs/équipe, réservation/paiement (Stripe, etc.), blog (SEO).

---

## 6. Contraintes & succès

- **Contraintes :**
  - **Stack :** réutilisation Django + DRF + PostgreSQL (backend), Next.js 15 (App Router) + Tailwind + Three.js (frontend).
  - **Mobile-first** (vision V4) ; **SEO** (SSR Next.js, score cible > 90).
  - **Phasage :** avancement par étapes (étapes V5) ; MVP 6–8 semaines possible puis modules avancés.
  - **Hébergement :** à préciser (Vercel front, Railway/Render backend, cPanel évoqués en V4).

- **Critères de succès :** à définir (ex. : trafic « cours bachata », inscriptions, réservations, score SEO, adoption Explore).

---

## 7. Vision complète et phasage

- **Phase 1 (MVP) :** Top 3 (Landing, Catalogue cours, Calendrier événements) + Explore 3D + Auth.
- **Vision complète V4 :** Boutique, Formations, Trainings, Artistes, Théorie, Care, Projets, Organisation (structure/pôles). Documentée dans `refactorisation_V5_Structuré/structure/` et analysée dans [09-analyse_alignement.md](09-analyse_alignement.md).

---

*Dernière mise à jour : 2025-02-10*
