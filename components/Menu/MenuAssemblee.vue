<template>
  <div
    class="custom-shadow relative flex items-center justify-center overflow-hidden rounded-lg shadow-lg"
  >
    <!-- Image de fond avec effet sombre -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{
        backgroundImage: `url('/images/menu/assemblee-nationale-1.jpg')`,
      }"
    >
      <div class="absolute inset-0 bg-black opacity-60"></div>
    </div>

    <!-- Contenu du bloc -->
    <div class="relative z-10 p-6 px-4 text-center text-white">
      <NuxtLink to="/assemblee-nationale">
        <h2 class="text-2xl font-extrabold md:text-3xl">Assemblée nationale</h2>
        <p class="text-sm font-medium leading-relaxed md:text-base">
          Suivi de l'activité parlementaire
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
