<template>
  <div
    class="custom-shadow mt-4 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 shadow-xl"
  >
    <h3 class="mb-6 text-center text-xl font-bold text-yellow-400">
      Chiffres Clés de l'Élection
    </h3>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      <!-- Inscrits -->
      <div
        class="group rounded-lg bg-emerald-800/30 p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-users"
            class="h-5 w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-sm text-emerald-100">Inscrits</p>
        </div>
        <p class="mt-1 text-lg font-bold text-white">
          {{ new Intl.NumberFormat("fr-FR").format(7371891) }}
        </p>
      </div>

      <!-- Votants -->
      <div
        class="group rounded-lg bg-emerald-800/30 p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-hand-raised"
            class="h-5 w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-sm text-emerald-100">Votants</p>
        </div>
        <p class="mt-1 text-lg font-bold text-white">
          {{ new Intl.NumberFormat("fr-FR").format(3650120) }}
        </p>
      </div>

      <!-- Bulletins nuls -->
      <div
        class="group rounded-lg bg-emerald-800/30 p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-x-circle"
            class="h-5 w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-sm text-emerald-100">Nuls</p>
        </div>
        <p class="mt-1 text-lg font-bold text-white">
          {{ new Intl.NumberFormat("fr-FR").format(26487) }}
        </p>
      </div>

      <!-- Suffrages Valables -->
      <div
        class="group rounded-lg bg-emerald-800/30 p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-check-circle"
            class="h-5 w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-sm text-emerald-100">Suffrages</p>
        </div>
        <p class="mt-1 text-lg font-bold text-white">
          {{ new Intl.NumberFormat("fr-FR").format(3623633) }}
        </p>
      </div>

      <!-- Quotient National -->
      <div
        class="group rounded-lg bg-emerald-800/30 p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-calculator"
            class="h-5 w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-sm text-emerald-100">Quotient</p>
        </div>
        <p class="mt-1 text-lg font-bold text-white">
          {{ new Intl.NumberFormat("fr-FR").format(68370) }}
        </p>
      </div>

      <!-- Participation -->
      <div
        class="group rounded-lg bg-emerald-800/30 p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-chart-bar"
            class="h-5 w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-sm text-emerald-100">Participation</p>
        </div>
        <p class="mt-1 text-lg font-bold text-white">49,51 %</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Si vous voulez rendre les chiffres dynamiques, vous pouvez les passer en props
// const props = defineProps<{
//   stats: {
//     inscrits: number;
//     votants: number;
//     bulletinsNuls: number;
//     suffragesValables: number;
//     quotientNational: number;
//     participation: number;
//   }
// }>();
</script>
