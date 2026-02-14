# User Stories — Site Bachata V5

**Format :** En tant que... je veux... afin de...  
**Organisation :** par Epic (1 à 6) — correspondance avec [07-prd.md](07-prd.md).

---

## Epic 1 — Landing & présentation école

### US-1.1 — Page d'accueil immersive

**En tant que** visiteur,  
**je veux** une page d'accueil immersive qui présente Capital of Fusion et l'École Nationale de Danse,  
**afin de** comprendre immédiatement l'identité et l'offre de l'école.

- **AC 1 :** La landing affiche le branding (marque, logos) de manière claire et cohérente.
- **AC 2 :** Le design est moderne, responsive, chargement fluide.
- **AC 3 :** Navigation visible vers Cours, Événements, Explore.

---

### US-1.2 — Navigation globale

**En tant que** visiteur,  
**je veux** une navigation claire vers les sections principales (Cours, Événements, Explore),  
**afin de** accéder rapidement aux contenus qui m'intéressent.

- **AC 1 :** Header/footer ou menu avec liens vers `/cours`, `/evenements`, `/explore`.
- **AC 2 :** Navigation utilisable sur mobile (menu hamburger ou équivalent).
- **AC 3 :** Page courante clairement indiquée.

---

## Epic 2 — Catalogue des cours

### US-2.1 — Consulter la liste des cours

**En tant que** danseur,  
**je veux** voir une liste des cours disponibles avec les informations clés (titre, style, niveau, prof, horaire),  
**afin de** repérer rapidement les cours adaptés à mon niveau et mes préférences.

- **AC 1 :** Affichage de la liste des cours depuis l'API (ou données statiques pour MVP).
- **AC 2 :** Chaque carte/ ligne affiche au minimum : titre, style, niveau, prof, horaire.
- **AC 3 :** Liste responsive (grille ou liste selon viewport).

---

### US-2.2 — Filtrer les cours

**En tant que** danseur,  
**je veux** filtrer les cours par style, niveau et prof,  
**afin de** ne voir que les cours pertinents pour moi.

- **AC 1 :** Filtres par style (ex. fusion, dominicana, sensual).
- **AC 2 :** Filtres par niveau (beginner, intermediate, advanced, professional).
- **AC 3 :** Filtre par prof (optionnel).
- **AC 4 :** Les résultats se mettent à jour en fonction des filtres sélectionnés.

---

### US-2.3 — Rechercher cours et profs

**En tant que** danseur,  
**je veux** rechercher par mots-clés (cours, prof),  
**afin de** trouver rapidement un cours ou un professeur spécifique.

- **AC 1 :** Champ de recherche textuelle.
- **AC 2 :** Recherche appliquée sur titre de cours et nom de prof.
- **AC 3 :** Résultats affichés en temps réel ou après validation.

---

### US-2.4 — Consulter le détail d'un cours

**En tant que** danseur,  
**je veux** accéder à une page détail pour chaque cours avec toutes les informations utiles,  
**afin de** décider si je m'inscris ou si je réserve.

