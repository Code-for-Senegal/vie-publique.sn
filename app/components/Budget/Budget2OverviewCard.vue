<template>
  <div :class="['rounded-lg p-2 shadow-md sm:p-4', gradientClasses]">
    <!-- Titre de l'indicateur -->
    <h3 :class="['mb-2 text-sm font-semibold', titleColorClass]">{{ name }}</h3>

    <!-- Valeur + Variation (côte à côte) -->
    <div class="mb-1 flex flex-wrap items-baseline gap-2">
      <!-- Valeur principale -->
      <span :class="['text-2xl font-bold tracking-tight sm:text-3xl', valueColorClass]">
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
    <div v-if="!isPercentage" :class="['text-xs', unitColorClass]">
      {{ unit }}
    </div>

    <!-- Comparaison année précédente (petit texte en dessous) -->
    <div v-if="isComparisonText && variation_percentage" :class="['mt-1 text-xs', unitColorClass]">
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
  color?: 'green' | 'red' | 'gray' | 'orange' | 'purple' | 'yellow';
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

// Classes de dégradé en fonction de la couleur
const gradientClasses = computed(() => {
  switch (props.color) {
    case 'green':
      return 'bg-gradient-to-br from-emerald-50 via-green-100 to-teal-200 dark:from-emerald-900/30 dark:via-green-800/25 dark:to-teal-900/20';
    case 'red':
      return 'bg-gradient-to-br from-red-50 via-rose-100 to-pink-200 dark:from-red-900/30 dark:via-rose-800/25 dark:to-pink-900/20';
    case 'orange':
      return 'bg-gradient-to-br from-orange-50 via-orange-100 to-amber-200 dark:from-orange-900/30 dark:via-orange-800/25 dark:to-amber-900/20';
    case 'yellow':
      return 'bg-gradient-to-br from-yellow-50 via-amber-100 to-yellow-200 dark:from-yellow-900/30 dark:via-amber-800/25 dark:to-yellow-900/20';
    case 'purple':
      return 'bg-gradient-to-br from-purple-50 via-violet-100 to-indigo-200 dark:from-purple-900/30 dark:via-violet-800/25 dark:to-indigo-900/20';
    default:
      return 'bg-gradient-to-br from-gray-50 via-gray-100 to-slate-200 dark:from-gray-800/50 dark:via-gray-700/40 dark:to-slate-800/30';
  }
});

// Classe de couleur du titre
const titleColorClass = computed(() => {
  switch (props.color) {
    case 'green':
      return 'text-emerald-800 dark:text-white';
    case 'red':
      return 'text-red-800 dark:text-white';
    case 'orange':
      return 'text-orange-800 dark:text-white';
    case 'yellow':
      return 'text-yellow-800 dark:text-white';
    case 'purple':
      return 'text-purple-800 dark:text-white';
    default:
      return 'text-gray-700 dark:text-white';
  }
});

// Classe de couleur de la valeur
const valueColorClass = computed(() => {
  switch (props.color) {
    case 'green':
      return 'text-emerald-900 dark:text-white';
    case 'red':
      return 'text-red-900 dark:text-white';
    case 'orange':
      return 'text-orange-900 dark:text-white';
    case 'yellow':
      return 'text-yellow-900 dark:text-white';
    case 'purple':
      return 'text-purple-900 dark:text-white';
    default:
      return 'text-gray-800 dark:text-white';
  }
});

// Classe de couleur de l'unité
const unitColorClass = computed(() => {
  switch (props.color) {
    case 'green':
      return 'text-emerald-700 dark:text-white/80';
    case 'red':
      return 'text-red-700 dark:text-white/80';
    case 'orange':
      return 'text-orange-700 dark:text-white/80';
    case 'yellow':
      return 'text-yellow-700 dark:text-white/80';
    case 'purple':
      return 'text-purple-700 dark:text-white/80';
    default:
      return 'text-gray-500 dark:text-white/80';
  }
});
</script>
