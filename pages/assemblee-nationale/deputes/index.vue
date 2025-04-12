<!-- pages/deputies.vue -->
<template>
  <div>
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour à la liste"
      color="gray"
      @click="handleReturn()"
    />

    <div class="">
      <div class="container">
        <div class="prose prose-sm sm:prose my-2">
          <h1 class="">Annuaire des députés</h1>
        </div>
      </div>
    </div>

    <div class="flex flex-col">
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

// Liste des routes valides pour le retour
const validReturnPaths = [
  "/assemblee-nationale/deputes",
  "/assemblee-nationale/commissions",
  "/assemblee-nationale/bureau",
  "/assemblee-nationale/groupes",
];

// Gestion du retour
const handleReturn = () => {
  // Vérifie si on a un referer dans l'historique de navigation
  const previousRoute = router.options.history.state.back;

  // Si on a un referer et qu'il fait partie des routes valides
  if (
    previousRoute &&
    validReturnPaths.some((path) => previousRoute.startsWith(path))
  ) {
    router.back();
  } else {
    // Sinon, redirection vers la liste des députés par défaut
    router.push("/assemblee-nationale");
  }
};

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
