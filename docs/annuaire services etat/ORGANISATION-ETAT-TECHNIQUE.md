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
state_organization_entity_type  ──────< state_organization_entity ──────< state_organization_entity_snapshot >──── state_organization_decree
                                                      │
                                           parent_snapshot_id (self-ref)
```

### Collections principales

| Collection | Rôle |
|---|---|
| `state_organization_entity_type` | Référentiel des types (`ministere`, `direction`, `service`, `etablissement_public`, `societe_nationale`, `societe_participation_publique`, `entite_regroupement`, …) |
| `state_organization_entity` | Entité canonique avec `slug` **immuable** (clé URL stable), `name`, `code_institution`, champs de contact (`logo`, `web_site`, `email`, `phone`, `adresse`, `reseaux_sociaux`) et champs éditoriaux/SEO (`description`, `body` WYSIWYG, `cover_image`, `faq`) — voir §8.1 |
| `state_organization_decree` | Décret présidentiel avec `numero` (unique), `date_publication`, `status` (`active` ou archivé) |
| `state_organization_entity_snapshot` | Snapshot d'une entité pour un décret donné. Contient `official_label`, `change_type` et la hiérarchie via `parent_snapshot_id` (FK auto-référentielle) |
| `state_organization_entity_change` | Changements détectés entre deux décrets : `change_category` (`created`, `rename`, `reparent`, `deleted`, `merge`, `split`) |

### Points clés du schéma

- **`slug` ne change jamais** — c'est le seul identifiant stable pour les URL publiques.
- **`state_organization_entity_snapshot.parent_snapshot_id`** est la **clé fiable** de hiérarchie (pas `parent_entity`). Chaque décret crée ses propres snapshots.
- **`change_type = null`** dans `state_organization_entity_snapshot` → entité de regroupement (`entite_regroupement`), exclue de `state_organization_entity_change`.
- **`code_institution`** : identifiant numérique stable pour les 3 racines (Présidence=21, Primature=22, Ministères).

---

## 3. Architecture Frontend

```
pages/etat-senegal/
├── [slug].vue                  ← fiche détail d'une entité (Présentation + structures + FAQ)  [§8]
├── institutions/
│   ├── index.vue               ← liste des institutions constitutionnelles
│   └── [slug].vue              ← fiche détail d'une institution  [§8]
└── organisation/
    ├── index.vue               ← page principale (overview + stats + explorer + recent changes)
    └── changements.vue         ← page de comparaison inter-décrets

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
├── institutions.get.ts            ← GET /api/etat-organisation/institutions
├── institutions/[slug].get.ts     ← GET /api/etat-organisation/institutions/:slug
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
  // Données de contact (depuis state_organization_entity)
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
  entity: EtatOrganisationEntity,  // inclut description, body, cover_image, faq (§8.1)
  children: EtatOrganisationEntity[],
  breadcrumb: Array<{ id, public_slug, name }>,
  history: EtatOrganisationEntityHistoryItem[]
}
```

> Les champs éditoriaux (`description`, `body`, `cover_image`, `faq`) sont ajoutés aux `fields` de la requête Directus **et** au mapping du node serveur. Cache : `etat-organisation-entity-detail-v7`.

---

### `GET /api/etat-organisation/institutions/:slug`

Détail d'une institution constitutionnelle (lecture directe de `state_organization_entity`, sans snapshot). Inclut les mêmes champs éditoriaux (§8.1). **Réponse** : `{ institution: EtatOrganisationInstitutionDetail }`. Cache : `etat-organisation-institution-detail-v2`.

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

## 8. Pages de détail d'entité (fiches publiques)

Deux pages rendent la fiche d'une entité, à partir de la **même collection** `state_organization_entity` :

| Route | Fichier | Cible |
|---|---|---|
| `/etat-senegal/:slug` | `pages/etat-senegal/[slug].vue` | Toute entité publique de l'organigramme (ministères, directions, agences, établissements…). Source : snapshot du décret actif. Layout 2 colonnes (contenu + sidebar). |
| `/etat-senegal/institutions/:slug` | `pages/etat-senegal/institutions/[slug].vue` | Institutions constitutionnelles (Présidence, Assemblée, Conseil constitutionnel…). Layout centré 1 colonne. |

> ⚠️ La Présidence et la Primature (`type_code` `presidence` / `primature`) sont accessibles **par les deux routes**.

### 8.1 Champs éditoriaux (`state_organization_entity`)

En plus des champs de contact (`email`, `phone`, `adresse`, `web_site`, `reseaux_sociaux`, `logo`), l'entité porte **4 champs éditoriaux** exploités par les fiches :

| Champ | Type Directus | Usage |
|---|---|---|
| `description` | Texte court (~200-300 car.) | Résumé : **meta description**, og/twitter, excerpt des cartes de liste, **chapô** de la fiche (uniquement si pas de `body`). |
| `body` | WYSIWYG / Rich text (HTML) | Article éditorial (rôle, missions, base légale, fonctionnement…). Porte ses **propres titres H2/H3** — jamais de H1. |
| `cover_image` | Image (paysage, ~1200×630) | **og:image** prioritaire (meilleur rendu social qu'un logo carré/transparent qui se recadre mal). **Non affichée** dans la page (social only, par défaut). |
| `faq` | Repeater → `json` | Liste `{ question, answer }` → section FAQ visible + JSON-LD `FAQPage`. |

> **Stratégie hybride** : `body`/`cover_image`/`faq` ne sont remplis que pour les **fiches phares** (institutions, grands ministères). Les milliers d'entités secondaires (directions, services) restent sur `description` seul. Ne PAS imposer le WYSIWYG partout (il resterait vide).
>
> ⚠️ Les endpoints `entities/[slug].get.ts` et `institutions/[slug].get.ts` doivent **fetcher ces champs** (sans quoi la fiche reste du « thin content » non rankable). Caches versionnés (`etat-organisation-entity-detail-v7`, `etat-organisation-institution-detail-v2`) → **bumper la version** à chaque changement de forme de réponse.

### 8.2 Logique d'affichage « Présentation »

- **Le `body` riche prime.** Quand il existe, il se suffit à lui-même (il porte ses titres) : on **n'affiche NI titre de carte « Présentation », NI le chapô** `description` → évite le **doublon de titre** et l'**intro répétée**.
- Le **chapô** (`description`) ne s'affiche que pour les entités **sans** `body`.
- **Body repliable** (UX mobile) : clampé à `max-h-64` + fondu dégradé + bouton **« Lire la suite »** dès que `body.length > 600`. Le texte complet reste **dans le HTML SSR** → SEO préservé **et** scroll borné avant le bloc « Organisation administrative ».
- Rendu via `v-html` + classes Tailwind `prose` (contenu CMS de confiance, même pattern que `personnalites/[id]/[slug].vue`).

### 8.3 Bloc « Organisation administrative » (structures rattachées)

- Sous-titre grisé discret signalant que le bloc est navigable :
  _« Explorez les services, directions, établissements publics et autres organismes rattachés. »_
- Enfants groupés par type : `entite_regroupement` en **accordéon**, établissements/sociétés en **sections virtuelles** repliables, autres types en listes groupées.

### 8.4 FAQ

Section `<details>` natifs (accordéon), placée **après** les structures rattachées (pour ne pas les repousser sur mobile). Alimente aussi le JSON-LD `FAQPage` (§12).

---

## 9. Composants UI détaillés

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

## 10. Types TypeScript centraux

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
EtatOrganisationInstitutionDetail    // institution + body, cover_image, faq
EtatOrganisationFaqItem              // { question, answer } (champ faq Repeater)
```

