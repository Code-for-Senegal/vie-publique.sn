<script setup lang="ts">
interface RegionRow {
  regionCode: string;
  region: string;
  pibParHabitant: number;
  pibTotal: number;
  tauxChomage: number;
  population: number;
  secteurDominant: string;
  tendance: 'up' | 'down' | 'stable';
}

const props = defineProps<{
  regions: RegionRow[];
}>();

const sortKey = ref<keyof RegionRow>('pibParHabitant');
const sortDesc = ref(true);
const currentPage = ref(1);
const perPage = 7;

const maxPib = computed(() => Math.max(...props.regions.map((r) => r.pibParHabitant)));

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

const secteurStyle: Record<string, { label: string; bg: string; text: string }> = {
  services: { label: 'Services', bg: 'bg-sky-500/20', text: 'text-sky-400' },
  agriculture: { label: 'Agriculture', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  mines: { label: 'Mines', bg: 'bg-amber-500/20', text: 'text-amber-400' },
  peche: { label: 'Pêche', bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  industrie: { label: 'Industrie', bg: 'bg-violet-500/20', text: 'text-violet-400' },
};

const chomageStyle = (taux: number) => {
  if (taux < 15) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400' };
  if (taux < 20) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
  if (taux < 25) return { bg: 'bg-orange-500/20', text: 'text-orange-400' };
  return { bg: 'bg-red-500/20', text: 'text-red-400' };
};

const sorted = computed(() => {
  const key = sortKey.value;
  return [...props.regions].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDesc.value ? bVal.localeCompare(aVal, 'fr') : aVal.localeCompare(bVal, 'fr');
    }
    return sortDesc.value ? Number(bVal) - Number(aVal) : Number(aVal) - Number(bVal);
  });
});

const totalPages = computed(() => Math.ceil(sorted.value.length / perPage));
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return sorted.value.slice(start, start + perPage);
});

// Reset to page 1 when sort or data changes
watch([sortKey, sortDesc, () => props.regions.length], () => {
  currentPage.value = 1;
});

interface ColDef {
  key: keyof RegionRow;
  label: string;
  sortable: boolean;
  align?: 'left' | 'right' | 'center';
}

const columns: ColDef[] = [
  { key: 'region', label: 'Région', sortable: true, align: 'left' },
  { key: 'pibParHabitant', label: 'PIB / hab', sortable: true, align: 'left' },
  { key: 'tauxChomage', label: 'Chômage', sortable: true, align: 'center' },
  { key: 'population', label: 'Population', sortable: true, align: 'right' },
  { key: 'secteurDominant', label: 'Secteur', sortable: true, align: 'center' },
  { key: 'tendance', label: 'Tendance', sortable: false, align: 'center' },
];

