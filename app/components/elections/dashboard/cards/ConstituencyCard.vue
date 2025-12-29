<script setup lang="ts">
import type { Constituency } from '~/composables/elections/dashboard/useElectoralConstituencies';

interface Props {
  constituency: Constituency;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'select', constituencyId: string | number): void;
}>();

const iconByType = computed(() => {
  switch (props.constituency.type) {
    case 'diaspora':
      return 'i-heroicons-globe-alt';
    case 'commune':
      return 'i-heroicons-building-office';
    case 'departement':
      return 'i-heroicons-map-pin';
    default:
      return 'i-heroicons-map-pin';
  }
});

const badgeColorByType = computed(() => {
  switch (props.constituency.type) {
    case 'diaspora':
      return 'blue';
    case 'commune':
      return 'green';
    case 'departement':
      return 'primary';
    default:
      return 'primary';
  }
});

const labelByType = computed(() => {
  switch (props.constituency.type) {
    case 'diaspora':
      return 'Diaspora';
    case 'commune':
      return 'Commune';
    case 'departement':
      return 'Dépt.';
    default:
      return props.constituency.type;
  }
});
</script>

<template>
  <UCard
    class="relative group hover:ring-2 hover:ring-primary-500 ring-offset-2 ring-offset-[#f8fafc] dark:ring-offset-gray-950 transition-all duration-300 cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-lg bg-white dark:bg-gray-900"
    :ui="{ body: { padding: 'p-6' } }"
    @click="emit('select', constituency.id)"
  >
    <!-- Icône de type -->
    <div class="flex items-start justify-between mb-4">
      <div class="h-12 w-12 flex-shrink-0 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-2.5 flex items-center justify-center">
        <UIcon :name="iconByType" class="text-primary-600 dark:text-primary-400 h-7 w-7" />
      </div>
      <UBadge
        :color="badgeColorByType"
        variant="subtle"
        size="xs"
        class="uppercase tracking-wider"
      >
        {{ labelByType }}
      </UBadge>
    </div>

    <!-- Nom de la circonscription -->
    <div class="mb-4">
      <h3 class="text-base font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors leading-tight mb-1">
        {{ constituency.name }}
      </h3>
    </div>

    <!-- Stats: Communes & Coalitions -->
    <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 gap-2">
      <!-- Communes Count (Only if department) -->
      <div v-if="constituency.communes_count" class="flex flex-col">
          <span class="text-xs text-gray-400 uppercase font-semibold">Communes</span>
          <span class="text-lg font-black text-gray-900 dark:text-gray-100">{{ constituency.communes_count }}</span>
      </div>

      <!-- Coalitions Count -->
      <div class="flex flex-col items-end flex-1">
          <span class="text-xs text-gray-400 uppercase font-semibold">Listes</span>
          <span class="text-lg font-black text-primary-600 dark:text-primary-400">{{ constituency.coalitions_count }}</span>
      </div>
    </div>

    <!-- Flèche -->
    <div class="absolute bottom-3 right-3">
      <UIcon
        name="i-heroicons-arrow-right-circle"
        class="h-5 w-5 text-gray-300 group-hover:text-primary-500 transition-colors"
      />
    </div>
  </UCard>
</template>
