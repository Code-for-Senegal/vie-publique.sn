<script setup lang="ts">
import PromesseResume from '~/components/PromesseResume.vue';
import type { PromesseStats } from "~/types/promesse";

useHead({
    meta: [
        { name: 'robots', content: 'noindex' }
    ]
})

const runtimeConfig = useRuntimeConfig();
const showBarometer = ref(runtimeConfig.public.showBarometer === 'true');

const { data } = await useFetch('/api/barometre-politique/diomaye-faye');
const stats = computed<PromesseStats>(() => data.value?.stats || {
    total: 0,
    tenues: 0,
    non_tenues: 0,
    en_cours: 0,
    non_evaluees: 0
});
</script>

<template>
    <div>
        <!-- <div class="prose prose-sm sm:prose mx-auto my-2">
            <h1 class="text-center">
                Vérificateur de promesses électorales
            </h1>
        </div -->

        <h1 class="text-2xl font-bold text-center my-2">Vérificateur de promesses électorales</h1>

        <PromesseResume :stats="stats" v-if="showBarometer" />

        <div v-else class="text-gray-500 text-center">
            <p> Page en cours de construction </p>
            <p> Nous listerons ici la liste des promesses électorales du président diomaye</p>

            <NuxtLink to="/about/barometre">
                <p class="text-md text-gray-500 underline mt-4">
                    En savoir plus sur la démarche ›
                </p>
            </NuxtLink>
        </div>
        <!-- Autres contenus de la page -->
    </div>
</template>
