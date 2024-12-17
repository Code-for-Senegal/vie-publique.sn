<template>
  <div
    class="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg md:hidden dark:bg-gray-900"
  >
    <div class="flex items-center justify-around px-2 py-2">
      <UButton
        v-for="tab in tabs"
        :key="tab.name"
        :icon="tab.icon"
        color="gray"
        size="xs"
        variant="ghost"
        class="flex flex-col items-center justify-center"
        :class="{
          'bg-green-100 text-gray-900': isActiveTab(tab),
          'text-gray-500': !isActiveTab(tab),
        }"
        :to="tab.to"
        :label="tab.label"
      />
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const activeTab = ref("");

const tabs = [
  { label: "Accueil", name: "accueil", icon: "i-heroicons-home", to: "/" },
  {
    label: "Actualités",
    name: "actualites",
    icon: "i-heroicons-newspaper",
    to: "/publications/actualites",
  },
  {
    label: "Annuaires",
    name: "annuaires",
    icon: "i-heroicons-identification",
    to: "/annuaires",
  },
  {
    label: "Documents",
    name: "documents",
    icon: "i-heroicons-rectangle-stack",
    to: "/documents",
  },
  {
    label: "Budget",
    name: "budget",
    icon: "i-heroicons-banknotes",
    to: "/budget-senegal",
  },
];

const isActiveTab = (tab) => tab.name === activeTab.value;

watch(
  () => route.path,
  (newPath) => {
    const matchTab = tabs.find((tab) => tab.to === newPath);
    activeTab.value = matchTab ? matchTab.name : "";
  },
  { immediate: true },
);
</script>
