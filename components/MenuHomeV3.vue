<script setup lang="ts">
interface NavigationCard {
  title: string;
  description: string;
  icon: string;
  to: string;
}

interface CardConfig {
  color: string;
  bgColor: string;
  iconBg: string;
  borderColor: string;
}

interface CardConfigs {
  [key: string]: CardConfig;
}

defineProps<{
  navigationCards: NavigationCard[];
}>();

// Configuration des couleurs pour chaque carte avec une meilleure cohérence thématique
const cardConfigs: CardConfigs = {
  "Assemblée Nationale": {
    color: "text-blue-700",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
    iconBg: "bg-blue-100",
    borderColor: "border-blue-200",
  },
  "Journal officiel": {
    color: "text-red-700",
    bgColor: "bg-gradient-to-br from-red-50 to-red-100",
    iconBg: "bg-red-100",
    borderColor: "border-red-200",
  },
  "Budget Sénégal": {
    color: "text-emerald-700",
    bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    iconBg: "bg-emerald-100",
    borderColor: "border-emerald-200",
  },
  "Conseil des ministres": {
    color: "text-amber-700",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
    iconBg: "bg-amber-100",
    borderColor: "border-amber-200",
  },
  Annuaire: {
    color: "text-violet-700",
    bgColor: "bg-gradient-to-br from-violet-50 to-violet-100",
    iconBg: "bg-violet-100",
    borderColor: "border-violet-200",
  },
  Documents: {
    color: "text-indigo-700",
    bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    iconBg: "bg-indigo-100",
    borderColor: "border-indigo-200",
  },
} as const;
</script>

<template>
  <div class="my-4">
    <!-- Titre de la section -->
    <div class="prose prose-sm sm:prose mx-auto my-4">
      <h2 class="text-center text-gray-800 dark:text-white">
        Explorez nos données
      </h2>
    </div>

    <!-- Grille des cartes -->
    <div
      class="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
    >
      <NuxtLink
        v-for="card in navigationCards"
        :key="card.title"
        :to="card.to"
        class="group block"
      >
        <div
          class="custom-shadow dark:bg-gray-800 relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border p-3 text-center transition-all duration-300 sm:h-[88px] sm:flex-row sm:items-start sm:gap-4 sm:rounded-2xl sm:p-5 sm:text-left"
          :class="[
            cardConfigs[card.title]?.bgColor || 'bg-white dark:bg-gray-800',
            cardConfigs[card.title]?.borderColor ||
              'border-gray-200 dark:border-gray-700',
            'hover:shadow-current/5 hover:shadow-lg',
          ]"
        >
          <!-- Icône avec fond -->
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12"
            :class="[
              cardConfigs[card.title]?.iconBg || 'bg-gray-100 dark:bg-gray-700',
            ]"
          >
            <UIcon
              :name="card.icon"
              class="h-5 w-5 sm:h-6 sm:w-6"
              :class="[
                cardConfigs[card.title]?.color ||
                  'text-gray-700 dark:text-gray-200',
              ]"
            />
          </div>

          <!-- Contenu -->
          <div class="min-w-0 flex-1">
            <h3
              class="truncate text-sm font-semibold sm:mb-1 sm:text-base"
              :class="[
                cardConfigs[card.title]?.color ||
                  'text-gray-900 dark:text-white',
              ]"
            >
              {{ card.title }}
            </h3>
            <p
              class="line-clamp-1 hidden truncate text-sm text-gray-600 sm:block dark:text-gray-400"
            >
              {{ card.description }}
            </p>
          </div>

          <!-- Indicateur de hover -->
          <div
            class="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 transform transition-transform duration-300 group-hover:scale-x-100"
            :class="[
              cardConfigs[card.title]?.color?.replace('text-', 'bg-') ||
                'bg-gray-700 dark:bg-gray-200',
            ]"
          ></div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
<style scoped></style>