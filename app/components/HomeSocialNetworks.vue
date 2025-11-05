<template>
  <div class="my-8">
    <div class="prose prose-sm mx-auto mb-8 sm:prose">
      <!-- <div class="prose prose-sm sm:prose mx-auto mb-4"> -->

      <h2 class="text-center text-xl text-gray-800 dark:text-white">Nos réseaux sociaux</h2>
    </div>

    <div class="mx-auto max-w-5xl">
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
        <a
          v-for="network in socialNetworks"
          :key="network.id"
          :href="network.href"
          target="_blank"
          rel="noopener noreferrer"
          class="group block"
        >
          <div
            class="flex flex-col items-center bg-white p-4 text-center shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md sm:p-6 dark:bg-gray-800 dark:ring-1 dark:ring-gray-700 dark:backdrop-blur-md"
          >
            <div class="mb-2 rounded-full p-3" :class="getBackgroundClass(network)">
              <UIcon :name="network.icon" class="h-8 w-8" :style="`color: ${network.color}`" />
            </div>
            <h3 class="mb-1 font-medium text-gray-900 dark:text-white">
              {{ network.name }}
            </h3>
            <p
              class="mb-2 text-sm font-medium dark:text-white"
              :style="$colorMode.value === 'dark' ? '' : `color: ${network.color}`"
            >
              {{ network.followers }}
            </p>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import socialNetworksData from '~/assets/data/social-networks.json';

interface SocialNetwork {
  id: string;
  name: string;
  href: string;
  icon: string;
  color: string;
  colorDark: string;
  followers: string;
  bgGradient: boolean;
  bgGradientColors?: string;
  display: boolean;
}

// Filtrer uniquement les réseaux avec display: true
const socialNetworks = computed(() =>
  socialNetworksData.networks.filter((network: SocialNetwork) => network.display),
);

const getBackgroundClass = (network: SocialNetwork) => {
  if (network.bgGradient && network.bgGradientColors) {
    return `bg-gradient-to-br ${network.bgGradientColors}`;
  }

  // Créer une classe de fond basée sur la couleur avec opacité
  const colorMap: Record<string, string> = {
    '#0A66C2': 'bg-[#0A66C2]/10',
    '#1877F2': 'bg-[#1877F2]/10',
    '#E4405F': 'bg-[#E4405F]/10',
    black: 'bg-black/10',
    '#000000': 'bg-black/10',
    '#FF0000': 'bg-[#FF0000]/10',
    '#25D366': 'bg-[#25D366]/10',
  };

  return colorMap[network.color] || 'bg-gray-100';
};
</script>