- **AC 1 :** Page `/cours/[id]` ou équivalent avec infos complètes.
- **AC 2 :** Affichage : titre, style, niveau, prof, horaire, lieu, description.
- **AC 3 :** CTA visible (ex. « Réserver », « S'inscrire » — lien ou placeholder si paiement non implémenté).

---

## Epic 3 — Calendrier / agenda événements

### US-3.1 — Consulter la liste des événements

**En tant que** danseur,  
**je veux** voir une liste ou un calendrier des événements à venir avec dates, lieux et types,  
**afin de** ne manquer aucun événement qui m'intéresse.

- **AC 1 :** Affichage des événements depuis l'API.
- **AC 2 :** Chaque entrée affiche : titre, date(s), lieu, type (festival, soirée, etc.).
- **AC 3 :** Vue liste ou calendrier selon implémentation.

---

### US-3.2 — Filtrer les événements

**En tant que** danseur,  
**je veux** filtrer les événements par date, lieu et type,  
**afin de** cibler les événements pertinents.

- **AC 1 :** Filtres par plage de dates.
- **AC 2 :** Filtre par lieu (si applicable).
- **AC 3 :** Filtre par type (festival, soirée, stage, etc.).
- **AC 4 :** Résultats mis à jour selon les filtres.

---

### US-3.3 — Consulter les passes

**En tant que** danseur,  
**je veux** voir les passes disponibles pour un événement (ex. week-end, journée),  
**afin de** choisir l'option adaptée à mon budget et ma disponibilité.

- **AC 1 :** Affichage des passes dans le détail d'un événement.
- **AC 2 :** Infos par pass : nom, prix (si pertinent), période couverte.

---

### US-3.4 — Consulter le détail d'un événement

**En tant que** danseur,  
**je veux** accéder à une page détail pour chaque événement avec toutes les informations,  
**afin de** planifier ma participation et éventuellement acheter un pass.

- **AC 1 :** Page `/evenements/[id]` avec infos complètes.
- **AC 2 :** Affichage : titre, dates, lieu, type, description, passes, lien billetterie ou CTA si applicable.

---

## Epic 4 — Expérience Explore (3D)

### US-4.1 — Naviguer dans l'univers 3D

**En tant que** visiteur,  
**je veux** explorer un univers 3D où les organisations/partenaires sont représentés comme des « planètes »,  
**afin de** découvrir de manière immersive les acteurs de la communauté bachata.

- **AC 1 :** Environnement 3D chargé (Three.js).
- **AC 2 :** Navigation (rotation, zoom, déplacement) fluide.
- **AC 3 :** Chaque « planète » correspond à une organisation/partenaire.

---

### US-4.2 — Découvrir les organisations

**En tant que** visiteur,  
**je veux** pouvoir cliquer ou survoler une planète pour afficher les infos de l'organisation,  
**afin de** en savoir plus sur chaque acteur.

- **AC 1 :** Clic ou survol → affichage infos (nom, résumé).
- **AC 2 :** Lien possible vers la page de l'organisation ou ses cours/événements.
- **AC 3 :** Expérience utilisable sur mobile (touch) et desktop.

---

## Epic 5 — Auth & rôles (base)

### US-5.1 — Se connecter en tant que prof / admin

**En tant que** professeur ou administrateur,  
**je veux** me connecter avec identifiants pour accéder à des fonctionnalités réservées,  
**afin de** gérer mes cours ou administrer le site.

- **AC 1 :** Page/login flux de connexion (login, logout).
- **AC 2 :** Rôles supportés : participant, artiste, admin.
- **AC 3 :** Après connexion, accès aux zones protégées selon le rôle.

---

### US-5.2 — Voir / éditer mon profil (artiste)

**En tant que** artiste (prof),  
**je veux** consulter et éditer mon profil (bio, photo, cours associés),  
**afin de** que les danseurs puissent me découvrir et s'inscrire à mes cours.

- **AC 1 :** Page profil artiste avec infos affichées.
- **AC 2 :** Édition des champs autorisés (bio, photo, etc.).
- **AC 3 :** Sauvegarde des modifications via l'API.

---

## Epic 6 — Backlog (priorité P2/P3)

- **US-6.1** — Formulaire de contact : visiteur peut envoyer un message. *(P2)*
- **US-6.2** — Page profs / équipe : liste des professeurs avec présentation. *(P2)*
- **US-6.3** — Réservation / paiement : réservation de cours ou achat de passes via Stripe. *(P2)*
- **US-6.4** — Blog : articles pour SEO et fidélisation. *(P3)*

---

## Correspondance PRD ↔ User Stories

| Epic PRD | User Stories |
|----------|---------------|
| Epic 1 | US-1.1, US-1.2 |
| Epic 2 | US-2.1 à US-2.4 |
| Epic 3 | US-3.1 à US-3.4 |
| Epic 4 | US-4.1, US-4.2 |
| Epic 5 | US-5.1, US-5.2 |
| Epic 6 | US-6.1 à US-6.4 (backlog) |

---

*Dernière mise à jour : 2025-02-10*
