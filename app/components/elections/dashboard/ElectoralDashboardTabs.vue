<script setup lang="ts">
interface Props {
  modelValue: number;
  selectedType?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const tabs = computed(() => [
  {
    id: "candidats",
    label: props.selectedType === 'presidential' ? 'Candidats' : (props.selectedType === 'locale' ? 'Circonscriptions' : 'Coalitions'),
    icon: "i-heroicons-user-group"
  },
  { id: "carte", label: "Carte", icon: "i-heroicons-map" },
  { id: "resultats", label: "Résultats", icon: "i-heroicons-chart-bar" },
  { id: "documents", label: "Documents", icon: "i-heroicons-document-duplicate" },
  { id: "statistiques", label: "Stats", icon: "i-heroicons-presentation-chart-line" },
  { id: "guide", label: "Guide", icon: "i-heroicons-play-circle" },
]);

const currentTabIndex = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>

<template>
  <UTabs
    v-model="currentTabIndex"
    :items="tabs"
    class="w-full max-w-3xl"
    :ui="{
      wrapper: 'space-y-0',
      container: 'hidden',
      list: {
        base: 'grid grid-cols-6 gap-0 w-full',
        background: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700',
        marker: {
          wrapper: 'absolute inset-0 flex',
          base: 'w-full h-full',
          background: 'bg-primary-600 dark:bg-primary-500 rounded-lg shadow-md',
        },
        tab: {
          base: 'relative flex items-center justify-center py-2.5 px-1 transition-all duration-200 whitespace-nowrap z-10',
          active: 'text-white font-black',
          inactive: 'text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white font-bold',
          rounded: 'rounded-lg',
          size: 'text-[9px] sm:text-xs'
        }
      }
    }"
  >
    <template #item="{ item }">
      <div class="flex items-center justify-center gap-1 sm:gap-1.5">
        <UIcon :name="item.icon" class="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
        <!-- Sur mobile: texte visible uniquement pour le tab actif -->
        <!-- Sur desktop: texte toujours visible -->
        <span 
          class="truncate transition-all duration-200"
          :class="tabs[currentTabIndex]?.id === item.id ? 'inline' : 'hidden sm:inline'"
        >
          {{ item.label }}
        </span>
      </div>
    </template>
  </UTabs>
</template>
