<script setup lang="ts">
// import type { Promesse } from "~/types/promesse";
import {
  getStatusBackgroundClass,
  getStatusIcon,
  getStatusIconClass,
  getStatusTextClass,
} from "@/composables/usePromesseStatus";

import { usePromesseStore } from "@/stores/promesseStore";

useHead({
  meta: [{ name: "robots", content: "noindex" }],
});

const itemStore = usePromesseStore();
const promesse = computed(() => itemStore.selectedItem);

// Vous pouvez aussi vérifier que l'item est bien chargé ou effectuer une redirection si nécessaire
if (!promesse.value) {
  // par exemple, rediriger ou afficher un message d'erreur
  console.log("erreur");
  console.log(promesse);
}

watch(promesse, (newVal) => {
  if (!newVal) {
    console.error("Aucune promesse sélectionnée. Redirection...");
    // router.push({ name: '/barometre-politique/diomaye-faye' });
  }
});

const links = [{ label: "Barometre", to: "/barometre-politique/diomaye-faye" }];
</script>

<template>
  <div>
    <AppBreadcrumb :links="links" last-text="Diomaye faye" />

    <pre>{{ promesse }}</pre>
    <div v-if="promesse">
      <UCard
        class="cursor-pointer transition-shadow duration-300 hover:shadow-lg"
      >
        <div class="flex items-start">
          <div class="mr-3 flex w-20 flex-shrink-0 flex-col items-center">
            <div
              class="mb-1 flex h-12 w-12 items-center justify-center rounded-full"
              :class="getStatusBackgroundClass(promesse.status)"
            >
              <UIcon
                :name="getStatusIcon(promesse.status)"
                class="text-2xl"
                :class="getStatusIconClass(promesse.status)"
              />
            </div>
            <span
              class="text-center text-xs font-medium uppercase"
              :class="getStatusTextClass(promesse.status)"
            >
              {{ promesse.status }}
            </span>
          </div>
          <div class="flex-1">
            <h3 class="mb-1 text-base font-semibold">
              {{ promesse.label }}
            </h3>
            <p class="text-xs text-gray-600">
              Échéance : {{ promesse.schedules }}
            </p>
            <p class="text-xs text-gray-600">Thème : {{ promesse.theme }}</p>
            <p class="text-xs text-gray-600">Source : {{ promesse.source }}</p>
          </div>
        </div>
      </UCard>
    </div>
    <div v-else>test</div>
  </div>
</template>
