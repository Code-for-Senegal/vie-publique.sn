<script setup lang="ts">
import type { PublicProject } from '~~/types/public-project';

interface Props {
  projects: PublicProject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  year?: number;
  loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'page-change': [page: number];
}>();

const formatAmount = (value: number | null): string => {
  if (value === null || value === undefined) return '—';
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mds`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} M`;
  }
  return value.toLocaleString('fr-FR');
};

// Pages à afficher dans la pagination
const visiblePages = computed(() => {
  const current = props.pagination.page;
  const total = props.pagination.totalPages;
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: number[] = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});
</script>

<template>
  <div>
    <!-- Header du tableau -->
    <div class="mb-3 flex items-center justify-between">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ pagination.total }} projet{{ pagination.total > 1 ? 's' : '' }} trouvé{{
          pagination.total > 1 ? 's' : ''
        }}
      </p>
    </div>

    <!-- Tableau desktop -->
    <div
      class="hidden overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 md:block"
    >
      <table class="w-full text-left text-sm">
        <thead
          class="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          <tr>
            <th class="px-4 py-3">Projet</th>
            <th class="px-4 py-3">Axe</th>
            <th class="px-4 py-3">Secteur</th>
            <th class="px-4 py-3">Ministère</th>
            <th class="px-4 py-3">Région</th>
            <th class="px-4 py-3 text-right">Budget total projet</th>
            <th v-if="year" class="px-4 py-3 text-right">AE {{ year }}</th>
            <th v-if="year" class="px-4 py-3 text-right">CP {{ year }}</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="project in projects"
            :key="project.id"
            class="cursor-pointer bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
            @click="navigateTo(`/projets-publics/${project.slug}`)"
          >
            <td class="max-w-[240px] px-4 py-3">
              <NuxtLink
                :to="`/projets-publics/${project.slug}`"
                class="flex items-center gap-2 hover:underline"
              >
                <span
                  v-if="project.isPres"
                  class="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  >PRES</span
                >
                <span class="truncate font-medium text-primary-600 dark:text-primary-400">{{
                  project.shortTitle || project.title
                }}</span>
              </NuxtLink>
            </td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
              {{ project.policyPrimary?.title || '—' }}
            </td>
            <td class="px-4 py-3">
              <span
                v-if="project.sector"
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                :style="
                  project.sector.color
                    ? { backgroundColor: project.sector.color + '20', color: project.sector.color }
                    : {}
                "
              >
                {{ project.sector.name }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="max-w-[180px] truncate px-4 py-3 text-gray-600 dark:text-gray-400">
              {{ project.ministry?.name || '—' }}
            </td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
              {{ project.regionPrimaryLabel || '—' }}
            </td>
            <td
              class="whitespace-nowrap px-4 py-3 text-right font-mono text-gray-900 dark:text-white"
            >
              {{ formatAmount(project.budgetTotalAmount) }}
            </td>
            <td
              v-if="year"
              class="whitespace-nowrap px-4 py-3 text-right font-mono text-gray-900 dark:text-white"
            >
              {{ formatAmount(project.annualAE) }}
            </td>
            <td
              v-if="year"
              class="whitespace-nowrap px-4 py-3 text-right font-mono text-gray-900 dark:text-white"
            >
              {{ formatAmount(project.annualCP) }}
            </td>
            <td class="px-4 py-3">
              <NuxtLink
                :to="`/projets-publics/${project.slug}`"
                class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
              </NuxtLink>
            </td>
          </tr>
          <tr v-if="projects.length === 0 && !loading">
            <td
              :colspan="year ? 9 : 7"
              class="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
            >
              Aucun projet trouvé pour ces critères.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cartes mobile -->
    <div class="space-y-3 md:hidden">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="`/projets-publics/${project.slug}`"
        class="block rounded-lg border border-gray-200 bg-white p-3 transition-colors active:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:active:bg-gray-700"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span
                v-if="project.isPres"
                class="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                >PRES</span
              >
              <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {{ project.shortTitle || project.title }}
              </h3>
            </div>
            <p v-if="project.sector" class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {{ project.sector.name }}
            </p>
          </div>
          <UIcon name="i-heroicons-chevron-right" class="h-4 w-4 shrink-0 text-gray-400" />
        </div>
        <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          <span v-if="project.ministry">{{ project.ministry.name }}</span>
          <span v-if="project.regionPrimaryLabel">{{ project.regionPrimaryLabel }}</span>
        </div>
        <div
          v-if="project.budgetTotalAmount"
          class="mt-2 text-sm font-semibold text-gray-900 dark:text-white"
        >
          Budget total : {{ formatAmount(project.budgetTotalAmount) }} FCFA
        </div>
      </NuxtLink>

      <div
        v-if="projects.length === 0 && !loading"
        class="py-8 text-center text-gray-500 dark:text-gray-400"
      >
        Aucun projet trouvé pour ces critères.
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="mt-4 flex items-center justify-center gap-1">
      <button
        :disabled="pagination.page <= 1"
        class="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
        @click="$emit('page-change', pagination.page - 1)"
      >
        <UIcon name="i-heroicons-chevron-left" class="h-4 w-4" />
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        class="min-w-[32px] rounded-md px-2 py-1 text-sm transition-colors"
        :class="
          page === pagination.page
            ? 'bg-primary-500 font-semibold text-white'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        "
        @click="$emit('page-change', page)"
      >
        {{ page }}
      </button>

      <button
        :disabled="pagination.page >= pagination.totalPages"
        class="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
        @click="$emit('page-change', pagination.page + 1)"
      >
        <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
