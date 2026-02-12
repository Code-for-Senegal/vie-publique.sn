<script setup lang="ts">
interface Props {
  selectedYear: number;
  selectedType: string;
  config?: {
    types: Array<{ label: string; value: string }>;
    years: Array<{ label: string; value: number }>;
    elections?: Array<{ year: number; type: string; [key: string]: any }>;
  };
  hideTabsMobile?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:year', year: number): void;
  (e: 'update:type', type: string): void;
  (e: 'clear-coalition'): void;
}>();

// Filter years based on selected election type
const filteredYears = computed(() => {
  if (!props.config?.elections || props.config.elections.length === 0) {
    return props.config?.years || [];
  }

  // Get years that have the selected election type
  const yearsForType = props.config.elections
    .filter(election => election.type === props.selectedType)
    .map(election => election.year);

  // Filter the years array to only include years with this election type
  return props.config.years.filter(yearOption =>
    yearsForType.includes(yearOption.value)
  );
});

const handleYearChange = (year: number) => {
  emit('update:year', year);
  emit('clear-coalition');
};

const handleTypeChange = (type: string) => {
  emit('update:type', type);
  emit('clear-coalition');
};

// Responsivité pour masquage définitif
const isMobile = useMediaQuery('(max-width: 768px)');
const shouldShowSelectors = computed(() => {
  if (!props.hideTabsMobile) return true;
  return !isMobile.value;
});
</script>

<template>
  <header class="backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 w-full transition-all">
    <div class="container mx-auto px-4 py-4 md:py-6">
      <!-- Breadcrumb slot -->
      <slot name="breadcrumb" />

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <UIcon name="i-heroicons-bolt-20-solid" class="text-white h-6 w-6" />
          </div>
          <div>
            <h1 class="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
              Elections <span class="text-primary-600">{{ selectedYear }}</span>
            </h1>
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ selectedType }}</p>
            </div>
          </div>
        </div>

        <!-- Selectors -->
        <div
          v-if="shouldShowSelectors"
          class="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-2xl border dark:border-gray-700"
        >
          <USelectMenu
            :model-value="selectedType"
            :options="config?.types || []"
            value-attribute="value"
            option-attribute="label"
            class="w-36 md:w-44"
            :ui-menu="{ rounded: 'rounded-xl' }"
            @update:model-value="handleTypeChange"
          >
            <template #label>
              <span class="truncate text-xs font-bold">{{ config?.types.find(t => t.value === selectedType)?.label || selectedType }}</span>
            </template>
          </USelectMenu>

          <USelectMenu
            :model-value="selectedYear"
            :options="filteredYears"
            value-attribute="value"
            option-attribute="label"
            class="w-24 md:w-28"
            @update:model-value="handleYearChange"
          >
            <template #label>
              <span class="truncate text-xs font-bold">{{ selectedYear }}</span>
            </template>
          </USelectMenu>
        </div>
      </div>

      <!-- Tabs Slot -->
      <div
        v-if="shouldShowSelectors"
        class="mt-6 flex justify-center w-full px-2"
      >
        <slot name="tabs" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.container {
  max-width: 1400px;
}
</style>
