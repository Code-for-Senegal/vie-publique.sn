<template>
  <div class="rounded-lg bg-white p-2 shadow-lg sm:p-4 dark:bg-gray-800">
    <!-- Titre de l'indicateur -->
    <h3 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{{ name }}</h3>

    <!-- Valeur + Variation (côte à côte) -->
    <div class="mb-1 flex items-baseline gap-2">
      <!-- Valeur principale -->
      <span
        class="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl dark:text-white"
      >
        {{ formattedValue }}{{ isPercentage ? '%' : '' }}
      </span>

      <!-- Badge de variation (toujours à côté) -->
      <UBadge
        v-if="showVariationBadge && variation_percentage && !isComparisonText"
        :color="variation_color"
        variant="solid"
        size="xs"
      >
        {{ variation_percentage }}
      </UBadge>
    </div>

    <!-- Unité (en dessous pour les valeurs en milliards) -->
    <div v-if="!isPercentage" class="text-xs text-gray-500 dark:text-gray-400">
      {{ unit }}
    </div>

    <!-- Comparaison année précédente (petit texte en dessous) -->
    <div
      v-if="isComparisonText && variation_percentage"
      class="mt-1 text-xs text-gray-500 dark:text-gray-400"
    >
      {{ variation_percentage }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  value: string;
  unit?: string;
  variation_percentage: string;
  color?: 'green' | 'red' | 'gray';
  variation_color?: 'green' | 'red' | 'gray';
  showVariationBadge?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  color: 'gray',
  variation_color: 'gray',
  showVariationBadge: true,
});

// Détecter si c'est un pourcentage
const isPercentage = computed(() => props.unit === '%');

// Formater la valeur : 1 décimale pour les pourcentages
const formattedValue = computed(() => {
  if (!isPercentage.value) return props.value;

  const numValue = parseFloat(props.value);
  if (isNaN(numValue)) return props.value;

  return numValue.toFixed(1);
});

// Détecter si la variation est un texte de comparaison (ex: "5.2% en 2025")
const isComparisonText = computed(() => {
  return props.variation_percentage && props.variation_percentage.includes('en');
});
</script>
