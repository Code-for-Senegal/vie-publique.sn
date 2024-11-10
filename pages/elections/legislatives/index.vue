<!-- pages/coalitions.vue -->
<script setup lang="ts">
const route = useRoute();

const seoTitle = "Élections Législatives 2024 Sénégal";
const seoDescription =
  "Élections Législatives anticipées du 17 Novembre 2024 Sénégal: coalitions, listes, candidats, résultats";
const seoImgPath = "/images/vpsn-share-elections.png";
const seoPageUrl = "https://vie-publique.sn/elections/legislatives";
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

const {
  data: coalitions,
  pending: loadingCoalitions,
  error: errorCoalitions,
} = useCoalitions();

const listViewTypeDefault = "Listes";
const listViewTypeBulletin = "Bulletins";
const listViewTypeHeadOfList = "Têtes de liste";
const selectedlistViewType = ref(listViewTypeDefault);
const listViewTypes = [
  listViewTypeDefault,
  listViewTypeBulletin,
  listViewTypeHeadOfList,
];

const links = [{ label: "Tableau de Bord Élections", to: "/elections" }];
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <UButton
      v-if="coalitions"
      size="xs"
      class="bg-gray b-0 mb-1 w-full hover:bg-white"
    >
      <AppBreadcrumb :links="links" :last-text="route.params.slug" />
    </UButton>

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Candidatures Législatives 2024</h1>
    </div>

    <div class="my-3 w-full text-center">
      <UButton
        v-for="option in listViewTypes"
        :key="option"
        class="custom-shadow mb-1 ml-1"
        :color="selectedlistViewType === option ? 'white' : 'gray'"
        :class="
          selectedlistViewType === option
            ? 'border-b border-green-700 font-semibold text-green-700'
            : ''
        "
        size="xl"
        @click="
          selectedlistViewType = selectedlistViewType === option ? '' : option
        "
      >
        {{ option }}
      </UButton>
    </div>

    <div class="w-full">
      <!-- <USelect
        v-model="selectedlistViewType"
        :options="listViewTypes"
        placeholder="Choisir un mode d'affichage"
        class="input custom-shadow mb-4 w-full"
      /> -->

      <UCard v-if="loadingCoalitions">
        <USkeleton class="custom-shadow h-21 bg-gray mb-2 w-full" />
      </UCard>

      <UAlert v-else-if="errorCoalitions" type="danger">
        {{ errorCoalitions }}
      </UAlert>

      <div v-else>
        <ElectionListDefault
          v-if="
            selectedlistViewType == listViewTypeDefault &&
            coalitions?.length > 0
          "
          :coalitions="coalitions"
          :loading="loadingCoalitions"
        />

        <ElectionListBulletin
          v-if="
            selectedlistViewType == listViewTypeBulletin &&
            coalitions?.length > 0
          "
          :coalitions="coalitions"
          :loading="loadingCoalitions"
        />

        <ElectionListHead
          v-if="
            selectedlistViewType == listViewTypeHeadOfList &&
            coalitions?.length > 0
          "
          :coalitions="coalitions"
          :loading="loadingCoalitions"
        />
      </div>
    </div>
  </div>
</template>
