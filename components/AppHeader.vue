<template>
  <NuxtLink :to="`/`">
    <div class="flex flex-row items-center gap-1 px-2.5 py-3.5">
      <div class="flag-logo px-2.5">
        <img
          src="~/assets/logos/logo.svg"
          loading="lazy"
          fetchpriority="high"
          alt="Logo"
          class="flag-logo"
        />
      </div>
      <div class="text-xs">
        <h2 class="font-bold tracking-wide text-gray-500">Vie-Publique.sn</h2>
        <!-- <p class="text-gray-500">Au cœur du débat public au Sénégal</p> -->
        <p class="text-gray-500">Sénégal transparent</p>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.flag-logo {
  height: auto;
  width: 60px;
}
</style>
