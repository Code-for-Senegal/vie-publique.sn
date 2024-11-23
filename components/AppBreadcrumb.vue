<template>
  <div class="flex flex-row items-center gap-1 py-2 text-sm text-gray-500">
    <ULink to="/" class="xxx">
      <UIcon name="i-heroicons-home" size="sm" />
    </ULink>
    <UIcon name="i-heroicons-chevron-right" size="sm" />
    <ULink
      v-for="link in props.links"
      :key="link.to"
      :to="link.to"
      class="text-sm"
    >
      <span class="underline">{{ link.label }}</span>
    </ULink>
    <!-- <UIcon name="i-heroicons-chevron-right" size="sm" /> -->
    <!-- <p class="truncate">{{ props.lastText }}</p> -->
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  links: any[];
  lastText: string | string[];
}>();
</script>
