<template>
  <div class="relative">
    <div class="hidden">
      <svg :width="size" :height="size" viewBox="0 0 100 100">
        <!-- Cercle de fond -->
        <circle cx="50" cy="50" :r="radius" fill="#f0f0f0" />

        <!-- Segments pour chaque catégorie -->
        <path
          v-for="(segment, index) in segments"
          :key="index"
          :d="segment.path"
          :fill="segment.color"
        />

        <!-- Cercle central pour le total -->
        <circle cx="50" cy="50" :r="innerRadius" fill="white" />
      </svg>
    </div>
    <!-- Texte central pour le total -->
    <div
      class="absolute inset-0 flex hidden flex-col items-center justify-center text-center"
    >
      <div class="text-3xl font-bold">{{ totalValue }} Mrd</div>
      <div class="text-sm">FCFA</div>
    </div>

    <!-- Légende -->
    <div class="text-center">
      <div class="mt-4 grid grid-cols-2 gap-2">
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="flex items-center"
        >
          <div :class="['mr-2 h-4 w-4', category.color]"></div>
          <div class="mr-2 font-semibold">{{ category.name }}</div>

          <div>
            <div>{{ category.value }} Mrd ({{ category.percentage }}%)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  categories: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  size?: number;
}>();

const size = computed(() => props.size || 300);
const radius = computed(() => 45);
const innerRadius = computed(() => 30);

const totalValue = computed(() =>
  props.categories.reduce((sum, category) => sum + category.value, 0),
);

const segments = computed(() => {
  let startAngle = 0;
  return props.categories.map((category) => {
    const percentage = (category.value / totalValue.value) * 100;
    const angle = (percentage / 100) * Math.PI * 2;
    const endAngle = startAngle + angle;
    const x1 = 50 + radius.value * Math.cos(startAngle);
    const y1 = 50 + radius.value * Math.sin(startAngle);
    const x2 = 50 + radius.value * Math.cos(endAngle);
    const y2 = 50 + radius.value * Math.sin(endAngle);
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const path = `M 50 50 L ${x1} ${y1} A ${radius.value} ${radius.value} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    startAngle = endAngle;
    return { path, color: category.color };
  });
});
</script>
