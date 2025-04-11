<template>
  <div class="space-y-2">
    <NuxtLink
      v-for="article in news?.slice(0, 3)"
      :key="article.id"
      :to="`/assemblee-nationale/actualites/${article.id}/${article.slug}`"
      class="block rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100"
    >
      <h3 class="line-clamp-2 text-sm font-medium" v-text="article.title"></h3>
      <time class="mt-2 block text-xs text-gray-500">
        {{ $dateformat(article.date_published) }}
      </time>
    </NuxtLink>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  news: any;
}>();
</script>
