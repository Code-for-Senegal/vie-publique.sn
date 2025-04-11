<script setup lang="ts">
interface CardItem {
  title: string;
  description: string;
  image: string;
  to: string;
}

const props = defineProps<{
  navigationCards: CardItem[];
}>();
</script>

<template>
  <div class="mb-2 grid grid-cols-2 gap-2">
    <NuxtLink
      v-for="card in navigationCards"
      :key="card.title"
      :to="card.to"
      class="custom-shadow group relative h-20 overflow-hidden rounded-lg transition hover:shadow-xl md:h-24"
    >
      <img
        :src="card.image"
        :alt="card.title"
        class="h-full w-full object-cover"
      />
      <div
        class="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"
      ></div>
      <div class="absolute inset-0 flex items-center px-2 sm:px-4">
        <div class="text-white">
          <h3 class="text-xl font-extrabold md:text-3xl">{{ card.title }}</h3>
          <p
            class="hidden text-sm font-medium leading-relaxed opacity-90 md:block"
          >
            {{ card.description }}
          </p>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
