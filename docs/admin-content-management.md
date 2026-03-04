# Gestion du Contenu Administrateur (Admin Content Management)

L'administration du contenu (Événements, Cours, Leçons de théorie, Projets, et Noeuds d'organisation) se fait **directement depuis l'interface publique (Inline Editing)**. 

Il n'y a pas de tableau de bord d'administration séparé coté frontend (hors interface Django Admin classique pour les configurations complexes).

## Architecture

L'architecture repose sur la détection du rôle de l'utilisateur connecté via le contexte d'authentification (`AuthContext`).

### 1. Sécurité Backend (Django)

Des endpoints d'API dédiés à l'administration ont été créés sous la route `/api/admin/`.
Ils sont protégés par deux conditions cumulatives :
- L'utilisateur doit être authentifié (`IsAuthenticated`).
- L'utilisateur doit être un super-utilisateur (`user.is_superuser == True`).

Les requêtes non autorisées renvoient une erreur `401 Unauthorized` (pas de token) ou `403 Forbidden` (token valide mais permissions insuffisantes).

### 2. Interface Frontend (Next.js)

Sur le frontend, la détection se fait via le profil utilisateur décodé du token JWT :
Si `user.user_type === "ADMIN"`, les composants d'édition deviennent visibles.

#### Composants Clés

*   `AdminEditButton.tsx` : Fournit deux boutons réutilisables.
    *   `AdminEditButton` : Bouton flottant (icône ✏️) généralement placé sur les cards de contenu pour **modifier** ou **supprimer** une entrée existante.
    *   `AdminAddButton` : Bouton (icône ➕) placé en haut des listes pour **créer** une nouvelle entrée.
*   `AdminModal.tsx` : Composant wrapper pour les formulaires modaux d'édition. Il gère l'affichage stylisé (glassmorphism), les boutons d'action (Sauvegarder, Annuler, Supprimer) et l'état de chargement.
*   `lib/adminApi.ts` : Centralise toutes les fonctions d'appel à l'API backend pour les opérations d'écriture (POST, PATCH, DELETE). Ce fichier injecte automatiquement le token JWT du `localStorage` dans les headers de la requête.

## Implémentation par Page

### `/cours`
*   **Bouton Ajout** : Présent en haut de la liste.
*   **Bouton Édition** : Sur chaque card de cours.
*   **Fonctionnalité** : Permet de modifier le nom, slug, description, et d'activer/désactiver le cours du catalogue.

### `/theorie/cours`
*   **Bouton Ajout** : Présent en haut de la liste.
*   **Bouton Édition** : Sur chaque card de leçon.
*   **Fonctionnalité** : Modification du titre, description, durée, type de contenu et URL de la vidéo.

### `/evenements`
*   **Bouton Ajout** : Présent en haut de la liste.
*   **Bouton Édition** : Sur chaque card d'événement.
*   **Fonctionnalité** : Modification du nom, slug, type (Festival, Soirée, Atelier), dates de début/fin, lieu et description.

### `/projets`
*   **Bouton Ajout** : Présent en haut de la liste.
*   **Bouton Édition** : Sur chaque card de projet ET sur la page de détail d'un projet (`/projets/[slug]`).
*   **Fonctionnalité** : Utilisation avancée permettant la saisie de texte au format **Markdown** pour le contenu détaillé. La page de rendu frontend utilise `react-markdown` pour afficher proprement ce contenu.

### `/explore` (Vue 3D / Organisation)
*   **Édition** : Bouton `🛠 Editer Planètes` dans le panneau d'options de la vue 3D.
*   **Fonctionnalité** : Ouvre le `GlobalPlanetConfigPanel` permettant d'éditer la position, la couleur, l'échelle et la visibilité des noeuds d'organisation, répercutant les changements directement dans la modélisation spatiale.

## Pratiques de Développement pour l'Édition

Lors de la création de nouveaux formulaires d'administration :
1. Importer `AdminModal`, `AdminField`, et les classes utilitaires de style depuis `@/components/admin/AdminModal`.
2. Gérer un état local `isEditing` ou la sélection de l'objet à éditer dans la page parente.
3. Afficher conditionnellement la `<Modale>` par-dessus le contenu.
4. Relaoder la liste des données via la fonction `onSuccess` après une modification réussie pour refléter les changements sans recharger la page.
