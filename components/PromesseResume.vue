<template>
    <div class="text-center max-w-md mx-auto">
        <div class=" w-28 mx-auto mb-4">
            <img src="/images/diomaye-officielle-1.jfif" alt="Diomaye Faye" class="object-cover w-28" />
        </div>
        <h2 class="text-3xl font-bold mb-1">Diomaye Faye</h2>
        <p class="text-xl mb-4">(2024-2029)</p>
        <div class="h-1 w-16 bg-gray-500 mx-auto mb-4"></div>

        <p class="font-bold text-xl mb-6">{{ stats.total }} PROMESSES IDENTIFIÉS</p>

        <div class="space-y-2 text-left mb-6">
            <div v-for="(item, key) in statsDisplay" :key="key" class="flex items-center">
                <span class="w-24 text-right mr-2 font-bold">{{ item.count }}</span>
                <span class="w-32 uppercase text-sm">{{ item.label }}</span>
                <div class="flex-grow h-4 bg-gray-200">
                    <div :class="item.color" :style="{ width: `${(item.count / stats.total) * 100}%` }" class="h-full">
                    </div>
                </div>
            </div>
        </div>

        <!-- <UButton to="/barometre-politique/diomaye-faye" class="mb-4">
            Explorer les promesses
        </UButton> -->

        <NuxtLink to="/barometre-politique/diomaye-faye" class="mt-4">
            <p class="font-semibold underline">
                Explorer les promesses ›
            </p>
        </NuxtLink>


        <p class="text-sm text-gray-500 mt-4">
            Mis à jour le 17 Aout 2024
        </p>

        <NuxtLink to="/about/barometre">
            <p class="text-md text-gray-500 underline mt-4">
                En savoir plus sur la démarche ›
            </p>
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
import type { PromesseStats } from "~/types/promesse";

const props = defineProps<{
    stats: PromesseStats
}>();

const statsDisplay = computed(() => [
    { count: props.stats.tenues, label: 'Tenues', color: 'bg-green-600' },
    { count: props.stats.non_tenues, label: 'Non tenues', color: 'bg-red-600' },
    { count: props.stats.en_cours, label: 'Partiellement', color: 'bg-orange-500' },
    { count: props.stats.inevaluables, label: 'Inévaluables', color: 'bg-gray-600' },
    { count: props.stats.non_evaluees, label: 'Non évaluées', color: 'bg-gray-400' },
]);
</script>