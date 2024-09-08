<template>
  <div class="mx-auto max-w-md text-center">
    <div class="mx-auto mb-4 w-28">
      <img
        src="/images/diomaye-officielle-1.jfif"
        alt="Diomaye Faye"
        class="w-28 object-cover"
      />
    </div>
    <h2 class="mb-1 text-3xl font-bold">Diomaye Faye</h2>
    <p class="mb-4 text-xl">(2024-2029)</p>
    <div class="mx-auto mb-4 h-1 w-16 bg-gray-500"></div>

    <p class="mb-6 text-xl font-bold">{{ stats.total }} PROMESSES IDENTIFIÉS</p>

    <div class="mb-6 space-y-2 text-left">
      <div
        v-for="(item, key) in statsDisplay"
        :key="key"
        class="flex items-center"
      >
        <span class="mr-2 w-24 text-right font-bold">{{ item.count }}</span>
        <span class="w-40 text-sm uppercase">{{ item.label }}</span>
        <div class="h-4 flex-grow bg-gray-200">
          <div
            :class="item.color"
            :style="{ width: `${(item.count / stats.total) * 100}%` }"
            class="h-full"
          ></div>
        </div>
      </div>
    </div>

    <!-- <UButton to="/barometre-politique/diomaye-faye" class="mb-4">
            Explorer les promesses
        </UButton> -->

    <NuxtLink to="/barometre-politique/diomaye-faye" class="mt-4">
      <p class="font-semibold underline">Explorer les promesses ›</p>
    </NuxtLink>

    <p class="mt-4 text-sm text-gray-500">Mis à jour le 17 Aout 2024</p>

    <NuxtLink to="/about/barometre">
      <p class="text-md mt-4 text-gray-500 underline">
        En savoir plus sur la démarche ›
      </p>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { PromesseStats } from "~/types/promesse";

const props = defineProps<{
  stats: PromesseStats;
}>();

const statsDisplay = computed(() => [
  { count: props.stats.tenues, label: "Tenues", color: "bg-green-600" },
  { count: props.stats.non_tenues, label: "Non tenues", color: "bg-red-600" },
  {
    count: props.stats.en_cours,
    label: "Partiellement",
    color: "bg-orange-500",
  },
  {
    count: props.stats.inevaluables,
    label: "Inévaluables",
    color: "bg-gray-600",
  },
  {
    count: props.stats.non_evaluees,
    label: "Attente d'évaluation",
    color: "bg-gray-400",
  },
]);
</script>
