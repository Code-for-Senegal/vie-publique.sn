<!-- todo DELETE -->
<script setup lang="ts">
// import { getInstitutionColor } from "@/composables/useInstitution";

const props = defineProps<{
  dataQ1: any;
  dataLfi: any;
}>();
</script>

<template>
  <div class="mx-auto max-w-4xl bg-white p-2 text-sm sm:p-4">
    <h1 class="mb-2 text-center text-xl font-bold">Situation d'exécution au 2ème Trimestre 2024</h1>

    <div class="mb-2 grid grid-cols-2 gap-2">
      <BudgetExecutionIndicatorBox
        title="Ressources totales"
        :lfi-value="dataQ1.resources.lfi"
        :realized-value="dataQ1.resources.realized"
        unit="Mrd"
      />
      <BudgetExecutionIndicatorBox
        title="Dépenses totales"
        :lfi-value="dataQ1.expenses.lfi"
        :realized-value="dataQ1.expenses.realized"
        unit="Mrd"
      />
    </div>

    <div class="bg-beige-100 my-4 p-2 text-center font-bold text-black">
      Exécution par catégorie de dépenses
    </div>

    <BudgetExecutionRateBar
      v-for="category in dataQ1.expenseCategories"
      :key="category.title"
      :title="category.title"
      :lfi-value="category.lfi"
      :realized-value="category.realized"
      :color="category.color"
    />

    <div class="bg-beige-100 mt-4 p-2 text-center font-bold text-black">
      Exécution par institution
    </div>

    <BudgetExecutionRateBar
      v-for="institution in dataLfi.institutionBudgets"
      :key="institution.name"
      :title="institution.name"
      :lfi-value="institution.totalBudget.amount"
      :realized-value="institution.execution_q2.amount"
      :color="institution.color"
    />
  </div>
</template>

<style scoped>
.bg-beige-300 {
  background-color: #d7ccc8;
}

.bg-beige-100 {
  background-color: #efebe9;
}
</style>
