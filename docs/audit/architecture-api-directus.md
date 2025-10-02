# Architecture API Directus - Guide de migration

## 📊 État actuel : Problèmes identifiés

### 1. Sécurité - URL Backend exposée ⚠️

- Les clés API (`CMS_API_KEY`) et URLs (`CMS_API_URL`) sont exposées côté client dans `useRuntimeConfig().public`
- Les appels fetch directs depuis les composables/stores révèlent l'URL Directus dans le navigateur
- Exemple : `composables/news/useNews.ts:34-40` expose l'URL complète

```typescript
// ❌ PROBLÈME : Exposé côté client
const config = useRuntimeConfig();
const response = await fetch(
  `${config.public.cmsApiUrl}/items/news?fields=${fields}`,
  {
    headers: {
      Authorization: `Bearer ${config.public.cmsApiKey}`,
    },
  },
);
```

### 2. Incohérence architecturale 🔀

Actuellement **3 patterns différents** coexistent :

- **fetch() direct** dans composables (`useNews.ts`, `useJournalOfficiel.ts`)
- **Pinia stores** qui font aussi du fetch (`stores/news.ts`)
- **Server API routes** (mais peu utilisées, souvent deprecated)
- **Pas de SDK Directus** utilisé dans le frontend (alors qu'il est disponible dans les scripts)

### 3. Performance - Pas de cache 📉

- Aucune stratégie de cache HTTP côté serveur
- Le store a un cache manuel basique (5 min) mais côté client uniquement
- Pas d'utilisation de `useFetch` ou `useAsyncData` qui offrent du cache automatique
- Pas de support CDN/Cloudflare optimisé

### 4. SEO - Rendu mixte 🔍

- Appels API depuis `onMounted()` = données non disponibles au SSR
- Impact négatif sur SEO et Core Web Vitals
- Contenu non indexable par les moteurs de recherche

## ✅ Architecture recommandée - Pattern unifié

### Pattern en 3 couches

```
┌─────────────────────────────┐
│     Components (.vue)       │  ← Utilise composables/stores (UI logic)
│  - Affichage                │
│  - Interactions utilisateur │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│  Composables + Stores       │  ← Appelle server routes (business logic)
│  - useNews()                │     via useFetch/useAsyncData
│  - useJournalOfficiel()     │  ← Gestion état + cache client
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│   Server Routes             │  ← Communication Directus (API gateway)
│   /server/api/directus/*    │  ← URLs/tokens cachés côté serveur
│  - Cache HTTP               │  ← Point unique de modification
│  - Validation               │
└─────────────────────────────┘
               │
┌──────────────▼──────────────┐
│      Directus CMS           │
└─────────────────────────────┘
```

### Avantages de cette architecture

| Aspect             | Avant                       | Après                              |
| ------------------ | --------------------------- | ---------------------------------- |
| **Sécurité**       | URL/token exposés au client | Cachés côté serveur uniquement     |
| **Performance**    | Pas de cache                | Cache HTTP + CDN + useFetch        |
| **SEO**            | onMounted = pas de SSR      | SSR natif avec données pré-rendues |
| **Maintenabilité** | 3 patterns différents       | Pattern unique et cohérent         |
| **DX**             | Duplication de code         | Composables réutilisables          |

## 🛠️ Plan de migration - Étapes détaillées

### Étape 1 : Installer les dépendances

```bash
npm install @directus/sdk
```

### Étape 2 : Sécuriser la configuration

#### Modifier `nuxt.config.ts`

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // ✅ PRIVÉ - côté serveur uniquement (jamais envoyé au client)
    cmsApiUrl: process.env.CMS_API_URL,
    cmsApiKey: process.env.CMS_API_KEY,

    public: {
      // Public - accessible client
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      // ❌ NE PLUS mettre cmsApiUrl/cmsApiKey ici !
    },
  },

  // Cache headers pour Cloudflare/CDN
  routeRules: {
    "/api/directus/**": {
      cache: {
        maxAge: 300, // 5 minutes
        staleMaxAge: 600, // 10 minutes (stale-while-revalidate)
      },
      swr: true,
    },
  },
});
```

### Étape 3 : Créer un helper Directus réutilisable

```typescript
// server/utils/directus.ts
import { createDirectus, rest, authentication } from "@directus/sdk";

let directusClient: any = null;

