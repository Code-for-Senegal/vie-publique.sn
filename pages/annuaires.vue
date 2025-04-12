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
    icon: "i-heroicons-user-group",
    to: "/nomination-senegal",
    color: "amber",
  },
  {
    title: "Annuaire Sites Web",
    description: "Annuaire des sites publics",
    icon: "i-heroicons-computer-desktop",
    to: "/annuaire-sites-publics-senegal",
    color: "blue",
  },
  {
    title: "Annuaire Médias",
    description: "Liste des Médias reconnus",
    icon: "i-heroicons-tv",
    to: "/medias",
    color: "red",
  },
  {
    title: "Annuaire Députés",
    description: "les 165 députés élus",
    icon: "i-heroicons-user",
    to: "/assemblee-nationale/deputes",
    color: "green",
  },
  {
    title: "Aide à la presses",
    description: "Fond d'aide à la presse",
    icon: "i-heroicons-radio",
    to: "/medias/aide-presse",
    color: "red",
  },
  {
    title: "Annuaire Justice",
    description: "Magistrature, acteurs de la justice",
    icon: "i-heroicons-scale",
    to: "/justice/magistrature",
    color: "indigo",
  },
];

// Fonction pour obtenir la couleur de fond de l'icône
const getIconBgColor = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100",
    green: "bg-emerald-100",
    red: "bg-rose-100",
    indigo: "bg-indigo-100",
    amber: "bg-amber-100",
  };
  return colorMap[color] || "bg-gray-100";
};

// Fonction pour obtenir la couleur de l'icône
const getIconColor = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-emerald-600",
    red: "text-rose-600",
    indigo: "text-indigo-600",
    amber: "text-amber-600",
  };
  return colorMap[color] || "text-gray-600";
};
</script>

<template>
  <div class="container mx-auto">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Annuaires</h1>
    </div>

    <div class="mt-2 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
      <NuxtLink
        v-for="menu in menuCategories"
        :key="menu.title"
        :to="menu.to"
        class="no-underline"
      >
        <UCard
          :ui="{
            base: 'transition-all duration-300 h-full',
            body: {
              base: 'p-0 h-full',
              padding: '',
            },
            ring: '',
            divide: '',
          }"
          class="hover:scale-102 overflow-hidden shadow-md transition-all hover:shadow-xl"
        >
          <div class="flex h-full">
            <!-- Partie gauche avec l'icône sur fond coloré -->
            <div
              :class="[
                getIconBgColor(menu.color),
                'flex items-center justify-center',
                'w-16 py-4 sm:w-20 sm:py-6',
              ]"
            >
              <div class="flex flex-col items-center">
                <UIcon
                  :name="menu.icon"
                  :class="[getIconColor(menu.color), 'h-10 w-10']"
                />
              </div>
            </div>

            <!-- Partie droite avec le texte -->
            <div class="flex flex-1 flex-col justify-center p-4">
              <h2 class="text-base font-bold text-gray-800">
                {{ menu.title }}
              </h2>
              <p class="text-xs text-gray-600 sm:text-sm">
                {{ menu.description }}
              </p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.hover\:scale-102:hover {
  transform: scale(1.02);
}
</style>
