<script setup lang="ts">
import type { PublicProject } from '~~/types/public-project';

interface Props {
  projects: PublicProject[];
}

const props = defineProps<Props>();

// Couleurs et icones par axe politique (ordre stable)
const policyStyles: Record<string, { color: string; bg: string; darkBg: string; icon: string }> = {
  default_0: { color: '#16a34a', bg: 'bg-green-50', darkBg: 'dark:bg-green-900/20', icon: 'i-heroicons-academic-cap' },
  default_1: { color: '#eab308', bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/20', icon: 'i-heroicons-building-office' },
  default_2: { color: '#06b6d4', bg: 'bg-cyan-50', darkBg: 'dark:bg-cyan-900/20', icon: 'i-heroicons-cpu-chip' },
  default_3: { color: '#ef4444', bg: 'bg-red-50', darkBg: 'dark:bg-red-900/20', icon: 'i-heroicons-shield-check' },
  default_4: { color: '#8b5cf6', bg: 'bg-violet-50', darkBg: 'dark:bg-violet-900/20', icon: 'i-heroicons-globe-alt' },
  default_5: { color: '#f97316', bg: 'bg-orange-50', darkBg: 'dark:bg-orange-900/20', icon: 'i-heroicons-heart' },
  default_6: { color: '#3b82f6', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20', icon: 'i-heroicons-light-bulb' },
  default_7: { color: '#ec4899', bg: 'bg-pink-50', darkBg: 'dark:bg-pink-900/20', icon: 'i-heroicons-users' },
};

interface PolicyCard {
  id: number;
  title: string;
  count: number;
  percentage: number;
  color: string;
  bg: string;
  darkBg: string;
  icon: string;
}

const policyCards = computed<PolicyCard[]>(() => {
  const policyMap = new Map<number, { title: string; count: number }>();

  for (const project of props.projects) {
    if (!project.policyPrimary) continue;
    const existing = policyMap.get(project.policyPrimary.id);
    if (existing) {
      existing.count++;
    } else {
      policyMap.set(project.policyPrimary.id, {
        title: project.policyPrimary.title,
        count: 1,
      });
    }
  }

  const total = props.projects.length || 1;
  const sorted = Array.from(policyMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count);

  return sorted.map((item, index) => {
    const styleKey = `default_${index % Object.keys(policyStyles).length}`;
    const style = policyStyles[styleKey];
    return {
      id: item.id,
      title: item.title,
      count: item.count,
      percentage: Math.round((item.count / total) * 100),
      color: style.color,
      bg: style.bg,
      darkBg: style.darkBg,
      icon: style.icon,
    };
  });
});

// Arc SVG pour la jauge semi-circulaire
const getArcPath = (percentage: number): string => {
  const radius = 32;
  const cx = 40;
  const cy = 40;
  // Arc de 180 degres (semi-cercle), de gauche a droite
  const startAngle = Math.PI; // 180°
  const endAngle = Math.PI + (Math.PI * percentage) / 100;
  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);
  const largeArc = percentage > 50 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
};
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <h3 class="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
      Répartition par axe politique
    </h3>

    <div v-if="policyCards.length > 0" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        v-for="card in policyCards"
        :key="card.id"
        class="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-colors dark:border-gray-700"
        :class="[card.bg, card.darkBg]"
      >
        <!-- Icone -->
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          :style="{ backgroundColor: card.color + '20' }"
        >
          <UIcon :name="card.icon" class="h-5 w-5" :style="{ color: card.color }" />
        </div>

        <!-- Texte -->
        <div class="min-w-0 flex-1">
          <p class="line-clamp-2 text-sm font-semibold leading-tight text-gray-900 dark:text-white">
            {{ card.title }}
          </p>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {{ card.count }} projet{{ card.count > 1 ? 's' : '' }}
          </p>
          <!-- Barre de progression -->
          <div class="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{ width: card.percentage + '%', backgroundColor: card.color }"
            ></div>
          </div>
        </div>

        <!-- Jauge semi-circulaire -->
        <div class="relative flex shrink-0 flex-col items-center">
          <svg width="60" height="36" viewBox="0 0 80 44" class="overflow-visible">
            <!-- Arc fond -->
            <path
              :d="getArcPath(100)"
              fill="none"
              stroke="currentColor"
              stroke-width="6"
              stroke-linecap="round"
              class="text-gray-200 dark:text-gray-700"
            />
            <!-- Arc valeur -->
            <path
              :d="getArcPath(card.percentage)"
              fill="none"
              :stroke="card.color"
              stroke-width="6"
              stroke-linecap="round"
            />
          </svg>
          <span
            class="-mt-1 text-sm font-bold"
            :style="{ color: card.color }"
          >
            {{ card.percentage }}%
          </span>
        </div>
      </div>
    </div>

    <p v-else class="py-8 text-center text-sm text-gray-400">Aucune donnée</p>
  </div>
</template>
