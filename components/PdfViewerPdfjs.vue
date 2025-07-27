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
        <UButton
          icon="i-heroicons-arrows-pointing-in"
          size="sm"
          variant="outline"
          @click="fitToPage"
          title="Ajuster à la page"
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
        <span class="text-sm">
          Page 
          <input
            type="number"
            v-model.number="currentPage"
            @change="goToPage"
            :min="1"
            :max="totalPages"
            class="mx-1 w-12 rounded border px-1 text-center"
          />
          / {{ totalPages }}
        </span>
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
          <p v-if="loadingProgress > 0" class="text-xs text-gray-500 mt-1">
            {{ Math.round(loadingProgress) }}%
          </p>
        </div>
      </div>

      <div v-if="error" class="flex h-96 items-center justify-center">
        <div class="text-center">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="mb-2 h-12 w-12 text-red-500"
          />
          <p class="text-sm text-gray-600">Erreur lors du chargement du PDF</p>
          <p class="text-xs text-gray-500 mt-1">{{ errorMessage }}</p>
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
        v-show="!loading && !error"
        class="pdf-canvas-wrapper p-4"
      >
        <canvas
          ref="pdfCanvas"
          class="pdf-canvas mx-auto shadow-lg"
        ></canvas>
      </div>
    </div>

    <!-- Version mobile : boutons de navigation flottants -->
    <div class="md:hidden" v-if="totalPages > 1">
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
        <span class="text-sm font-medium">{{ currentPage }} / {{ totalPages }}</span>
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
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// Configuration du worker PDF.js - utiliser le worker local
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs';
}

interface Props {
  source: string;
  downloadName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  downloadName: "document.pdf",
});

// Refs
const pdfContainer = ref<HTMLElement>();
const pdfCanvas = ref<HTMLCanvasElement>();
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const loadingProgress = ref(0);

// PDF.js objects
let pdfDoc: PDFDocumentProxy | null = null;
let pageRendering = false;
let pageNumPending: number | null = null;
let currentRenderTask: any = null;

// Render the page
const renderPage = async (num: number) => {
  if (!pdfDoc || !pdfCanvas.value) return;
  
  pageRendering = true;
  
  try {
    // Cancel any ongoing render task
    if (currentRenderTask) {
      await currentRenderTask.cancel();
    }
  } catch (e) {
    // Ignore cancellation errors
  }
  
  try {
    const page: PDFPageProxy = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: scale.value });
    
    const canvas = pdfCanvas.value;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    currentRenderTask = page.render(renderContext);
    await currentRenderTask.promise;
    
    pageRendering = false;
    
    if (pageNumPending !== null) {
      renderPage(pageNumPending);
      pageNumPending = null;
    }
  } catch (err: any) {
    if (err.name !== 'RenderingCancelledException') {
      console.error('Error rendering page:', err);
    }
    pageRendering = false;
  }
};

// Queue render
const queueRenderPage = (num: number) => {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
};

// Navigation
const previousPage = () => {
  if (currentPage.value <= 1) return;
  currentPage.value--;
  queueRenderPage(currentPage.value);
};

const nextPage = () => {
  if (currentPage.value >= totalPages.value) return;
  currentPage.value++;
  queueRenderPage(currentPage.value);
};

const goToPage = () => {
  const page = Math.max(1, Math.min(currentPage.value, totalPages.value));
  currentPage.value = page;
  queueRenderPage(currentPage.value);
};

// Zoom controls
const zoomIn = () => {
  if (scale.value < 3) {
    scale.value = Math.min(scale.value + 0.25, 3);
    queueRenderPage(currentPage.value);
  }
};

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(scale.value - 0.25, 0.5);
    queueRenderPage(currentPage.value);
  }
};

const fitToWidth = () => {
  if (!pdfContainer.value || !pdfDoc) return;
  
  pdfDoc.getPage(currentPage.value).then((page) => {
    const viewport = page.getViewport({ scale: 1 });
    const containerWidth = pdfContainer.value!.clientWidth - 32; // 32px for padding
    scale.value = containerWidth / viewport.width;
    queueRenderPage(currentPage.value);
  });
};

const fitToPage = () => {
  if (!pdfContainer.value || !pdfDoc) return;
  
  pdfDoc.getPage(currentPage.value).then((page) => {
    const viewport = page.getViewport({ scale: 1 });
    const containerWidth = pdfContainer.value!.clientWidth - 32;
    const containerHeight = pdfContainer.value!.clientHeight - 32;
    
    const scaleX = containerWidth / viewport.width;
    const scaleY = containerHeight / viewport.height;
    scale.value = Math.min(scaleX, scaleY);
    
    queueRenderPage(currentPage.value);
  });
};

// Download PDF
const downloadPdf = () => {
  const link = document.createElement("a");
  link.href = props.source;
  link.download = props.downloadName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Load PDF document
const loadPdf = async () => {
  loading.value = true;
  error.value = false;
  errorMessage.value = '';
  loadingProgress.value = 0;
  
  try {
    const loadingTask = pdfjsLib.getDocument({
      url: props.source,
      onProgress: (progress) => {
        if (progress.total > 0) {
          loadingProgress.value = (progress.loaded / progress.total) * 100;
        }
      }
    });
    
    pdfDoc = await loadingTask.promise;
    totalPages.value = pdfDoc.numPages;
    
    // Render first page
    await renderPage(1);
    
    // Auto fit to width on first load
    await nextTick();
    fitToWidth();
    
    loading.value = false;
  } catch (err: any) {
    console.error('Error loading PDF:', err);
    error.value = true;
    errorMessage.value = err.message || 'Erreur inconnue';
    loading.value = false;
  }
};

// Keyboard navigation
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

// Lifecycle
onMounted(() => {
  loadPdf();
  window.addEventListener("keydown", handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
  if (pdfDoc) {
    pdfDoc.destroy();
  }
});

// Watch for source changes
watch(() => props.source, () => {
  loadPdf();
});
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

.pdf-canvas-wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pdf-canvas {
  max-width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>