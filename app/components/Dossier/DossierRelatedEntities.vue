<template>
  <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <li v-for="entity in entities" :key="entity.id">
      <NuxtLink
        :to="entityUrl(entity)"
        class="group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-100 transition-all active:scale-[0.99] dark:bg-gray-800 dark:ring-gray-700 md:hover:ring-gray-300"
      >
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
        >
          <CmsImage
            v-if="entity.logo"
            :src="entity.logo"
            :alt="entity.name"
            class="h-full w-full object-contain p-1"
          />
          <UIcon v-else name="i-heroicons-building-library" class="h-5 w-5 text-gray-400" />
        </div>
        <h3 class="line-clamp-2 flex-1 text-sm font-medium text-gray-900 dark:text-white">
          {{ entity.name }}
        </h3>
        <UIcon
          name="i-heroicons-arrow-up-right"
          class="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-blue-500"
        />
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { DossierLinkedEntity } from '~~/types/dossier';

defineProps<{ entities: DossierLinkedEntity[] }>();

// Les institutions/présidence/primature ont des pages dédiées /etat-senegal/institutions/<slug>,
// les autres entités (ministères, agences, établissements publics…) sont sur /etat-senegal/<slug>.
const INSTITUTION_TYPES = ['institution', 'presidence', 'primature'];

const entityUrl = (entity: DossierLinkedEntity) =>
  entity.type_code && INSTITUTION_TYPES.includes(entity.type_code)
    ? `/etat-senegal/institutions/${entity.slug}`
    : `/etat-senegal/${entity.slug}`;
</script>
