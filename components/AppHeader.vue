<template>
  <NuxtLink :to="`/`">
    <div class="flex flex-row items-center gap-1 px-2.5 py-3">
      <!-- Logo responsive avec largeur de base ajustable -->
      <img
        src="~/assets/logos/vie-publique-logo-2.svg"
        loading="lazy"
        fetchpriority="high"
        alt="Logo Vie-Publique"
        class="h-auto w-56 md:w-40 lg:w-48"
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
