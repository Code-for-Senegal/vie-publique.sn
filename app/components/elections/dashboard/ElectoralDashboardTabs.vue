<script setup lang="ts">
interface Props {
  modelValue: number;
  selectedType?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const allTabs = [
  {
    id: "candidats",
    icon: "i-heroicons-user-group",
  },
  { id: "carte", label: "Carte", icon: "i-heroicons-map" },
  { id: "resultats", label: "Résultats", icon: "i-heroicons-chart-bar" },
  { id: "documents", label: "Documents", icon: "i-heroicons-document-duplicate" },
  { id: "statistiques", label: "Stats", icon: "i-heroicons-presentation-chart-line", hidden: true },
  { id: "guide", label: "Guide", icon: "i-heroicons-play-circle" },
];

const tabs = computed(() => {
  const visibleTypes: Record<string, string[]> = {
    legislative: ['statistiques'],
  };

  return allTabs
    .filter(tab => !tab.hidden || visibleTypes[props.selectedType ?? '']?.includes(tab.id))
    .map(tab => ({
      ...tab,
      label: tab.id === 'candidats'
        ? props.selectedType === 'presidential' ? 'Candidats' : (props.selectedType === 'locale' ? 'Circonscriptions' : 'Coalitions')
        : tab.label,
    }));
});

const currentTabIndex = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>

<template>
  <div class="w-full max-w-3xl">
    <div class="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 w-full">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        class="relative flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 sm:px-3 rounded-lg transition-all duration-200 whitespace-nowrap text-[9px] sm:text-xs"
        :class="[
          'sm:flex-1',
          currentTabIndex === index
            ? 'bg-primary-600 dark:bg-primary-500 text-white font-black shadow-md'
            : 'text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white font-bold flex-1',
        ]"
        @click="currentTabIndex = index"
      >
        <UIcon :name="tab.icon" class="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
        <span
          class="truncate transition-all duration-200"
          :class="currentTabIndex === index ? 'inline' : 'hidden sm:inline'"
        >
          {{ tab.label }}
        </span>
      </button>
    </div>
  </div>
</template>
