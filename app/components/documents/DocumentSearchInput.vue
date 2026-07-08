<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Rechercher...',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
};
</script>

<template>
  <div class="group relative mt-3">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
      <UIcon
        name="i-heroicons-magnifying-glass-20-solid"
        class="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-gray-500"
      />
    </div>
    <input
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      class="block w-full rounded-xl border-0 bg-gray-100 py-3 pl-11 pr-10 text-sm text-gray-900 ring-1 ring-transparent transition-all placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-gray-800/80 dark:focus:ring-gray-500 sm:py-2.5"
      @input="handleInput"
    />
    <button
      v-if="modelValue"
      type="button"
      class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
      @click="emit('update:modelValue', '')"
    >
      <span
        class="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600"
      >
        <UIcon
          name="i-heroicons-x-mark-20-solid"
          class="h-3.5 w-3.5 text-gray-600 dark:text-gray-300"
        />
      </span>
    </button>
  </div>
</template>
