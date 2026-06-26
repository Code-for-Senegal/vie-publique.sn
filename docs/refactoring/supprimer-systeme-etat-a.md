# TODO Refactoring — Supprimer l'ancien système « état » (Système A)

> **Statut** : à traiter. Audit réalisé le 2026-06-25.
> **Résumé** : le projet contient deux systèmes « état » parallèles. Le **Système A**
> (collection Directus `state_entity`) est redondant avec le **Système B** actuel
> (`state_organization_entity`). Il faut supprimer le Système A.

## Contexte : deux systèmes parallèles

| | **ANCIEN — Système A** | **ACTUEL — Système B** |
| --- | --- | --- |
| Collection Directus | `state_entity` (+ `state_type`, `state_structure`) | `state_organization_entity` (+ snapshots, décrets, changes) |
| API serveur | `server/api/state/` (4 fichiers) | `server/api/etat-organisation/` (6 fichiers) |
| Pages | `/etat-senegal/annuaire` (2 pages) | `/etat-senegal/organisation`, `/institutions`, `/ministeres`, `/[slug]`… (8 pages) |
| Composables | `useStateEntities`, `useStateTree`, `useStateStats`, `useStateEntityDetail` | `useEtatOrganisation*` (4) |

**Constats de l'audit :**

- Les deux systèmes tournent (code vivant).
- Le Système A est accessible via la carte menu « Organigramme de l'etat »
  (`/etat-senegal/annuaire`, flag `menu_organigramme_etat` **enabled**) mais
  **n'est PAS dans le sitemap** (`server/api/__sitemap__/urls.ts`) → non indexé volontairement.
- Le **budget** et les **dossiers** utilisent le Système B :
  `budget_line.public_entity` → `state_organization_entity`
  (`server/api/budget/entity/[slug].get.ts`, `server/api/budget/ministries.get.ts`),
  `server/api/dossiers/[slug].get.ts` → `state_organization_entity_id`.
- **Seul lien restant vers l'ancien `state_entity`** : `public_project.ministry`
  (filtre ministères des projets) dans `server/api/public-projects/filters.get.ts` (L48-58).

## Couche 1 — CODE (suppression sûre, rien ne l'importe hors de lui)

À supprimer :

- [ ] `server/api/state/` (4 fichiers : `entities/index.get.ts`, `entities/[slug].get.ts`, `tree.get.ts`, `stats.get.ts`)
- [ ] `app/pages/etat-senegal/annuaire/` (2 fichiers : `index.vue`, `[slug].vue`)
- [ ] `app/composables/useStateEntities.ts`
- [ ] `app/composables/useStateTree.ts`
- [ ] `app/composables/useStateStats.ts`
- [ ] `app/composables/useStateEntityDetail.ts`
- [ ] `types/state-entity.ts`
- [ ] Entrée menu « Organigramme de l'etat » dans `app/pages/menu.vue` (~L261-267)
- [ ] Flag `menu_organigramme_etat` dans `app/config/features.config.ts`
- [ ] Vérifier ensuite : `npm run lint` (aucune référence résiduelle)

## Couche 2 — COLLECTION Directus `state_entity` (PAS avant migration)

**Bloqueur** : `public_project.ministry` pointe encore vers `state_entity`
(`server/api/public-projects/filters.get.ts` L48-58).

- [ ] Re-pointer `public_project.ministry` vers `state_organization_entity` dans l'admin Directus.
- [ ] Adapter `server/api/public-projects/filters.get.ts` si la structure des champs change.
- [ ] Une fois la relation migrée : supprimer les collections `state_entity`,
      `state_type`, `state_structure` côté Directus.
