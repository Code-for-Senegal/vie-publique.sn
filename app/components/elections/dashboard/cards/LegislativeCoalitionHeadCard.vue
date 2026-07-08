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
    class="relative flex flex-col overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer bg-white dark:bg-gray-900 border dark:border-gray-800 h-64"
    @click="emit('select', coalition.id)"
  >
    <!-- Background Head of List Photo -->
    <div class="absolute inset-0 bg-gray-100 dark:bg-gray-800">
      <CmsImage
        v-if="coalition.head_of_list?.photo"
        :src="coalition.head_of_list.photo"
        class="h-full w-full object-cover group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
        alt="Photo tête de liste"
      />
      <div v-else class="h-full w-full flex items-center justify-center">
        <UIcon name="i-heroicons-user" class="h-24 w-24 text-gray-200 dark:text-gray-700" />
      </div>
    </div>

    <!-- Overlay Gradient -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

    <!-- Content -->
    <div class="absolute inset-0 flex flex-col justify-end p-4 text-white">
      <h4 v-if="coalition.head_of_list" class="text-lg font-black uppercase leading-tight">
        {{ coalition.head_of_list.first_name }} {{ coalition.head_of_list.last_name }}
      </h4>
      <h4 v-else class="text-lg font-black uppercase leading-tight italic opacity-50">
        Non spécifié
      </h4>
      
      <div class="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
        <span class="text-[10px] font-bold uppercase tracking-widest truncate max-w-[80%]">
          {{ coalition.list_order }}. {{ coalition.name }}
        </span>
        <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
