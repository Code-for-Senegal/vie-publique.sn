<script setup lang="ts">
import { getInstitutionColor } from "@/composables/useInstitution";

const keyPoints = [
  "Source: Document de loi de finance 2024",
  "Vie-Publique est tenu par des bénévoles",
  "si vous voyez une erreur merci de nous aider à corriger",
];

interface Budget {
  amount: number;
  unit: "milliards" | "millions";
}

interface Category {
  name: string;
  budget: Budget;
}

interface Institution {
  name: string;
  totalBudget: Budget;
  categories: Category[];
}

const props = defineProps<{
  institutions: Institution[];
}>();

const formatBudget = (budget: Budget): string => {
  const formattedMontant = budget.amount.toFixed(1);
  const uniteAbrev = budget.unit === "milliards" ? "Mrd" : "Millions";
  return `${formattedMontant} ${uniteAbrev}`;
};

const totalBudget = computed(() => {
  return props.institutions.reduce((total, inst) => {
    const montantInMilliards =
      inst.totalBudget.unit === "milliards"
        ? inst.totalBudget.amount
        : inst.totalBudget.amount / 1000;
    return total + montantInMilliards;
  }, 0);
});

const institutionsWithPercentage = computed(() => {
  return props.institutions.map((inst) => {
    const montantInMilliards =
      inst.totalBudget.unit === "milliards"
        ? inst.totalBudget.amount
        : inst.totalBudget.amount / 1000;
    const percentage = (montantInMilliards / totalBudget.value) * 100;
    return { ...inst, percentage };
  });
});

// État pour le tri
const isSortedDescending = ref(true);

const sortedInstitutions = computed(() => {
  return [...institutionsWithPercentage.value].sort((a, b) => {
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

// State to track which institution's categories are visible
const expandedInstitutionIndex = ref<number | null>(null);

const toggleInstitution = (index: number) => {
  expandedInstitutionIndex.value =
    expandedInstitutionIndex.value === index ? null : index;
};
</script>

<template>
  <div class="mx-auto max-w-4xl bg-white p-2 text-sm sm:p-4">
    <h1 class="mb-2 text-center text-xl font-bold">
      Budget par Institution
      <button @click="toggleSortOrder" class="text-primary">
        {{ isSortedDescending ? "↑" : "↓" }}
      </button>
    </h1>

    <div
      v-for="(institution, index) in sortedInstitutions"
      :key="institution.name"
      class="bg-beige-100 mb-2 rounded p-2"
      @click="toggleInstitution(index)"
    >
      <div class="flex flex-row justify-between sm:items-center">
        <h3 class="text mb-2 font-semibold sm:mb-0">
          {{ institution.name }}
        </h3>

        <div class="flex flex-row items-center sm:justify-between">
          <p class="mr-1 font-bold sm:text-sm">
            {{ formatBudget(institution.totalBudget) }}
          </p>
          <UIcon
            :name="
              expandedInstitutionIndex === index
                ? 'i-heroicons-chevron-up'
                : 'i-heroicons-chevron-down'
            "
            size="md"
          />
        </div>
      </div>
      <div class="bg-beige-300 h-2 w-full">
        <div
          class="h-full"
          :style="{
            width: `${institution.percentage}%`,
            backgroundColor: getInstitutionColor(index),
          }"
        ></div>
      </div>
      <!-- Display the categories when the card is expanded -->
      <transition name="fade">
        <div v-if="expandedInstitutionIndex === index" class="mt-2">
          <div
            v-for="category in institution.categories"
            :key="category.name"
            class="bg-beige-100 mt-1 rounded-md p-2"
          >
            <div class="flex justify-between">
              <span class="text-xs">{{ category.name }}</span>
              <span>{{ formatBudget(category.budget) }}</span>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- <div class="mt-6">
      <h2 class="mb-2 text-lg font-semibold">💡 NB</h2>
      <ul class="list-disc space-y-1 pl-5">
        <li v-for="point in keyPoints" :key="point">{{ point }}</li>
      </ul>
    </div> -->
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.bg-beige-100 {
  background-color: #efebe9;
}
.bg-beige-300 {
  background-color: #d7ccc8;
}
</style>
