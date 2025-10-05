✅ Sécuriser les credentials (retirer du public)
✅ Implémenter SSR complet
✅ Cache serveur optimisé
✅ Pagination server-side
✅ Recherche server-side (si possible)
✅ Remplacer fetch par useFetch

✅ sur le store pinia, Garder uniquement UI state # (searchQuery, selectedCategory currentPage)

✅ Utilise useFetch pour le SSR et le cache automatique

Benefits Achieved:
- Security 🔒: Backend URLs and API keys hidden from client-side code
- Performance ⚡: SSR pre-renders data, client-side caching via useFetch
- SEO 📈: Content available in HTML source for search engines
- Unified Pattern 🎯: Consistent architecture across all news functionality

exemple:

Server API Routes (3 files created in /server/api/cms/news/):

- index.get.ts - Paginated news list with search & filters
- [id].get.ts - Single article by ID
- featured.get.ts - Featured articles for homepage

Composables (3 files created in /composables/news/):

- useNewsList.ts - SSR-friendly news list with reactive filters
- useNewsItem.ts - Single article fetching
- useFeaturedNews.ts - Homepage featured articles

Components/Pages Migrated (3 files updated):

- components/HomeNews.vue - Homepage featured news
- pages/actualites/[id]/[slug].vue - Article detail page
- pages/actualites/index.vue - Main news listing page

Technical Implementation:
Pattern used: Components → Composables (useFetch) → Server Routes → Directus CMS Instead of the Directus SDK (which had permission issues), we used direct $fetch calls with proper authentication headers, which matches the working pattern from the old code.
