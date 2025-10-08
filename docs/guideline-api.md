# Guidelines : Appels API Directus dans Nuxt

## 🎯 Principe général

**Toujours faire les appels API côté serveur via les routes `server/api/`** pour maximiser la sécurité, le SEO et la performance.

## 📋 Architecture recommandée

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

### Quoi utiliser entre le store ou le query param ?
L’utilisation des query params est préférable pour le SEO. Les moteurs de recherche peuvent indexer les URLs contenant des paramètres de recherche, ce qui permet de référencer des pages de résultats spécifiques. Cela n’est pas possible si les termes de recherche sont uniquement stockés dans le store, car cette information n’est pas visible dans l’URL et donc inaccessible aux robots d’indexation.
Donc si dans des pages on doit faire des recherches sur des termes spécifiques, il est préférable d’utiliser les query params pour stocker ces termes et de les récupérer dans le composable.

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
