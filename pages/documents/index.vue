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
    icon: "i-heroicons-newspaper",
    to: "/documents/journal-officiel",
    color: "blue",
  },
  {
    title: "Rapports Publics",
    description: "Cours des Comptes OFNAC etc",
    icon: "i-heroicons-document-chart-bar",
    to: "/documents/rapports-audit",
    color: "green",
  },
  {
    title: "Documents Budgétaires",
    description: "Lois de finances et annexes",
    icon: "i-heroicons-banknotes",
    to: "/documents/budget",
    color: "amber",
  },
  {
    title: "Documents Stratégie",
    description: "Les stratégies du Sénégal",
    icon: "i-heroicons-presentation-chart-line",
    to: "/documents/strategies",
    color: "red",
  },
  {
    title: "Codes Généraux",
    description: "Constitution, famille, presse...",
    icon: "i-heroicons-scale",
    to: "/documents/codes",
    color: "indigo",
  },
];

// Fonction pour obtenir la couleur de fond de l'icône
const getIconBgColor = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100",
    green: "bg-emerald-100",
    amber: "bg-amber-100",
    red: "bg-rose-100",
    indigo: "bg-indigo-100",
  };
  return colorMap[color] || "bg-gray-100";
};

// Fonction pour obtenir la couleur de l'icône
const getIconColor = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-rose-600",
    indigo: "text-indigo-600",
  };
  return colorMap[color] || "text-gray-600";
};
</script>

<template>
  <div class="container mx-auto">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Documents</h1>
    </div>

    <div class="mt-2 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
      <NuxtLink
        v-for="menu in documentCategories"
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
