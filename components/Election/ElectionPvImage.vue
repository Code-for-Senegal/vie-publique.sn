// components/PvImage.vue
<template>
  <div class="relative">
    <img
      v-if="!error && !loading"
      :src="url"
      :alt="alt"
      class="h-auto max-w-full rounded shadow-lg"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Loading State -->
    <div
      v-if="loading"
      class="w-full animate-pulse rounded bg-gray-200"
      :style="{ paddingBottom: '75%' }"
    ></div>

    <!-- Error State -->
    <div v-if="error" class="rounded bg-red-50 p-4 text-center text-red-500">
      Impossible de charger l'image
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string;
  alt?: string;
}>();

const loading = ref(true);
const error = ref(false);

const handleLoad = () => {
  loading.value = false;
};

const handleError = () => {
  loading.value = false;
  error.value = true;
};

// Reset states when URL changes
watch(
  () => props.url,
  () => {
    loading.value = true;
    error.value = false;
  },
);
</script>
