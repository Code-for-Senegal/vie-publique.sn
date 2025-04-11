\
<script setup lang="ts">
const seoTitle = "Nos offres recrutement";
const seoDescription = "Nos offres recrutement";
const seoImgPath = "https://vie-publique.sn/images/share-linkedin.png";
const seoPageUrl = "https://vie-publique.sn/publications/recrutement";

useHead({
  title: seoTitle,
  meta: [
    { name: "description", content: seoDescription },
    { name: "twitter:title", content: seoTitle },
    { name: "twitter:description", content: seoDescription },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    { property: "og:title", content: seoTitle },
    { property: "og:description", content: seoDescription },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});

const searchQuery = ref("");

const {
  data: contentItems,
  pending,
  error,
} = await useAsyncData(
  "contentItems",
  () => queryContent("publications/recrutement").find(),
  { server: true, lazy: false },
);

const filteredSortedContentItems = computed(() => {
  if (!contentItems.value) return [];
  return contentItems.value
    .filter((code) =>
      code.title?.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});
</script>

<template>
  <div class="container mx-auto px-4 py-4">
    <div class="prose prose-lg mx-auto mb-8">
      <h1 class="text-center">
        Rejoignez notre équipe
        <span class="mt-2 block text-lg font-normal text-gray-600">
          Découvrez nos opportunités
        </span>
      </h1>
    </div>

    <!-- Loading spinner -->
    <div v-if="pending" class="flex justify-center py-12">
      <div
        class="h-16 w-16 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent"
      ></div>
    </div>

    <!-- Error alert -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      :description="error.message"
    />

    <!-- Job listings -->
    <div v-else>
      <!-- No results message -->
      <div
        v-if="filteredSortedContentItems.length === 0"
        class="mt-8 flex flex-col items-center text-center"
      >
        <UIcon
          name="i-heroicons-exclamation-circle"
          class="mb-4 h-16 w-16 text-gray-400"
        />
        <p class="text-xl text-gray-500">Aucun poste disponible actuellement</p>
      </div>

      <!-- Job cards grid -->
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <UCard
          v-for="item in filteredSortedContentItems"
          :key="item._path"
          class="custom-shadow hover:scale-102 group transition-transform duration-300 hover:shadow-lg"
        >
          <NuxtLink :to="item._path" class="block h-full">
            <!-- Job title -->
            <h3
              class="mb-4 text-xl font-bold text-gray-900 transition-colors group-hover:text-emerald-700"
            >
              {{ item.title }}
            </h3>

            <!-- Dates -->
            <div class="space-y-2 text-sm">
              <div class="flex items-center text-gray-800">
                <UIcon name="i-heroicons-calendar" class="mr-2 h-5 w-5" />
                <span>Publié le {{ $dateformatWithDayName(item.date) }}</span>
              </div>
              <div class="flex items-center text-gray-700">
                <UIcon name="i-heroicons-clock" class="mr-2 h-5 w-5" />
                <span
                  >Date limite :
                  {{ $dateformatWithDayName(item.deadline) }}</span
                >
              </div>
            </div>

            <!-- Apply button -->
            <div class="mt-4 text-right">
              <span
                class="inline-flex items-center font-medium text-emerald-700 group-hover:text-emerald-800"
              >
                Voir le poste
                <UIcon
                  name="i-heroicons-arrow-right"
                  class="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </NuxtLink>
        </UCard>
      </div>

      <div class="w-full px-4 py-4">
        <NuxtLink
          to="/about/us"
          class="texte-center mt-2 block text-lg font-normal text-blue-600 underline"
        >
          En savoir plus sur nous
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
