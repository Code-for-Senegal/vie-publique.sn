<script setup lang="ts">
import type { NavigationCard } from "~/composables/useNavigationCards";

defineProps<{
  navigationCards: NavigationCard[];
}>();

// Utilisation du composable centralisé pour les couleurs
const { getQuickAccessIconBackground, getQuickAccessIconColor } =
  useNavigationCards();
</script>

<template>
  <div class="my-2">
    <!-- Section centrée comme la recherche -->
    <div class="flex justify-center">
      <div class="w-full max-w-4xl">
        <!-- Boutons en flex wrap pour s'adapter naturellement -->
        <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
          <!-- Conteneur avec largeur maximale pour forcer le wrap sur mobile -->
          <NuxtLink
            v-for="card in navigationCards"
            :key="card.title"
            :to="card.to"
            class="group block"
          >
            <div
              class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-sm transition-all duration-300 hover:translate-y-[-1px] hover:border-gray-300 hover:shadow-md sm:gap-2 sm:px-3 sm:py-2 dark:border-gray-700 dark:bg-gray-800/90 dark:hover:border-gray-600"
            >
              <!-- Icône -->
              <div
                class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 group-hover:scale-105 sm:h-8 sm:w-8"
                :class="getQuickAccessIconBackground(card.title)"
              >
                <UIcon
                  :name="card.icon"
                  class="h-3 w-3 sm:h-4 sm:w-4"
                  :class="getQuickAccessIconColor(card.title)"
                />
              </div>

              <!-- Titre -->
              <span
                class="whitespace-nowrap text-xs font-medium text-gray-900 sm:text-sm dark:text-white"
              >
                {{ card.title }}
              </span>

              <!-- Badge avec nombre -->
              <span
                class="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 sm:px-2 dark:bg-gray-600 dark:text-gray-300"
              >
                {{ card.count || 0 }}
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation pour l'effet de levée au hover */
.group:hover .translate-y-\[-3px\] {
  transform: translateY(-3px);
}
</style>
