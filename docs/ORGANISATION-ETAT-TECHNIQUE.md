# Documentation Technique — Feature « Organisation de l'État »

> **Workspace source :** [organisation-etat/](https://github.com/vie-publique-senegal/organisation-etat) (CMS + scripts d'import)
> **Frontend :** point d'entrée `app/pages/etat-senegal/organisation/index.vue`

---

## 1. Vue d'ensemble

Le feature « Organisation de l'État » expose l'organigramme administratif officiel du Sénégal tel que défini par les décrets présidentiels. Il permet :

- de **visualiser** la hiérarchie complète (arborescence + liste filtrée)
- de **comparer** deux décrets pour voir les changements structurels
- de **naviguer** vers la fiche publique de chaque entité

La donnée source est gérée dans un CMS Directus et consommée par le frontend Nuxt via des API routes SSR.

---

## 2. Modèle de données (Directus / PostgreSQL)

```
state_entity_type  ──────< state_entity ──────< state_entity_snapshot >──── state_organization_decree
                                                      │
                                           parent_snapshot_id (self-ref)
```

### Collections principales

| Collection | Rôle |
|---|---|
| `state_entity_type` | Référentiel des types (`ministere`, `direction`, `service`, `etablissement_public`, `societe_nationale`, `societe_participation_publique`, `entite_regroupement`, …) |
| `state_entity` | Entité canonique avec `slug` **immuable** (clé URL stable), `name`, `code_institution` |
| `state_organization_decree` | Décret présidentiel avec `numero` (unique), `date_publication`, `status` (`active` ou archivé) |
| `state_entity_snapshot` | Snapshot d'une entité pour un décret donné. Contient `official_label`, `change_type` et la hiérarchie via `parent_snapshot_id` (FK auto-référentielle) |
| `state_entity_change` | Changements détectés entre deux décrets : `change_category` (`created`, `rename`, `reparent`, `deleted`, `merge`, `split`) |

### Points clés du schéma

- **`slug` ne change jamais** — c'est le seul identifiant stable pour les URL publiques.
- **`state_entity_snapshot.parent_snapshot_id`** est la **clé fiable** de hiérarchie (pas `parent_entity`). Chaque décret crée ses propres snapshots.
- **`change_type = null`** dans `state_entity_snapshot` → entité de regroupement (`entite_regroupement`), exclue de `state_entity_change`.
- **`code_institution`** : identifiant numérique stable pour les 3 racines (Présidence=21, Primature=22, Ministères).

---

## 3. Architecture Frontend

```
pages/etat-senegal/organisation/
├── index.vue            ← page principale (overview + stats + explorer + recent changes)
└── changements.vue      ← page de comparaison inter-décrets

composables/
├── useEtatOrganisation.ts         ← état central : overview, entities, tree, filtres, pagination
├── useEtatOrganisationChanges.ts  ← comparaison entre deux décrets
└── useEtatOrganisationEntity.ts   ← détail d'une entité par slug

types/etat-organisation.ts         ← tous les types TypeScript du domaine

components/etat/
├── EtatOrganisation.vue           ← composant racine générique
├── EtatTreeView.vue               ← vue arbre standalone
├── EtatTreeNode.vue               ← nœud d'arbre générique
└── organisation/
    ├── Explorer.vue               ← conteneur tabs (Arborescence / Liste)
    ├── Tree.vue                   ← arbre interactif avec expand/collapse global
    ├── TreeItem.vue               ← nœud récursif de l'arbre
    ├── List.vue                   ← liste paginée avec recherche et filtres
    └── RecentChanges.vue          ← résumé + liste des derniers changements

server/api/etat-organisation/
├── overview.get.ts                ← GET /api/etat-organisation/overview
├── entities.get.ts                ← GET /api/etat-organisation/entities
├── entities/[slug].get.ts         ← GET /api/etat-organisation/entities/:slug
└── changes.get.ts                 ← GET /api/etat-organisation/changes
```

---

## 4. Routes API

Toutes les routes utilisent `defineCachedEventHandler` avec `CacheDuration.MEDIUM`.

### `GET /api/etat-organisation/overview`

Retourne un snapshot léger du décret actif pour la page d'accueil.

**Réponse : `EtatOrganisationOverview`**

```typescript
{
  decree: {
    id, numero, date_publication, status,
    previous_numero  // numéro du décret précédent (pour afficher la période)
  } | null,
  stats: {
    total_entities: number,
    public_pages: number,         // entités avec page publique
    types: EtatOrganisationTypeStat[]  // count par type_code
  },
  changes: {
    summary: EtatOrganisationChangeSummary[],  // { category, label, count }
    total: number
  },
  recent_changes: EtatOrganisationRecentChange[]  // 24 derniers changements
}
```

**Logique** :
1. Charge tous les décrets triés par `date_publication DESC`.
2. Décret actif = premier avec `status='active'`, sinon le premier.
3. Décret précédent = premier décret ≠ actif.
4. Requêtes parallèles (`Promise.all`) : types, entités publiques, counts de changements, 24 derniers changements.

---

### `GET /api/etat-organisation/entities[?decree=NUMERO]`

Retourne **toutes les entités** du décret (flat list) avec leur hiérarchie de snapshot.

**Paramètre** : `decree` = numéro de décret (ex: `2024-940`). Par défaut : décret actif.

**Réponse : `EtatOrganisationEntitiesResponse`**

```typescript
{
  decree: EtatOrganisationDecreeRef | null,
  allDecrees: EtatOrganisationDecreeRef[],
  entities: EtatOrganisationEntity[]
}
```

**Structure de `EtatOrganisationEntity`** :

```typescript
{
  id: string            // UUID public_entity
  snapshot_id: string   // UUID entity_snapshot (clé hiérarchie)
  public_slug: string
  name: string          // official_label du snapshot
  has_public_page: boolean
  type_code: string
  type_label: string
  code_institution?: number | null
  parent_snapshot_id?: string | null  // lien hiérarchique fiable
  parent_id?: string | null           // résolu en post-traitement
  parent_name?: string | null         // résolu en post-traitement
  // Données de contact (depuis state_entity)
  email?, adresse?, phone?, web_site?, reseaux_sociaux?, logo?
}
```

**Post-traitement serveur** : après la requête, le handler résout `parent_id` et `parent_name` via une `Map<snapshot_id → node>` en O(n).

**Cache key** : `etat-organisation-entities-${decree|active}` (version `v4`).

---

### `GET /api/etat-organisation/entities/:slug`

Retourne le détail d'une entité avec arborescence locale, breadcrumb et historique.

**Réponse : `EtatOrganisationEntityDetailResponse`**

```typescript
{
  decree: EtatOrganisationDecreeRef | null,
  entity: EtatOrganisationEntity,
  children: EtatOrganisationEntity[],
  breadcrumb: Array<{ id, public_slug, name }>,
  history: EtatOrganisationEntityHistoryItem[]
}
```

---

### `GET /api/etat-organisation/changes[?from=&to=&category=&page=]`

Comparaison paginée entre deux décrets.

**Paramètres** :
- `from` : numéro du décret source (défaut : décret précédent)
- `to` : numéro du décret cible (défaut : décret actif)
- `category` : filtre par `change_category`
- `page` : pagination (taille fixe : 30)

**Réponse : `EtatOrganisationChangesResponse`**

```typescript
{
  from_decree, to_decree: EtatOrganisationDecreeRef | null,
  allDecrees: EtatOrganisationDecreeRef[],
  summary: EtatOrganisationChangeSummary[],   // counts par catégorie
  changes: EtatOrganisationChange[],
  total, page, pageSize: number
}
```

---

## 5. Composables

### `useEtatOrganisation()` — composable central

**État URL-driven** (tous les filtres vivent dans `route.query`) :

| Computed (r/w) | Query param | Description |
|---|---|---|
| `searchTerm` | `search` | Recherche accent-insensitive |
| `selectedType` | `type` | Filtre par `type_code` |
| `listPage` | `page` | Page courante (liste) |
| `selectedDecreeNumero` | `decree` | Décret affiché (vide = actif) |

**Données chargées** :

| Ref | API | SSR |
|---|---|---|
| `overview` | `/api/etat-organisation/overview` | `server: true` |
| `entitiesResponse` | `/api/etat-organisation/entities` | `server: true`, watch `selectedDecreeNumero` |

**Computed clés** :

- **`entities`** : liste plate, toutes entités du décret sélectionné.
- **`availableTypes`** : types uniques extraits des entités, triés FR.
- **`filteredEntities`** : algorithme en 4 étapes :
  1. Marque les **matches directs** (recherche accent-insensitive sur `name`, hors `entite_regroupement`).
  2. Inclut les **descendants** des matches directs (traversée parent via `Map<snapshot_id>`, max 25 niveaux).
  3. Applique le **filtre de type** et exclut `entite_regroupement`.
  4. **Trie** : starts-with > contains > alphabétique FR.
- **`treeRoots`** : construit l'arbre hiérarchique depuis la liste plate en deux passes :
  1. Mappe `snapshot_id → EtatOrganisationTreeNode`.
  2. Attache les enfants à leur parent via `parent_snapshot_id`.
  3. **Groupe** les établissements/sociétés en nœuds virtuels (`__etablissement_public__{id}`).
  4. **Groupe** tous les ministères sous un nœud virtuel « Ministères ».
  5. **Trie** les racines : Présidence (0) → Primature (1) → reste alphabétique.
- **`paginatedEntities`** : slice de `filteredEntities` selon `listPage` et `LIST_PAGE_SIZE` (25).
- **`tutelleBySnapshotId`** : `Map<snapshot_id, parent_name>` pour affichage de la tutelle dans la liste.

---

### `useEtatOrganisationChanges()` — comparaison décrets

URL-driven : `from`, `to`, `category`, `page` dans `route.query`.

Utilise `useAsyncData` en mode **`lazy: true`** (non-bloquant à la navigation) avec clé dynamique incluant tous les paramètres.

**Retourne** : `fromNumero`, `toNumero`, `selectedCategory`, `currentPage`, `changes`, `summary`, `allDecrees`, `fromDecree`, `toDecree`, `total`, `pageSize`, `totalPages`, `pending`, `error`, `refresh`, `resetFilters`.

---

### `useEtatOrganisationEntity(slug)` — détail entité

Accepte un `string` ou `Ref<string>`. SSR (`server: true`), re-fetch automatique si le slug change.

---

## 6. Page principale — `index.vue`

**Route** : `/etat-senegal/organisation`

### Structure de la page

```
AppBreadcrumb
└─ "État du Sénégal" → /etat-senegal
   └─ "Organisation de l'État"

Section Hero
└─ Badge décret actif + date de mise en vigueur
   Titre + description

Section Stats (4 tuiles cliquables)
└─ ministere → /etat-senegal/ministeres
   etablissement_public → /etat-senegal/entites-publiques?type=etablissement_public
   societe_nationale → /etat-senegal/entites-publiques?type=societe_nationale
   societe_participation_publique → /etat-senegal/entites-publiques?type=societe_participation_publique

Section Explorer
└─ <EtatOrganisationExplorer>
   ├─ Tabs : Arborescence | Liste
   ├─ Sélecteur de décret (historique)
   ├─ <EtatOrganisationTree>  ─── TreeItem (récursif)
   └─ <EtatOrganisationList>  ─── SearchBar + TypeFilter + pagination

Section Historique
└─ <EtatOrganisationRecentChanges>
   ├─ Résumé par catégorie (pills colorées)
   └─ Liste des 24 derniers changements avec lien vers /organisation/changements
```

### Logique des stats (`typeStats`)

Calculé côté client depuis `entities` (chargé SSR) :

```typescript
STAT_TYPES = ['ministere', 'etablissement_public', 'societe_nationale', 'societe_participation_publique']
// Count par type_code dans les entities
// → tableau { code, label, count, icon, color }
```

---

## 7. Page Changements — `changements.vue`

**Route** : `/etat-senegal/organisation/changements`

Utilise `useEtatOrganisationChanges()`. Permet de sélectionner deux décrets via des `<select>` peuplés par `allDecrees`. Pagination côté serveur (30 items/page). Filtre par catégorie de changement.

### Catégories de changements

| Catégorie | Label FR | Couleur |
|---|---|---|
| `created` | Nouvelle entité / Créations | vert |
| `deleted` | Suppression | rouge |
| `rename` | Renommage | bleu |
| `reparent` | Changement de tutelle | amber |
| `merge` | Fusion | violet |
| `split` | Scission | orange |

---

## 8. Composants UI détaillés

### `EtatOrganisationExplorer.vue`

- **Tabs** `view` dans query param (`tree` = défaut, `list`).
- **Décret selector** : `<select>` natif, valeur = numéro décret. Si décret ≠ actif → bandeau « vue archivée ».
- Délègue à `<EtatOrganisationTree>` ou `<EtatOrganisationList>`.

### `EtatOrganisationTree.vue` + `TreeItem.vue`

- `Tree.vue` : provides `treeExpandAll` et `treeCollapseAll` (booleans `ref`) via `provide/inject`.
- `TreeItem.vue` :
  - Récursif, reçoit `node: EtatOrganisationTreeNode` et `depth: number`.
  - `depth=0` → rendu **root card** (icône colorée 40px, lien si `has_public_page`).
  - `depth>0` → rendu **child row** indenté (`Math.min((depth-1)*24 + 12, 96)` px).
  - Expand/collapse local via `isOpen ref`.
  - Nœuds virtuels (`id` préfixé `__`) → pas de lien public.
  - Inject `treeExpandAll`/`treeCollapseAll` pour le contrôle global.

### `EtatOrganisationList.vue`

- Search input + chips de filtre par type (4 types seulement exposés).
- Pagination avec `listPage` computed r/w.
- Affiche `tutelleBySnapshotId` comme sous-titre de chaque ligne.
- Skeleton pendant `pending`.

### `EtatOrganisationRecentChanges.vue`

- Reçoit `overview: EtatOrganisationOverview | null` en prop.
- Affiche les summary pills + liste des `recent_changes` (max 24).
- Lien « Voir tous les changements » → `/etat-senegal/organisation/changements`.

---

## 9. Types TypeScript centraux

Fichier : `types/etat-organisation.ts`

```typescript
EtatOrganisationEntity               // entité plate (snapshot résolu)
EtatOrganisationTreeNode             // extends Entity + children: TreeNode[]
EtatOrganisationDecreeRef            // { id, numero, date_publication, status }
EtatOrganisationOverview             // réponse overview API
EtatOrganisationEntitiesResponse     // réponse entities API
EtatOrganisationEntityDetailResponse // réponse entity detail API
EtatOrganisationChange               // changement complet (old_value, new_value)
EtatOrganisationChangesResponse      // réponse changes API
EtatOrganisationRecentChange         // changement léger pour overview
EtatOrganisationTypeStat             // { code, label, count }
EtatOrganisationChangeSummary        // { category, label, count }
EtatOrganisationEntityHistoryItem    // item historique d'une entité
```

---

## 10. Import des décrets (repo [organisation-etat](https://github.com/vie-publique-senegal/organisation-etat))

### Pipeline d'import

```
markdown/decret_XXXX-XXX.md
        │
        ▼
scripts/import-decree.js
        │  Parsing Markdown → entités structurées
        │  Détection type depuis contexte parent (##, ###, ####, bold markers)
        │  Génération slug (ONCE, immuable)
        │  Upsert state_entity par slug / code_institution
        │  Création state_entity_snapshot liés au décret
        │  Détection changements → state_entity_change
        ▼
Directus CMS (PostgreSQL)
```

### Commandes

```bash
cd scripts
npm run import:2024    # Décret 2024-940
npm run import:2025    # Décret 2025-1431
npm run import:all     # Tous les décrets

npm run clean:all      # Supprime toutes les données (structure préservée)
```

### Règles slug

- Entités niveau 2 (Présidence, Primature, Ministères) : slug simple.
- `entite_regroupement` : slug qualifié par le parent (toujours).
- Entités standard : simple si unique dans le décret, qualifié parent si doublon.
- Max 100 chars (simple) ou 200 chars (avec parent).

---

## 11. SEO

La page `index.vue` configure via `useSeoMeta` + `useHead` :

```
title: "Organisation de l'État du Sénégal"
description: "Explorez l'organigramme officiel, les entités publiques..."
robots: index,follow
og:title + og:description
```

---

## 12. Flux de données complet (SSR)

```
Browser request /etat-senegal/organisation
        │
        ▼ (Nuxt SSR)
index.vue setup()
   ├─ useEtatOrganisation()
   │    ├─ useAsyncData('etat-organisation-overview')
   │    │       → GET /api/etat-organisation/overview
   │    │             → Directus: state_organization_decree + state_entity_type + state_entity + state_entity_change
   │    │             → Cache MEDIUM
   │    └─ useAsyncData('etat-organisation-entities-active')
   │            → GET /api/etat-organisation/entities
   │                  → Directus: state_entity_snapshot JOIN public_entity JOIN entity_type
   │                  → Post-traitement: résolution parent_name
   │                  → Cache MEDIUM
   │
   ▼ (hydration client)
computed treeRoots ← entities (flat) → arbre hiérarchique + nœuds virtuels
computed filteredEntities ← entities + searchTerm + selectedType
computed typeStats ← entities + STAT_TYPES

EtatOrganisationExplorer (tabs tree/list)
EtatOrganisationRecentChanges (overview prop)
```

---

## 13. Dépendances clés

| Package | Rôle |
|---|---|
| `@directus/sdk` v17 | Client CMS (`readItems`, `createDirectus`, `staticToken`) |
| `nuxt` 4 | Framework SSR, `useAsyncData`, `$fetch` |
| `@nuxt/ui` | Composants UI (`UIcon`, `UButton`, …) |
| `tailwindcss` | Styles utility-first |
| `vue` 3 | `computed`, `ref`, `inject/provide`, `watch` |
