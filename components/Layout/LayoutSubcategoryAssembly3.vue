<template>
  <div class="container mx-auto mb-4">
    <!-- <h2 class="mb-2 text-center text-xl font-bold">{{ title }}</h2> -->

    <div class="mb-8 grid grid-cols-2 gap-2 lg:grid-cols-4">
      <NuxtLink
        v-for="card in item"
        :key="card.title"
        :to="card.to"
        class="group relative h-24 overflow-hidden rounded-lg shadow-sm transition hover:shadow-md md:h-32"
      >
        <img
          :src="card.image"
          :alt="card.title"
          class="h-full w-full object-cover"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"
        ></div>
        <div class="absolute inset-0 flex items-center p-2 sm:p-4">
          <div class="text-white">
            <h3 class="text-xl font-extrabold md:mb-1">{{ card.title }}</h3>
            <p
              class="hidden text-sm font-medium leading-relaxed opacity-90 md:block"
            >
              {{ card.description }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: any[];
  title: string;
}>();
</script>
