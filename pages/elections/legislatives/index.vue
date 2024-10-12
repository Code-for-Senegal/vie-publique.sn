<!-- pages/coalitions.vue -->
<script setup lang="ts">
const { data: coalitions, pending: loading, error, refresh } = useCoalitions();

useHead({
  title: "Liste des coalitions électorales",
  meta: [
    {
      name: "description",
      content: "Liste des coalitions participant aux élections",
    },
  ],
});
</script>

<template>
  <!-- <div class="container mx-auto px-4 py-8"> -->
  <div class="flex flex-col items-center px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Législatives 2024</h1>
    </div>

    <!-- <p v-if="coalitions.length > 1" class="mb-4 text-sm text-gray-500">
      {{ coalitions.length }} Liste des coalitions électorales
    </p> -->

    <!-- <h1 class="mb-6 text-3xl font-bold">Liste des coalitions électorales</h1> -->

    <UCard v-if="loading">
      <USkeleton class="h-32" />
    </UCard>

    <UAlert v-else-if="error" type="danger">
      {{ error }}
    </UAlert>

    <div v-else class="flex flex-col gap-2">
      <UCard v-for="coalition in coalitions" :key="coalition.id" class="">
        <NuxtLink
          class="flex flex-row items-center gap-2"
          :to="`/coalition/legislatives/${coalition.id}`"
        >
          <div class="h-12 w-12 flex-shrink-0 md:w-16">
            <UAvatar
              v-if="coalition.logo"
              :src="$directusImageUrl(coalition.logo)"
              :alt="coalition.name"
              size="lg"
              loading="lazy"
            />
            <UAvatar v-else icon="i-heroicons-photo" size="lg" />
          </div>
          <div class="flex-grow">
            <h2 class="font-semibold md:text-lg">
              <!-- <UBadge :ui="{ rounded: 'rounded-full' }">{{
                coalition.list_order
              }}</UBadge> -->
              {{ coalition.list_order }}.
              {{ coalition.name }}
            </h2>
            <!-- <p class="text-sm text-gray-600">
            Numéro d'ordre: {{ coalition.list_order }}
          </p> -->
          </div>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>
