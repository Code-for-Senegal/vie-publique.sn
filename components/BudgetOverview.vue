<script setup lang="ts">
const keyPoints = [
  " Vie-Publique est tenu par des bénévoles, si vous voyez une erreur merci de nous aider à corriger",
  "Les chiffres présentés sont basés sur les crédits de paiement de l'Annexe II de la LFI 2024",
];

const props = defineProps<{
  budgetDatas: any;
}>();
</script>

<template>
  <div class="mx-auto max-w-4xl bg-white p-2 text-sm sm:p-4">
    <h1 class="mb-2 text-center text-xl font-bold">
      Budget prévisionnel Loi de finances 2024
    </h1>

    <div class="grid grid-cols-2 gap-2">
      <div class="bg-beige-100 rounded-lg p-2 sm:p-4">
        <h3 class="text-sm font-semibold">Budget Global</h3>
        <span class="text-2xl font-bold md:text-4xl">{{
          budgetDatas.totalBudget.toFixed(0)
        }}</span>
        <span class="text-md ml-1 font-semibold text-green-600 sm:text-2xl"
          >+{{ budgetDatas.budgetIncrease }}%</span
        >
        <div class="text-primary text-sm">milliards FCFA</div>
      </div>

      <div class="bg-beige-100 rounded-lg p-2 sm:p-4">
        <h3 class="text-sm font-semibold">Déficit budgétaire</h3>
        <span class="text-2xl font-bold md:text-4xl">
          {{ budgetDatas.balance.amount.toFixed(0) }}
        </span>
        <span class="text-md ml-1 font-semibold text-red-600 sm:text-2xl"
          >{{ budgetDatas.balance.pibPercentage }}% PIB</span
        >
        <div class="text-primary text-sm">
          {{ budgetDatas.balance.unit }} FCFA
        </div>
      </div>

      <div class="bg-beige-100 rounded-lg p-2 sm:p-4">
        <h3 class="text-sm font-semibold">Ressources du budget général</h3>
        <span class="text-2xl font-bold md:text-4xl">{{
          budgetDatas.resources.totalResources.toFixed(0)
        }}</span>
        <span class="text-md ml-1 font-semibold text-green-600 sm:text-2xl"
          >+{{ budgetDatas.resources.resourcesIncrease }}%</span
        >
        <div class="text-primary text-sm">milliards FCFA</div>
      </div>

      <div class="bg-beige-100 rounded-lg p-2 sm:p-4">
        <h3 class="text-sm font-semibold">Taux de croissance prévu</h3>
        <span class="text-2xl font-bold md:text-4xl">
          {{ budgetDatas.growthRate }} %
        </span>
        <!-- <span class="text-md ml-2 font-semibold text-green-600 sm:text-2xl"
          >{{ budgetDatas.balance.pibPercentage }}%</span
        > -->
        <!-- <div class="font-semibold">{{ budgetDatas.balance.unit }} FCFA</div> -->
      </div>
    </div>

    <div class="my-2">
      <h2 class="bg-beige-100 mb-2 p-2 text-center font-bold">
        Ressources du budget général
      </h2>
      <div class="flex items-center justify-around">
        <div class="text-center">
          <div class="mb-2">Ressources Internes</div>
          <div class="flex flex-col md:flex-row md:gap-4">
            <BudgetRessourcesCircleProgress
              v-for="resource in budgetDatas.resources.internalResources
                .details"
              :key="resource.name"
              :percentage="resource.percentage"
              :label="resource.name"
              :value="`${resource.value} Mrd`"
              color="#4CAF50"
              class="flex-1"
            />
          </div>
        </div>

        <div class="text-center">
          <div class="mb-2">Ressources Externes</div>
          <div class="flex flex-col md:flex-row md:gap-4">
            <BudgetRessourcesCircleProgress
              v-for="resource in budgetDatas.resources.externalResources
                .details"
              :key="resource.name"
              :percentage="resource.percentage"
              :label="resource.name"
              :value="`${resource.value} Mrd`"
              color="#4CAF50"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="my-4">
      <div class="bg-beige-100 mb-2 p-2 text-center">
        <span class="font-bold">Dépenses du budget général</span>
      </div>

      <div class="mt-2 text-center">
        <span class="text-xl font-bold sm:text-3xl">{{
          budgetDatas.expenses.totalExpenses
        }}</span>
        <span class="text-md ml-1 font-semibold text-green-600"
          >↑ {{ budgetDatas.expenses.expensesIncrease }}%</span
        >
        <div class="font-medium">milliards FCFA</div>
      </div>

      <BudgetRateBar
        :items="budgetDatas?.expenses.categories || []"
        :total="budgetDatas.expenses.totalExpenses || 0"
      />
    </div>

    <div class="my-4">
      <div class="bg-beige-100 mb-2 p-2 text-center">
        <span class="font-bold"> Comptes Spéciaux du Trésor</span>
      </div>

      <div class="mt-2 text-center">
        <span class="text-xl font-bold sm:text-3xl">
          {{ budgetDatas.specialAccount.value }}
        </span>
        <span class="text-md ml-1 font-semibold text-green-600"
          >↑ {{ budgetDatas.specialAccount.increase }}%</span
        >
        <div class="mb-2 font-medium">milliards FCFA</div>
        <div class="hidden text-sm text-gray-500">
          Les recettes et dépenses des Comptes spéciaux du Trésor s'équilibrent
          à
        </div>
      </div>
    </div>
  </div>

  <div class="mt-6">
    <h2 class="mb-2 text-lg font-semibold">💡 NB</h2>
    <ul class="list-disc space-y-1 pl-5">
      <li v-for="point in keyPoints" :key="point">{{ point }}</li>
    </ul>
  </div>
</template>

<style scoped>
.bg-beige-300 {
  background-color: #d7ccc8;
}

.text-beige-500 {
  color: #a1887f;
}

.bg-beige-300 {
  background-color: #d7ccc8;
}

.bg-beige-100 {
  background-color: #efebe9;
}
</style>