> `EtatOrganisationEntity` et `EtatOrganisationInstitutionDetail` incluent désormais les champs éditoriaux `description?`, `body?`, `cover_image?`, `faq?` (§8.1).

---

## 11. Import des décrets (repo [organisation-etat](https://github.com/vie-publique-senegal/organisation-etat))

### Pipeline d'import — Architecture en deux phases

```
markdown/decret_XXXX-XXX.md  +  scripts/decrees.json
        │
        ▼
Phase 1 : scripts/import-snapshots.js   (idempotent)
        │  Parsing Markdown → arbre d'entités en mémoire
        │  Détection type depuis contexte parent (##, ###, ####, bold markers)
        │  Génération slug (ONCE, immuable)
        │  Résolution/création state_organization_entity par slug / code_institution
        │  Upsert state_organization_entity_snapshot (parent_snapshot_id, code_institution niveau 2)
        │
        ▼
Phase 2 : scripts/compute-changes.js    (rejouable, recalcul intelligent)
        │  Tri des décrets par date_publication, construction des paires consécutives
        │  Suppression des entity_change orphelins (paires devenues non-consécutives)
        │  Détection created / rename / reparent / deleted par paire
        │  → state_organization_entity_change
        ▼
Directus CMS (PostgreSQL)
```

Les deux phases sont **indépendantes** et **idempotentes** : elles peuvent être rejouées sans créer de doublons. La Phase 2 peut être relancée après ajout d'un décret intercalaire sans tout réimporter.

