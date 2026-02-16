<script setup lang="ts">
import { useElectoralFormatting } from '~/composables/elections/dashboard/useElectoralFormatting';
import type { Candidate } from '~~/types/candidate';

interface Props {
  modelValue: boolean;
  candidate: Candidate | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>

<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'max-w-md',
      container: 'flex items-center justify-center'
    }"
  >
    <UCard
      class="overflow-hidden"
      :ui="{
        body: { padding: 'p-0' },
        header: { padding: 'p-0' },
        ring: 'ring-1 ring-gray-200 dark:ring-gray-800'
      }"
    >
      <!-- Modal Header with Image -->
      <div class="relative h-64 bg-gray-900">
        <UButton
          icon="i-heroicons-x-mark"
          color="white"
          variant="soft"
          class="absolute right-4 top-4 z-10 rounded-full blur-backdrop"
          @click="isOpen = false"
        />

        <CmsImage
          v-if="candidate?.photo"
          :src="candidate.photo"
          class="h-full w-full object-cover opacity-80"
          :alt="candidate.first_name"
        />
        <div v-else class="h-full w-full flex items-center justify-center bg-gray-800">
          <UIcon name="i-heroicons-user" class="h-32 w-32 text-gray-700" />
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent text-white">
          <UBadge color="primary" class="mb-2">Position {{ candidate?.position }}</UBadge>
          <h3 class="text-2xl font-black uppercase">{{ candidate?.first_name }} {{ candidate?.last_name }}</h3>
          <p class="text-primary-400 font-bold">{{ candidate?.profession }}</p>
        </div>
      </div>

      <div class="p-6 space-y-4 dark:bg-gray-900">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
            <p class="text-[10px] text-gray-500 uppercase font-black">Sexe</p>
            <p class="font-bold">{{ candidate?.gender === 'M' ? 'Masculin' : 'Féminin' }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
            <p class="text-[10px] text-gray-500 uppercase font-black">ID National</p>
            <p class="font-bold">#{{ candidate?.id?.toString().slice(0,8) }}</p>
          </div>
        </div>

        <div v-if="candidate?.biography">
          <p class="text-[10px] text-gray-500 uppercase font-black mb-2">Notice Biographique</p>
          <div class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-xl italic">
            "{{ candidate.biography }}"
          </div>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<style scoped>
.blur-backdrop {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style>