export const useDirectusClient = () => {
  if (directusClient) return directusClient;

  const config = useRuntimeConfig();

  directusClient = createDirectus(config.cmsApiUrl)
    .with(rest())
    .with(authentication("json", { credentials: "include" }));

  return directusClient;
};
```

### Étape 4 : Créer les Server Routes (API Gateway)

#### Route pour les actualités

```typescript
// server/api/directus/news.get.ts
import { readItems } from "@directus/sdk";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();

  try {
    const client = useDirectusClient();

    // Construction des filtres
    const filters: any = {
      status: { _eq: "published" },
    };

    if (query.featured === "true") {
      filters.featured = { _eq: true };
    }

    if (query.category) {
      filters["category.slug"] = { _eq: query.category };
    }

    // Appel Directus avec SDK
    const items = await client.request(
      readItems("news", {
        fields: [
          "id",
          "title",
          "slug",
          "date_published",
          "cover_image",
          "tags",
          "featured",
          "category.slug",
          "category.name",
        ],
        filter: filters,
        sort: ["-date_published"],
        limit: query.limit ? Number(query.limit) : 500,
      }),
    );

    return items;
  } catch (error) {
    console.error("Erreur lors de la récupération des news:", error);
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des actualités",
    });
  }
});
```

#### Route pour un article spécifique

```typescript
// server/api/directus/news/[id].get.ts
import { readItem } from "@directus/sdk";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID manquant",
    });
  }

  try {
    const client = useDirectusClient();

    const item = await client.request(
      readItem("news", id, {
        fields: [
          "id",
          "title",
          "slug",
          "content",
          "date_published",
          "cover_image",
          "tags",
          "document.file",
        ],
      }),
    );

    return item;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'article ${id}:`, error);
    throw createError({
      statusCode: 404,
      message: "Article non trouvé",
    });
  }
});
```

#### Route pour les documents/Journal Officiel

```typescript
// server/api/directus/documents.get.ts
import { readItems, aggregate } from "@directus/sdk";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  try {
    const client = useDirectusClient();

    // Construction des filtres
    const filters: any = {
      status: { _eq: "published" },
      type: { _eq: "official_journal" },
    };

    if (query.search) {
      filters._or = [
        { title: { _contains: query.search } },
        { description: { _contains: query.search } },
      ];
    }

    if (query.year && query.year !== "all") {
      filters["year(publish_date)"] = { _eq: Number(query.year) };
    }

    // Récupérer le total
    const totalResult = await client.request(
      aggregate("documents", {
        aggregate: { countDistinct: ["id"] },
        query: { filter: filters },
      }),
    );

    const total = totalResult[0]?.countDistinct?.id || 0;

    // Récupérer les documents paginés
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const items = await client.request(
      readItems("documents", {
        filter: filters,
        sort: ["-publish_date"],
        limit: limit,
        offset: (page - 1) * limit,
      }),
    );

    return {
      data: items,
      total,
      page,
      limit,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des documents",
    });
  }
});
```

#### Route pour les votes

```typescript
// server/api/directus/votes.get.ts
import { readItems } from "@directus/sdk";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  if (!query.deputy_id) {
    throw createError({
      statusCode: 400,
      message: "deputy_id requis",
    });
  }

  try {
    const client = useDirectusClient();

    const items = await client.request(
      readItems("votes", {
        filter: {
          deputy_id: { _eq: Number(query.deputy_id) },
        },
        fields: ["*", "motion.*"],
      }),
    );

    return items;
  } catch (error) {
    console.error("Erreur lors de la récupération des votes:", error);
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la récupération des votes",
    });
  }
});
```

### Étape 5 : Migrer les composables

#### Nouveau composable useNews

```typescript
// composables/useNews.ts
export const useNews = (options?: {
  category?: string;
  featured?: boolean;
  limit?: number;
}) => {
  // Construire les query params
  const queryParams = computed(() => ({
    ...(options?.category && { category: options.category }),
    ...(options?.featured && { featured: "true" }),
    ...(options?.limit && { limit: options.limit.toString() }),
  }));

  // useFetch avec cache automatique + SSR
  const {
    data: news,
    pending: loading,
    error,
    refresh,
  } = useFetch("/api/directus/news", {
    query: queryParams,
    // Cache key unique pour éviter les collisions
    key: `news-${JSON.stringify(queryParams.value)}`,
    // Transform pour gérer les null
    transform: (data) => data || [],
    // Cache côté client (5 minutes)
    getCachedData: (key) => {
      const nuxtApp = useNuxtApp();
      const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      if (!data) return;

      // Vérifier si les données sont expirées
      const expirationDate = new Date(data.fetchedAt || Date.now());
      expirationDate.setTime(expirationDate.getTime() + 5 * 60 * 1000); // 5 min
      const isExpired = expirationDate.getTime() < Date.now();

      return isExpired ? undefined : data;
    },
  });

  return {
    news: computed(() => news.value || []),
    loading,
    error,
    refresh,
  };
};

