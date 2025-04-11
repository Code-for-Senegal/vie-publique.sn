<script setup lang="ts">
useHead({
  title: "Annuaires du Sénégal",
  meta: [
    {
      name: "description",
      content:
        "Accédez aux annuaires du Sénégal: Nominations Gouvernement, Justice, Media, Sites Web publics et plus encore.",
    },
  ],
});

const menuCategories = [
  {
    title: "Annuaire Gouvernement",
    description: "Nominations, Ministres, DG...",
    icon: "i-heroicons-identification",
    to: "/nomination-senegal",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Annuaire Députés",
    description: "les 165 députés élus",
    icon: "i-heroicons-user",
    to: "/assemblee-nationale/deputes",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Annuaire Médias",
    description: "Liste des Médias reconnus",
    icon: "i-heroicons-tv",
    to: "/medias",
    color: "bg-red-100 text-red-700",
  },
  {
    title: "Aide à la presses",
    description: "Fond d'aide à la presse",
    icon: "i-heroicons-radio",
    to: "/medias/aide-presse",
    color: "bg-red-100 text-red-700",
  },
  {
    title: "Annuaire Justice",
    description: "Magistrature, acteurs de la justice",
    icon: "i-heroicons-scale",
    to: "/justice/magistrature",
    color: "bg-purple-100 text-purple-700",
  },
  {
    title: "Annuaire Sites Web",
    description: "Annuaire des sites publics",
    icon: "i-heroicons-computer-desktop",
    to: "/annuaire-sites-publics-senegal",
    color: "bg-blue-100 text-blue-700",
  },
];
</script>

<template>
  <div class="container mx-auto px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Annuaires</h1>
    </div>

    <div class="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
      <UCard
        v-for="menu in menuCategories"
        :key="menu.title"
        class="custom-shadow p-0 hover:shadow-xl"
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
