<template>
  <div class="relative" :class="[containerClass]">
    <img
      v-if="!error"
      :src="url"
      :alt="alt"
      :class="[
        'max-w-full transition-opacity duration-300',
        imageClass,
        { 'opacity-0': loading, 'opacity-100': !loading },
      ]"
      :loading="lazy ? 'lazy' : 'eager'"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Loading Spinner -->
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-gray-100"
    >
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
        :class="{ 'opacity-50': !error }"
      ></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-md bg-red-50 p-4">
      <p class="text-sm text-red-500">
        {{ errorMessage }}
      </p>
      <button
        v-if="retryEnabled"
        @click="retryLoad"
        class="mt-2 text-sm text-blue-500 hover:text-blue-700"
      >
        Réessayer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  url: string;
  alt?: string;
  errorMessage?: string;
  containerClass?: string;
  imageClass?: string;
  lazy?: boolean;
  retryEnabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  alt: "Image",
  errorMessage: "Impossible de charger l'image",
  containerClass: "",
  imageClass: "h-auto",
  lazy: true,
  retryEnabled: true,
});

const loading = ref(true);
const error = ref(false);
const currentSrc = ref(props.url);

const handleLoad = () => {
  loading.value = false;
  error.value = false;
};

const handleError = () => {
  loading.value = false;
  error.value = true;
};

const retryLoad = () => {
  loading.value = true;
  error.value = false;
  // Force le rechargement de l'image en modifiant l'URL
  currentSrc.value = `${props.url}${props.url.includes("?") ? "&" : "?"}retry=${Date.now()}`;
};

// Émet des événements pour le parent
const emit = defineEmits<{
  (e: "load"): void;
  (e: "error"): void;
}>();

// Observe les changements d'URL
watch(
  () => props.url,
  () => {
    loading.value = true;
    error.value = false;
    currentSrc.value = props.url;
  },
);
</script>
