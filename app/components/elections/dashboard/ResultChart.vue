<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut } from 'vue-chartjs';
import type { Coalition } from '~~/types/coalition';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const props = defineProps<{
  results: Coalition[];
  type: string;
}>();

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');

// Vérifier si des données de sièges existent (pour les législatives)
const hasSeatsData = computed(() => {
  return props.results.some(c => (Number(c.sieges) || 0) + (Number(c.sieges_departement) || 0) > 0);
});

// Le composant ne doit pas s'afficher si législatives sans données de sièges
const shouldDisplay = computed(() => {
  if (props.type === 'legislative') return hasSeatsData.value;
  return true;
});

// Palette de couleurs par défaut si coalition.color est absent
const defaultColors = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#E11D48', '#A855F7', '#22C55E', '#D946EF',
];

const sortedResults = computed(() => {
  return [...props.results]
    .sort((a, b) => (b.voix || 0) - (a.voix || 0))
    .slice(0, 10);
});

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

const getName = (item: Coalition) => {
  if (props.type === 'presidential' && item.head_of_list) {
    const firstName = item.head_of_list.first_name || '';
    const lastName = item.head_of_list.last_name || '';
    return `${firstName} ${lastName}`.trim() || item.name;
  }
  return item.name;
};

const chartColors = computed(() =>
  sortedResults.value.map((item, i) => item.color || defaultColors[i % defaultColors.length])
);

// --- DONUT CHART (Présidentielle) ---
const doughnutData = computed(() => ({
  labels: sortedResults.value.map(item => getName(item)),
  datasets: [{
    data: sortedResults.value.map(item => item.pourcentage || 0),
    backgroundColor: chartColors.value,
    borderColor: isDark.value ? '#111827' : '#ffffff',
    borderWidth: 3,
    hoverBorderWidth: 0,
    hoverOffset: 8,
  }],
}));

const doughnutOptions = computed((): any => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: 0,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        color: isDark.value ? '#d1d5db' : '#374151',
        font: { size: 11, weight: 'bold' as const },
        padding: 12,
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? '#1f2937' : '#ffffff',
      titleColor: isDark.value ? '#f3f4f6' : '#111827',
      bodyColor: isDark.value ? '#d1d5db' : '#374151',
      borderColor: isDark.value ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: {
        label: (context: any) => {
          const item = sortedResults.value[context.dataIndex];
          const lines = [];
          if (props.type === 'presidential' && item) {
            lines.push(` Coalition: ${item.name}`);
          }
          lines.push(` ${context.parsed}% (${formatNumber(item?.voix || 0)} voix)`);
          return lines;
        },
      },
    },
    datalabels: {
      color: '#ffffff',
      font: { size: 11, weight: 'bold' as const },
      formatter: (value: number) => {
        return value >= 3 ? `${value}%` : '';
      },
      anchor: 'center' as const,
      align: 'center' as const,
      textShadowColor: 'rgba(0,0,0,0.4)',
      textShadowBlur: 4,
    },
  },
}));

// --- HÉMICYCLE DYNAMIQUE (Législatives) ---
const getTotalSieges = (item: Coalition) => {
  const national = Number(item.sieges) || 0;
  const dept = Number(item.sieges_departement) || 0;
  return national + dept;
};

const TOTAL_SEATS = 165;
const NUM_ROWS = 10;
const SVG_WIDTH = 360;
const SVG_HEIGHT = 200;
const CENTER_X = SVG_WIDTH / 2;
const CENTER_Y = SVG_HEIGHT - 10;
const MIN_RADIUS = 50;
const MAX_RADIUS = 175;
const SEAT_RADIUS = 5;

// Générer les positions des sièges en hémicycle
const generateSeatPositions = (totalSeats: number) => {
  const radii: number[] = [];
  for (let i = 0; i < NUM_ROWS; i++) {
    radii.push(MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * i / (NUM_ROWS - 1));
  }

  // Répartir les sièges proportionnellement au rayon (arc plus long = plus de sièges)
  const totalProp = radii.reduce((s, r) => s + r, 0);
  const seatsPerRow = radii.map(r => Math.round(totalSeats * r / totalProp));

  // Ajuster pour que le total soit exact
  let diff = totalSeats - seatsPerRow.reduce((s, n) => s + n, 0);
  let idx = seatsPerRow.length - 1;
  while (diff !== 0) {
    seatsPerRow[idx] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
    idx = (idx - 1 + seatsPerRow.length) % seatsPerRow.length;
  }

  const positions: { x: number; y: number }[] = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    const n = seatsPerRow[row];
    const radius = radii[row];
    for (let j = 0; j < n; j++) {
      const angle = Math.PI * (j + 0.5) / n;
      positions.push({
        x: Math.round((CENTER_X - radius * Math.cos(angle)) * 100) / 100,
        y: Math.round((CENTER_Y - radius * Math.sin(angle)) * 100) / 100,
      });
    }
  }
  return positions;
};

