<script setup lang="ts">
const seoTitle = "Institutions de la république du Sénégal";
const seoDescription = "Institutions de la république du Sénégal";
const seoImgPath = "https://vie-publique.sn/images/share-linkedin.png";
const seoPageUrl = "https://vie-publique.sn/publications/actualites";
useHead({
  meta: [{ name: "robots", content: "index,follow" }],
});

const searchQuery = ref("");

const {
  data: contentItems,
  pending,
  error,
} = await useAsyncData(
  "contentItems",
  () => queryContent("publications/institutions").find(),
  { server: true, lazy: false },
);

const filteredContentItems = computed(() => {
  if (!contentItems.value) return [];
  return contentItems.value
    .filter((code) =>
      code.title?.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});
</script>

<template>
  <div class="container mx-auto px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Les Institutions du Sénégal</h1>
    </div>

    <div class="text-center">
      <p
        v-if="contentItems && contentItems.length > 0"
        class="mb-2 text-sm text-gray-500"
      >
        Les Institutions de la République selon l'Article premier de la loi
        constitutionnelle n° 2016-10 du 05 avril 2016
      </p>
    </div>

    <UInput
      v-model="searchQuery"
      size="md"
      placeholder="Rechercher..."
      icon="i-heroicons-magnifying-glass"
      class="input custom-shadow my-4 hidden w-full"
    />

    <div v-if="pending">Chargement...</div>
    <div v-else-if="error">
      Une erreur s'est produite lors du chargement des actualités.
    </div>

    <!-- TODO - turn to component -->
    <div
      v-else="contentItems && contentItems.length > 0"
      class="flex flex-col gap-2"
    >
      <UCard
        v-for="link in contentItems"
        :key="link.to"
        class="custom-shadow cursor-pointer"
      >
        <NuxtLink :to="link._path">
          <p>
            <span class="font-semibold text-blue-600 underline"
              >{{ link.subtitle }}
            </span>
            <!-- <UIcon name="i-heroicons-arrow-right" size="sm" />  -->
          </p>
          <p class="text-sm text-gray-500">{{ link.category }}</p>
        </NuxtLink>
      </UCard>
    </div>

    <!-- <div
        v-else="contentItems && contentItems.length > 0"
        class="grid grid-cols-1 gap-2"
      >
        <UCard
          v-for="item in contentItems"
          :key="item._path"
          class="cursor-pointer custom-shadow"
        >
          <NuxtLink :to="item._path" class="flex flex-row gap-2">
            <div class="hidden flex-shrink-0 w-16 md:w-16">
              <NuxtImg
                :src="item.image || '/default-image-2.gif'"
                :alt="item.title"
                class="w-full object-cover"
                loading="lazy" fetchpriority="high"
                sizes="300px"
                :placeholder="[300, 300]"
              />
            </div>
            <div class="flex-grow">
              <p class="font-semibold">
                {{ item.title }}
              </p>
              <div
                class="inline-block px-2 py-1 my-1 text-xs bg-gray-200 text-gray-800"
              >
                {{ item.category }}
              </div>
            </div>
          </NuxtLink>
        </UCard>
      </div> -->
  </div>
</template>
