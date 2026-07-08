<script setup lang="ts">
/**
 * Page index des cartes — liste les cartes disponibles.
 * URL: /carte
 */
definePageMeta({ ssr: true })

useSeoMeta({
  title: 'Cartes interactives du Sénégal',
  description:
    'Explorez les données du Sénégal sur des cartes interactives : élections, économie, santé, infrastructure.',
})

const cartes = [
  {
    slug: 'elections',
    title: 'Élections Présidentielles 2024',
    description: 'Résultats par région, participation et bureaux de vote',
    icon: '🗳️',
    color: 'from-green-600 to-emerald-800',
  },
  {
    slug: 'economie',
    title: 'Indicateurs Économiques',
    description: 'PIB par région, marchés et flux commerciaux',
    icon: '💰',
    color: 'from-amber-600 to-orange-800',
  },
  {
    slug: 'sante',
    title: 'Couverture Sanitaire',
    description: 'Vaccination, hôpitaux et foyers épidémiques',
    icon: '🏥',
    color: 'from-blue-600 to-indigo-800',
  },
  {
    slug: 'infrastructure',
    title: 'Infrastructure & Connectivité',
    description: 'Électrification, eau potable, routes et réseau mobile',
    icon: '⚡',
    color: 'from-purple-600 to-violet-800',
  },
]
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-12">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        🗺️ Cartes interactives du Sénégal
      </h1>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Explorez les données du Sénégal sur des cartes interactives propulsées par MapLibre GL et deck.gl.
        Chaque carte est configurable et affiche des couches de données en temps réel.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NuxtLink
        v-for="carte in cartes"
        :key="carte.slug"
        :to="`/carte/${carte.slug}`"
        class="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      >
        <div
          class="bg-gradient-to-br p-8 text-white min-h-[180px] flex flex-col justify-between"
          :class="carte.color"
        >
          <div>
            <span class="text-4xl mb-4 block">{{ carte.icon }}</span>
            <h2 class="text-xl font-bold mb-2 group-hover:underline">
              {{ carte.title }}
            </h2>
            <p class="text-sm text-white/80">
              {{ carte.description }}
            </p>
          </div>
          <div class="mt-4 flex items-center text-sm text-white/70 group-hover:text-white transition-colors">
            <span>Explorer la carte →</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
