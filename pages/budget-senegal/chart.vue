<script setup lang="ts">
useHead({
  meta: [{ name: "robots", content: "noindex" }],
});

/* Get Datas */

const { data: budgetDatas, pending } = useLazyFetch("/api/budget-lfi");
const { data: q1Datas } = useLazyFetch("/api/budget-q1");
</script>

<template>
  <div v-if="pending">Chargement en cours...</div>
  <div v-else-if="budgetDatas" class="mx-auto max-w-4xl p-4 text-sm">
    <!-- <h1 class="text-2xl font-bold text-center mb-6">Budget Sénégal 2024</h1> -->

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Graphique Budget Sénégal 2024</h1>
    </div>
    <div class="mt-8 text-center">
      <UDivider />
      <pre>BudgetTendanceDebtCompositionChart</pre>
      <h2
        class="bg-beige-300 mb-4 p-2 text-center font-bold font-semibold text-black"
      >
        Composition de la dette publique du Sénégal
      </h2>

      <BudgetTendanceDebtCompositionChart />
    </div>

    <div class="mt-8 text-center">
      <UDivider />
      <pre>BudgetBarChart</pre>
      <h2
        class="bg-beige-300 mb-4 p-2 text-center font-bold font-semibold text-black"
      >
        Ressources du budget général
      </h2>
      <BudgetBarChart
        :items="
          [
            ...budgetDatas.resources.externalResources.details,
            ...budgetDatas.resources.internalResources.details,
          ] || []
        "
        :total="budgetDatas.resources.totalResources || 0"
      />
    </div>

    <div class="mt-8 text-center">
      <UDivider />
      <pre>BudgetRessourcesCategory Treemap D3</pre>
      <BudgetRessourcesCategoryTreemapD3
        :data="[
          ...budgetDatas.resources.externalResources.details,
          ...budgetDatas.resources.internalResources.details,
        ]"
      />
    </div>

    <div class="mt-8 text-center">
      <UDivider />
      <pre>BudgetRessourcesCategory Treemap</pre>
      <div class="container mx-auto p-4">
        <BudgetRessourcesCategoryTreemap
          title="Ressources Externes"
          :items="[
            ...budgetDatas.resources.externalResources.details,
            ...budgetDatas.resources.internalResources.details,
          ]"
          unit="Mrd"
        />
      </div>
    </div>

    <div class="mt-8 text-center">
      <UDivider />
      <pre>BudgetRessourcesCategory Treemap V3</pre>

      <div class="container mx-auto p-4">
        <BudgetRessourcesCategoryTreemapV3
          title="Ressources Externes"
          :items="[
            ...budgetDatas.resources.externalResources.details,
            ...budgetDatas.resources.internalResources.details,
          ]"
          unit="Mrd"
        />
      </div>
    </div>

    <div class="mt-8 text-center">
      <UDivider />
      <pre>BudgetRessourcesCategory Donut </pre>
      <BudgetRessourcesCategoryDonut
        :categories="[
          ...budgetDatas.resources.externalResources.details,
          ...budgetDatas.resources.internalResources.details,
        ]"
        :size="400"
      />
    </div>
  </div>
</template>
