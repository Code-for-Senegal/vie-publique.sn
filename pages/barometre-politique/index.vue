<script setup lang="ts">
import type { PromesseStats } from "~/types/promesse";

useHead({
  meta: [{ name: "robots", content: "noindex" }],
});

const runtimeConfig = useRuntimeConfig();
const showBarometer = ref(runtimeConfig.public.showBarometer === "true");

const { data } = await useFetch("/api/barometre-politique/diomaye-faye");
const stats = computed<PromesseStats>(
  () =>
    data.value?.stats || {
      total: 0,
      tenues: 0,
      non_tenues: 0,
      en_cours: 0,
      non_evaluees: 0,
    },
);
</script>

<template>
  <div>
    <!-- <div class="prose prose-sm sm:prose mx-auto my-2">
            <h1 class="text-center">
                Vérificateur de promesses électorales
            </h1>
        </div -->

    <h1 class="my-2 text-center text-2xl font-bold">
      Vérificateur de promesses électorales
    </h1>

    <!-- <div v-if="showBarometer">test</div> -->
    <PromiseOverview v-if="showBarometer" :stats="stats" />

    <div v-else class="text-center text-gray-500">
      <p>Page en cours de construction</p>
      <p>
        Nous listerons ici la liste des promesses électorales du président
        diomaye
      </p>

      <NuxtLink to="/about/barometre">
        <p class="text-md mt-4 text-gray-500 underline">
          En savoir plus sur la démarche ›
        </p>
      </NuxtLink>
    </div>
    <!-- Autres contenus de la page -->
  </div>
</template>
