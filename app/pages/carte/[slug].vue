<script setup lang="ts">
/**
 * Page carte dynamique — charge n'importe quelle config par slug.
 * URL: /carte/elections, /carte/economie, /carte/sante, /carte/infrastructure
 */
import { electionMapConfig } from '~/config/map-elections'
import { economieMapConfig } from '~/config/map-economie'
import { santeMapConfig } from '~/config/map-sante'
import { infraMapConfig } from '~/config/map-infrastructure'
import type { SenegalMapConfig } from '~~/types/map'

definePageMeta({ ssr: false, layout: 'fullscreen' })

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const configs: Record<string, SenegalMapConfig> = {
  elections: electionMapConfig,
  economie: economieMapConfig,
  sante: santeMapConfig,
  infrastructure: infraMapConfig,
}

const activeConfig = computed(() => configs[slug.value] ?? null)

// Charger les données de test
const { data: testData } = await useFetch<any>(() => `/data/test-${slug.value}.json`, {
  default: () => null,
})

// Enrichir les datasets avec les données chargées
const config = computed<SenegalMapConfig | null>(() => {
  const base = activeConfig.value
  if (!base) return null

  if (!testData.value) return base

  return {
    ...base,
    datasets: base.datasets.map((ds) => {
      // Match les données par ID de dataset
      const dataForDs = testData.value?.datasets?.[ds.id] ?? testData.value?.regions ?? ds.data
      return { ...ds, data: Array.isArray(dataForDs) ? dataForDs : ds.data }
    }),
  }
})

// SEO
useSeoMeta({
  title: () => activeConfig.value?.title ?? 'Carte du Sénégal',
  description: () => activeConfig.value?.description ?? 'Carte interactive du Sénégal',
})
</script>

<template>
  <div class="w-full" style="height: calc(100vh - 64px); height: calc(100dvh - 64px); min-height: 0;">
    <MapSenegalMap
      v-if="config"
      :config="config"
      @region-click="(e) => console.log('Region click:', e)"
      @action="(e) => console.log('Action:', e)"
    />
    <div
      v-else
      class="flex items-center justify-center h-full bg-gray-900 text-white"
    >
      <div class="text-center">
        <p class="text-6xl mb-4">🗺️</p>
        <h1 class="text-2xl font-bold mb-2">Carte non trouvée</h1>
        <p class="text-gray-400 mb-4">
          La carte « {{ slug }} » n'existe pas.
        </p>
        <p class="text-sm text-gray-500">
          Cartes disponibles :
          <NuxtLink
            v-for="key in Object.keys(configs)"
            :key="key"
            :to="`/carte/${key}`"
            class="text-blue-400 hover:underline mx-1"
          >
            {{ key }}
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
