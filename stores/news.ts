import { defineStore } from "pinia";
import { useNews } from "~/composables/news/useNews";

interface NewsArticle {
  id: string;
  title: string;
  slug?: string;
  date_published: string;
  cover_image?: string;
  featured?: boolean;
  category?: {
    name: string;
    slug?: string;
  };
}

export const useNewsStore = defineStore("news", {
  state: () => ({
    articles: [] as NewsArticle[],
    featuredArticles: [] as NewsArticle[],
    searchQuery: "",
    selectedCategory: "Toutes",
    loading: false,
    error: null as string | null,
    lastFetch: null as Date | null,
    lastFeaturedFetch: null as Date | null,
    currentPage: 1,
    itemsPerPage: 9,
    totalItems: 0,
  }),

  getters: {
    // Obtenir les articles mis en avant (featured)
    featuredNews: (state) => {
      return state.featuredArticles
        .sort(
          (a, b) =>
            new Date(b.date_published).getTime() -
            new Date(a.date_published).getTime(),
        )
        .slice(0, 6);
    },

    // Obtenir les catégories uniques
    categories: (state) => {
      // Si en cours de chargement, retourner un tableau vide
      if (state.loading) return [];

      if (!state.articles.length) return [{ name: "Toutes" }];

      const categories = new Set<string>();
      categories.add("Toutes");

      state.articles.forEach((item) => {
        categories.add(item.category?.name || "Non catégorisé");
      });

      return Array.from(categories).map((name) => ({ name }));
    },

    // Filtrer et trier les actualités
    filteredSortedNews: (state) => {
      // Si en cours de chargement, retourner un tableau vide
      if (state.loading) return [];

      return state.articles
        .filter((article) => {
          const matchesSearch = article.title
            ?.toLowerCase()
            .includes(state.searchQuery.toLowerCase());
          const matchesCategory =
            state.selectedCategory === "Toutes" ||
            article.category?.name === state.selectedCategory;

          return matchesSearch && matchesCategory;
        })
        .sort(
          (a, b) =>
            new Date(b.date_published).getTime() -
            new Date(a.date_published).getTime(),
        );
    },

    shouldRefetch: (state) => {
      if (!state.lastFetch) return true;
      const fiveMinutes = 5 * 60 * 1000;
      return Date.now() - state.lastFetch.getTime() > fiveMinutes;
    },

    shouldRefetchFeatured: (state) => {
      if (!state.lastFeaturedFetch) return true;
      const fiveMinutes = 5 * 60 * 1000;
      return Date.now() - state.lastFeaturedFetch.getTime() > fiveMinutes;
    },

    // Getter pour obtenir les articles de la page courante
    paginatedNews: (state): NewsArticle[] => {
      const filtered = state.articles.filter((article) => {
        const matchesSearch = article.title
          ?.toLowerCase()
          .includes(state.searchQuery.toLowerCase());
        const matchesCategory =
          state.selectedCategory === "Toutes" ||
          article.category?.name === state.selectedCategory;

        return matchesSearch && matchesCategory;
      });

      state.totalItems = filtered.length;

      const start = (state.currentPage - 1) * state.itemsPerPage;
      const end = start + state.itemsPerPage;

      return filtered
        .sort(
          (a, b) =>
            new Date(b.date_published).getTime() -
            new Date(a.date_published).getTime(),
        )
        .slice(start, end);
    },

    // Getter pour le nombre total de pages
    totalPages: (state) => {
      return Math.ceil(state.totalItems / state.itemsPerPage);
    },
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    setSelectedCategory(category: string) {
      this.selectedCategory = category;
    },

    setCurrentPage(page: number) {
      this.currentPage = page;
    },

    async fetchNews(options?: { featured?: boolean }) {
      // Vérifier si on doit recharger selon le type de requête
      const shouldFetch = options?.featured
        ? this.shouldRefetchFeatured
        : this.shouldRefetch;

      if (
        !shouldFetch &&
        (options?.featured
          ? this.featuredArticles.length > 0
          : this.articles.length > 0)
      ) {
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const config = useRuntimeConfig();
        const apiUrl = config.public.cmsApiUrl;
        const apiKey = config.public.cmsApiKey;

        const fields =
          "id,title,slug,date_published,cover_image,featured,category.name,category.slug";
        const sort = "sort=-date_published";
        const filters = "filter[status]=published";
        const limit = options?.featured ? "limit=6" : "limit=500";

        const response = await fetch(
          `${apiUrl}/items/news?fields=${fields}&${sort}&${filters}&${limit}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des actualités");
        }

        const data = await response.json();

        if (data && data.data) {
          if (options?.featured) {
            // Mise à jour des articles featured uniquement
            this.featuredArticles = data.data.filter(
              (article: NewsArticle) => article.featured,
            );
            this.lastFeaturedFetch = new Date();
          } else {
            // Mise à jour de tous les articles
            this.articles = data.data;
            this.lastFetch = new Date();
            this.currentPage = 1;
          }
        } else {
          throw new Error("Format de données invalide");
        }
      } catch (e) {
        console.error("Error fetching news:", e);
        this.error = e instanceof Error ? e.message : "Une erreur est survenue";
      } finally {
        this.loading = false;
      }
    },
  },
});
