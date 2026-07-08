<template>
  <div class="my-6">
    <h2 class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white">
      Suivez-nous sur les réseaux sociaux
    </h2>

    <div class="mx-auto max-w-5xl px-4">
      <!-- Loading state -->
      <div v-if="loading" class="flex flex-wrap items-center justify-center gap-2">
        <div
          v-for="i in 5"
          :key="i"
          class="h-10 w-36 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
        />
      </div>

      <!-- Stats -->
      <div v-else class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <a
          v-for="network in enrichedNetworks"
          :key="network.id"
          :href="network.link"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:py-2.5 dark:border-gray-700 dark:bg-gray-800/80"
          :class="network.hoverBorderClass"
        >
          <UIcon
            :name="network.icon"
            class="network-color h-4 w-4 shrink-0 sm:h-5 sm:w-5"
            :style="`--nc-light: ${network.colorLight}; --nc-dark: ${network.colorDark}`"
          />
          <span class="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
            {{ network.name }}
          </span>
          <span
            class="network-color text-xs font-bold sm:text-sm"
            :style="`--nc-light: ${network.colorLight}; --nc-dark: ${network.colorDark}`"
          >
            {{ formatFollowers(network.followers) }}
          </span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SocialStat } from '~~/types/social-stat';

const { visibleStats: socialStats, loading } = useSocialStats();

interface NetworkMeta {
  icon: string;
  color: string;
  colorDark: string;
  hoverBorderClass: string;
}

const networkMetaMap: Record<string, NetworkMeta> = {
  linkedin: {
    icon: 'i-simple-icons-linkedin',
    color: '#0A66C2',
    colorDark: '#60a5fa',
    hoverBorderClass: 'hover:border-[#0A66C2]/50 dark:hover:border-[#60a5fa]/50',
  },
  facebook: {
    icon: 'i-simple-icons-facebook',
    color: '#1877F2',
    colorDark: '#60a5fa',
    hoverBorderClass: 'hover:border-[#1877F2]/50 dark:hover:border-[#60a5fa]/50',
  },
  instagram: {
    icon: 'i-simple-icons-instagram',
    color: '#E4405F',
    colorDark: '#f472b6',
    hoverBorderClass: 'hover:border-[#E4405F]/50 dark:hover:border-[#f472b6]/50',
  },
  twitter: {
    icon: 'i-simple-icons-x',
    color: '#000000',
    colorDark: '#e5e7eb',
    hoverBorderClass: 'hover:border-gray-500 dark:hover:border-gray-400',
  },
  x: {
    icon: 'i-simple-icons-x',
    color: '#000000',
    colorDark: '#e5e7eb',
    hoverBorderClass: 'hover:border-gray-500 dark:hover:border-gray-400',
  },
  youtube: {
    icon: 'i-simple-icons-youtube',
    color: '#FF0000',
    colorDark: '#f87171',
    hoverBorderClass: 'hover:border-[#FF0000]/50 dark:hover:border-[#f87171]/50',
  },
  tiktok: {
    icon: 'i-simple-icons-tiktok',
    color: '#000000',
    colorDark: '#e5e7eb',
    hoverBorderClass: 'hover:border-gray-500 dark:hover:border-gray-400',
  },
  whatsapp: {
    icon: 'i-simple-icons-whatsapp',
    color: '#25D366',
    colorDark: '#4ade80',
    hoverBorderClass: 'hover:border-[#25D366]/50 dark:hover:border-[#4ade80]/50',
  },
};

const defaultMeta: NetworkMeta = {
  icon: 'i-heroicons-globe-alt',
  color: '#6b7280',
  colorDark: '#9ca3af',
  hoverBorderClass: 'hover:border-gray-400 dark:hover:border-gray-500',
};

const getNetworkMeta = (name: string): NetworkMeta => {
  const key = name.toLowerCase().trim();
  // Exact match first, then partial match (e.g. "Twitter (X)" matches "twitter")
  return (
    networkMetaMap[key] ||
    Object.entries(networkMetaMap).find(([k]) => key.includes(k))?.[1] ||
    defaultMeta
  );
};

const enrichedNetworks = computed(() =>
  socialStats.value.map((stat: SocialStat) => {
    const meta = getNetworkMeta(stat.name);
    return {
      ...stat,
      icon: meta.icon,
      colorLight: meta.color,
      colorDark: meta.colorDark,
      hoverBorderClass: meta.hoverBorderClass,
    };
  }),
);

const formatFollowers = (count: number): string => {
  if (count >= 1000000) {
    const val = count / 1000000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (count >= 1000) {
    const val = count / 1000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
  }
  return count.toString();
};
</script>

<style scoped>
.network-color {
  color: var(--nc-light);
}

.dark .network-color {
  color: var(--nc-dark);
}
</style>
