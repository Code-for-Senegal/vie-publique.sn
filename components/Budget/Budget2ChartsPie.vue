<script setup></script>
<template>
  <div class="py-8">
    <div class="item-center grid grid-cols-1 gap-2 md:grid-cols-2">
      <div>
        <h3 class="mb-4 text-center text-lg font-semibold">Recettes</h3>
        <div id="revenueChart" class="text-center"></div>
      </div>
      <div>
        <h3 class="mb-4 text-center text-lg font-semibold">Dépenses</h3>
        <div id="expenseChart"></div>
      </div>
    </div>

    <BudgetChartsWaterfall
      :revenue-data="budget?.revenueData"
      :expense-data="budget?.expenseData"
    />
  </div>
</template>
