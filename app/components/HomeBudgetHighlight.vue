<script setup lang="ts">
const stats = [
  {
    label: 'Dépenses',
    value: '7 434',
    change: '+13,0%',
    color: 'orange',
  },
  {
    label: 'Recettes',
    value: '6 189',
    change: '+26,7%',
    color: 'emerald',
  },
  {
    label: 'Déficit',
    value: '1 245',
    change: '-26,6%',
    color: 'rose',
  },
];

const cardStyles: Record<string, string> = {
  orange:
    'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30',
  emerald:
    'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30',
  rose: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/30',
};

const textStyles: Record<string, { label: string; value: string; unit: string }> = {
  orange: {
    label: 'text-orange-700 dark:text-orange-300',
    value: 'text-orange-900 dark:text-orange-100',
    unit: 'text-orange-600/70 dark:text-orange-400/70',
  },
  emerald: {
    label: 'text-emerald-700 dark:text-emerald-300',
    value: 'text-emerald-900 dark:text-emerald-100',
    unit: 'text-emerald-600/70 dark:text-emerald-400/70',
  },
  rose: {
    label: 'text-rose-700 dark:text-rose-300',
    value: 'text-rose-900 dark:text-rose-100',
    unit: 'text-rose-600/70 dark:text-rose-400/70',
  },
};

const badgeColors: Record<string, 'orange' | 'green' | 'red'> = {
  orange: 'orange',
  emerald: 'green',
  rose: 'red',
};
</script>

<template>
  <div class="my-4">
    <UCard
      class="overflow-hidden border-0 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800/50"
      :ui="{ body: { padding: 'p-4 sm:p-6' } }"
    >
      <!-- Header -->
      <div class="mb-4 flex items-center justify-between sm:mb-5">
        <div class="flex items-center gap-2">
          <div
            class="bg-primary-100 dark:bg-primary-900/50 flex h-8 w-8 items-center justify-center rounded-lg"
          >
            <UIcon
              name="i-heroicons-chart-pie"
              class="text-primary-600 dark:text-primary-400 h-4 w-4"
            />
          </div>
          <h3 class="text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
            Comprendre le Budget 2026 du Sénégal
          </h3>
        </div>
        <NuxtLink
          to="/budget-senegal/dashboard"
          class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 group hidden items-center gap-1 text-sm font-medium sm:inline-flex"
        >
          Explorer
          <UIcon
            name="i-heroicons-arrow-right"
            class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          />
        </NuxtLink>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-3 gap-2 sm:gap-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-xl p-3 transition-transform hover:scale-[1.02] sm:p-4"
          :class="cardStyles[stat.color]"
        >
          <p class="text-xs font-medium sm:text-sm" :class="textStyles[stat.color].label">
            {{ stat.label }}
          </p>
          <div class="mt-1 flex items-baseline gap-1 sm:gap-2">
            <span
              class="text-lg font-bold tracking-tight sm:text-2xl"
              :class="textStyles[stat.color].value"
            >
              {{ stat.value }}
            </span>
            <UBadge
              :color="badgeColors[stat.color]"
              variant="subtle"
              size="xs"
              class="hidden sm:inline-flex"
            >
              {{ stat.change }}
            </UBadge>
          </div>
          <p class="mt-0.5 text-[10px] sm:text-xs" :class="textStyles[stat.color].unit">
            Mds FCFA
            <span class="inline sm:hidden">({{ stat.change }})</span>
          </p>
        </div>
      </div>

      <!-- Mobile CTA -->
      <NuxtLink
        to="/budget-senegal/dashboard"
        class="bg-primary-50 mt-3 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:hidden dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Voir le tableau de bord
        <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
      </NuxtLink>
    </UCard>
  </div>
</template>
