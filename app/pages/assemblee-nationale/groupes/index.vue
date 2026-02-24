<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sticky Header Mobile -->
    <div class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 md:relative md:border-0 md:bg-transparent md:py-6 md:backdrop-blur-none dark:md:bg-transparent">
      <div class="mx-auto max-w-6xl">
        <!-- Breadcrumb desktop only -->
        <div class="mb-2 hidden md:block">
          <AppBreadcrumb :items="[
            { label: 'Assemblée nationale', to: '/assemblee-nationale' },
            { label: 'Groupes parlementaires' }
          ]" />
        </div>
        
        <div class="flex items-center justify-between gap-4">
          <!-- Back button mobile -->
          <NuxtLink 
            to="/assemblee-nationale" 
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:scale-95 dark:bg-gray-700 md:hidden"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </NuxtLink>
          
          <div class="flex-1">
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white md:text-2xl">
              Groupes parlementaires
            </h1>
            <p class="hidden text-sm text-gray-500 dark:text-gray-400 md:block">
              Les groupes politiques rassemblent les députés selon leur affinité politique
            </p>
          </div>
          
          <!-- Stats badge -->
          <div v-if="!loading && groups?.length" class="flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 dark:bg-sky-900/30">
            <UIcon name="i-heroicons-user-group" class="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span class="text-sm font-medium text-sky-700 dark:text-sky-300">{{ groups.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-0">
      <!-- Info card mobile -->
      <div class="mb-6 rounded-xl bg-sky-50 p-4 dark:bg-sky-900/20 md:hidden">
        <p class="text-sm text-sky-800 dark:text-sky-300">
          Un groupe doit être composé au minimum de 16 députés.
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading && !groups?.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
          <div class="flex items-center gap-4">
            <USkeleton class="h-16 w-16 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-5 w-3/4" />
              <USkeleton class="h-4 w-1/2" />
            </div>
          </div>
          <div class="mt-4 flex gap-2">
            <USkeleton class="h-8 w-20 rounded-full" />
            <USkeleton class="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-2xl bg-red-50 p-6 text-center dark:bg-red-900/20">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 class="font-medium text-red-800 dark:text-red-300">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- Grille des groupes -->
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AssemblyGroupCard
          v-for="group in groups"
          :key="group.id"
          :group="group"
        />
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && !error && !groups?.length"
        class="rounded-2xl bg-white p-8 text-center ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <UIcon name="i-heroicons-user-group" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="font-medium text-gray-900 dark:text-white">Aucun groupe trouvé</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Les groupes parlementaires ne sont pas encore disponibles
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { groups, loading, error } = useAssemblyGroups();
</script>
