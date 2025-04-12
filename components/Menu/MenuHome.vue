<script setup lang="ts">
interface Menu {
  label: string;
  description: string;
  icon: any;
  to: string;
}

const props = defineProps<{
  menus: Menu[];
}>();
</script>

<template>
  <div class="mb-6 mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
    <UCard
      v-for="menu in menus"
      :key="menu.label"
      class="custom-shadow p-2 hover:shadow-xl"
    >
      <NuxtLink :to="menu.to" class="flex items-start">
        <div class="mr-4 flex-shrink-0">
          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100"
          >
            <UIcon :name="menu.icon" class="text-black-700 h-8 w-8" />
          </div>
        </div>
        <div>
          <h2 class="text-md text-black-700 font-bold">{{ menu.label }}</h2>
          <p class="text-sm text-gray-700">{{ menu.description }}</p>
        </div>
      </NuxtLink>
    </UCard>
  </div>
</template>
