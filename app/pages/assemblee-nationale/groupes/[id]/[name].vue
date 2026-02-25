<!-- pages/assemblee-nationale/groupes/[id]/[name].vue -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero section with background -->
    <div class="relative h-48" style="background-image: url('/images/menu/assemblee-nationale-1.jpg')" :class="['bg-cover bg-center']">
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
      
      <!-- Sticky Header overlay -->
      <div class="absolute inset-x-0 top-0 z-40 px-4 py-3">
        <div class="mx-auto flex max-w-6xl items-center gap-4">
          <!-- Back button -->
          <NuxtLink 
            to="/assemblee-nationale/groupes" 
            class="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm active:scale-95"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-5 w-5 text-white" />
          </NuxtLink>
          
          <div class="min-w-0 flex-1">
            <p class="text-sm text-white/80">Groupe parlementaire</p>
            <h1 class="truncate text-lg font-semibold text-white">
              {{ groupById?.name || 'Chargement...' }}
            </h1>
          </div>
          
          <!-- Status badge -->
          <div v-if="groupById?.status === 'active'" class="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 backdrop-blur-sm">
            <span class="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span class="text-xs font-medium text-white">Actif</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="mx-auto max-w-6xl px-4 pb-24">
      <!-- Group Card - overlapping hero -->
      <div class="relative -mt-16 mb-6">
        <!-- Loading skeleton -->
        <div v-if="loading" class="rounded-2xl bg-white p-6 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
          <div class="flex flex-col items-center gap-4 md:flex-row">
            <USkeleton class="h-24 w-24 rounded-2xl" />
            <div class="flex-1 space-y-3 text-center md:text-left">
              <USkeleton class="mx-auto h-6 w-48 md:mx-0" />
              <USkeleton class="mx-auto h-4 w-32 md:mx-0" />
              <div class="flex flex-wrap justify-center gap-2 md:justify-start">
                <USkeleton class="h-8 w-24 rounded-full" />
                <USkeleton class="h-8 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="rounded-2xl bg-red-50 p-6 text-center dark:bg-red-900/20">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="font-medium text-red-800 dark:text-red-300">Erreur de chargement</h3>
          <p class="mt-1 text-sm text-red-600 dark:text-red-400">Impossible de charger les informations du groupe</p>
          <NuxtLink 
            to="/assemblee-nationale/groupes"
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
            Retour aux groupes
          </NuxtLink>
        </div>

        <!-- Group info card -->
        <div v-else-if="groupById" class="rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
          <div class="flex flex-col items-center gap-5 md:flex-row">
            <!-- Logo -->
            <div class="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 ring-4 ring-white dark:bg-gray-700 dark:ring-gray-800">
              <img
                v-if="groupById.logo"
                :src="useCmsImage(groupById.logo, 100)"
                :alt="`Logo ${groupById.name}`"
                class="h-full w-full object-contain"
              />
              <UIcon v-else name="i-heroicons-user-group" class="h-12 w-12 text-gray-400" />
            </div>
            
            <!-- Info -->
            <div class="flex-1 text-center md:text-left">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ groupById.name }}</h2>
              
              <p v-if="groupById.creation_date" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Créé le {{ formatDate(groupById.creation_date) }}
              </p>
              
              <div class="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                <!-- Members count -->
                <span class="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                  <UIcon name="i-heroicons-users" class="h-4 w-4" />
                  {{ groupById.members?.length || 0 }} membres
                </span>
              </div>
            </div>
          </div>
          
          <!-- Description -->
          <p v-if="groupById.description" class="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-700/50 dark:text-gray-300">
            {{ groupById.description }}
          </p>
        </div>
      </div>

      <!-- Bureau section -->
      <div v-if="groupById && (groupById.president || groupById.vice_president)" class="mb-6 rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <UIcon name="i-heroicons-star" class="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Bureau du groupe</h3>
        </div>
        
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <!-- President -->
          <NuxtLink
            v-if="groupById.president"
            :to="`/assemblee-nationale/deputes/${groupById.president.id}/${$getSlugifyUrlPath(groupById.president.first_name + '-' + groupById.president.last_name)}`"
            class="group flex items-center gap-4 rounded-xl bg-emerald-50 p-4 transition-all active:scale-[0.99] hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
          >
            <img
              v-if="groupById.president.photo"
              :src="useCmsImage(groupById.president.photo)"
              :alt="groupById.president.first_name"
              class="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-500"
            />
            <div v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-200 ring-2 ring-emerald-500 dark:bg-emerald-800">
              <UIcon name="i-heroicons-user" class="h-7 w-7 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate font-medium text-gray-900 dark:text-white">
                {{ groupById.president.first_name }} {{ groupById.president.last_name }}
              </div>
              <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                <UIcon name="i-heroicons-star" class="h-3 w-3" />
                Président(e)
              </span>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 text-emerald-400 transition-transform group-hover:translate-x-1" />
          </NuxtLink>
          
          <!-- Vice-president -->
          <NuxtLink
            v-if="groupById.vice_president"
            :to="`/assemblee-nationale/deputes/${groupById.vice_president.id}/${$getSlugifyUrlPath(groupById.vice_president.first_name + '-' + groupById.vice_president.last_name)}`"
            class="group flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition-all active:scale-[0.99] hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
          >
            <img
              v-if="groupById.vice_president.photo"
              :src="useCmsImage(groupById.vice_president.photo)"
              :alt="groupById.vice_president.first_name"
              class="h-14 w-14 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600"
            />
            <div v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 ring-2 ring-gray-300 dark:bg-gray-600 dark:ring-gray-500">
              <UIcon name="i-heroicons-user" class="h-7 w-7 text-gray-400 dark:text-gray-300" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate font-medium text-gray-900 dark:text-white">
                {{ groupById.vice_president.first_name }} {{ groupById.vice_president.last_name }}
              </div>
              <span class="text-sm text-gray-500 dark:text-gray-400">Vice-président(e)</span>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 dark:text-gray-500" />
          </NuxtLink>
        </div>
      </div>

      <!-- Members section -->
      <div v-if="groupById?.members?.length" class="rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <div class="mb-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
              <UIcon name="i-heroicons-users" class="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Membres du groupe</h3>
          </div>
          <span class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {{ groupById.members.length }} députés
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <AssemblyDeputyCard2
            v-for="deputy in groupById.members"
            :key="deputy.id"
            :deputy="{
              ...deputy,
              group: {
                name: groupById.name || '',
                color: groupById.color || '#gray-500',
              },
              electoral_list: {
                type: '',
                name: '',
                coalition: undefined,
                constituency: undefined,
              },
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// ✅ Nouvelle architecture : useCmsCollection avec mode détail (id)
const {
  group: groupById,
  loading,
  error,
  refresh,
} = useAssemblyGroups({
  id: route.params.id as string,
})

// Fonction de formatage de date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>
