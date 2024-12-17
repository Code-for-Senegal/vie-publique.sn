<script setup lang="ts">
const config = useRuntimeConfig();

const props = defineProps<{
  deputy: {
    id: number;
    first_name: string;
    last_name: string;
    photo: string;
    profession: string;
  };
}>();

const deputyUrl = computed(() => {
  const fullName = `${props.deputy.first_name}-${props.deputy.last_name}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return `/assemblee-nationale/deputes/${props.deputy.id}/${fullName}`;
});
</script>

<template>
  <NuxtLink
    :to="deputyUrl"
    class="flex flex-col items-center transition-opacity hover:opacity-90"
  >
    <img
      :src="$directusImageUrl(deputy.photo, '50')"
      :alt="`Photo de ${deputy.first_name} ${deputy.last_name}`"
      class="mb-3 h-32 w-32 rounded-full object-cover shadow-md"
    />
    <div class="text-center font-medium">
      {{ deputy.first_name }}<br />{{ deputy.last_name }}
    </div>
    <!-- <div class="text-center text-sm text-gray-600">{{ deputy.profession }}</div> -->
  </NuxtLink>
</template>
