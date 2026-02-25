<script lang="ts" setup>
import { useNews } from '~/composables/news/useNews';

const formatNewsUrl = (article: {
  id: string;
  title?: string;
  slug?: string;
  category?: { slug?: string };
}) => {
  if (!article) return '/actualites';

  const id = article.id;
  const slug =
    article.slug ||
    (article.title
      ? article.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : 'actualite');

  const categorySlug = article.category?.slug;

  if (categorySlug === 'conseil-des-ministres') {
    return `/conseil-des-ministres/${id}/${slug}`;
  }
  if (categorySlug === 'assemblee-nationale') {
    return `/assemblee-nationale/actualites/${id}/${slug}`;
  }
  return `/actualites/${id}/${slug}`;
};

const {
  articles: featuredNews,
  error,
  loading,
} = useNews({
  featured: true,
  limit: 3,
});
</script>

<template>
  <section class="my-4" aria-labelledby="news-heading">
    <h2
      id="news-heading"
      class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white"
    >
      Derniers articles et actualités
    </h2>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 pb-4 pt-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:pt-0"
      aria-busy="true"
    >
      <div
        v-for="n in 3"
        :key="n"
        class="w-36 flex-shrink-0 snap-start rounded-xl bg-white shadow-sm ring-1 ring-gray-100 md:w-auto md:flex-shrink dark:bg-gray-800 dark:ring-gray-700/50"
      >
        <USkeleton class="h-24 w-full rounded-t-xl md:h-36" />
        <div class="space-y-1.5 p-2 md:p-3">
          <USkeleton class="h-3 w-full" />
          <USkeleton class="h-3 w-3/4" />
          <USkeleton class="h-2.5 w-1/2" />
        </div>
      </div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Erreur"
      description="Une erreur est survenue lors du chargement des actualités."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Content -->
    <div v-else-if="featuredNews && featuredNews.length > 0">
      <div
        class="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 pb-4 pt-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:pt-0"
        role="list"
      >
        <article
          v-for="article in featuredNews.slice(0, 3)"
          :key="article.id"
          role="listitem"
          class="w-36 flex-shrink-0 snap-start md:w-auto md:flex-shrink"
        >
          <NuxtLink
            :to="formatNewsUrl(article)"
            :aria-label="`Lire : ${article.title}`"
            class="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98] md:ring-0 md:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700/50"
          >
            <!-- Image: compact vertical -->
            <div class="relative h-24 w-full overflow-hidden md:h-36">
              <CmsImage
                :src="article.cover_image"
                :fallback="'/default-image-2.gif'"
                :alt="article.title || 'Image actualité'"
                class="h-full w-full object-cover transition-transform duration-300 md:group-hover:scale-105"
                sizes="(max-width: 768px) 144px, 300px"
                loading="lazy"
              />
            </div>

            <!-- Content: compact -->
            <div class="p-2 md:p-3">
              <h3
                class="line-clamp-2 min-h-[2.25rem] text-[11px] font-medium leading-snug text-gray-900 md:min-h-[3rem] md:text-sm dark:text-white"
              >
                {{ article.title }}
              </h3>
              <p
                v-if="article.date_published"
                class="mt-1 text-[10px] text-gray-500 md:text-xs dark:text-gray-400"
              >
                {{ $dateformatWithDayName(article.date_published) }}
              </p>
            </div>
          </NuxtLink>
        </article>
      </div>

      <!-- CTA -->
      <div class="mt-5 text-center">
        <UButton
          to="/actualites"
          color="gray"
          variant="solid"
          size="md"
          trailing-icon="i-heroicons-arrow-right"
          class="rounded-full border-gray-200 bg-white font-medium"
        >
          Voir toutes les actualités
        </UButton>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      Aucune actualité disponible pour le moment
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
