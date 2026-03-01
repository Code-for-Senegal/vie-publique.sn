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
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Document PDF',
})

const emit = defineEmits<{
  close: []
}>()

const containerRef = ref<HTMLElement>()
const pageRefs = ref<HTMLCanvasElement[]>([])
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const loadingProgress = ref(0)

let pdfDoc: PDFDocumentProxy | null = null
let observer: IntersectionObserver | null = null

const setPageRef = (el: any, index: number) => {
  if (el) {
    pageRefs.value[index] = el
  }
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

    const renderContext: any = {
      canvasContext: context,
      viewport: viewport,
    }

    await page.render(renderContext).promise
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
    if (canvas) {
      await renderPage(i, canvas)
    }
  }
}

const fitToWidth = async () => {
  if (!pdfDoc || !containerRef.value) return

  try {
    const page = await pdfDoc.getPage(1)
    const containerWidth = containerRef.value.clientWidth - 48
    const unscaledViewport = page.getViewport({ scale: 1 })

    const newScale = containerWidth / unscaledViewport.width
    scale.value = Math.min(Math.max(newScale, 0.5), 3)
  } catch (err) {
    console.error('Error calculating fit scale:', err)
  }
}

const canGoPrev = computed(() => currentPage.value > 1)
const canGoNext = computed(() => currentPage.value < totalPages.value)

const scrollToPage = (pageNum: number) => {
  const canvas = pageRefs.value[pageNum - 1]
  if (canvas) {
    canvas.scrollIntoView({ behavior: 'smooth', block: 'start' })
    currentPage.value = pageNum
  }
}

const goToPrev = () => {
  if (canGoPrev.value) {
    scrollToPage(currentPage.value - 1)
  }
}

const goToNext = () => {
  if (canGoNext.value) {
    scrollToPage(currentPage.value + 1)
  }
}

const updateZoom = async (newScale: number) => {
  scale.value = newScale
  await renderAllPages()
}

const zoomIn = () => {
  if (scale.value < 3) {
    updateZoom(Math.min(scale.value + 0.25, 3))
  }
}

const zoomOut = () => {
  if (scale.value > 0.5) {
    updateZoom(Math.max(scale.value - 0.25, 0.5))
  }
}

const resetZoom = async () => {
  await fitToWidth()
  await renderAllPages()
}

const zoomPercent = computed(() => Math.round(scale.value * 100))

const setupObserver = () => {
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = pageRefs.value.findIndex((el) => el === entry.target)
          if (index !== -1) {
            currentPage.value = index + 1
          }
        }
      })
    },
    {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0,
    }
  )

  pageRefs.value.forEach((el) => {
    if (el) observer?.observe(el)
  })
}

const loadPdf = async () => {
  loading.value = true
  error.value = false
  errorMessage.value = ''
  loadingProgress.value = 0
  pageRefs.value = []

  try {
    const loadingTask = pdfjsLib.getDocument({
      url: props.src,
      wasmUrl: '/pdf-worker/',
    })

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
      setTimeout(() => {
        renderAllPages(2)
      }, 100)
    }
  } catch (err: any) {
    console.error('Error loading PDF:', err)
    error.value = true
    errorMessage.value = err.message || 'Erreur inconnue'
    loading.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') goToPrev()
  if (e.key === 'ArrowRight') goToNext()
}

let resizeTimeout: ReturnType<typeof setTimeout>
const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    fitToWidth().then(() => renderAllPages())
  }, 200)
}

onMounted(() => {
  loadPdf()
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
  if (observer) observer.disconnect()
  if (pdfDoc) {
    pdfDoc.destroy()
  }
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col bg-gray-900/95 dark:bg-black/95">
    <!-- Header -->
    <header
      class="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-3 dark:border-gray-600 dark:bg-gray-900"
    >
      <h2 class="truncate text-sm font-medium text-white sm:text-base">{{ title }}</h2>

      <div class="flex items-center gap-2">
        <a
          :href="src"
          download
          class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          title="Télécharger"
        >
          <UIcon name="i-heroicons-arrow-down-tray" class="h-5 w-5" />
        </a>

        <a
          :href="src"
          target="_blank"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          title="Ouvrir dans un nouvel onglet"
        >
          <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-5 w-5" />
        </a>

        <button
          @click="emit('close')"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          title="Fermer (Escape)"
        >
          <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
        </button>
      </div>
    </header>

    <!-- Toolbar -->
    <div
      class="flex flex-wrap items-center justify-center gap-2 border-b border-gray-700 bg-gray-800/50 px-4 py-2 sm:gap-4 dark:border-gray-600 dark:bg-gray-900/50"
    >
      <!-- Navigation pages -->
      <div class="flex items-center gap-1">
        <button
          @click="goToPrev"
          :disabled="!canGoPrev"
          class="flex h-8 w-8 items-center justify-center rounded text-gray-300 transition-colors hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <UIcon name="i-heroicons-chevron-left" class="h-5 w-5" />
        </button>

        <span class="min-w-[80px] text-center text-sm text-gray-300">
          {{ currentPage }} / {{ totalPages || '...' }}
        </span>

        <button
          @click="goToNext"
          :disabled="!canGoNext"
          class="flex h-8 w-8 items-center justify-center rounded text-gray-300 transition-colors hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <UIcon name="i-heroicons-chevron-right" class="h-5 w-5" />
        </button>
      </div>

      <div class="hidden h-6 w-px bg-gray-600 sm:block" />

      <!-- Zoom -->
      <div class="flex items-center gap-1">
        <button
          @click="zoomOut"
          :disabled="scale <= 0.5"
          class="flex h-8 w-8 items-center justify-center rounded text-gray-300 transition-colors hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          title="Zoom arrière"
        >
          <UIcon name="i-heroicons-minus" class="h-4 w-4" />
        </button>

        <button
          @click="resetZoom"
          class="min-w-[50px] rounded px-2 py-1 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          title="Ajuster la largeur"
        >
          {{ zoomPercent }}%
        </button>

        <button
          @click="zoomIn"
          :disabled="scale >= 3"
          class="flex h-8 w-8 items-center justify-center rounded text-gray-300 transition-colors hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          title="Zoom avant"
        >
          <UIcon name="i-heroicons-plus" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- PDF Content -->
    <div ref="containerRef" class="relative flex-1 overflow-auto bg-gray-950 p-4 dark:bg-black">
      <!-- Loading -->
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/90"
      >
        <div class="text-center">
          <UIcon class="mx-auto h-8 w-8 animate-spin text-gray-400" name="i-heroicons-arrow-path" />
          <p class="mt-2 text-gray-400">Chargement du PDF...</p>
          <p v-if="loadingProgress > 0" class="mt-1 text-xs text-gray-500">
            {{ Math.round(loadingProgress) }}%
          </p>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="flex h-full items-center justify-center">
        <div class="text-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto h-12 w-12 text-red-400" />
          <p class="mt-2 text-gray-300">{{ errorMessage }}</p>
          <a
            :href="src"
            target="_blank"
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700"
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-4 w-4" />
            Ouvrir dans un nouvel onglet
          </a>
        </div>
      </div>

      <!-- PDF Canvas Pages -->
      <div v-show="!loading && !error" class="flex flex-col items-center gap-4">
        <canvas
          v-for="i in totalPages"
          :key="i"
          :ref="(el) => setPageRef(el, i - 1)"
          class="shadow-2xl transition-all duration-200"
          style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges"
        />
      </div>
    </div>
  </div>
</template>
