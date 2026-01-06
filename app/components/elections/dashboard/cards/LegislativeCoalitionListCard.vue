<script setup lang="ts">
import { useElectoralFormatting } from '~/composables/elections/dashboard/useElectoralFormatting';

interface Props {
  coalition: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'select', coalitionId: string | number): void;
}>();

const { getCoalitionColor, getCmsAsset } = useElectoralFormatting();
</script>

<template>
  <div 
    class="flex items-center gap-5 p-4 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer"
    @click="emit('select', coalition.id)"
  >
    <div 
      class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform overflow-hidden border dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
    >
      <img v-if="coalition.logo" :src="getCmsAsset(coalition.logo)" class="max-h-full max-w-full object-contain p-2" :alt="coalition.name" />
      <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
        <UIcon name="i-heroicons-photo" class="w-6 h-6" />
      </div>
    </div>
    <div class="min-w-0">
      <h3 class="text-sm font-black uppercase tracking-tight group-hover:text-primary-600 transition-colors line-clamp-1">
        {{ coalition.list_order }}<span class="mx-1">• </span> 
        {{ coalition.name }}
      </h3>
      <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
        <template v-if="coalition.head_of_list">
          {{ coalition.head_of_list.first_name }} {{ coalition.head_of_list.last_name }}
        </template>
        <template v-else>Non spécifié</template>
      </p>
    </div>
    <UIcon name="i-heroicons-chevron-right-20-solid" class="ml-auto text-gray-300 group-hover:text-primary-500 transition-colors h-5 w-5 shrink-0" />
  </div>
</template>
