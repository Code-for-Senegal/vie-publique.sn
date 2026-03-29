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

defineProps<Props>();

const isOpen = ref(false);

function formatValue(value: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
}
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700/50 dark:bg-gray-900/80"
  >
    <!-- Bouton accordéon -->
    <button
      class="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
        >
          <UIcon
            name="i-heroicons-document-magnifying-glass-20-solid"
            class="h-5 w-5 text-gray-500 dark:text-gray-400"
          />
        </div>
        <div>
          <h3 class="text-base font-bold text-gray-900 dark:text-white">
            Méthodologie & cadre SND 2025-2029
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Processus RAC, indicateurs de suivi et cibles annuelles
          </p>
        </div>
      </div>
      <UIcon
        name="i-heroicons-chevron-down-20-solid"
        :class="[
          'h-5 w-5 text-gray-400 transition-transform duration-200',
          isOpen ? 'rotate-180' : '',
        ]"
      />
    </button>

    <!-- Contenu déplié -->
    <div v-show="isOpen" class="border-t border-gray-200 dark:border-gray-700/50">
      <!-- Processus de mise en place -->
      <div class="px-6 py-5">
        <h4 class="mb-3 text-sm font-bold text-gray-700 dark:text-gray-300">Processus RAC</h4>
        <div class="flex flex-wrap gap-2">
          <div v-for="(step, i) in setupProcess" :key="i" class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-600 dark:bg-sky-400/10 dark:text-sky-400"
            >
              {{ i + 1 }}
            </span>
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ step }}</span>
            <UIcon
              v-if="i < setupProcess.length - 1"
              name="i-heroicons-chevron-right-20-solid"
              class="hidden h-4 w-4 text-gray-300 dark:text-gray-600 sm:block"
            />
          </div>
        </div>
      </div>

      <!-- Indicateurs avec cibles : format cartes (pas tableau) -->
      <div class="border-t border-gray-100 px-6 py-5 dark:border-gray-800">
        <h4 class="mb-3 text-sm font-bold text-gray-700 dark:text-gray-300">
          Indicateurs et cibles annuelles
        </h4>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="target in targets"
            :key="target.id"
            class="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30"
          >
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ target.label }}
            </p>
            <p class="mb-2 text-[10px] text-gray-400 dark:text-gray-500">{{ target.axis }}</p>
            <div class="flex items-baseline gap-1">
              <span class="text-xl font-extrabold text-gray-900 dark:text-white">
                {{ formatValue(target.baseline) }}
              </span>
              <span class="text-xs text-gray-400">{{ target.unit }}</span>
              <span class="text-[10px] text-gray-400">({{ target.reference_year }})</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span
                v-for="year in ['2025', '2026', '2027', '2028', '2029']"
                :key="year"
                class="inline-flex items-center gap-0.5 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-900/20 dark:text-sky-400"
              >
                {{ year }}:
                {{ target.targets[year] !== undefined ? formatValue(target.targets[year]) : '—' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Indicateurs sans cibles -->
      <div
        v-if="exampleIndicators.length"
        class="border-t border-gray-100 px-6 py-5 dark:border-gray-800"
      >
        <h4 class="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
          Indicateurs en cours de calibrage
        </h4>
        <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Cibles annuelles non encore disponibles
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(indicator, i) in exampleIndicators"
            :key="i"
            class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            {{ indicator.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