// Fonction pour récupérer un article par ID
export const useNewsById = (id: MaybeRef<string>) => {
  const newsId = computed(() => unref(id));

  const {
    data: article,
    pending: loading,
    error,
    refresh,
  } = useFetch(() => `/api/directus/news/${newsId.value}`, {
    key: `news-${newsId.value}`,
    // Ne pas faire l'appel si pas d'ID
    immediate: computed(() => !!newsId.value),
  });

  return {
    article,
    loading,
    error,
    refresh,
  };
};
```

#### Nouveau composable useJournalOfficiel

```typescript
// composables/useJournalOfficiel.ts
export const useJournalOfficiel = (options?: {
  page?: Ref<number>;
  limit?: Ref<number>;
  search?: Ref<string>;
  year?: Ref<string>;
}) => {
  const page = options?.page || ref(1);
  const limit = options?.limit || ref(10);
  const search = options?.search || ref("");
  const year = options?.year || ref("all");

  // Query params reactifs
  const queryParams = computed(() => ({
    page: page.value.toString(),
    limit: limit.value.toString(),
    ...(search.value && { search: search.value }),
    ...(year.value !== "all" && { year: year.value }),
  }));

  // Fetch avec useFetch
  const {
    data,
    pending: loading,
    error,
    refresh,
  } = useFetch("/api/directus/documents", {
    query: queryParams,
    key: `documents-${JSON.stringify(queryParams.value)}`,
    // Cache 5 minutes
    getCachedData: (key) => {
      const nuxtApp = useNuxtApp();
      const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      if (!cached) return;

      const expirationDate = new Date(cached.fetchedAt || Date.now());
      expirationDate.setTime(expirationDate.getTime() + 5 * 60 * 1000);
      return expirationDate.getTime() > Date.now() ? cached : undefined;
    },
  });

  // Computed properties
  const documents = computed(() => data.value?.data || []);
  const total = computed(() => data.value?.total || 0);
  const totalPages = computed(() => Math.ceil(total.value / limit.value));

  // Actions
  const updateSearch = (query: string) => {
    search.value = query;
    page.value = 1; // Reset à la page 1
  };

  const updateYear = (selectedYear: string) => {
    year.value = selectedYear;
    page.value = 1;
  };

  const updatePage = (newPage: number) => {
    page.value = newPage;
  };

  const resetFilters = () => {
    search.value = "";
    year.value = "all";
    page.value = 1;
  };

  return {
    documents,
    loading,
    error,
    total,
    totalPages,
    page,
    limit,
    search,
    year,
    updateSearch,
    updateYear,
    updatePage,
    resetFilters,
    refresh,
  };
};
```

#### Nouveau composable useVote

```typescript
// composables/parliament/useVote.ts
export const useVote = (deputyId: MaybeRef<number | undefined>) => {
  const id = computed(() => unref(deputyId));

  const {
    data: votes,
    pending: loading,
    error,
  } = useFetch("/api/directus/votes", {
    query: computed(() => ({
      deputy_id: id.value?.toString() || "",
    })),
    key: computed(() => `votes-deputy-${id.value}`),
    // Ne fetch que si on a un ID
    immediate: computed(() => !!id.value),
    transform: (data) => data || [],
  });

  return {
    votes: computed(() => votes.value || []),
    loading,
    error,
  };
};
```

### Étape 6 : Adapter les composants

#### Avant (avec onMounted)

```vue
<!-- ❌ ANCIEN - components/HomeNews.vue -->
<script setup lang="ts">
import { useNewsStore } from "~/stores/news";

const store = useNewsStore();

// Problème: onMounted = pas de SSR
onMounted(async () => {
  await store.fetchNews({ featured: true });
});
</script>

<template>
  <div v-if="store.loading">Loading...</div>
  <div v-else>
    <UCard v-for="article in store.featuredNews?.slice(0, 3)" :key="article.id">
      <!-- ... -->
    </UCard>
  </div>
</template>
```

#### Après (avec useFetch - SSR ready)

```vue
<!-- ✅ NOUVEAU - components/HomeNews.vue -->
<script setup lang="ts">
// Appel immédiat, données disponibles en SSR
const { news, loading, error } = useNews({
  featured: true,
  limit: 6,
});

const featuredNews = computed(() => news.value?.slice(0, 3) || []);