### Configuration — `scripts/decrees.json`

Chaque décret est déclaré dans ce fichier (le tri se fait automatiquement par `date_publication`) :

```json
{
  "numero": "2026-XXXX",
  "date_publication": "2026-03-15",
  "status": "active",
  "document_url": "https://...",
  "pr": "Nom du Président",
  "pm": "Nom du Premier Ministre",
  "markdownPath": "../markdown/decret_2026-XXXX.md"
}
```

### Commandes

```bash
cd scripts

# Phase 1 — importer les nouveaux décrets (uniquement ceux non encore traités)
npm run snapshots

# Phase 1 — forcer le réimport de tous les décrets
npm run snapshots:force

# Phase 1 — simulation sans écriture
npm run snapshots -- --dry-run

# Phase 2 — calculer les changements entre décrets consécutifs
npm run changes

# Phase 2 — recalculer toutes les paires
npm run changes:force
```

### Règles slug

- Entités niveau 2 (Présidence, Primature, Ministères) : slug simple (max 100 car.).
- `entite_regroupement` : toujours qualifié par la racine — `nom-code-racine` (max 200 car.).
- Entités standard : simple si nom unique dans le décret, qualifié par la racine si doublon.

### Détection du type par contexte parent

| Contexte parent | Type assigné |
|---|---|
| Contient "Cabinet" | `cabinet` |
| Contient "Secrétariat général" | `secretariat` |
| Contient "Direction" | `direction` |
| Contient "Services" | `service` |
| Contient "Autres administrations" | `autres_administrations` |
| Titre `###` / `####` | `entite_regroupement` |
| `# Article 2` | `etablissement_public` |
| `# Article 3` | `societe_nationale` / `societe_participation_publique` |

> Les `entite_regroupement` sont **exclus** de `state_organization_entity_change` — ils ne génèrent jamais de changement détecté.

---

## 12. SEO

> Règles transverses : voir `CLAUDE.md` (§ SEO & Open Graph) et `docs/seo/`. **Toujours vérifier le HTML SSR de prod avant de conclure** (`@nuxtjs/seo` absolutise les og:image relatives et fournit des fallbacks globaux).

### 12.1 Page liste — `organisation/index.vue`

`useSeoMeta` + `useHead` : `title` « Organisation de l'État du Sénégal », `description` organigramme, `robots: index,follow`, og:title/description, canonical, JSON-LD `WebPage`. Le `BreadcrumbList` est émis **uniquement** par `<AppBreadcrumb>` (ne pas le réémettre en page).

