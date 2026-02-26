<script setup lang="ts">
const actions = [
  {
    title: 'Signaler un problème',
    icon: 'i-heroicons-exclamation-triangle',
    to: '/dashboard/corruption/signaler',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
  },
  {
    title: 'Poser question',
    icon: 'i-heroicons-question-mark-circle',
    to: '/contact',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    title: "Suivre l'indicateur",
    icon: 'i-heroicons-chart-bar',
    to: '/newsletter',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
];
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50"
  >
    <h3 class="mb-3 text-sm font-bold text-gray-900 dark:text-white">Actions citoyennes</h3>
    <div class="flex flex-row gap-3 lg:flex-col">
      <NuxtLink
        v-for="action in actions"
        :key="action.title"
        :to="action.to"
        class="group flex flex-1 flex-col items-center gap-1.5 rounded-lg p-2 text-center transition-all hover:bg-gray-50 dark:hover:bg-gray-800 lg:p-3"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110"
          :class="action.bg"
        >
          <UIcon :name="action.icon" class="h-5 w-5" :class="action.color" />
        </div>
        <span class="text-[11px] font-medium leading-tight text-gray-700 dark:text-gray-300">
          {{ action.title }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>
