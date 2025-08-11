<script setup lang="ts">
import type { NavigationCard } from "~/composables/useNavigationCards";

defineProps<{
  navigationCards: NavigationCard[];
}>();

// Utilisation du composable centralisé pour les couleurs
const { getMenuCardColor } = useNavigationCards();
</script>

<template>
  <div class="my-4">
    <!-- Titre de la section -->
    <!-- <div class="prose prose-sm sm:prose mx-auto my-4">
      <h2 class="text-center text-gray-800 dark:text-white">
        Explorez nos données
      </h2>
    </div> -->

    <!-- Grille des cartes -->
    <div
      class="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3"
    >
      <NuxtLink
        v-for="card in navigationCards"
        :key="card.title"
        :to="card.to"
        class="group block"
      >
        <div
          class="custom-shadow flex items-center gap-2 rounded-xl bg-white p-3 shadow-md shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:bg-gray-700/80 hover:shadow-xl sm:p-4 dark:bg-gray-800/80 dark:ring-1 dark:ring-gray-700 dark:backdrop-blur-md"
        >
          <!-- Icône -->
          <div class="flex-shrink-0">
            <UIcon
              :name="card.icon"
              class="h-6 w-6 transition-transform duration-200 group-hover:scale-110"
              :class="getMenuCardColor(card.title)"
            />
          </div>

          <!-- Titre -->
          <div class="min-w-0 flex-1">
            <h3
              class="line-clamp-2 text-sm font-medium leading-tight text-gray-900 sm:line-clamp-1 sm:text-base dark:text-white"
            >
              {{ card.title }}
            </h3>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
