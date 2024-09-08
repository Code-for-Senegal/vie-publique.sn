<script setup lang="ts">
interface Menu {
  label: string;
  description: string;
  photo: string;
  icon: any;
  to: string;
}

const props = defineProps<{
  menus: Menu[];
}>();
</script>

<template>
  <div class="grid-container mt-2">
    <ULink
      v-for="link in menus"
      :key="link.to"
      :to="link.to"
      class="mb-2 w-full"
    >
      <UCard class="custom-shadow h-28 border-b-2 border-green-700 sm:h-28">
        <div class="flex flex-row gap-1">
          <div class="w-11 flex-shrink-0 md:w-16">
            <UIcon :name="link.icon" class="mt-1 w-full text-2xl" />
          </div>
          <div class="flex-grow">
            <h2 class="text-md font-semibold">{{ link.label }}</h2>
            <p class="text-sm text-gray-500">{{ link.description }}</p>
          </div>
        </div>
      </UCard>
    </ULink>
  </div>
</template>