const formatNewsUrl = (article: any) => {
  if (!article) return "/actualites";

  const id = article.id;
  const slug = article.slug || "actualite";
  const categorySlug = article.category?.slug;

  if (categorySlug === "conseil-des-ministres") {
    return `/conseil-des-ministres/${id}/${slug}`;
  }

  if (categorySlug === "assemblee-nationale") {
    return `/assemblee-nationale/actualites/${id}/${slug}`;
  }

  return `/actualites/${id}/${slug}`;
};
</script>

<template>
  <div class="my-4">
    <div class="prose prose-sm sm:prose mx-auto my-4">
      <h2 class="text-center text-gray-800">À la une</h2>
    </div>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div v-for="n in 3" :key="n" class="animate-pulse">
        <div class="relative w-full">
          <div class="aspect-[16/9] rounded-t-lg bg-gray-200"></div>
        </div>
        <div class="mt-4 h-4 w-3/4 rounded bg-gray-200"></div>
        <div class="mt-2 h-3 w-1/4 rounded bg-gray-200"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="p-4 text-red-600">
      Une erreur est survenue lors du chargement des actualités.
    </div>

    <!-- Success state -->
    <div v-else>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <UCard
          v-for="article in featuredNews"
          :key="article.id"
          class="custom-shadow cursor-pointer"
        >
          <NuxtLink
            :to="formatNewsUrl(article)"
            class="flex flex-row sm:flex-col"
          >
            <div class="mb-0 mr-4 w-1/3 sm:mb-4 sm:mr-0 sm:w-full">
              <NuxtImg
                :src="
                  article.cover_image
                    ? $directusImageUrl(article.cover_image, '50')
                    : '/default-image-2.gif'
                "
                :alt="article.title || 'Image actualité'"
                class="h-20 w-full object-cover sm:h-48"
                loading="lazy"
                fetchpriority="high"
                sizes="300px"
                :placeholder="[300, 300]"
              />
            </div>
            <div class="flex-1">
              <p class="line-clamp-2 text-sm font-semibold sm:text-base">
                {{ article.title }}
              </p>
              <div v-if="article.date_published" class="text-sm text-gray-800">
                {{ $dateformatWithDayName(article.date_published) }}
              </div>
            </div>
          </NuxtLink>
        </UCard>
      </div>
      <div class="mt-4 text-center">
        <NuxtLink
          to="/actualites"
          class="inline-flex items-center gap-2 text-sm font-medium text-green-700 underline"
        >
          Voir toutes les actualités
          <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
```

### Étape 7 : Adapter les Stores Pinia (optionnel)

Les stores peuvent être conservés pour la gestion d'état UI (filtres, pagination), mais délèguent les appels API aux composables.

```typescript
// stores/journalOfficiel.ts - Version simplifiée
import { defineStore } from "pinia";

export const useJournalOfficielStore = defineStore("journalOfficiel", () => {
  // State (uniquement UI state)
  const searchQuery = ref("");
  const selectedYear = ref("all");
  const currentPage = ref(1);
  const itemsPerPage = ref(10);

  // Actions
  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    currentPage.value = 1; // Reset page
  };

  const setSelectedYear = (year: string) => {
    selectedYear.value = year;
    currentPage.value = 1;
  };

  const setCurrentPage = (page: number) => {
    currentPage.value = page;
  };

  const resetFilters = () => {
    searchQuery.value = "";
    selectedYear.value = "all";
    currentPage.value = 1;
  };

  return {
    searchQuery,
    selectedYear,
    currentPage,
    itemsPerPage,
    setSearchQuery,
    setSelectedYear,
    setCurrentPage,
    resetFilters,
  };
});
```

Usage dans un composant :

```vue
<script setup lang="ts">
const store = useJournalOfficielStore();