### 12.2 Fiches de détail — `[slug].vue` & `institutions/[slug].vue`

| Élément | Mise en œuvre |
|---|---|
| **`title`** | `"{name} \| Organisation de l'État du Sénégal"` (entité) / `"{name} \| Institutions du Sénégal"` (institution). Le `titleTemplate` global ajoute `\| Vie-Publique.sn`. |
| **`description` / og** | `description` éditorial si présent, sinon phrase générée (type + tutelle + nb structures + décret). |
| **og:image** | `cover_image` **en priorité** → fallback `logo` → fallback `/nomination-3.png`. URL absolutisée (`toAbsoluteCms` = `siteUrl` + `/cms/<id>`). |
| **`canonical`** | URL propre de la fiche. |
| **JSON-LD `GovernmentOrganization`** | `name`, `description`, `url`, `inLanguage`, `areaServed: Sénégal`, + `sameAs`/`email`/`telephone`/`address`/`logo`/`image`/`parentOrganization` quand dispo. Côté entité : `subOrganization` = enfants à page publique. |
| **JSON-LD `FAQPage`** | Émis seulement si `faq` non vide. `mainEntity[]` = `Question` + `acceptedAnswer/Answer`. |
| **`key` sur chaque `<script>` ld+json** | `ld-organization`, `ld-faq` → évite le **doublon de nœud à l'hydratation** (cf. CLAUDE.md §6). |
| **`BreadcrumbList`** | Émis **uniquement** par `<AppBreadcrumb>` (source unique). **Ne PAS** ajouter de breadcrumb en page. |
| **1 seul `<h1>`** | Le nom de l'entité. Le `body` WYSIWYG ne doit contenir que des **H2/H3**. |

### 12.3 Levier « thin content »

Le principal frein au ranking de ces fiches était l'**absence de texte unique** (l'endpoint entité ne récupérait même pas `description`). Les champs `description` + `body` + `faq` (§8.1) sont la réponse : contenu rédactionnel indexable + ciblage _People Also Ask_ via `FAQPage`.

### 12.4 Vérifications SSR (avant de conclure)

```bash
# 1 seul H1
curl -s <url> | grep -o "<h1" | wc -l                 # → 1
# 1 seul BreadcrumbList, N ListItem (pas 2×N)
curl -s <url> | grep -oE '"@type":"(BreadcrumbList|ListItem)"' | sort | uniq -c
# FAQPage présent si faq rempli
curl -s <url> | grep -o '"@type":"FAQPage"'
# og:image = cover_image
curl -s <url> | grep -oE '<meta[^>]*og:image[^>]*>'
```

---

## 13. Flux de données complet (SSR)

```
Browser request /etat-senegal/organisation
        │
        ▼ (Nuxt SSR)
index.vue setup()
   ├─ useEtatOrganisation()
   │    ├─ useAsyncData('etat-organisation-overview')
   │    │       → GET /api/etat-organisation/overview
   │    │             → Directus: state_organization_decree + state_organization_entity_type + state_organization_entity + state_organization_entity_change
   │    │             → Cache MEDIUM
   │    └─ useAsyncData('etat-organisation-entities-active')
   │            → GET /api/etat-organisation/entities
   │                  → Directus: state_organization_entity_snapshot JOIN public_entity JOIN entity_type
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

## 14. Dépendances clés

| Package | Rôle |
|---|---|
| `@directus/sdk` v17 | Client CMS (`readItems`, `createDirectus`, `staticToken`) |
| `nuxt` 4 | Framework SSR, `useAsyncData`, `$fetch` |
| `@nuxt/ui` | Composants UI (`UIcon`, `UButton`, …) |
| `tailwindcss` | Styles utility-first |
| `vue` 3 | `computed`, `ref`, `inject/provide`, `watch` |
