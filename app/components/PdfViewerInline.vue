<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

if (import.meta.client) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href
}

interface Props {
  src: string
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxHeight: '700px'
})

const emit = defineEmits<{
  'open-fullscreen': []
}>()

const containerRef = ref<HTMLElement>()
const scrollRef = ref<HTMLElement>()
const pageRefs = ref<HTMLCanvasElement[]>([])
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)
const loading = ref(true)
const error = ref(false)
const loadingProgress = ref(0)

let pdfDoc: PDFDocumentProxy | null = null
let observer: IntersectionObserver | null = null

const setPageRef = (el: any, index: number) => {
  if (el) pageRefs.value[index] = el
}

const renderPage = async (num: number, canvas: HTMLCanvasElement) => {
  if (!pdfDoc) return
  try {
    const page: PDFPageProxy = await pdfDoc.getPage(num)
    const pixelRatio = window.devicePixelRatio || 1
    const viewport = page.getViewport({ scale: scale.value * pixelRatio })
    const context = canvas.getContext('2d')
    if (!context) return

    if (canvas.width !== viewport.width || canvas.height !== viewport.height) {
      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.style.width = `${viewport.width / pixelRatio}px`
      canvas.style.height = `${viewport.height / pixelRatio}px`
    }

    await page.render({ canvasContext: context, viewport } as any).promise
  } catch (err: any) {
    if (err.name !== 'RenderingCancelledException') {
      console.error(`Error rendering page ${num}:`, err)
    }
  }
}

const renderAllPages = async (startFrom = 1) => {
  if (!pdfDoc || !totalPages.value) return
  for (let i = startFrom; i <= totalPages.value; i++) {
    const canvas = pageRefs.value[i - 1]
    if (canvas) await renderPage(i, canvas)
  }
}

const fitToWidth = async () => {
  if (!pdfDoc || !containerRef.value) return
  try {
    const page = await pdfDoc.getPage(1)
    const containerWidth = containerRef.value.clientWidth - 32
    const unscaledViewport = page.getViewport({ scale: 1 })
    scale.value = Math.min(Math.max(containerWidth / unscaledViewport.width, 0.5), 3)
  } catch (err) {
    console.error('Error calculating fit scale:', err)
  }
}

const setupObserver = () => {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = pageRefs.value.findIndex(el => el === entry.target)
        if (index !== -1) currentPage.value = index + 1
      }
    })
  }, {
    root: scrollRef.value,
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0
  })
  pageRefs.value.forEach((el) => {
    if (el) observer?.observe(el)
  })
}

const loadPdf = async () => {
  loading.value = true
  error.value = false
  loadingProgress.value = 0
  pageRefs.value = []

  try {
    const loadingTask = pdfjsLib.getDocument(props.src)
    loadingTask.onProgress = (progress: any) => {
      if (progress.total > 0) {
        loadingProgress.value = (progress.loaded / progress.total) * 100
      }
    }

    pdfDoc = await loadingTask.promise
    totalPages.value = pdfDoc.numPages
    await nextTick()
    await fitToWidth()

    if (pageRefs.value[0]) {
      await renderPage(1, pageRefs.value[0])
    }
    loading.value = false
    setupObserver()

    if (totalPages.value > 1) {
      setTimeout(() => renderAllPages(2), 100)
    }
  } catch (err: any) {
    console.error('Error loading PDF:', err)
    error.value = true
    loading.value = false
  }
}

let resizeTimeout: NodeJS.Timeout
const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    fitToWidth().then(() => renderAllPages())
  }, 200)
}

onMounted(() => {
  loadPdf()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (observer) observer.disconnect()
  if (pdfDoc) pdfDoc.destroy()
})
</script>

<template>
  <div ref="containerRef" class="overflow-hidden rounded-lg border border-secondary-200 dark:border-gray-800">
    <!-- Mini toolbar -->
    <div class="flex items-center justify-between bg-secondary-50 px-3 py-2 dark:bg-secondary-800">
      <span class="text-xs text-secondary-500 dark:text-secondary-400">
        <template v-if="totalPages">
          Page {{ currentPage }} / {{ totalPages }}
        </template>
        <template v-else>
          Chargement...
        </template>
      </span>
      <button
        @click="emit('open-fullscreen')"
        class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors dark:hover:bg-primary-900/30"
      >
        <Icon name="heroicons:arrows-pointing-out" class="h-3.5 w-3.5" />
        Plein écran
      </button>
    </div>

    <!-- PDF scroll area -->
    <div
      ref="scrollRef"
      class="relative overflow-auto bg-secondary-100 dark:bg-secondary-900"
      :style="{ maxHeight }"
    >
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <Icon class="mx-auto h-6 w-6 animate-spin text-secondary-400" name="heroicons:arrow-path" />
          <p class="mt-2 text-sm text-secondary-500 dark:text-secondary-400">Chargement du PDF...</p>
          <p v-if="loadingProgress > 0" class="mt-1 text-xs text-secondary-400">
            {{ Math.round(loadingProgress) }}%
          </p>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="flex items-center justify-center py-20">
        <div class="text-center">
          <Icon name="heroicons:exclamation-triangle" class="mx-auto h-8 w-8 text-red-400" />
          <p class="mt-2 text-sm text-secondary-500 dark:text-secondary-400">Impossible de charger le PDF</p>
          <a
            :href="src"
            target="_blank"
            class="mt-3 inline-flex items-center gap-1.5 text-sm text-primary-700 hover:underline dark:text-primary-400"
          >
            <Icon name="heroicons:arrow-top-right-on-square" class="h-4 w-4" />
            Ouvrir dans un nouvel onglet
          </a>
        </div>
      </div>

      <!-- Pages -->
      <div v-show="!loading && !error" class="flex flex-col items-center gap-3 p-4">
        <canvas
          v-for="i in totalPages"
          :key="i"
          :ref="(el) => setPageRef(el, i - 1)"
          class="shadow-md"
          style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;"
        />
      </div>
    </div>
  </div>
</template>
