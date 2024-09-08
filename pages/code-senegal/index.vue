<script setup lang="ts">
const seoTitle = "Code général de la république du Sénégal";
const seoDescription =
  "Sénégal Constitution, Code de la famille, Code du travail, Code des collectivités locales, Code de la presse";
const seoImgPath = "/images/vpsn-share-jors.png";
const seoPageUrl = "https://vie-publique.sn/journal-officiel-senegal/2024";
useHead({
  title: seoTitle,
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    // Twitter Card Meta Tags
    {
      name: "twitter:title",
      content: seoTitle,
    },
    {
      name: "twitter:description",
      content: seoDescription,
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    // Open Graph Meta Tags
    {
      property: "og:title",
      content: seoTitle,
    },
    {
      property: "og:description",
      content: seoDescription,
    },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});

const searchQuery = ref("");

const {
  data: codes,
  pending,
  error,
} = await useAsyncData("codes", () => queryContent("code-senegal").find(), {
  server: true,
  lazy: false,
});

const filteredCodes = computed(() => {
  if (!codes.value) return [];
  return codes.value.filter((code) =>
    code.title?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});
</script>

<template>
  <div class="container mx-auto px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Codes du Sénégal</h1>
    </div>

    <div class="text-center">
      <p v-if="filteredCodes.length > 1" class="mb-2 text-sm text-gray-500">
        {{ filteredCodes.length }} Codes référencés
      </p>
    </div>

    <UInput
      v-model="searchQuery"
      size="md"
      placeholder="Rechercher..."
      icon="i-heroicons-magnifying-glass"
      class="input custom-shadow my-4 w-full"
    />

    <div v-if="pending" class="space-y-4">
      <USkeleton
        v-for="i in 5"
        :key="i"
        class="h-24 w-full"
        :ui="{ background: 'bg-gray-200 dark:bg-gray-800' }"
      >
        <div class="space-y-2">
          <USkeleton width="70%" height="20px" class="mb-2" />
          <USkeleton width="40%" height="16px" />
        </div>
      </USkeleton>
    </div>

    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      :description="error.message"
    />

    <div v-else>
      <div
        v-if="filteredCodes.length === 0"
        class="mt-4 flex flex-col items-center text-center text-gray-500"
      >
        <UIcon
          size="sm"
          name="i-heroicons-exclamation-circle"
          class="my-8 h-6 w-6"
        />
        <p class="text-sm">Aucun résultat disponible</p>
      </div>
      <div v-else class="flex flex-col gap-2">
        <UCard
          v-for="codeItem in filteredCodes"
          :key="codeItem._path"
          class="custom-shadow cursor-pointer"
        >
          <NuxtLink :to="codeItem._path">
            <p class="font-semibold underline">
              <!-- <UIcon name="i-heroicons-document" />&nbsp; -->
              {{ codeItem.title }}
            </p>
            <p class="mt-1 text-sm text-gray-500">{{ codeItem.subtitle }}</p>
          </NuxtLink>
        </UCard>
      </div>
    </div>
  </div>
</template>
