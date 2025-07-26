<template>
  <div class="pdf-viewer-container">
    <div class="pdf-controls mb-4 flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <UButton
          icon="i-heroicons-minus"
          size="sm"
          variant="outline"
          @click="zoomOut"
          :disabled="scale <= 0.5"
        />
        <span class="text-sm font-medium">{{ Math.round(scale * 100) }}%</span>
        <UButton
          icon="i-heroicons-plus"
          size="sm"
          variant="outline"
          @click="zoomIn"
          :disabled="scale >= 3"
        />
        <UButton
          icon="i-heroicons-arrows-pointing-out"
          size="sm"
          variant="outline"
          @click="fitToWidth"
          title="Ajuster à la largeur"
        />
      </div>

      <div class="flex items-center gap-2">
        <UButton
          icon="i-heroicons-chevron-left"
          size="sm"
          variant="outline"
          @click="previousPage"
          :disabled="currentPage <= 1"
        />
        <span class="text-sm"> Page {{ currentPage }} / {{ totalPages }} </span>
        <UButton
          icon="i-heroicons-chevron-right"
          size="sm"
          variant="outline"
          @click="nextPage"
          :disabled="currentPage >= totalPages"
        />
      </div>

      <UButton
        icon="i-heroicons-arrow-down-tray"
        label="Télécharger"
        size="sm"
        variant="outline"
        @click="downloadPdf"
      />
    </div>

    <div
      ref="pdfContainer"
      class="pdf-content relative overflow-auto rounded-lg border border-gray-200 bg-gray-50"
    >
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-90"
      >
        <div class="text-center">
          <div class="mb-2">
            <UIcon
              name="i-heroicons-arrow-path"
              class="h-8 w-8 animate-spin text-gray-500"
            />
          </div>
          <p class="text-sm text-gray-600">Chargement du PDF...</p>
        </div>
      </div>

      <div v-if="error" class="flex h-96 items-center justify-center">
        <div class="text-center">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="mb-2 h-12 w-12 text-red-500"
          />
          <p class="text-sm text-gray-600">Erreur lors du chargement du PDF</p>
          <UButton
            label="Télécharger directement"
            size="sm"
            variant="outline"
            class="mt-4"
            @click="downloadPdf"
          />
        </div>
      </div>

      <div
        v-show="!error"
        class="pdf-canvas-container"
        :style="{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.3s ease'
        }"
      >
        <VuePdfEmbed
          :key="`${currentPage}-${pdfKey}`"
          :source="source"
          :page="currentPage"
          @loaded="handleLoaded"
          @loading-failed="handleError"
          @rendered="handleRendered"
          style="width: 100%; height: auto;"
        />
      </div>
    </div>

    <!-- Version mobile : boutons de navigation flottants -->
    <div class="md:hidden">
      <div
        class="fixed bottom-20 left-4 right-4 flex items-center justify-between rounded-lg bg-white p-2 shadow-lg"
      >
        <UButton
          icon="i-heroicons-chevron-left"
          size="sm"
          variant="ghost"
          @click="previousPage"
          :disabled="currentPage <= 1"
        />
        <span class="text-sm font-medium"
          >{{ currentPage }} / {{ totalPages }}</span
        >
        <UButton
          icon="i-heroicons-chevron-right"
          size="sm"
          variant="ghost"
          @click="nextPage"
          :disabled="currentPage >= totalPages"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VuePdfEmbed from "vue-pdf-embed";

interface Props {
  source: string;
  downloadName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  downloadName: "document.pdf",
});

const pdfContainer = ref<HTMLElement>();
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1);
const loading = ref(true);
const error = ref(false);
const pdfKey = ref(0);

const fitToWidth = () => {
  if (pdfContainer.value) {
    // Reset to fit width
    scale.value = 1;
    pdfKey.value++; // Force re-render
  }
};

const zoomIn = () => {
  if (scale.value < 3) {
    scale.value = Math.min(scale.value + 0.25, 3);
  }
};

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(scale.value - 0.25, 0.5);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const handleLoaded = (data: any) => {
  console.log('PDF loaded:', data);
  totalPages.value = data?.numPages || 0;
  loading.value = false;
  error.value = false;
};

const handleError = (err: any) => {
  console.error('PDF loading error:', err);
  loading.value = false;
  error.value = true;
};

const handleRendered = () => {
  console.log('PDF rendered');
};

const downloadPdf = () => {
  const link = document.createElement("a");
  link.href = props.source;
  link.download = props.downloadName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Gestion des touches clavier
onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
});

const handleKeyPress = (e: KeyboardEvent) => {
  switch (e.key) {
    case "ArrowLeft":
      previousPage();
      break;
    case "ArrowRight":
      nextPage();
      break;
    case "+":
    case "=":
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        zoomIn();
      }
      break;
    case "-":
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        zoomOut();
      }
      break;
  }
};
</script>

<style scoped>
.pdf-viewer-container {
  @apply w-full;
}

.pdf-content {
  height: 800px;
  max-height: 85vh;
  position: relative;
}

@media (max-width: 768px) {
  .pdf-content {
    height: 70vh;
  }
}

.pdf-canvas-container {
  @apply p-4;
  width: 100%;
  max-width: 100%;
}

:deep(.vue-pdf-embed) {
  max-width: 100% !important;
}

:deep(.vue-pdf-embed > div) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
  margin: 0 auto;
}
</style>