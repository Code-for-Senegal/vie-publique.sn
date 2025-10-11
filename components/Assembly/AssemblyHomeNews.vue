<template>
  <div class="space-y-2">
    <NuxtLink
      v-for="article in news?.slice(0, 3)"
      :key="article.id"
      :to="`/assemblee-nationale/actualites/${article.id}/${article.slug}`"
      class="block rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-700"
    >
      <div class="flex gap-2">
        <div class="flex-shrink-0">
          <CmsImage
            v-if="article.cover_image"
            :src="article.cover_image"
            :quality="25"
            :alt="`Image ${article.title}`"
            class="h-12 w-12 rounded-md object-cover"
            loading="lazy"
          />
          <div
            v-else
            class="flex h-16 w-16 items-center justify-center rounded-md bg-gray-200"
          >
            <UIcon name="i-heroicons-newspaper" class="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div class="flex-1">
          <h3
            class="mt-0 line-clamp-2 text-sm font-medium"
            v-text="article.title"
          ></h3>
          <time class="mt-1 block text-xs text-gray-500">
            {{ $dateformat(article.date_published) }}
          </time>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { NewsArticle } from "~/composables/news/useNews";

defineProps<{
  news?: NewsArticle[];
}>();
</script>
