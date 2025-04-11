<script setup lang="ts">
const seoTitle = "Budget l'État du Sénégal";
const seoDescription =
  "Budget 2025 de l'État du Sénégal, Loi de finance et rapport d'exécution";
const seoImgPath = "https://vie-publique.sn/images/vpsn-share-budget.png";
const seoPageUrl = "https://vie-publique.sn/budget-senegal";
useHead({
  title: seoTitle,
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    {
      name: "keywords",
      content:
        "Budget Sénégal, Budget Sénégal 2025, loi de finances Sénégal, LFI Sénégal",
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

const keyPoints = [
  "Vie-Publique est tenu par des bénévoles, si vous voyez une erreur merci de nous aider à corriger",
  "Les chiffres présentés sont basés sur les crédits de paiement de l'Annexe II de la LFI 2024",
];

const sources = [
  {
    title: "Loi de finances 2024",
    url: "/pdf/budget/2024-lois-de-finances-2023-18.pdf",
  },
  {
    title: "Annexe la Loi de finances 2024",
    url: "/pdf/budget/2024-loi-de-finances-annexes.pdf",
  },
  {
    title: "Rapport d'exécution 1er trimestre 2024",
    url: "/pdf/budget/2024-rapport-execution-budgetaire-premier-trimestre.pdf",
  },
  {
    title: "Rapport d'exécution 2ème trimestre 2024",
    url: "/pdf/budget/2024-rapport-execution-budgetaire-deuxieme-trimestre.pdf",
  },
];

/* Get Datas */

// const { data: budgetDatas } = await useFetch('/api/quiz-text')
const { data: budgetDatas, pending } = useLazyFetch("/api/budget-lfi");

const { data: q1Datas } = useLazyFetch("/api/budget-execution");

const optionBudget = "Chiffres clés";
const optionInstitutions = "Institutions";
const optionMinisteres = "Ministères";
const optionExecution = "Suivi exécution";
const optionEvolution = "Tendances";
const selectedOptions = ref(optionBudget);
const options = [
  optionBudget,
  optionInstitutions,
  optionMinisteres,
  optionExecution,
  optionEvolution,
];

// to move in ministry wrapper component
const isSortedDescending = ref(true);

const sortedMinistryBudgets = computed(() => {
  return [...budgetDatas.value.ministryBudgets].sort((a, b) => {
    const aAmount =
      a.totalBudget.unit === "milliards"
        ? a.totalBudget.amount
        : a.totalBudget.amount / 1000;
    const bAmount =
      b.totalBudget.unit === "milliards"
        ? b.totalBudget.amount
        : b.totalBudget.amount / 1000;
    return isSortedDescending.value ? bAmount - aAmount : aAmount - bAmount;
  });
});

const toggleSortOrder = () => {
  isSortedDescending.value = !isSortedDescending.value;
};
</script>

<template>
  <div v-if="pending">Chargement en cours...</div>
  <div v-else-if="budgetDatas" class="mx-auto max-w-4xl p-2 text-sm sm:p-4">
    <NuxtLink
      to="/budget-senegal"
      class="mb-2 inline-flex items-center text-gray-600 hover:text-gray-800"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
      Retour
    </NuxtLink>
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Budget Sénégal 2024</h1>
    </div>

    <div class="my-3 w-full text-center">
      <UButton
        v-for="organisme in options"
        :key="organisme"
        class="custom-shadow mb-1 ml-1"
        :color="selectedOptions === organisme ? 'primary' : 'white'"
        @click="
          selectedOptions = selectedOptions === organisme ? '' : organisme
        "
      >
        {{ organisme }}
      </UButton>
    </div>

    <div v-if="selectedOptions == optionBudget">
      <BudgetOverview :budget-datas="budgetDatas" />
    </div>

    <div v-if="selectedOptions == optionMinisteres">
      <h1 class="mb-4 text-center text-xl font-bold">
        Budget par ministère
        <button class="text-primary" @click="toggleSortOrder">
          {{ isSortedDescending ? "↑" : "↓" }}
        </button>
      </h1>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <BudgetMinistry
          v-for="ministry in sortedMinistryBudgets"
          :key="ministry.name"
          :icon="ministry.icon"
          :ministry="ministry.name"
          :budget="ministry.budget"
        />
      </div>
    </div>

    <div v-if="selectedOptions == optionInstitutions">
      <BudgetInstitutions :institutions="budgetDatas.institutionBudgets" />
    </div>

    <div v-if="selectedOptions == optionExecution">
      <BudgetExecution
        v-if="q1Datas"
        :data-q1="q1Datas"
        :data-lfi="budgetDatas"
      />
    </div>

    <div v-if="selectedOptions == optionEvolution">
      <BudgetTendance :data="q1Datas" />
    </div>
    <!-- END IF -->

    <div class="mt-6">
      <h2 class="mb-2 text-lg font-semibold">💡 NB</h2>
      <ul class="list-disc space-y-1 pl-5">
        <li v-for="point in keyPoints" :key="point">{{ point }}</li>
      </ul>
    </div>
    <div class="mt-6">
      <h2 class="mb-2 text-lg font-semibold">🗂️ Sources</h2>
      <ul class="list-disc space-y-1 pl-5">
        <li v-for="source in sources" :key="source.url">
          <a :href="source.url" class="underline" target="_blank">{{
            source.title
          }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
