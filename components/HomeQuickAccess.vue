<script setup lang="ts">
import type { NavigationCard } from "~/composables/useNavigationCards";

defineProps<{
  navigationCards: NavigationCard[];
}>();

const { getQuickAccessIconBackground, getQuickAccessIconColor } =
  useNavigationCards();
</script>

<template>
  <div class="my-2">
    <div class="flex justify-center">
      <div class="w-full max-w-4xl">
        <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
          <NuxtLink
            v-for="card in navigationCards.filter((c) => c.display !== false)"
            :key="card.title"
            :to="card.to"
            class="group block"
          >
            <div
              class="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-1.5 py-1 shadow-sm transition-all duration-300 hover:translate-y-[-1px] hover:border-gray-300 hover:shadow-md sm:gap-1.5 sm:px-2 sm:py-1.5 dark:border-gray-700 dark:bg-gray-800/90 dark:hover:border-gray-600"
            >
              <!-- Icône -->
              <div
                class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 group-hover:scale-105 sm:h-6 sm:w-6"
                :class="getQuickAccessIconBackground(card.title)"
              >
                <UIcon
                  :name="card.icon"
                  class="h-2.5 w-2.5 sm:h-3 sm:w-3"
                  :class="getQuickAccessIconColor(card.title)"
                />
              </div>

              <!-- Titre -->
              <span
                class="whitespace-nowrap text-[10px] font-medium text-gray-900 sm:text-xs dark:text-white"
              >
                {{ card.title }}
              </span>

              <!-- Badge avec nombre -->
              <span
                class="rounded-full bg-gray-100 px-1 py-0.5 text-[10px] font-medium text-gray-600 sm:px-1.5 sm:text-xs dark:bg-gray-600 dark:text-gray-300"
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
