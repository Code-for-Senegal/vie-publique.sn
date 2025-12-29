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
  <UCard
    class="relative group hover:ring-2 hover:ring-primary-500 ring-offset-2 ring-offset-[#f8fafc] dark:ring-offset-gray-950 transition-all duration-300 cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-md bg-white dark:bg-gray-900"
    :ui="{ body: { padding: 'p-0' } }"
    @click="emit('select', coalition.id)"
  >
    <!-- Color Strip -->
    <div class="absolute left-0 top-0 bottom-0 w-1" :style="{ backgroundColor: getCoalitionColor(coalition.color) }"></div>

    <!-- Number Badge (top-right corner) -->
    <div class="absolute top-2 right-2 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
      <span class="text-[9px] font-black uppercase tracking-widest text-gray-500">N°{{ coalition.list_order }}</span>
    </div>

    <div class="p-4 pt-8 space-y-3">
      <!-- Candidat Principal -->
      <div v-if="coalition.head_of_list" class="flex flex-col items-center text-center space-y-3">
        <!-- Photo du candidat (plus grande) -->
        <div class="h-28 w-28 rounded-full overflow-hidden border-3 shadow-lg bg-gray-100 dark:bg-gray-800 group-hover:scale-105 transition-transform duration-500" :style="{ borderColor: getCoalitionColor(coalition.color) }">
          <img
            v-if="coalition.head_of_list.photo"
            :src="getCmsAsset(coalition.head_of_list.photo)"
            class="h-full w-full object-cover"
          />
          <UIcon v-else name="i-heroicons-user" class="text-gray-300 h-full w-full p-6" />
        </div>

        <!-- Nom du candidat (en avant) -->
        <div class="min-w-0 w-full space-y-1">
          <h4 class="text-base font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors leading-tight">
            {{ coalition.head_of_list.first_name }} {{ coalition.head_of_list.last_name }}
          </h4>

          <!-- Coalition (juste après le nom) -->
          <p class="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-tight line-clamp-2 px-2">
            {{ coalition.name }}
          </p>
        </div>
      </div>

      <!-- Arrow -->
      <div class="flex justify-center pt-1">
        <UIcon name="i-heroicons-chevron-right-20-solid" class="text-gray-300 h-4 w-4 group-hover:text-primary-400 transition-colors" />
      </div>
    </div>
  </UCard>
</template>