// Le composable utilise les valeurs du store
const { documents, loading, error, total, totalPages } = useJournalOfficiel({
  page: computed(() => store.currentPage),
  limit: computed(() => store.itemsPerPage),
  search: computed(() => store.searchQuery),
  year: computed(() => store.selectedYear),
});
</script>
```

## 📝 Checklist de migration complète

### Phase 1 : Sécurité (Priorité HAUTE) 🔒

- [ ] Installer `@directus/sdk` : `npm install @directus/sdk`
- [ ] Déplacer `cmsApiUrl` et `cmsApiKey` de `runtimeConfig.public` vers `runtimeConfig` (privé)
- [ ] Créer `server/utils/directus.ts` avec le helper
- [ ] Tester que les variables ne sont plus accessibles côté client

### Phase 2 : Server Routes (Priorité HAUTE) 🛣️

- [ ] Créer `server/api/directus/news.get.ts`
- [ ] Créer `server/api/directus/news/[id].get.ts`
- [ ] Créer `server/api/directus/documents.get.ts`
- [ ] Créer `server/api/directus/votes.get.ts`
- [ ] Ajouter les `routeRules` pour le cache dans `nuxt.config.ts`
- [ ] Tester toutes les routes avec Postman/curl

### Phase 3 : Composables (Priorité MOYENNE) 🔧

- [ ] Migrer `composables/news/useNews.ts`
- [ ] Migrer `composables/useJournalOfficiel.ts`
- [ ] Migrer `composables/parliament/useVote.ts`
- [ ] Créer les autres composables nécessaires
- [ ] Supprimer les anciens fichiers commentés

### Phase 4 : Composants (Priorité MOYENNE) 🎨

- [ ] Adapter `components/HomeNews.vue`
- [ ] Adapter `components/HomeLatestDocuments.vue`
- [ ] Adapter `components/Assembly/AssemblyDeputyQuestion.vue`
- [ ] Adapter tous les composants utilisant les anciens composables
- [ ] Tester le rendu SSR (View Source doit contenir les données)

### Phase 5 : Stores (Priorité BASSE) 🗄️

- [ ] Simplifier `stores/news.ts` (uniquement UI state)
- [ ] Simplifier `stores/journalOfficiel.ts`
- [ ] Ou supprimer les stores si non nécessaires
- [ ] Mettre à jour les imports dans les composants

### Phase 6 : Nettoyage (Priorité BASSE) 🧹

- [ ] Supprimer `server/api/journaux-officiels.ts` (deprecated)
- [ ] Supprimer `server/api/nominations.ts` (deprecated)
- [ ] Supprimer les anciens composables commentés
- [ ] Mettre à jour la documentation
- [ ] Vérifier qu'aucune référence à `config.public.cmsApiUrl` ne reste

### Phase 7 : Tests & Validation (Priorité HAUTE) ✅

- [ ] Tester le SSR (données dans le HTML source)
- [ ] Tester le cache HTTP (headers `Cache-Control`)
- [ ] Vérifier que l'URL Directus n'apparaît pas dans le navigateur
- [ ] Tester les performances (Lighthouse)
- [ ] Tester sur mobile
- [ ] Déployer en staging

## 🚀 Commandes utiles

### Vérifier que les secrets ne sont pas exposés

```bash
# Rechercher les utilisations de config.public.cms
grep -r "config.public.cms" --include="*.ts" --include="*.vue" composables/ components/ pages/
```

### Tester le SSR

```bash
# Build en mode production
npm run build

# Démarrer le serveur
npm run start

# Vérifier le HTML source (doit contenir les données)
curl http://localhost:3000 | grep "titre-article"
```

### Tester le cache

```bash
# Vérifier les headers de cache
curl -I http://localhost:3000/api/directus/news

# Devrait retourner :
# Cache-Control: public, max-age=300, s-maxage=300
```

## 📚 Ressources

- [Nuxt useFetch](https://nuxt.com/docs/api/composables/use-fetch)
- [Directus SDK](https://docs.directus.io/guides/sdk/getting-started.html)
- [Nuxt Runtime Config](https://nuxt.com/docs/guide/going-further/runtime-config)
- [Nuxt Route Rules](https://nuxt.com/docs/guide/concepts/rendering#route-rules)

## ❓ FAQ

### Dois-je tout migrer d'un coup ?

Non, migration progressive recommandée :

1. D'abord sécuriser (runtimeConfig)
2. Créer les server routes
3. Migrer composable par composable
4. Tester entre chaque étape

### Que faire des stores Pinia existants ?

Deux options :

- **Option 1** : Les simplifier (uniquement UI state, pas d'appels API)
- **Option 2** : Les supprimer si le state local suffit

### Comment gérer l'authentification Directus ?

Si vous avez besoin d'auth utilisateur :

```typescript
// server/utils/directus.ts
import { authentication } from "@directus/sdk";

export const useDirectusClient = () => {
  return createDirectus(config.cmsApiUrl)
    .with(rest())
    .with(authentication("json"));
};

// Dans une route API
const client = useDirectusClient();
await client.login(email, password);
```

### Le cache fonctionne-t-il avec Cloudflare ?

Oui, avec les `routeRules` configurées, Cloudflare respectera les headers de cache automatiquement.

### Comment invalider le cache ?

```typescript
// Dans un composant
const { refresh } = useNews({ featured: true });

// Forcer le rechargement
await refresh();
```

Ou côté serveur avec Nuxt Hooks pour invalider après une mutation.

---

**Date de création** : 2025-10-02
**Dernière mise à jour** : 2025-10-02
**Auteur** : Architecture Team
