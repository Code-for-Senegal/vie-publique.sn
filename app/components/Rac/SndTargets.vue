<script setup lang="ts">
interface Target {
  axis: string;
  id: string;
  label: string;
  reference_year: number;
  baseline: number;
  unit: string;
  targets: Record<string, number>;
}

interface ExampleIndicator {
  axis: string;
  label: string;
}

interface Props {
  setupProcess: string[];
  targets: Target[];
  exampleIndicators: ExampleIndicator[];
}

const props = defineProps<Props>();

const showAll = ref(false);

// Nombre de cibles affichées par défaut
const MAX_VISIBLE = 4;

const visibleTargets = computed(() =>
  showAll.value ? props.targets : props.targets.slice(0, MAX_VISIBLE),
);

const hasMore = computed(() => props.targets.length > MAX_VISIBLE);

function formatValue(value: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Objectifs clés SND (visible par défaut) -->
    <div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          v-for="target in visibleTargets"
          :key="target.id"
          class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700/40 dark:bg-gray-900/60"
        >
          <p class="text-sm font-bold text-gray-900 dark:text-white">
            {{ target.label }}
          </p>
          <p class="mb-3 text-[11px] text-gray-400 dark:text-gray-500">{{ target.axis }}</p>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-extrabold text-gray-900 dark:text-white">
              {{ formatValue(target.baseline) }}
            </span>
            <span class="text-sm text-gray-400">{{ target.unit }}</span>
            <span class="text-xs text-gray-400">({{ target.reference_year }})</span>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <UIcon
              name="i-heroicons-arrow-long-right-20-solid"
              class="h-4 w-4 text-gray-400 dark:text-gray-500"
            />
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Cible 2029 :
              {{
                target.targets['2029'] !== undefined
                  ? formatValue(target.targets['2029']) + ' ' + target.unit
                  : '—'
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Bouton voir plus / moins -->
      <div v-if="hasMore" class="mt-4 text-center">
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="showAll = !showAll"
        >
          <UIcon
            :name="
              showAll ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'
            "
            class="h-4 w-4"
          />
          {{ showAll ? 'Voir moins' : 'Voir les indicateurs détaillés' }}
        </button>
      </div>
    </div>

    <!-- Indicateurs sans cibles (visibles seulement en mode étendu) -->
    <div v-if="showAll && exampleIndicators.length">
      <h4 class="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
        Indicateurs en cours de calibrage
      </h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(indicator, i) in exampleIndicators"
          :key="i"
          class="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          {{ indicator.label }}
        </span>
      </div>
    </div>
  </div>
</template>
