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
    class="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    @click="emit('select', candidate)"
  >
    <CmsImage
      v-if="candidate.photo"
      :src="candidate.photo"
      class="h-full w-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
      :alt="`${candidate.first_name} ${candidate.last_name}`"
    />
    <div v-else class="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <UIcon name="i-heroicons-user" class="h-20 w-20 text-gray-300 dark:text-gray-700" />
    </div>

    <!-- Overlay Info -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
      <div class="absolute top-2 right-2 bg-primary-600/90 text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full backdrop-blur-sm border border-white/20">
        {{ candidate.position }}
      </div>
      <div class="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <p class="font-black text-xs leading-tight uppercase text-white tracking-tighter">{{ candidate.last_name }}</p>
        <p class="text-[11px] text-primary-300 font-bold capitalize">{{ candidate.first_name }}</p>
        <p class="text-[9px] text-gray-400 line-clamp-1 mt-0.5">{{ candidate.profession }}</p>
      </div>
    </div>
  </div>
</template>
