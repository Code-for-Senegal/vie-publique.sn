<script setup lang="ts">
import { useElectoralFormatting } from '~/composables/elections/dashboard/useElectoralFormatting';

interface Props {
  coalition: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'select', coalitionId: string | number): void;
}>();

const { getCoalitionColor } = useElectoralFormatting();
</script>

<template>
  <UCard
    class="relative group hover:ring-2 hover:ring-primary-500 ring-offset-2 ring-offset-[#f8fafc] dark:ring-offset-gray-950 transition-all duration-300 cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-md bg-white dark:bg-gray-900"
    :ui="{ body: { padding: 'p-0' } }"
    @click="emit('select', coalition.id)"
  >
    <!-- Color Strip -->
    <div class="absolute left-0 top-0 bottom-0 w-1" :style="{ backgroundColor: getCoalitionColor(coalition.color) }"></div>

    <div class="p-4 space-y-3">
      <!-- Logo & Header -->
      <div class="flex items-start justify-between">
        <div class="h-14 w-14 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl p-2 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <CmsImage
            v-if="coalition.logo"
            :src="coalition.logo"
            :alt="coalition.name"
            class="max-h-full max-w-full object-contain"
          />
          <UIcon v-else name="i-heroicons-photo" class="text-gray-200 h-8 w-8" />
        </div>
        <div class="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700">
          <span class="text-[9px] font-black uppercase tracking-widest text-gray-500">N°{{ coalition.list_order }}</span>
        </div>
      </div>

      <!-- Name -->
      <div class="min-w-0">
        <h4 class="text-xs font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase leading-tight line-clamp-2">
          {{ coalition.name }}
        </h4>
      </div>

      <!-- Head of List Widget -->
      <div v-if="coalition.head_of_list" class="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-800">
            <CmsImage
              v-if="coalition.head_of_list.photo"
              :src="coalition.head_of_list.photo"
              class="h-full w-full object-cover"
            />
            <UIcon v-else name="i-heroicons-user" class="text-gray-300 h-full w-full p-1.5" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[8px] text-gray-400 font-bold uppercase tracking-tight">Tête de liste</span>
            <span class="text-[10px] font-bold leading-tight line-clamp-2">{{ coalition.head_of_list.first_name }} {{ coalition.head_of_list.last_name }}</span>
          </div>
        </div>
        <UIcon name="i-heroicons-chevron-right-20-solid" class="text-gray-300 h-4 w-4" />
      </div>
    </div>
  </UCard>
</template>
