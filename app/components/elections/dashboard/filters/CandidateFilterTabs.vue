<script setup lang="ts">
import type { FilterOption } from '~~/types/electoral-dashboard';

interface Props {
  modelValue: string;
  options: FilterOption[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <div class="flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
    <UButton
      v-for="option in options"
      :key="option.value"
      :color="modelValue === option.value ? 'primary' : 'gray'"
      :variant="modelValue === option.value ? 'solid' : 'ghost'"
      size="sm"
      class="rounded-full px-4 transition-all duration-300 gap-2"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
      <UBadge
        v-if="option.count !== undefined"
        :color="modelValue === option.value ? 'white' : 'primary'"
        variant="solid"
        size="xs"
        class="rounded-full min-w-[20px] justify-center"
      >
        {{ option.count }}
      </UBadge>
    </UButton>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