interface HemicycleGroup {
  name: string;
  acronym: string | null;
  color: string;
  seats: number;
  positions: { x: number; y: number }[];
}

const hemicycleGroups = computed((): HemicycleGroup[] => {
  const positions = generateSeatPositions(TOTAL_SEATS);

  const coalitions = [...props.results]
    .map((c, i) => ({
      name: c.name,
      acronym: c.acronym,
      color: c.color || defaultColors[i % defaultColors.length],
      totalSeats: getTotalSieges(c),
      voix: c.voix,
      pourcentage: c.pourcentage,
    }))
    .filter(c => c.totalSeats > 0)
    .sort((a, b) => b.totalSeats - a.totalSeats);

  const groups: HemicycleGroup[] = [];
  let seatIdx = 0;
  for (const c of coalitions) {
    const coalitionPositions: { x: number; y: number }[] = [];
    for (let i = 0; i < c.totalSeats && seatIdx < positions.length; i++) {
      coalitionPositions.push(positions[seatIdx]);
      seatIdx++;
    }
    groups.push({
      name: c.name,
      acronym: c.acronym,
      color: c.color,
      seats: c.totalSeats,
      positions: coalitionPositions,
    });
  }

  // Sièges restants non attribués
  if (seatIdx < positions.length) {
    const remaining: { x: number; y: number }[] = [];
    while (seatIdx < positions.length) {
      remaining.push(positions[seatIdx]);
      seatIdx++;
    }
    groups.push({
      name: 'Non attribués',
      acronym: null,
      color: '#d1d5db',
      seats: remaining.length,
      positions: remaining,
    });
  }

  return groups;
});

const totalSiegesAttribues = computed(() => {
  return props.results.reduce((sum, c) => sum + getTotalSieges(c), 0);
});

// Tooltip hémicycle
const hoveredGroup = ref<HemicycleGroup | null>(null);
</script>

<template>
  <div v-if="shouldDisplay" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <div>
        <h3 class="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
          {{ type === 'presidential' ? 'Répartition des voix par candidat' : 'Répartition des sièges par coalition' }}
        </h3>
      </div>
    </div>

    <!-- Chart -->
    <div class="p-4 sm:p-6">
      <ClientOnly>
        <!-- DONUT: Présidentielle -->
        <div v-if="type === 'presidential'" class="flex justify-center">
          <div class="w-full max-w-md" style="height: 360px;">
            <Doughnut
              :key="`donut-${isDark}`"
              :data="doughnutData"
              :options="doughnutOptions"
            />
          </div>
        </div>

        <!-- HÉMICYCLE: Législatives -->
        <div v-else-if="type === 'legislative'" class="flex flex-col items-center">
          <!-- SVG Hémicycle -->
          <div class="w-full max-w-lg">
            <svg
              :viewBox="`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`"
              class="w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Total au centre -->
              <text
                :x="CENTER_X"
                :y="CENTER_Y - 2"
                text-anchor="middle"
                class="fill-gray-900 dark:fill-white"
                style="font-size: 32px; font-weight: bold;"
              >
                {{ totalSiegesAttribues }}
              </text>

              <!-- Groupes de sièges par coalition -->
              <g
                v-for="(group, gi) in hemicycleGroups"
                :key="gi"
                :style="{ fill: group.color }"
                @mouseenter="hoveredGroup = group"
                @mouseleave="hoveredGroup = null"
              >
                <title>{{ group.name }} — {{ group.seats }} siège{{ group.seats > 1 ? 's' : '' }}</title>
                <circle
                  v-for="(pos, si) in group.positions"
                  :key="si"
                  :cx="pos.x"
                  :cy="pos.y"
                  :r="SEAT_RADIUS"
                />
              </g>
            </svg>
          </div>

          <!-- Info au survol -->
          <div class="h-6 text-center mt-1">
            <span v-if="hoveredGroup" class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {{ hoveredGroup.name }} — <span class="font-black" :style="{ color: hoveredGroup.color }">{{ hoveredGroup.seats }}</span> siège{{ hoveredGroup.seats > 1 ? 's' : '' }}
            </span>
          </div>

          <!-- Légende compacte -->
          <div class="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5 max-w-lg">
            <div
              v-for="group in hemicycleGroups"
              :key="group.name"
              class="flex items-center gap-1.5 cursor-default text-xs"
              @mouseenter="hoveredGroup = group"
              @mouseleave="hoveredGroup = null"
            >
              <span
                class="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: group.color }"
              />
              <span class="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {{ group.acronym || group.name }}
              </span>
              <span class="font-bold text-gray-900 dark:text-white">{{ group.seats }}</span>
            </div>
          </div>
        </div>

        <template #fallback>
          <div class="flex items-center justify-center h-64">
            <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600"></div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Footer légende résumée (présidentielle uniquement) -->
    <div v-if="type === 'presidential' && results.length > 10" class="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
      <span class="text-xs text-gray-400 italic">+ {{ results.length - 10 }} autres listes non affichées</span>
    </div>
  </div>
</template>
