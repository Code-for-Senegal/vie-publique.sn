<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  url?: string
  compact?: boolean
}>()

const route = useRoute()
const config = useRuntimeConfig()

const currentUrl = computed(() => {
  if (props.url) return props.url
  if (import.meta.client) {
    return window.location.href
  }
  return `${config.public.siteUrl}${route.path}`
})

// Check if Web Share API is supported
const canShare = computed(() => {
  if (!import.meta.client) return false
  return !!navigator.share
})

const isSharing = ref(false)
const shareSuccess = ref(false)
const copied = ref(false)

const handleShare = async () => {
  if (!import.meta.client) return

  // Use native share if available
  if (navigator.share) {
    isSharing.value = true
    try {
      await navigator.share({
        title: props.title,
        text: props.description || props.title,
        url: currentUrl.value,
      })
      shareSuccess.value = true
      setTimeout(() => {
        shareSuccess.value = false
      }, 2000)
    } catch (err) {
      // User cancelled or error - silently ignore
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err)
      }
    } finally {
      isSharing.value = false
    }
  } else {
    // Fallback: copy to clipboard
    await copyLink()
  }
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <button
    type="button"
    class="share-btn group relative overflow-hidden"
    :class="{ 'share-btn--success': shareSuccess || copied, 'share-btn--compact': compact }"
    :disabled="isSharing"
    @click="handleShare"
  >
    <!-- Background gradient animation -->
    <span class="share-btn__bg" />
    
    <!-- Content -->
    <span class="share-btn__content">
      <!-- Icon with animation -->
      <span class="share-btn__icon">
        <UIcon
          v-if="shareSuccess || copied"
          name="i-heroicons-check"
          class="h-4 w-4"
        />
        <UIcon
          v-else-if="isSharing"
          name="i-heroicons-arrow-path"
          class="h-4 w-4 animate-spin"
        />
        <UIcon
          v-else
          name="i-heroicons-share"
          class="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
        />
      </span>
      
      <!-- Label -->
      <span class="share-btn__label">
        <span v-if="shareSuccess">Partagé !</span>
        <span v-else-if="copied">Lien copié</span>
        <span v-else-if="isSharing">Partage...</span>
        <span v-else>Partager</span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.share-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}

.share-btn:active {
  transform: scale(0.98);
}

.share-btn:disabled {
  cursor: wait;
  opacity: 0.8;
}

.share-btn--success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
}

.share-btn--success:hover {
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
}

.share-btn__bg {
  display: none;
}

.share-btn__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.share-btn__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-btn__label {
  white-space: nowrap;
}

/* Compact variant */
.share-btn--compact {
  min-width: auto;
  padding: 0 10px;
  font-size: 11px;
  height: 32px;
  border-radius: 8px;
  box-shadow: none;
}

.share-btn--compact .share-btn__content {
  gap: 4px;
}

.share-btn--compact .share-btn__icon :deep(.iconify) {
  width: 14px;
  height: 14px;
}

/* Dark mode */
:root.dark .share-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

:root.dark .share-btn:hover {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
}

:root.dark .share-btn--success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}
</style>
