<template>
  <div class="container mx-auto mb-4">
    <h2 class="mb-2 text-center text-xl font-bold">{{ title }}</h2>

    <div class="mt-0 grid grid-cols-2 gap-2 md:grid-cols-2">
      <UCard
        v-for="menu in item"
        :key="menu.title"
        :class="[menu.display ? '' : 'bg-gray-100']"
        class="custom-shadow p-0 hover:shadow-xl sm:p-0"
      >
        <NuxtLink :to="menu.display ? menu.to : '#'" class="flex items-start">
          <div class="mr-4 flex-shrink-0">
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-full',
                menu.display ? menu.color : 'bg-gray-200 text-gray-700',
              ]"
            >
              <UIcon :name="menu.icon" class="h-6 w-6" />
            </div>
          </div>
          <div>
            <h2 class="font-bold">{{ menu.title }}</h2>
            <p v-if="menu.description" class="text-sm text-gray-600">
              {{ menu.description }}
            </p>
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
