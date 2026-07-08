<script setup lang="ts">
import { useElectoralFormatting } from '~/composables/elections/dashboard/useElectoralFormatting';

interface Props {
  coalition: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'select', coalitionId: string | number): void;
}>();

</script>

<template>
  <div 
    class="group relative aspect-[3/4] overflow-hidden rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer bg-white"
    @click="emit('select', coalition.id)"
  >
    <!-- Ballot Image -->
    <div class="h-full w-full bg-gray-50 flex items-center justify-center p-2">
      <CmsImage
        v-if="coalition.bulletin"
        :src="coalition.bulletin"
        :alt="`Bulletin de ${coalition.name}`"
        class="h-full w-full object-contain transform group-hover:scale-105 transition-transform duration-700"
      />
      <div v-else class="text-center p-4">
        <UIcon name="i-heroicons-document" class="h-16 w-16 text-gray-200 mx-auto mb-2" />
        <p class="text-[10px] font-black uppercase text-gray-400">Bulletin non disponible</p>
      </div>
    </div>

    <!-- Hover Overlay with Badge -->
    <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
      <div class="flex items-center justify-between">
        <div class="bg-primary-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">
          N°{{ coalition.list_order }}
        </div>
        <span class="text-[10px] font-bold text-white uppercase truncate ml-2">
          {{ coalition.name }}
        </span>
      </div>
    </div>
  </div>
</template>
