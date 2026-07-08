# Analyse et Plan de Refactorisation - Section Documents

> Date : 2026-03-04
> Statut : Proposition

## Table des matières

- [1. Etat des lieux](#1-etat-des-lieux)
- [2. Problemes identifies](#2-problemes-identifies)
- [3. Plan d'action](#3-plan-daction)
- [4. Details techniques](#4-details-techniques)
- [5. Impact SEO](#5-impact-seo)
- [6. Checklist de migration](#6-checklist-de-migration)

---

## 1. Etat des lieux

### Pages actuelles

| Page | Route | Role | Filtres |
|------|-------|------|---------|
| `index.vue` | `/documents` | Landing avec 6 cartes categories | Aucun |
| `public.vue` | `/documents/public` | Tous les documents, filtres avances | Type, annee, famille, institution, recherche |
| `journal-officiel.vue` | `/documents/journal-officiel` | Journal officiel | Annee |
| `rapports-audit.vue` | `/documents/rapports-audit` | Rapports d'audit | Institution (OFNAC, Cour des Comptes, etc.) |
| `strategies.vue` | `/documents/strategies` | Documents strategiques | Recherche |
| `codes.vue` | `/documents/codes` | Codes et constitution | Recherche |
| `budget.vue` | `/documents/budget` | Documents budgetaires | Recherche |
| `[id]/[slug].vue` | `/documents/:id/:slug` | Page detail | - |

### Composables

| Fichier | Role |
|---------|------|
| `useDocuments.ts` | Composable principal (liste + detail, filtres, pagination, sync URL) |
| `useAvailableYears.ts` | Annees disponibles avec compteurs |
| `useAvailableTypes.ts` | Types disponibles avec compteurs |
| `useAvailableDocumentFamilies.ts` | Familles de documents |
| `useVpDocuments.ts` | Collection VP documents (separee) |

### Composants

| Fichier | Role |
|---------|------|
| `HomeFeaturedDocuments.vue` | Documents mis en avant (home) |
| `HomeLatestDocuments.vue` | Derniers documents (home) |
| `elections/dashboard/DocumentsTab.vue` | Documents election (dashboard) |

### Endpoints API

| Route | Cache | Role |
|-------|-------|------|
| `GET /api/documents` | 5 min | Liste avec pagination et filtres |
| `GET /api/documents/[id]` | 1 h | Detail d'un document |
| `GET /api/documents/families` | 5 min | Familles avec compteurs |
| `GET /api/documents/types` | 5 min | Types avec compteurs |
| `GET /api/documents/years` | 5 min | Annees avec compteurs |
| `GET /api/documents/featured` | 5 min | Documents mis en avant |
| `GET /api/vp-documents` | 15 min | Collection VP separee |

---

## 2. Problemes identifies

### 2.1 Duplication de code (CRITIQUE)

Les 5 pages categories (`journal-officiel`, `rapports-audit`, `strategies`, `codes`, `budget`) sont **essentiellement la meme page** avec des filtres pre-configures differents.

| Pattern duplique | Occurrences | Fichiers concernes |
|---|---|---|
| Input de recherche (meme style/structure) | 5+ | Toutes les pages categories |
| Etats vide / erreur / loading | 5+ | Toutes les pages categories |
| Pagination `UPagination` | 4+ | public, journal-officiel, rapports-audit, strategies |
| Rendu image document (CmsImage + fallback) | 3+ | public, HomeLatestDocuments, HomeFeatureDocuments |
| Select de filtre (annee, institution) | 4+ | journal-officiel, rapports-audit, public, budget |
| Logique de reset des filtres | 3 | journal-officiel, rapports-audit, public |

**Estimation : ~500+ lignes de code dupliquees.**

La page `public.vue` fait deja tout ce que les pages categories font individuellement.

### 2.2 SEO (INCOHERENT)

| Page | useSeoMeta | OG Tags | Twitter Card | Schema.org | Canonical |
|------|------------|---------|--------------|------------|-----------|
| index.vue | Non | Non | Non | Non | Non |
| journal-officiel.vue | Non | Non | Non | Non | Non |
| rapports-audit.vue | Non | Non | Non | Non | Non |
| strategies.vue | Oui | Oui | Oui | Non | Non |
| codes.vue | Oui | Oui | Oui | Non | Non |
| public.vue | Oui (dynamique) | Oui | Oui | Non | Non |
| [id]/[slug].vue | Oui | Oui | Oui | Oui (Article + Breadcrumb) | Oui |

**Problemes :**

- 3 pages sans Open Graph ni Twitter Card = mauvais partage sur les reseaux sociaux
- Aucune page liste n'a de Schema.org (`CollectionPage` / `ItemList`)
- Pas de canonical URL sur les pages listes = risque de duplicate content avec les filtres en query params
- La page detail est excellente, mais les pages listes sont en retard

### 2.3 Performance

**Correct :**
- Cache API en 3 niveaux (5 min listes, 1 h detail, 15 min VP docs)
- Lazy loading images via `CmsImage`
- `ClientOnly` pour le PDF viewer

**A ameliorer :**
- Chaque page categorie fait ses propres appels API au mount, sans pre-fetch depuis la page index
- Les endpoints d'agregation (`/years`, `/types`, `/families`) sont appeles separement sans coordination
- Pas de skeleton loading unifie

---

## 3. Plan d'action

### Phase 1 : Extraction des composants partages

Creer des composants reutilisables pour eliminer la duplication :

```
app/components/documents/
  ├── DocumentSearchInput.vue    # Input de recherche unifie
  ├── DocumentCard.vue           # Carte document (image + fallback + meta)
  ├── DocumentPagination.vue     # Wrapper UPagination configure
  ├── DocumentEmptyState.vue     # Etat vide unifie
  ├── DocumentErrorState.vue     # Etat erreur unifie
  └── DocumentListSeo.vue        # Meta SEO pour pages listes (renderless)
```

### Phase 2 : Fusion des pages categories en page generique

Remplacer les 5 pages categories par une seule page dynamique `[category].vue`.

**Structure avant / apres :**

```
AVANT :                              APRES :
pages/documents/                     pages/documents/
├── index.vue                        ├── index.vue          (inchange)
├── public.vue                       ├── public.vue         (inchange)
├── journal-officiel.vue  ─┐         ├── [category].vue     (NOUVEAU)
├── rapports-audit.vue    ─┤         └── [id]/[slug].vue    (inchange)
├── strategies.vue        ─┤
├── codes.vue             ─┘
├── budget.vue            ─┘
└── [id]/[slug].vue
```

**Configuration par categorie :**

```typescript
// Mapping category slug → configuration
const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  'journal-officiel': {
    type: 'official_journal',
    title: 'Journal Officiel du Senegal',
    description: 'Consultez les publications du Journal Officiel...',
    ogImage: '/images/og-journal-officiel.webp',
    filters: ['year', 'search'],
  },
  'rapports-audit': {
    type: 'audit_report',
    title: 'Rapports publics Senegal - OFNAC, Cour des Comptes',
    description: 'Accdez aux rapports d\'audit publics...',
    ogImage: '/images/og-rapports-audit.webp',
    filters: ['audit_institution', 'search'],
  },
  'strategies': {
    type: 'strategy',
    title: 'Documents strategiques du Senegal',
    description: 'Plans et strategies nationales...',
    ogImage: '/images/og-strategies.webp',
    filters: ['search'],
  },
  'codes': {
    type: 'code',
    title: 'Codes et Constitution du Senegal',
    description: 'Codes juridiques et textes constitutionnels...',
    ogImage: '/images/og-codes.webp',
    filters: ['search'],
  },
  'budget': {
    type: 'budget',
    title: 'Documents budgetaires du Senegal',
    description: 'Lois de finances et documents budgetaires...',
    ogImage: '/images/og-budget.webp',
    filters: ['year', 'search'],
  },
}
```

### Phase 3 : Uniformisation SEO

Appliquer a toutes les pages listes :

1. **`useSeoMeta()` complet** avec OG + Twitter Card
2. **Canonical URL** pour eviter le duplicate content avec les query params
3. **Schema.org `CollectionPage`** avec `ItemList` pour les pages listes
4. **Titres dynamiques** selon les filtres actifs (comme `public.vue` le fait deja)

Exemple de composable SEO pour les listes :

```typescript
// composables/useDocumentListSeo.ts
export function useDocumentListSeo(options: {
  title: string
  description: string
  ogImage: string
  canonicalPath: string
  filters?: { type?: string; year?: string; search?: string }
}) {
  const siteUrl = useRuntimeConfig().public.siteUrl

  const seoTitle = computed(() => {
    const parts = [options.title]
    if (options.filters?.year) parts.push(options.filters.year)
    if (options.filters?.search) parts.push(`Recherche: ${options.filters.search}`)
    return parts.join(' | ')
  })

  useSeoMeta({
    title: () => seoTitle.value,
    description: options.description,
    ogTitle: () => seoTitle.value,
    ogDescription: options.description,
    ogImage: `${siteUrl}${options.ogImage}`,
    ogUrl: `${siteUrl}${options.canonicalPath}`,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: () => seoTitle.value,
    twitterDescription: options.description,
  })

  useHead({
    link: [{ rel: 'canonical', href: `${siteUrl}${options.canonicalPath}` }],
    script: [{
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: options.title,
        description: options.description,
        url: `${siteUrl}${options.canonicalPath}`,
      }),
    }],
  })
}
```

### Phase 4 : Redirections

Mettre en place des redirections 301 pour preserver le SEO existant :

```typescript
// server/middleware/documents-redirects.ts
// Rediriger les anciennes URLs vers les nouvelles si les slugs changent
// /documents/journal-officiel → /documents/journal-officiel (meme slug = pas de redirect)
```

Dans ce cas, les slugs sont conserves via `[category].vue`, donc **pas de redirections necessaires**. Les URLs restent identiques.

---

## 4. Details techniques

### 4.1 Page `[category].vue` - Structure

```vue
<script setup lang="ts">
const route = useRoute()
const category = route.params.category as string

// Validation : 404 si categorie inconnue
const config = CATEGORY_CONFIG[category]
if (!config) {
  throw createError({ statusCode: 404, statusMessage: 'Categorie non trouvee' })
}

// Composable documents avec type pre-configure
const { documents, loading, error, pagination, searchQuery, ... } = useDocuments({
  type: config.type,
})

// Filtres conditionnels selon la config
const showYearFilter = config.filters.includes('year')
const showAuditFilter = config.filters.includes('audit_institution')

// SEO
useDocumentListSeo({
  title: config.title,
  description: config.description,
  ogImage: config.ogImage,
  canonicalPath: `/documents/${category}`,
})
</script>

<template>
  <div>
    <UBreadcrumb ... />
    <h1 class="sr-only">{{ config.title }}</h1>

    <!-- Filtres conditionnels -->
    <DocumentSearchInput v-model="searchQuery" />
    <FilterSelect v-if="showYearFilter" ... />
    <FilterSelect v-if="showAuditFilter" ... />

    <!-- Liste -->
    <DocumentErrorState v-if="error" />
    <DocumentEmptyState v-else-if="!loading && documents.length === 0" />
    <div v-else class="grid ...">
      <DocumentCard v-for="doc in documents" :key="doc.id" :document="doc" />
    </div>

    <DocumentPagination ... />
  </div>
</template>
```

### 4.2 Composant `DocumentCard.vue`

Unifie la logique d'affichage image (CmsImage + fallback journal officiel + fallback icone) :

```vue
<script setup lang="ts">
interface Props {
  document: Document
  showDescription?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showDescription: false,
})

const hasImage = computed(() => !!props.document.cover_image)
const isJournalOfficiel = computed(() => props.document.type === 'official_journal')
</script>

<template>
  <NuxtLink :to="`/documents/${document.id}/${document.slug}`">
    <UCard>
      <template #header>
        <CmsImage v-if="hasImage" :image="document.cover_image" :quality="25" />
        <img v-else-if="isJournalOfficiel" src="/images/default-journal-officiel.webp" />
        <UIcon v-else name="i-heroicons-document-text" />
      </template>
      <p class="font-semibold line-clamp-2">{{ document.title }}</p>
      <p v-if="showDescription" class="text-sm text-gray-500 line-clamp-2">
        {{ document.description }}
      </p>
    </UCard>
  </NuxtLink>
</template>
```

---

## 5. Impact SEO

### Risques

| Risque | Mitigation |
|--------|------------|
| Perte de positionnement | URLs identiques conservees (memes slugs de route) |
| Duplicate content filtres | Ajout de canonical URLs sur toutes les pages |
| Perte de meta social | Uniformisation OG + Twitter Card |

### Gains attendus

| Amelioration | Impact |
|-------------|--------|
| OG + Twitter Card sur toutes les pages | Meilleur partage social |
| Schema.org CollectionPage | Rich snippets potentiels |
| Canonical URLs | Elimination du duplicate content |
| Titres dynamiques selon filtres | Meilleur CTR dans les SERPs |
| Coherence des meta | Signal de qualite pour les moteurs |

---

## 6. Checklist de migration

### Preparation

- [ ] Lire et comprendre le code actuel de chaque page categorie
- [ ] Identifier les specificites de chaque page (layouts, filtres, styles)
- [ ] Verifier les URLs actuelles indexees (Google Search Console)

### Phase 1 - Composants partages

- [ ] Creer `DocumentSearchInput.vue`
- [ ] Creer `DocumentCard.vue`
- [ ] Creer `DocumentPagination.vue`
- [ ] Creer `DocumentEmptyState.vue`
- [ ] Creer `DocumentErrorState.vue`
- [ ] Creer composable `useDocumentListSeo.ts`
- [ ] Tester chaque composant individuellement

### Phase 2 - Page generique

- [ ] Creer la config `CATEGORY_CONFIG` (type, titre, description, filtres)
- [ ] Creer `[category].vue` avec rendu conditionnel des filtres
- [ ] Verifier le rendu pour chaque categorie
- [ ] Comparer visuellement avec les pages actuelles
- [ ] Supprimer les 5 pages categories obsoletes

### Phase 3 - SEO

- [ ] Ajouter `useSeoMeta` complet sur `index.vue`
- [ ] Ajouter Schema.org `CollectionPage` sur les pages listes
- [ ] Ajouter canonical URLs sur toutes les pages listes
- [ ] Verifier les meta avec un outil (og:image debugger, Twitter Card validator)

### Phase 4 - Validation

- [ ] `npm run lint:fix && npm run format`
- [ ] `npm run build` sans erreur
- [ ] Tester la navigation complete (index → categorie → detail → retour)
- [ ] Verifier le SSR (meta visibles dans le source HTML)
- [ ] Verifier que les URLs existantes fonctionnent toujours
- [ ] Tester le partage social (OG preview)
