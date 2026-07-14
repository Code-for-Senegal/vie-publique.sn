# Guidelines : Architecture des appels API dans Nuxt

> **Guide complet pour ajouter de nouvelles pages avec collections Directus**

## 📁 Structure du projet

**IMPORTANT** : Ce projet utilise la structure Nuxt avec dossier `app/`

```
vie-publique.sn/
├── app/                          ⚠️ Tout le code frontend est ici
│   ├── components/              ✅ Composants Vue
│   ├── composables/             ✅ Composables (useDocuments, useNews, etc.)
│   ├── pages/                   ✅ Pages Vue Router
│   └── ...
├── server/                      ✅ Code backend (pas dans app/)
│   ├── api/                    ✅ Routes API
│   ├── utils/                  ✅ Utilitaires serveur (cms-client.ts, etc.)
│   └── ...
├── composables/                ❌ NE PAS UTILISER (à la racine)
├── components/                 ❌ NE PAS UTILISER (à la racine)
└── pages/                      ❌ NE PAS UTILISER (à la racine)
```

**⚠️ Toujours créer les fichiers dans `app/` et non à la racine** :
- ✅ `app/composables/useBudget.ts`
- ❌ `composables/useBudget.ts`

---

## 🎯 Objectifs de l'architecture

✅ **Sécurité** : Credentials côté serveur uniquement
✅ **Performance** : SSR + cache Nitro + useFetch
✅ **SEO** : URL params pour filtres/recherche
✅ **Maintenabilité** : Code DRY (Don't Repeat Yourself)
✅ **Réutilisabilité** : Composables génériques

---

## ⚠️ RÈGLE D'OR : JAMAIS `onMounted` pour les données critiques

**Problème** : `onMounted()` ne s'exécute **QUE** côté client (navigateur), **JAMAIS** côté serveur.

```typescript
// ❌ INTERDIT - Données INVISIBLES pour Google, robots SEO, partage social
onMounted(async () => {
  const data = await $fetch('/api/documents');
  documents.value = data;
});
```

**Conséquences** :
- 🔴 **SEO = 0/100** : Google ne voit rien (HTML initial vide)
- 🔴 **Pas d'aperçu social** : WhatsApp/Twitter/Facebook affichent une page vide
- 🔴 **Performance dégradée** : Délai de ~2s avant affichage (client fetch)
- 🔴 **Pas de SSR** : Perte totale des avantages de Nuxt

```typescript
// ✅ OBLIGATOIRE - Utiliser useFetch (SSR-friendly)
const { data: documents } = await useFetch('/api/documents');

// ✅ MIEUX - Via composable métier (recommandé)
const { documents, loading } = useDocuments();
```

**Avantages** :
- ✅ **SEO = 100/100** : Données dans le HTML initial
- ✅ **Aperçu social parfait** : Titre + description + image
- ✅ **Performance optimale** : ~500ms (SSR)
- ✅ **SSR complet** : Toute la puissance de Nuxt

**Quand utiliser `onMounted` ?** :
- ✅ Interactions client uniquement (event listeners, animations)
- ✅ Code qui nécessite le DOM (ex: `document.getElementById`)
- ✅ Code qui ne peut PAS tourner sur le serveur (ex: `window`, `localStorage`)
- ❌ **JAMAIS** pour des données destinées au SEO/contenu

---

## 🏗️ Architecture en couches

```
┌─────────────────────────────────────────────────────────┐
│  Pages Vue (.vue)                                       │
│  → Présentation UI uniquement                          │
│  → Pas de logique métier                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Composables métier (useDocuments, useNews)            │
│  → Logique spécifique à la collection                  │
│  → Construction des filtres métier                      │
│  → Délègue l'état UI et le fetch                       │
└──────────────┬────────────────────┬─────────────────────┘
               │                    │
               ▼                    ▼
┌──────────────────────┐  ┌──────────────────────────────┐
│ useCollectionState   │  │ useCmsCollection             │
│ → Pagination         │  │ → useFetch + SSR             │
│ → Recherche          │  │ → Construction query params  │
│ → Filtres            │  │ → Transformation réponse     │
│ → Sync URL           │  │ → Loading/Error states       │
└──────────┬───────────┘  └────────────┬─────────────────┘
           │                           │
           │                           ▼
           │              ┌───────────────────────────────┐
           │              │ Server API Routes             │
           │              │ → SDK Directus                │
           │              │ → defineCachedEventHandler    │
           │              │ → Validation params           │
           │              └──────────┬────────────────────┘
           │                         │
           │                         ▼
           │              ┌───────────────────────────────┐
           │              │ Directus CMS                  │
           │              │ → Base de données             │
           │              └───────────────────────────────┘
           │
           └─────► URL Query Params (?page=2&search=audit)
                   → Source de vérité pour l'état UI
                   → SEO-friendly & Bookmarkable
```

---

## 📦 Composables génériques (déjà créés)

### 1. `useCmsCollection<T>` - Fetch générique

**Responsabilité** : Récupérer des données depuis une API route

```typescript
// ✅ Déjà implémenté dans composables/useCmsCollection.ts
const { items, loading, error, pagination, refresh } = useCmsCollection<Document>({
  collection: 'documents',
  id: '123', // Optionnel (pour détail)
  filters: { type: 'audit_report' },
  sort: '-publish_date',
  limit: 10,
  page: 1,
  search: 'audit'
});
```

### 2. `useCollectionState` - État UI générique

**Responsabilité** : Gérer pagination, recherche, filtres, sync URL

```typescript
// ✅ Déjà implémenté dans app/composables/useCollectionState.ts
const state = useCollectionState({
  defaultSort: '-publish_date',
  defaultItemsPerPage: 10,
  syncUrl: true, // Synchronise avec URL
  urlParamsMapping: {
    search: 'q',      // ?q=audit
    filter: 'type',   // ?type=law
    page: 'page',     // ?page=2
    sort: 'sort'      // ?sort=-date
  }
});

// Retourne
state.currentPage       // Ref<number>
state.searchQuery       // Ref<string>
state.sortBy           // Ref<string>
state.filterValue      // Ref<string>
state.setSearchQuery(query)
state.resetFilters()
state.hasActiveFilters // ComputedRef<boolean>
```

---

## 🚀 Guide : Ajouter une nouvelle collection

Suivez ces étapes pour ajouter une nouvelle collection (ex: `medias`, `nominations`, etc.)

### Étape 1 : Créer les routes API server-side

📁 `server/api/medias/index.get.ts`

```typescript
import { readItems } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || "-id";

    try {
      const directus = getCmsClient();

      // Construction des filtres
      const filter: any = { status: { _eq: "published" } };

      if (search) {
        filter._or = [
          { title: { _icontains: search } },
          { description: { _icontains: search } }
        ];
      }

      // Fetch des données
      const offset = (page - 1) * limit;
      const data = await directus.request(
        readItems("medias", {
          fields: ["id", "title", "slug", "cover_image", "date_created"],
          filter,
          limit,
          offset,
          sort: [sortBy],
        })
      );

      // Compte total pour pagination
      const totalCount = await directus.request(
        readItems("medias", {
          fields: ["id"],
          filter,
          aggregate: { count: ["id"] },
        })
      ).then((result: any) => result?.[0]?.count?.id || 0);

      return {
        medias: data, // Nom de la collection
        totalMedias: totalCount,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des médias",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "medias-list",
    getKey: (event) => `medias-${JSON.stringify(getQuery(event))}`,
  }
);
```

📁 `server/api/medias/[id].get.ts`

```typescript
import { readItem } from "@directus/sdk";
import { getDirectusClient } from "~/server/utils/directus";

export default defineCachedEventHandler(
  async (event) => {
    const id = getRouterParam(event, "id");
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: "ID manquant" });
    }

    try {
      const directus = getCmsClient();
      const data = await directus.request(
        readItem("medias", id, {
          fields: ["id", "title", "slug", "content", "cover_image", "date_created"],
        })
      );

      return { media: data };
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: "Média non trouvé",
      });
    }
  },
  {
    maxAge: 60 * 60,
    name: "media-detail",
    getKey: (event) => `media-${getRouterParam(event, "id")}`,
  }
);
```

---

### Étape 2 : Créer le composable métier

📁 `app/composables/useMedias.ts` ⚠️ **Important : dans le dossier `app/`**

```typescript
export interface Media {
  id: string;
  title: string;
  slug: string;
  cover_image?: string;
  date_created: string;
}

export interface MediasOptions {
  id?: string;
  limit?: number;
  sort?: string;
  syncUrl?: boolean;
}

export const useMedias = (options: MediasOptions = {}) => {
  // Mode détail : fetch d'un item unique
  if (options.id) {
    const collection = useCmsCollection<Media>({
      collection: "medias",
      id: options.id,
    });

    return {
      media: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,

      // États vides pour compatibilité
      medias: computed(() => []),
      currentPage: ref(1),
      searchQuery: ref(""),
      pagination: computed(() => undefined),
    };
  }

  // Mode liste : avec état UI
  const state = useCollectionState({
    defaultSort: options.sort || "-date_created",
    defaultItemsPerPage: options.limit || 10,
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: "q",
      page: "page",
      sort: "sort",
    },
  });

  // Construction des filtres métier spécifiques
  const filters = computed(() => {
    const filters: Record<string, any> = {};
    // Ajoutez ici vos filtres spécifiques
    return filters;
  });

  // Utilisation des composables génériques
  const collection = useCmsCollection<Media>({
    collection: "medias",
    filters,
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.searchQuery,
  });

  return {
    // Données
    medias: collection.items,
    media: collection.item,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États UI
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    itemsPerPage: state.itemsPerPage,

    // Méthodes
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    resetFilters: state.resetFilters,

    // Computed
    totalItems: computed(() => collection.pagination.value?.total || 0),
    totalPages: computed(() => collection.pagination.value?.totalPages || 1),
    hasActiveFilters: state.hasActiveFilters,
  };
};
```

---

### Étape 3 : Utiliser dans une page

📁 `app/pages/medias/index.vue` ⚠️ **Important : dans le dossier `app/`**

```vue
<script setup lang="ts">
const {
  medias,
  loading,
  currentPage,
  searchQuery,
  sortBy,
  totalItems,
  totalPages,
  setCurrentPage,
  setSearchQuery,
  hasActiveFilters,
  resetFilters,
} = useMedias();

// SEO
useHead({
  title: "Médias du Sénégal",
  meta: [
    { name: "description", content: "Liste des médias sénégalais" }
  ]
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1>Médias</h1>

    <!-- Barre de recherche -->
    <UInput
      v-model="searchQuery"
      placeholder="Rechercher..."
      @input="setSearchQuery($event.target.value)"
    />

    <!-- État de chargement -->
    <div v-if="loading">Chargement...</div>

    <!-- Liste des résultats -->
    <div v-else-if="medias.length > 0" class="grid gap-4">
      <UCard v-for="media in medias" :key="media.id">
        <NuxtLink :to="`/medias/${media.id}/${media.slug}`">
          <h2>{{ media.title }}</h2>
        </NuxtLink>
      </UCard>
    </div>

    <!-- Aucun résultat -->
    <div v-else>Aucun média trouvé</div>

    <!-- Pagination -->
    <UPagination
      v-if="totalPages > 1"
      v-model="currentPage"
      :total="totalItems"
      :page-count="itemsPerPage"
      @update:model-value="setCurrentPage"
    />

    <!-- Reset filtres -->
    <UButton v-if="hasActiveFilters" @click="resetFilters">
      Réinitialiser
    </UButton>
  </div>
</template>
```

📁 `app/pages/medias/[id]/[slug].vue`

```vue
<script setup lang="ts">
const route = useRoute();
const { media, loading, error } = useMedias({
  id: route.params.id as string
});

// SEO dynamique
watchEffect(() => {
  if (media.value) {
    useHead({
      title: media.value.title,
      meta: [
        { name: "description", content: media.value.title }
      ]
    });
  }
});
</script>

<template>
  <div>
    <div v-if="loading">Chargement...</div>
    <div v-else-if="error">Erreur</div>
    <div v-else-if="media">
      <h1>{{ media.title }}</h1>
      <!-- Contenu du média -->
    </div>
  </div>
</template>
```

---

---

## ✅ Checklist pour une nouvelle collection

Avant de committer votre code, vérifiez :

- [ ] **Routes API server-side** (`server/api/[collection]/`)
  - [ ] `index.get.ts` avec pagination/filtres/recherche
  - [ ] `[id].get.ts` pour le détail
  - [ ] `defineCachedEventHandler` avec maxAge approprié
  - [ ] Validation des paramètres d'entrée
  - [ ] Gestion des erreurs avec `createError`

- [ ] **Composable métier** (`composables/use[Collection].ts`)
  - [ ] Interface TypeScript pour le type
  - [ ] Support mode liste ET détail (via `options.id`)
  - [ ] Utilise `useCmsCollection` pour le fetch
  - [ ] Utilise `useCollectionState` pour l'état UI
  - [ ] Construction des filtres métier spécifiques
  - [ ] Retourne l'API complète (data, loading, error, methods)

- [ ] **Pages Vue**
  - [ ] Page liste (`pages/[collection]/index.vue`)
  - [ ] Page détail (`pages/[collection]/[id]/[slug].vue`)
  - [ ] SEO avec `useHead()` et méta tags
  - [ ] Gestion des états (loading, error, empty)
  - [ ] Pagination et filtres dans l'UI

- [ ] **Tests manuels**
  - [ ] ⚠️ **Aucun `onMounted` pour fetch** (vérifié dans le code)
  - [ ] SSR fonctionne (view-source: contient les données)
  - [ ] URL params reflètent les filtres
  - [ ] Pagination fonctionne
  - [ ] Recherche fonctionne
  - [ ] Navigation back/forward préserve les filtres
  - [ ] F5 préserve les filtres (via URL)

---

## 🏆 Bonnes pratiques

### ✅ DO (À faire)

1. **État UI dans URL**
   ```typescript
   // ✅ BON - SEO-friendly, bookmarkable
   useCollectionState({ syncUrl: true })
   // URL: /documents?page=2&search=audit&type=law
   ```

2. **Séparation des responsabilités**
   ```typescript
   // ✅ BON - Chaque composable a un rôle clair
   useCollectionState()  → État UI (pagination, recherche)
   useCmsCollection()    → Fetch data (SSR, cache)
   useDocuments()        → Logique métier (filtres spécifiques)
   ```

3. **Cache serveur agressif**
   ```typescript
   // ✅ BON - 1h de cache pour données statiques
   defineCachedEventHandler(handler, { maxAge: 60 * 60 })
   ```

4. **TypeScript strict**
   ```typescript
   // ✅ BON - Types explicites
   export interface Media {
     id: string;
     title: string;
     slug: string;
   }
   ```

5. **Gestion d'erreurs explicite**
   ```typescript
   // ✅ BON - Erreurs HTTP standard
   throw createError({
     statusCode: 404,
     statusMessage: "Document non trouvé"
   });
   ```

### ❌ DON'T (À éviter)

1. **État UI dans store Pinia**
   ```typescript
   // ❌ MAUVAIS - Perdu au F5, pas SEO-friendly
   const store = useDocumentsStore();
   store.currentPage = 2; // Pas dans URL
   ```

2. **Appels API direct depuis composants**
   ```typescript
   // ❌ MAUVAIS - Token exposé, pas de cache, pas de SSR
   const data = await $fetch('https://cms.example.com/items/documents', {
     headers: { Authorization: 'Bearer SECRET_TOKEN' }
   });
   ```

3. **Duplication de logique**
   ```typescript
   // ❌ MAUVAIS - Copier/coller entre useDocuments et useNews
   const currentPage = ref(1);
   const searchQuery = ref("");
   watch([currentPage, searchQuery], () => { /* update URL */ });
   ```

4. **Oublier le SSR - ⚠️ CRITIQUE POUR LE SEO**
   ```typescript
   // ❌ MAUVAIS - Ne fonctionne que côté client (données INVISIBLES pour Google)
   onMounted(async () => {
     documents.value = await $fetch('/api/documents');
   });
   // Problème : onMounted ne s'exécute PAS côté serveur
   // → HTML initial vide → SEO = 0/100 → Google ne voit rien

   // ✅ BON - SSR-friendly (données dans le HTML initial)
   const { data: documents } = await useFetch('/api/documents');
   // Ou via composable générique
   const { documents } = useDocuments();
   // → HTML contient les données → SEO = 100/100 → Google indexe tout
   ```

5. **Pas de cache serveur**
   ```typescript
   // ❌ MAUVAIS - Chaque requête tape Directus
   export default defineEventHandler(async (event) => {
     // Sans defineCachedEventHandler
   });
   ```

6. **Navigation avec @click au lieu de NuxtLink - ⚠️ CRITIQUE POUR LE SEO**
   ```vue
   <!-- ❌ MAUVAIS - Les robots ne peuvent PAS suivre les liens JavaScript -->
   <div @click="router.push(`/medias/${media.id}`)">
     {{ media.name }}
   </div>

   <!-- Problèmes :
        - Google ne voit PAS le lien dans le HTML
        - Pas de crawl des pages détails
        - Pas d'indexation des sous-pages
        - Pas de préchargement au hover
   -->

   <!-- ✅ BON - Lien HTML natif, crawlable par Google -->
   <NuxtLink :to="`/medias/${media.id}/${slug}`">
     {{ media.name }}
   </NuxtLink>

   <!-- Avantages :
        - Google crawle automatiquement tous les liens
        - Indexation de chaque page détail
        - SEO optimal pour chaque élément
        - Préchargement automatique au hover
        - URL visible dans le HTML source
   -->
   ```

---

## 🎯 Principe général

**Toujours faire les appels API côté serveur via les routes `server/api/`** pour maximiser la sécurité, le SEO et la performance.

## 📋 Patterns d'utilisation (legacy - pour référence)

### 1. Routes API côté serveur (OBLIGATOIRE)

Créez une route API dans `server/api/` pour chaque endpoint Directus :

```ts
// server/api/directus/articles.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  try {
    const data = await $fetch(
      `${useRuntimeConfig().directusUrl}/items/articles`,
      {
        headers: {
          Authorization: `Bearer ${useRuntimeConfig().directusToken}`,
        },
        query,
      },
    );
    return data;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la récupération des articles",
    });
  }
});
```

### 2. Configuration des variables d'environnement

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    directusToken: process.env.DIRECTUS_TOKEN, // Côté serveur uniquement
    public: {
      directusUrl: process.env.DIRECTUS_URL, // Accessible côté client
    },
  },
});
```

## 🏗️ Patterns d'utilisation

### Pattern 1 : Composable seul (données locales)

**Quand l'utiliser :**

- Données spécifiques à un composant/page
- Pas de partage d'état nécessaire
- Logique simple

```ts
// composables/useArticles.ts
export const useArticles = (options = {}) => {
  return useFetch('/api/directus/articles', {
    key: 'articles',
    default: () => [],
    transform: (data: any) => data.data || [], // Transformation des données
    ...options
  })
}

