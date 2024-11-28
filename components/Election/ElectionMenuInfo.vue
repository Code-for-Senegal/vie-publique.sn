<template>
  <div
    class="custom-shadow relative flex items-center justify-center overflow-hidden rounded-lg shadow-lg"
  >
    <!-- Image de fond avec effet sombre -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url('/images/elections/assemble-1.jpg')` }"
    >
      <div class="absolute inset-0 bg-black opacity-60"></div>
    </div>

    <!-- Contenu du bloc -->
    <div class="relative z-10 p-6 px-4 text-center text-white">
      <NuxtLink to="/elections">
        <h2 class="mb-2 text-2xl font-extrabold md:text-3xl">
          Législatives 2024
        </h2>
        <p class="mb-2 text-sm font-medium leading-relaxed md:text-base">
          Informations essentielles pour les élections du 17 Novembre.
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
