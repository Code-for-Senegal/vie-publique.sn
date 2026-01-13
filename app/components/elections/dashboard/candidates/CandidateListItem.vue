<script setup lang="ts">
import { useElectoralFormatting } from '~/composables/elections/dashboard/useElectoralFormatting';
import type { Candidate } from '~~/types/candidate';

interface Props {
  candidate: Candidate;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'select', candidate: Candidate): void;
}>();

</script>

<template>
  <div
    class="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg hover:border-primary-500/50 transition-colors group cursor-pointer"
    @click="emit('select', candidate)"
  >
    <div class="font-black text-gray-300 dark:text-gray-700 text-lg w-8 text-center italic group-hover:text-primary-500">
      {{ candidate.position }}
    </div>
    <div class="h-10 w-10 shrink-0 rounded-full overflow-hidden border dark:border-gray-700 bg-gray-100">
      <CmsImage
        v-if="candidate.photo"
        :src="candidate.photo"
        class="h-full w-full object-cover"
      />
      <UIcon v-else name="i-heroicons-user" class="h-full w-full p-2 text-gray-400" />
    </div>
    <div class="flex flex-col min-w-0">
      <span class="font-bold text-sm text-gray-900 dark:text-white uppercase truncate">
        {{ candidate.first_name }} {{ candidate.last_name }}
      </span>
      <span class="text-[10px] text-gray-500 truncate">{{ candidate.profession }}</span>
    </div>
  </div>
</template>
