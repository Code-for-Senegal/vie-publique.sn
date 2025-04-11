<template>
  <div
    class="custom-shadow relative flex items-center justify-center overflow-hidden rounded-lg shadow-lg"
  >
    <!-- Badge Nouveau avec animation -->
    <div
      class="absolute right-0 top-0 z-20 -translate-y-2 translate-x-2 rotate-12 animate-pulse"
    >
      <div class="relative">
        <div
          class="absolute -inset-2 animate-ping rounded-full bg-red-500 opacity-20 blur"
        ></div>
        <span
          class="relative inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
        >
          Nouveau
        </span>
      </div>
    </div>

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
          Suivez l'activité parlementaire
        </p>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(12deg);
  }
  50% {
    transform: translateY(-5px) rotate(12deg);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
