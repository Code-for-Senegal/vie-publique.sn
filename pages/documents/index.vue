<script setup lang="ts">
useHead({
  title: "Documents officiels du Sénégal",
  meta: [
    {
      name: "description",
      content:
        "Accédez aux documents officiels du Sénégal: Journal officiel, rapports d'audit, codes généraux et plus encore.",
    },
  ],
});

const documentCategories = [
  {
    title: "Journal Officiel",
    description: "Textes, Lois, Décrets, Arrêtés",
    icon: "i-heroicons-clipboard-document-list",
    to: "/journal-officiel-senegal",
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Rapports Publics",
    description: "Cours des Comptes OFNAC etc",
    icon: "i-heroicons-document-text",
    to: "/rapport-senegal",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Documents Budgétaires",
    description: "Lois de finances et annexes",
    icon: "i-heroicons-document-currency-pound",
    to: "/documents/budget",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "Documents Stratégie",
    description: "Les stratégies du Sénégal",
    icon: "i-heroicons-document-chart-bar",
    to: "/documents/strategies",
    color: "bg-red-100 text-red-700",
  },
  {
    title: "Codes Généraux",
    description: "Constitution, famille, presse...",
    icon: "i-heroicons-book-open",
    to: "/code-senegal",
    color: "bg-purple-100 text-purple-700",
  },
];
</script>

<template>
  <div class="container mx-auto px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Documents</h1>
    </div>

    <div class="grid hidden grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="category in documentCategories"
        :key="category.title"
        class="transition-all duration-300 hover:shadow-lg"
      >
        <NuxtLink :to="category.to" class="block p-2">
          <div
            :class="[
              'mb-2 flex h-14 w-14 items-center justify-center rounded-full',
              category.color,
            ]"
          >
            <UIcon :name="category.icon" class="h-8 w-8" />
          </div>
          <h2 class="mb-2 text-xl font-semibold">{{ category.title }}</h2>
          <p class="text-gray-600">{{ category.description }}</p>
        </NuxtLink>
      </UCard>
    </div>

    <div class="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
      <UCard
        v-for="menu in documentCategories"
        :key="menu.title"
        class="custom-shadow p-4 hover:shadow-xl"
      >
        <NuxtLink :to="menu.to" class="flex items-start">
          <div class="mr-4 flex-shrink-0">
            <div
              :class="[
                'flex h-14 w-14 items-center justify-center rounded-full',
                menu.color,
              ]"
            >
              <UIcon :name="menu.icon" class="h-8 w-8" />
            </div>
          </div>
          <div>
            <h2 class="font-bold">{{ menu.title }}</h2>
            <!-- <h2 class="text-xl font-semibold mb-2">{{ category.title }}</h2> -->
            <p class="text-sm text-gray-700">{{ menu.description }}</p>
          </div>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>
