<script setup lang="ts">
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
    class="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
    @click="emit('select', coalition.id)"
  >
    <div
      class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
    >
      <CmsImage
        v-if="coalition.logo"
        :src="coalition.logo"
        class="max-h-full max-w-full object-contain p-1"
        :alt="coalition.name"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
        <UIcon name="i-heroicons-photo" class="w-5 h-5" />
      </div>
    </div>
    <div class="min-w-0 flex-1">
      <h3 class="text-xs sm:text-sm font-black uppercase tracking-tight group-hover:text-primary-600 transition-colors line-clamp-1">
        {{ coalition.list_order }}<span class="mx-0.5 sm:mx-1">•</span>{{ coalition.name }}
      </h3>
      <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        <template v-if="coalition.head_of_list">
          {{ coalition.head_of_list.first_name }} {{ coalition.head_of_list.last_name }}
        </template>
        <template v-else>Non spécifié</template>
      </p>
    </div>
    <UIcon name="i-heroicons-chevron-right-20-solid" class="text-gray-300 group-hover:text-primary-500 transition-colors h-4 w-4 shrink-0" />
  </div>
</template>