function toggleSort(key: keyof RegionRow) {
  if (sortKey.value === key) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortKey.value = key;
    sortDesc.value = key !== 'region';
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700/50 dark:bg-gray-900/80">
    <div class="border-b border-gray-100 px-3 py-2.5 dark:border-gray-700/50">
      <h3 class="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Données par région</h3>
      <p class="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">{{ regions.length }} régions — cliquez pour trier</p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500',
                col.align === 'right'
                  ? 'text-right'
                  : col.align === 'center'
                    ? 'text-center'
                    : 'text-left',
                col.sortable
                  ? 'cursor-pointer select-none transition-colors hover:text-gray-700 dark:hover:text-gray-300'
                  : '',
              ]"
              @click="col.sortable ? toggleSort(col.key) : null"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <UIcon
                  v-if="sortKey === col.key"
                  :name="
                    sortDesc
                      ? 'i-heroicons-chevron-down-20-solid'
                      : 'i-heroicons-chevron-up-20-solid'
                  "
                  class="h-3 w-3 text-sky-400"
                />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in paginatedRows"
            :key="row.regionCode"
            :class="[
              'border-b border-gray-50 transition-colors hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-gray-800/40',
              idx % 2 === 0 ? 'bg-white dark:bg-gray-900/40' : 'bg-gray-50/50 dark:bg-gray-900/20',
            ]"
          >
            <!-- Région -->
            <td class="whitespace-nowrap px-2.5 py-2">
              <span class="text-xs font-semibold text-gray-900 dark:text-white">{{ row.region }}</span>
            </td>

            <!-- PIB/hab + mini barre -->
            <td class="px-2.5 py-2">
              <div class="flex items-center gap-2">
                <div class="hidden w-16 sm:block">
                  <div class="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      class="h-full rounded-full bg-sky-500/80 transition-all duration-500"
                      :style="{ width: `${(row.pibParHabitant / maxPib) * 100}%` }"
                    />
                  </div>
                </div>
                <span class="whitespace-nowrap text-xs tabular-nums text-gray-700 dark:text-gray-300">
                  {{ fmt(row.pibParHabitant) }}
                  <span class="text-gray-400 dark:text-gray-600">FCFA</span>
                </span>
              </div>
            </td>

            <!-- Chômage badge -->
            <td class="px-2.5 py-2 text-center">
              <span
                :class="[
                  'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums',
                  chomageStyle(row.tauxChomage).bg,
                  chomageStyle(row.tauxChomage).text,
                ]"
              >
                {{ row.tauxChomage }}%
              </span>
            </td>

            <!-- Population -->
            <td class="whitespace-nowrap px-2.5 py-2 text-right text-xs tabular-nums text-gray-500 dark:text-gray-400">
              {{ fmt(row.population) }}
            </td>

            <!-- Secteur badge -->
            <td class="px-2.5 py-2 text-center">
              <span
                :class="[
                  'inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                  (
                    secteurStyle[row.secteurDominant] ?? {
                      bg: 'bg-gray-500/20',
                      text: 'text-gray-400',
                    }
                  ).bg,
                  (
                    secteurStyle[row.secteurDominant] ?? {
                      bg: 'bg-gray-500/20',
                      text: 'text-gray-400',
                    }
                  ).text,
                ]"
              >
                {{ (secteurStyle[row.secteurDominant] ?? { label: row.secteurDominant }).label }}
              </span>
            </td>

            <!-- Tendance -->
            <td class="px-2.5 py-2 text-center">
              <UIcon
                v-if="row.tendance === 'up'"
                name="i-heroicons-arrow-trending-up-20-solid"
                class="h-4 w-4 text-emerald-400"
              />
              <UIcon
                v-else-if="row.tendance === 'down'"
                name="i-heroicons-arrow-trending-down-20-solid"
                class="h-4 w-4 text-red-400"
              />
              <UIcon v-else name="i-heroicons-minus-20-solid" class="h-4 w-4 text-gray-600" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between border-t border-gray-100 px-3 py-2 dark:border-gray-800"
    >
      <span class="text-[10px] tabular-nums text-gray-400 dark:text-gray-500">
        {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, sorted.length) }}
        sur {{ sorted.length }}
      </span>
      <div class="flex items-center gap-1">
        <button
          :disabled="currentPage <= 1"
          class="rounded px-2 py-0.5 text-[10px] font-semibold transition-colors"
          :class="
            currentPage <= 1
              ? 'cursor-not-allowed text-gray-300 dark:text-gray-700'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
          "
          @click="currentPage--"
        >
          ‹ Préc.
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          class="h-6 w-6 rounded text-[10px] font-bold tabular-nums transition-colors"
          :class="
            p === currentPage
              ? 'bg-sky-500/20 text-sky-500 dark:text-sky-400'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-white'
          "
          @click="currentPage = p"
        >
          {{ p }}
        </button>
        <button
          :disabled="currentPage >= totalPages"
          class="rounded px-2 py-0.5 text-[10px] font-semibold transition-colors"
          :class="
            currentPage >= totalPages
              ? 'cursor-not-allowed text-gray-300 dark:text-gray-700'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
          "
          @click="currentPage++"
        >
          Suiv. ›
        </button>
      </div>
    </div>
  </div>
</template>
