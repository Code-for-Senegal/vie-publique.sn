<script setup lang="ts">
import { useNews } from '~/composables/news/useNews';

// Chargement des articles de la catégorie Budget
const {
  articles: budgetArticles,
  error,
  loading,
} = useNews({
  category: 'Budget',
  sort: '-date_published',
  limit: 3,
  syncUrl: false,
});
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div v-for="n in 3" :key="n" class="animate-pulse">
        <div class="rounded-lg bg-gray-200 dark:bg-gray-700">
          <div class="aspect-[16/9] rounded-t-lg bg-gray-300 dark:bg-gray-600"></div>
          <div class="p-4">
            <div class="mb-2 h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div class="h-3 w-1/4 rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
      <p class="text-red-600 dark:text-red-400">
        Une erreur est survenue lors du chargement des articles.
      </p>
    </div>

    <!-- No articles -->
    <div
      v-else-if="!budgetArticles || budgetArticles.length === 0"
      class="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800"
    >
      <UIcon name="i-heroicons-newspaper" class="mx-auto mb-4 h-12 w-12 text-gray-400" />
      <p class="text-gray-600 dark:text-gray-400">Aucun article disponible pour le moment</p>
    </div>

    <!-- Articles grid -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <UCard
        v-for="article in budgetArticles.slice(0, 3)"
        :key="article.id"
        class="border-primary/20 hover:border-primary/30 border-1 cursor-pointer overflow-hidden bg-white transition hover:shadow-lg dark:bg-gray-800"
      >
        <NuxtLink
          :to="`/actualites/${article.id}/${article.slug}`"
          class="flex flex-row sm:flex-col"
        >
          <!-- Image -->
          <div class="mb-0 mr-4 w-1/3 flex-shrink-0 sm:mb-4 sm:mr-0 sm:w-full">
            <CmsImage
              v-if="article.cover_image"
              :src="article.cover_image"
              :fallback="'/default-image-2.gif'"
              :alt="article.title || 'Image article budget'"
              class="h-20 w-full rounded-md object-cover sm:h-48"
              sizes="300px"
              :placeholder="[300, 300]"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-20 w-full items-center justify-center rounded-md bg-gray-200 sm:h-48 dark:bg-gray-700"
            >
              <UIcon name="i-heroicons-newspaper" class="h-8 w-8 text-gray-400 sm:h-12 sm:w-12" />
            </div>
          </div>

          <!-- Content -->
          <div class="flex flex-1 flex-col">
            <p
              class="line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base dark:text-white"
            >
              {{ article.title }}
            </p>
            <time
              v-if="article.date_published"
              class="mt-1 block text-xs text-gray-500 dark:text-gray-400"
            >
              {{ $dateformatWithDayName(article.date_published) }}
            </time>
          </div>
        </NuxtLink>
      </UCard>
    </div>

    <!-- Link to all articles -->
    <div v-if="budgetArticles && budgetArticles.length > 0" class="mt-6 text-center">
      <NuxtLink
        to="/actualites?category=Budget"
        class="group inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition-all duration-200 hover:bg-gray-50 hover:shadow-md hover:ring-gray-400 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700 dark:hover:ring-gray-600"
      >
        Voir toutes les actualités
        <UIcon
          name="i-heroicons-arrow-right"
          class="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
        />
      </NuxtLink>
    </div>
  </div>
</template>