// Dans un composant
<script setup>
const { data: articles, pending, error, refresh } = await useArticles()
</script>
```

### Pattern 2 : Store seul (état global simple)

**Quand l'utiliser :**

- État global simple
- Pas de logique réutilisable ailleurs

```ts
// stores/articles.ts
export const useArticlesStore = defineStore("articles", {
  state: () => ({
    articles: [] as Article[],
    loading: false,
  }),

  actions: {
    async fetchArticles() {
      this.loading = true;
      try {
        const { data } = await $fetch("/api/directus/articles");
        this.articles = data;
      } catch (error) {
        console.error("Erreur fetch articles:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});
```

### Pattern 3 : Composable + Store

**Quand l'utiliser :**

- État global + logique réutilisable
- Transformation de données complexe
- Gestion d'erreurs centralisée

```ts
// composables/useDirectusAPI.ts
export const useDirectusAPI = () => {
  const fetchCollection = async (collection: string, params = {}) => {
    return await $fetch(`/api/directus/${collection}`, {
      query: params,
      onResponseError({ response }) {
        console.error(`Erreur API ${collection}:`, response._data);
      },
    });
  };

  return { fetchCollection };
};

// stores/content.ts
export const useContentStore = defineStore("content", {
  state: () => ({
    articles: [],
    pages: [],
    loading: false,
  }),

  actions: {
    async fetchArticles() {
      const { fetchCollection } = useDirectusAPI();
      this.loading = true;

      try {
        const response = await fetchCollection("articles", {
          fields: ["id", "title", "content", "date_created"],
          sort: ["-date_created"],
        });
        this.articles = response.data;
      } finally {
        this.loading = false;
      }
    },
  },
});
```

### Pattern 4: SDK Directus + composable + store(optionel)

- **Composant vue** -> composable
- **Composable** -> `$fetch` vers l'API route `/server/api/*`
- **API Route** -> `SDK Directus` + `defineCachedEventHandler` pour performance(mettre en cache les données)
- Le store est principalement utilisé pour stocker les données de pagination, le tri.

```ts
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    try {
      const directus = createDiretus(config.cmsApiUrl)
        .with(rest())
        .with(staticToken(config.cmsApiKey));
      const collectionData = await directus.request(
        readItems("collection", {
          fields: [
            "id",
            "name",
            // Les autres champs à récupérer
          ],
          filter: {
            // Régle de filtrage
          },
          limit: 1000, // Le nombre maximum à récupérer
          sort: ["-id"], // Pour faire le tri
        }),
      );

      // Faire une transformation des données pour faciliter son manipulation par le composable
    } catch (error) {
      throw createError({
        statusCode: 500,

        statusMessage: "Message d'erreur",
      });
    }
  },
  {
    // Configuration du cache pour optimiser les performances
    maxAge: 60 * 60, // Le temps que la cache va durer
    name: "nom-du-cache",
    getKey: () => "nom-de-la-cle",
  },
);
```

---

## 🤔 FAQ : Questions fréquentes

### Q: Pourquoi ne JAMAIS utiliser `onMounted` pour charger des données ?

**Réponse : Parce que `onMounted` ne s'exécute PAS côté serveur = SEO cassé**

**Test simple** :
```bash
# Avec onMounted
curl http://localhost:3000/documents
# Résultat : HTML vide (pas de données)

# Avec useFetch
curl http://localhost:3000/documents
# Résultat : HTML complet avec toutes les données
```

**Impact concret** :
- **Google Search** : Indexe 0 document vs 100% des documents
- **Facebook/Twitter** : Aperçu vide vs aperçu complet
- **Performance** : 2000ms vs 500ms (First Contentful Paint)

**Solution** :
```typescript
// ❌ Ne JAMAIS faire ça
onMounted(async () => {
  data.value = await $fetch('/api/...');
});

// ✅ TOUJOURS faire ça
const { data } = await useFetch('/api/...');
// Ou via composable
const { data } = useDocuments();
```

**Exception** : `onMounted` est OK pour :
- Event listeners (click, scroll)
- Animations
- Code nécessitant `window`, `document`, `localStorage`
- Code qui **ne peut pas** tourner côté serveur

---

### Q: Store Pinia ou URL params pour les filtres ?

**Réponse : URL params (via `useCollectionState`)**

**Pourquoi ?**
- ✅ **SEO** : Google indexe `/documents?search=audit&type=law`
- ✅ **Bookmarkable** : L'utilisateur peut sauvegarder l'URL avec filtres
- ✅ **Shareable** : Partager le lien = partager les résultats filtrés
- ✅ **Browser back/forward** : Navigation naturelle
- ✅ **F5 preserve state** : Rafraîchir garde les filtres

**Quand utiliser store Pinia ?**
- Préférences utilisateur (dark mode, langue)
- Auth session (token, user info)
- Panier e-commerce
- Notifications globales

### Q: `useFetch` ou `useAsyncData` ?

**Réponse : `useFetch` dans 90% des cas**

```typescript
// ✅ BON - Simple et direct
const { data } = useFetch('/api/documents', {
  query: { page: 1 }
});

// ⚠️ useAsyncData uniquement si logique complexe
const { data } = useAsyncData('key', async () => {
  const [docs, news] = await Promise.all([
    $fetch('/api/documents'),
    $fetch('/api/news')
  ]);
  return { docs, news }; // Combinaison
});
```

### Q: Où mettre la logique de filtres métier ?

**Réponse : Dans le composable métier (`useDocuments`, `useNews`)**

```typescript
// ✅ BON - Logique métier dans useDocuments
export const useDocuments = (options) => {
  const state = useCollectionState(); // État UI générique

  // Filtres spécifiques aux documents
  const filters = computed(() => {
    const f: any = {};
    if (options.type === 'audit_report') {
      f.filterType = state.filterValue.value;
    }
    return f;
  });

  return useCmsCollection({ collection: 'documents', filters });
};
```

### Q: Comment gérer des filtres custom (ex: année, catégorie) ?

**Réponse : Via `additionalFilters` ou refs locales**

```typescript
// Option 1: additionalFilters
const yearFilter = ref('2024');
const state = useCollectionState({
  additionalFilters: { year: yearFilter }
});

// Option 2: Ref locale + watch manuel
const categoryFilter = ref('conseil');
watch(categoryFilter, () => {
  router.replace({ query: { ...route.query, category: categoryFilter.value } });
});
```

### Q: Combien de temps de cache pour `defineCachedEventHandler` ?

**Réponse : Dépend de la fréquence de mise à jour**

```typescript
// Données statiques (codes, lois) → 1 jour
{ maxAge: 60 * 60 * 24 }

// Données semi-statiques (documents, rapports) → 1 heure
{ maxAge: 60 * 60 }

// Données dynamiques (actualités) → 5 minutes
{ maxAge: 60 * 5 }

// Données temps réel (notifications) → Pas de cache
// Ne pas utiliser defineCachedEventHandler
```

---

## 📚 Exemples réels dans le projet

### Documents
- Routes API : [server/api/documents/index.get.ts](../../server/api/documents/index.get.ts)
- Composable : [composables/useDocuments.ts](../../app/composables/useDocuments.ts)
- Page : [pages/documents/public.vue](../../app/pages/documents/public.vue)

### News
- Routes API : [server/api/news/index.get.ts](../../server/api/news/index.get.ts)
- Composable : [composables/news/useNews.ts](../../app/composables/news/useNews.ts)
- Page : [pages/actualites/index.vue](../../app/pages/actualites/index.vue)

### Composables génériques
- État UI : [composables/useCollectionState.ts](../../app/composables/useCollectionState.ts)
- Fetch : [composables/useCmsCollection.ts](../../app/composables/useCmsCollection.ts)

---

## 📚 Ressources

- [SDK Directus](https://directus.io/docs/guides/connect/sdk)
- [Régles de filtres](https://directus.io/docs/guides/connect/filter-rules)
- [Les paramètres de requêtes](https://directus.io/docs/guides/connect/query-parameters)
- [Nuxt Data Fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching)
- [Nuxt Server Routes](https://nuxt.com/docs/4.x/guide/directory-structure/server)
- [Pinia avec Nuxt](https://nuxt.com/docs/4.x/getting-started/state-management)
- [Google SEO - URL Structure](https://developers.google.com/search/docs/crawling-indexing/url-structure?hl=fr)
- [Options cache](https://nitro.build/guide/cache#options)
- [Cache Nitro](https://nitro.build/guide/cache)
- [Doc defineCachedEventHandler](https://nitro.build/guide/cache#cached-event-handlers)
- [Optimise API Caching: Balancing RouteRules with CacheEventHandler](https://krutiepatel.com/blog/27-optimize-api-caching-balancing-routerules-with-definecacheeventhandler)
