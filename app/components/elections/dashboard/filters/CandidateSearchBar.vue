<script setup lang="ts">
interface Props {
  modelValue: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <UInput
    :model-value="modelValue"
    icon="i-heroicons-magnifying-glass"
    placeholder="Rechercher un candidat ..."
    size="xl"
    class="w-full shadow-sm"
    :ui="{ icon: { trailing: { pointer: '' } } }"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #trailing>
      <UButton
        v-show="modelValue !== ''"
        color="gray"
        variant="link"
        icon="i-heroicons-x-mark-20-solid"
        :padded="false"
        @click="emit('update:modelValue', '')"
      />
    </template>
  </UInput>
</template>
