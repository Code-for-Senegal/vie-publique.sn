<script setup lang="ts">
/**
 * MapExportButton.vue — Bouton d'export (PNG + CSV) standalone.
 */
import { ref } from 'vue'

const emit = defineEmits<{
  'export-png': []
  'export-csv': []
}>()

const showMenu = ref(false)
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center gap-1.5 bg-gray-900/90 backdrop-blur-md border border-gray-700/50 text-white text-xs px-3 py-2 rounded-xl shadow-lg hover:bg-gray-800 transition-colors"
      @click="showMenu = !showMenu"
    >
      📥 <span>Exporter</span>
    </button>
    <div
      v-if="showMenu"
      class="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700/50 py-1 shadow-xl min-w-[140px]"
    >
      <button
        class="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        @click="emit('export-png'); showMenu = false"
      >
        📸 Image PNG
      </button>
      <button
        class="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        @click="emit('export-csv'); showMenu = false"
      >
        📊 Données CSV
      </button>
    </div>
  </div>
</template>
