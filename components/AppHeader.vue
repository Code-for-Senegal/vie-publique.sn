<template>
  <NuxtLink :to="`/`">
    <div class="flex flex-row items-center gap-1 px-2.5 py-0">
      <!-- Logo responsive avec largeur de base ajustable -->
      <!-- <h1 class="text-2xl font-bold text-gray-800">Vie Publique</h1> -->

      <!-- <h1
        class="font-sans text-2xl font-bold uppercase text-gray-800 text-white"
      >
        Vie-Publique.sn
      </h1> -->

      <img
        src="~/assets/logos/vie-publique-logo-4.svg"
        loading="lazy"
        fetchpriority="high"
        alt="Logo Vie-Publique"
        class="h-auto w-40 lg:w-48"
      />
    </div>
  </NuxtLink>
</template>

<style scoped>
.flag-logo {
  height: auto;
  width: 60px;
}
</style>
