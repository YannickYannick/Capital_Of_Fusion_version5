# Feature : Navbar & Dashboard

Résumé des évolutions UI : logo dans la barre de menu, avatar quand l’utilisateur est connecté, et tableau de bord admin sans iframes avec accès « DB menu ».

---

## Navbar

| Élément | Détail |
|---------|--------|
| **Logo** | Image `frontend/public/logo.png` utilisée à la place du texte « Capital of Fusion » ; même logo dans `Navbar` et `MobileNav`. Taille contrôlée par classes (ex. `h-10` ou équivalent). |
| **Connexion** | Si l’utilisateur est authentifié : le lien « Connexion » est masqué et un espace/avatar utilisateur est affiché (placeholder ou photo selon implémentation). |
| **Menu** | Entrées pilotées par l’API `/api/menu/items/` ; pas de lien « DB » dans la navbar (réservé au dashboard). |

Fichiers : `frontend/src/components/shared/Navbar.tsx`, `frontend/src/components/shared/MobileNav.tsx`.

---

## Dashboard (`/dashboard`)

- **Contenu** : tableau de bord pour les utilisateurs connectés (liens utiles, accès admin si droit).
- **DB menu** : bouton visible pour les admins (ex. `user_type === 'ADMIN'`) pointant vers l’admin Django (ex. `http://localhost:8000/admin/` ou URL backend).
- **Pas d’iframe** : les anciennes iframes « Console d’administration » ont été retirées ; l’accès au back-office se fait via le lien « DB menu » (nouvel onglet).

Fichier : `frontend/src/app/(main)/dashboard/page.tsx`.
