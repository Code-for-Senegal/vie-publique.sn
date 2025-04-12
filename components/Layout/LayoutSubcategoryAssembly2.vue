<template>
  <div class="container mx-auto mb-8">
    <h2 class="mb-4 text-center text-2xl font-bold">{{ title }}</h2>

    <!-- Grid for menu items -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
      <UCard
        v-for="menu in item"
        :key="menu.title"
        class="transform rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
      >
        <NuxtLink
          :to="menu.display ? menu.to : '#'"
          class="flex items-start space-x-4"
        >
          <!-- Icon with dynamic color -->
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full text-white"
            :class="colors[menu.colorKey] || 'bg-gray-200 text-gray-700'"
          >
            <UIcon :name="menu.icon" class="h-6 w-6" />
          </div>
          <!-- Menu details -->
          <div>
            <h3 class="text-lg font-semibold">{{ menu.title }}</h3>
            <p class="text-sm text-gray-500">{{ menu.description }}</p>
          </div>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: Array<any>;
  colors: Record<string, string>;
  title: string;
}>();
</script>
