<script setup lang="ts">
interface ProgramData {
  label: string;
  value: number;
  variation_percentage: string;
  variation_color: string;
}

interface Props {
  programs: ProgramData[];
}

const props = defineProps<Props>();

const total = computed(() => props.programs.reduce((sum, item) => sum + item.value, 0));

const getPercentage = (value: number, total: number) => ((value / total) * 100).toFixed(1);
</script>

<template>
  <div class="mx-auto space-y-4">
    <div class="mt-2">
      <div class="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
        <!-- En-têtes -->
        <div
          class="bg-gray-50 px-2 py-3 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="flex-1">Programme</span>
            <div class="flex shrink-0 items-center gap-4">
              <span>Montant</span>
            </div>
          </div>
        </div>
        <!-- Items -->
        <div
          v-for="program in programs"
          :key="program.label"
          class="border-b border-gray-100 px-2 py-2 text-sm text-gray-900 last:border-b-0 dark:border-gray-700 dark:text-gray-100"
        >
          <div class="flex items-start gap-2">
            <!-- Pourcentage cercle -->
            <span
              class="relative inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-800"
            >
              <span class="text-xs font-medium leading-none text-gray-900 dark:text-white">
                {{ getPercentage(program.value, total) }}%
              </span>
            </span>

            <!-- Contenu principal -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="line-clamp-2 block flex-1 text-sm">{{ program.label }}</span>
                <div class="flex shrink-0 items-center gap-2">
                  <span class="text-sm font-medium">{{
                    program.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                  }}</span>
                  <!-- Zone badge avec largeur fixe pour maintenir l'alignement -->
                  <div class="w-16">
                    <UBadge
                      v-if="program.variation_percentage && program.variation_percentage !== 'N/A'"
                      variant="solid"
                      :class="[
                        'rounded-full border-none px-2 text-xs font-medium',
                        {
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                            program.variation_color === 'green',
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
                            program.variation_color === 'red',
                          'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300':
                            program.variation_color === 'gray',
                        },
                      ]"
                    >
                      {{
                        program.variation_percentage.startsWith('+')
                          ? '↑'
                          : program.variation_percentage.startsWith('-')
                            ? '↓'
                            : ''
                      }}
                      {{ program.variation_percentage.replace('+', '').replace('-', '') }}
                    </UBadge>
                  </div>
                </div>
              </div>

              <!-- Barre de progression -->
              <div class="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-2 rounded-full bg-blue-500"
                  :style="{
                    width: `${getPercentage(program.value, total)}%`,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Total -->
        <div class="px-2 py-2 text-sm font-semibold text-blue-800 dark:text-blue-300">
          <div class="flex items-center justify-between">
            <span class="pl-1">Total</span>
            <span>{{ total.toLocaleString(undefined, { maximumFractionDigits: 2 }) }} Mds</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
