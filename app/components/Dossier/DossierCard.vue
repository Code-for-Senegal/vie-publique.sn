<template>
  <NuxtLink
    :to="`/dossiers/${dossier.slug}`"
    class="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 transition-all active:scale-[0.99] dark:bg-gray-800 dark:ring-gray-700 md:hover:shadow-md md:hover:ring-gray-300"
  >
    <div class="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
      <CmsImage
        :src="dossier.cover_image"
        :alt="dossier.title"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span
        v-if="dossier.featured"
        class="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow"
      >
        À la une
      </span>
      <span
        v-if="dossier.type"
        class="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
      >
        {{ dossierTypeLabel(dossier.type) }}
      </span>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <h2 class="line-clamp-2 text-base font-semibold leading-snug text-gray-900 dark:text-white">
        {{ dossier.title }}
      </h2>
      <p
        v-if="dossier.summary"
        class="mt-1.5 line-clamp-2 text-sm text-gray-500 dark:text-gray-400"
      >
        {{ dossier.summary }}
      </p>

      <div class="mt-auto flex items-center gap-2 pt-3 text-xs text-gray-400">
        <UIcon name="i-heroicons-clock" class="h-3.5 w-3.5" />
        <span>Mis à jour {{ updatedLabel }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { DossierListItem } from '~~/types/dossier';
import { dossierTypeLabel } from '~/config/dossiers.config';

interface Props {
  dossier: DossierListItem;
}
const props = defineProps<Props>();

const updatedLabel = computed(() => {
  const date = props.dossier.date_updated || props.dossier.publish_date;
  if (!date) return 'récemment';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});
</script>
