<template>
  <div class="container mx-auto p-2 sm:p-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">{{ title }}</h1>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      <UCard
        v-for="menu in item"
        :key="menu.title"
        :class="[menu.display ? '' : 'bg-gray-100']"
        class="custom-shadow p-4 hover:shadow-xl"
      >
        <NuxtLink :to="menu.display ? menu.to : '#'" class="flex items-start">
          <div class="mr-4 flex-shrink-0">
            <div
              :class="[
                'flex h-12 w-12 items-center justify-center rounded-full',
                menu.display ? menu.color : 'bg-gray-200 text-gray-700',
              ]"
            >
              <UIcon :name="menu.icon" class="h-8 w-8" />
            </div>
          </div>
          <div>
            <h2 class="font-bold">{{ menu.title }}</h2>
            <p class="text-sm text-gray-700">{{ menu.description }}</p>
          </div>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: any[];
  title: string;
}>();
</script>
