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
  <div class="flex items-center justify-between border-b dark:border-gray-800 pb-4">
    <div class="flex items-center gap-4">
      <UButton
        icon="i-heroicons-arrow-left"
        color="gray"
        variant="ghost"
        @click="emit('close')"
        class="hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Retour
      </UButton>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        <template v-if="isPresidential">
          {{ genderText }} de la liste {{ coalitionName }}
        </template>
        <template v-else>
          Détails de la liste {{ coalitionName }}
        </template>
      </h2>
    </div>
    <UBadge v-if="listCount && !isPresidential" color="primary" variant="subtle">
      {{ (listCount / 2).toFixed(0) }} circonscriptions
    </UBadge>
  </div>
</template>
