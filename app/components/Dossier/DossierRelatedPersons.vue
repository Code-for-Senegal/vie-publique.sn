<template>
  <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
    <li v-for="person in persons" :key="person.id">
      <NuxtLink
        :to="`/personnalites/${person.id}/${person.slug}`"
        class="group flex flex-col items-center rounded-xl bg-white p-3 text-center ring-1 ring-gray-100 transition-all active:scale-[0.99] dark:bg-gray-800 dark:ring-gray-700 md:hover:ring-gray-300"
      >
        <div class="h-16 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          <CmsImage
            :src="person.photo"
            :alt="person.full_name"
            class="h-full w-full object-cover"
          />
        </div>
        <h3 class="mt-2 line-clamp-2 text-xs font-medium text-gray-900 dark:text-white">
          {{ person.full_name }}
        </h3>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { DossierLinkedPerson } from '~~/types/dossier';

defineProps<{ persons: DossierLinkedPerson[] }>();
</script>
