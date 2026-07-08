<script setup lang="ts">
import type { PublicProject, PublicProjectMode } from '~~/types/public-project';

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
  mode?: PublicProjectMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'global',
});

// Colonnes adaptatives selon le mode
const showBudgetTotal = computed(() => props.mode !== 'pres');
const showAECP = computed(() => props.mode !== 'pip' && !!props.year);

const emit = defineEmits<{
  'page-change': [page: number];
}>();

// Formater un titre : première lettre en majuscule, le reste en minuscule
const toSentenceCase = (str: string): string => {
  if (!str) return '';
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

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
          class="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
        >
          <tr>
            <th class="px-4 py-3">Projet</th>
            <th v-if="showBudgetTotal" class="px-4 py-3 text-right">Budget total</th>
            <th v-if="showAECP" class="px-4 py-3 text-right">AE {{ year }}</th>
            <th v-if="showAECP" class="px-4 py-3 text-right">CP {{ year }}</th>
            <th class="w-10 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="project in projects"
            :key="project.id"
            class="cursor-pointer bg-white transition-colors hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-800"
            @click="navigateTo(`/projets-publics-senegal/${project.slug}`)"
          >
            <!-- Colonne Projet : titre + badges + métadonnées -->
            <td class="px-4 py-3">
              <div class="space-y-1.5">
                <!-- Titre sur 2 lignes max -->
                <NuxtLink
                  :to="`/projets-publics-senegal/${project.slug}`"
                  class="line-clamp-2 text-sm font-semibold text-[#1a0dab] hover:underline dark:text-[#8ab4f8]"
                >
                  {{ toSentenceCase(project.shortTitle || project.title) }}
                </NuxtLink>

                <!-- Ministère + Politique -->
                <div class="flex flex-wrap gap-x-3 text-xs text-gray-500 dark:text-gray-400">
                  <span v-if="project.ministry" class="flex items-center gap-1">
                    <UIcon name="i-heroicons-building-office-2" class="h-3 w-3 shrink-0" />
                    <span class="line-clamp-1">{{ project.ministry.name }}</span>
                  </span>
                  <span v-if="project.policyPrimary" class="flex items-center gap-1">
                    <UIcon name="i-heroicons-flag" class="h-3 w-3 shrink-0" />
                    <span class="line-clamp-1">{{ project.policyPrimary.title }}</span>
                  </span>
                </div>

                <!-- Badges : PRES + PIP + Secteur + Région -->
                <div class="flex flex-wrap items-center gap-1.5">
                  <span
                    v-if="project.isInPres"
                    class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    >PRES</span
                  >
                  <span
                    v-if="project.isInPip"
                    class="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >PIP</span
                  >
                  <span
                    v-if="project.sector"
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                    :style="
                      project.sector.color
                        ? {
                            backgroundColor: project.sector.color + '20',
                            color: project.sector.color,
                          }
                        : {
                            backgroundColor: 'rgb(229 231 235)',
                            color: 'rgb(107 114 128)',
                          }
                    "
                  >
                    {{ project.sector.name }}
                  </span>
                  <span
                    v-if="project.regionPrimaryLabel"
                    class="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    {{ project.regionPrimaryLabel }}
                  </span>
                </div>
              </div>
            </td>

            <!-- Budget total -->
            <td
              v-if="showBudgetTotal"
              class="whitespace-nowrap px-4 py-3 text-right font-mono text-sm text-gray-900 dark:text-white"
            >
              {{ formatAmount(project.budgetTotalAmount) }}
            </td>

            <!-- AE / CP annuels -->
            <td
              v-if="showAECP"
              class="whitespace-nowrap px-4 py-3 text-right font-mono text-sm text-gray-900 dark:text-white"
            >
              {{ formatAmount(project.annualAE) }}
            </td>
            <td
              v-if="showAECP"
              class="whitespace-nowrap px-4 py-3 text-right font-mono text-sm text-gray-900 dark:text-white"
            >
              {{ formatAmount(project.annualCP) }}
            </td>

            <!-- Flèche -->
            <td class="px-4 py-3">
              <NuxtLink
                :to="`/projets-publics-senegal/${project.slug}`"
                class="hover:text-primary-700 dark:hover:text-primary-300 text-gray-500 dark:text-gray-400"
              >
                <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
              </NuxtLink>
            </td>
          </tr>
          <tr v-if="projects.length === 0 && !loading">
            <td
              :colspan="1 + (showBudgetTotal ? 1 : 0) + (showAECP ? 2 : 0) + 1"
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
        :to="`/projets-publics-senegal/${project.slug}`"
        class="block rounded-lg border border-gray-200 bg-white p-3 transition-colors active:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:active:bg-gray-700"
      >
        <!-- Titre -->
        <div class="flex items-start justify-between gap-2">
          <h3 class="line-clamp-2 text-sm font-semibold text-[#1a0dab] dark:text-[#8ab4f8]">
            {{ toSentenceCase(project.shortTitle || project.title) }}
          </h3>
          <UIcon name="i-heroicons-chevron-right" class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        </div>

        <!-- Badges -->
        <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            v-if="project.isInPres"
            class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            >PRES</span
          >
          <span
            v-if="project.isInPip"
            class="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            >PIP</span
          >
          <span
            v-if="project.sector"
            class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
            :style="
              project.sector.color
                ? { backgroundColor: project.sector.color + '20', color: project.sector.color }
                : { backgroundColor: 'rgb(229 231 235)', color: 'rgb(107 114 128)' }
            "
          >
            {{ project.sector.name }}
          </span>
          <span
            v-if="project.regionPrimaryLabel"
            class="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
          >
            {{ project.regionPrimaryLabel }}
          </span>
        </div>

        <!-- Métadonnées -->
        <div class="mt-2 flex flex-col gap-0.5 text-xs text-gray-500 dark:text-gray-400">
          <span v-if="project.ministry" class="flex items-center gap-1">
            <UIcon name="i-heroicons-building-office-2" class="h-3 w-3 shrink-0" />
            {{ project.ministry.name }}
          </span>
          <span v-if="project.policyPrimary" class="flex items-center gap-1">
            <UIcon name="i-heroicons-flag" class="h-3 w-3 shrink-0" />
            {{ project.policyPrimary.title }}
          </span>
        </div>

        <!-- Budget -->
        <div
          v-if="showBudgetTotal && project.budgetTotalAmount"
          class="mt-2 text-sm font-semibold text-gray-900 dark:text-white"
        >
          {{ formatAmount(project.budgetTotalAmount) }} FCFA
        </div>
        <div
          v-if="showAECP && (project.annualAE || project.annualCP)"
          class="mt-1 flex gap-3 text-xs text-gray-600 dark:text-gray-400"
        >
          <span v-if="project.annualAE">AE : {{ formatAmount(project.annualAE) }}</span>
          <span v-if="project.annualCP">CP : {{ formatAmount(project.annualCP) }}</span>
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
