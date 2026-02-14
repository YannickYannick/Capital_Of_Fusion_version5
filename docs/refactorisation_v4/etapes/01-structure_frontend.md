# Étape 01 – Structure dossiers frontend

_Modèle d'étape. À dupliquer et adapter pour chaque phase._

## Objectif

Créer la structure des dossiers frontend Next.js selon [01-arborescence.md](../structure/01-arborescence.md) : 1 layout `(main)`, monorepo `frontend/` + `backend/`.

## Prérequis

- Projet V5 initialisé (monorepo avec `frontend/` et `backend/` à la racine).

## Tâches

1. [x] Créer `frontend/src/app/(main)/` avec `page.tsx` (landing)
2. [x] Créer `frontend/src/app/layout.tsx` et `globals.css`
3. [x] Créer les dossiers : `components/ui/`, `components/shared/`, `components/features/`, `hooks/`, `lib/`, `contexts/`, `store/`, `types/`
4. [x] Créer les routes squelettes : `(main)/explore/`, `(main)/cours/`, `(main)/evenements/`, `(main)/boutique/`, `(main)/organisation/`, `(main)/login/` (page.tsx minimal)
5. [x] Vérifier que Next.js démarre et affiche la landing

## Livrables

- Arborescence `frontend/src/` conforme à 01-arborescence.
- Toutes les pages sous `(main)` partagent le même layout.
- Critères de validation : `npm run dev` OK, navigation vers `/`, `/explore`, `/cours` fonctionnelle (même vide).

## Notes

- Référence : [01-arborescence.md](../structure/01-arborescence.md)
- Design system : [04-maquettes_ui_jour.md](../structure/04-maquettes_ui_jour.md) section 6.
