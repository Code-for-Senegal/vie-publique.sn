<script setup lang="ts">
// Vraies données du budget 2026
</script>

<template>
  <div class="my-4">
    <UCard
      class="border-primary/20 dark:via-primary/10 dark:to-primary/20 custom-shadow overflow-hidden bg-white transition dark:bg-gradient-to-br dark:from-gray-800"
      :ui="{ body: { padding: 'p-2 sm:p-4' } }"
    >
      <!-- Header -->
      <div class="mb-6 flex items-center justify-center">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          Comprendre le Budget 2026
        </h3>
      </div>

      <!-- 2 colonnes : Indicateurs + Texte (sur desktop) / 4 cartes en 2x2 (sur mobile) -->
      <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-[2fr,1fr] md:gap-6">
        <!-- Colonne gauche : 3 cartes sur desktop, 4 cartes en 2x2 sur mobile -->
        <div class="col-span-2 grid grid-cols-2 gap-4 md:col-span-1 md:grid-cols-3">
          <!-- Dépenses -->
          <div
            class="rounded-lg bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 p-4 shadow-md dark:from-orange-900/30 dark:via-orange-800/25 dark:to-orange-900/20"
          >
            <h3 class="mb-1 text-sm font-semibold text-orange-800 dark:text-orange-300">
              Dépenses
            </h3>
            <div class="mb-2 flex flex-wrap items-baseline gap-2">
              <span
                class="text-2xl font-bold tracking-tight text-orange-900 sm:text-3xl dark:text-orange-200"
                >7 434</span
              >
              <UBadge color="orange" variant="solid" size="xs">+13,0%</UBadge>
            </div>
            <div class="text-xs text-orange-700 dark:text-orange-400">Milliards FCFA</div>
          </div>

          <!-- Recettes -->
          <div
            class="rounded-lg bg-gradient-to-br from-emerald-50 via-green-100 to-teal-200 p-4 shadow-md dark:from-emerald-900/30 dark:via-green-800/25 dark:to-teal-900/20"
          >
            <h3 class="mb-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Recettes
            </h3>
            <div class="mb-2 flex flex-wrap items-baseline gap-2">
              <span
                class="text-2xl font-bold tracking-tight text-emerald-900 sm:text-3xl dark:text-emerald-200"
                >6 189</span
              >
              <UBadge color="green" variant="solid" size="xs">+26,7%</UBadge>
            </div>
            <div class="text-xs text-emerald-700 dark:text-emerald-400">Milliards FCFA</div>
          </div>

          <!-- Déficit -->
          <div
            class="rounded-lg bg-gradient-to-br from-red-50 via-rose-100 to-pink-200 p-4 shadow-md dark:from-red-900/30 dark:via-rose-800/25 dark:to-pink-900/20"
          >
            <h3 class="mb-1 text-sm font-semibold text-red-800 dark:text-red-300">Déficit</h3>
            <div class="mb-2 flex flex-wrap items-baseline gap-2">
              <span
                class="text-2xl font-bold tracking-tight text-red-900 sm:text-3xl dark:text-red-200"
                >1 245</span
              >
              <UBadge color="red" variant="solid" size="xs">-26,6%</UBadge>
            </div>
            <div class="text-xs text-red-700 dark:text-red-400">Milliards FCFA</div>
          </div>

          <!-- CTA Card (visible uniquement sur mobile) -->
          <NuxtLink
            to="/budget-senegal/dashboard"
            class="group flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 p-4 shadow-md transition hover:shadow-lg md:hidden dark:from-blue-900/30 dark:via-blue-800/25 dark:to-indigo-900/20"
          >
            <UIcon
              name="i-heroicons-chart-bar-square"
              class="mb-2 h-8 w-8 text-blue-600 transition group-hover:scale-110 dark:text-blue-400"
            />
            <span class="text-center text-xs font-semibold text-blue-800 dark:text-blue-300">
              Tableau de bord complet
            </span>
            <UIcon
              name="i-heroicons-arrow-right"
              class="mt-1 h-4 w-4 text-blue-600 transition group-hover:translate-x-1 dark:text-blue-400"
            />
          </NuxtLink>
        </div>

        <!-- Colonne droite : Texte intro (visible uniquement sur desktop) -->
        <div class="hidden md:block">
          <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            Explorez le budget de l'État avec notre tableau de bord interactif.
            <strong>Consultez les chiffres clés</strong>, comparez les évolutions entre 2024 et
            2026, et découvrez la répartition par ministère et institution.
          </p>
        </div>
      </div>

      <!-- CTA Desktop uniquement -->
      <div class="hidden border-t border-gray-200 pt-4 text-center md:block dark:border-gray-700">
        <NuxtLink
          to="/budget-senegal/dashboard"
          class="inline-flex items-center gap-2 font-semibold text-gray-800 transition-all hover:gap-3 hover:text-blue-800 dark:text-gray-300 dark:hover:text-blue-700"
        >
          <span>Voir le tableau de bord complet</span>
          <UIcon name="i-heroicons-arrow-right" size="xs" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
.custom-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.custom-shadow:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
</style>
