<script setup lang="ts">
import type { Candidate } from '~~/types/candidate';

interface Props {
  coalitionName?: string;
  listCount?: number;
  type?: string;
  candidate?: Candidate | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isPresidential = computed(() => props.type === 'presidential');
const genderText = computed(() => {
  if (!props.candidate) return 'le/la candidat.e';
  return props.candidate.gender === 'F' ? 'la candidate' : 'le candidat';
});
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-gray-800 pb-4 gap-4">
    <div class="flex items-start sm:items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        color="gray"
        variant="soft"
        @click="emit('close')"
        class="rounded-xl shrink-0"
        size="sm"
      >
        <span class="hidden sm:inline">Retour</span>
      </UButton>
      <h2 class="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase leading-tight tracking-tighter">
        <template v-if="isPresidential">
          {{ genderText }} de la liste {{ coalitionName }}
        </template>
        <template v-else>
          Détails de la liste {{ coalitionName }}
        </template>
      </h2>
    </div>
    <UBadge v-if="listCount && !isPresidential" color="primary" variant="subtle" class="w-fit self-end sm:self-auto text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
      {{ (listCount / 2).toFixed(0) }} circonscriptions
    </UBadge>
  </div>
</template>
