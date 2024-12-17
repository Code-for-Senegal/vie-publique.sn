<!-- pages/deputies.vue -->
<template>
  <div>
    <!-- <UBreadcrumb
      class="mt-2"
      :links="[
        { label: 'Accueil', to: '/' },
        { label: '15e législature', to: '/assemblee-nationale' },
        { label: 'Députés' },
      ]"
    /> -->
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour à la liste"
      color="gray"
      @click.native="router.back()"
    />

    <div class="">
      <div class="container">
        <div class="prose prose-sm sm:prose my-2">
          <h1 class="">Annuaire des députés</h1>
        </div>

        <!-- <template v-if="!loading && deputies">
          <p class="mt-2 text-gray-600">{{ deputies.length }} candidats élus</p>
        </template> -->
      </div>
    </div>
    <!-- Informations sur l'Assemblée nationale -->
    <div class="flex flex-col">
      <!-- <p v-html="legislature.description"></p> -->
      <p class="text-sm text-gray-600">Les 165 députés de la 15e législature</p>
    </div>

    <ElectionResultDeputiesGrid2
      :deputies="deputies"
      :loading="loading"
      :error="error"
    />
  </div>
</template>

<script setup>
import { useDeputev2 } from "@/composables/parliament/useDeputev2";
const router = useRouter();

const { deputies, loading, error, fetchElectedDeputies } = useDeputev2();

onMounted(async () => {
  await fetchElectedDeputies();
});

const seoTitle = "Députés Assemblée Nationale nationale";
const seoDescription =
  "Retrouvez tous les députés en activité de l'Assemblée nationale du Sénégal. Résultats de vote et analyses pour chaque député.";
const seoImgPath = "/images/vpsn-share-elections.png";
const seoPageUrl = "https://vie-publique.sn/deputes";
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
</script>
