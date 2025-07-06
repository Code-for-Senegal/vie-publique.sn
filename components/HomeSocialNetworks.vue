<template>
  <div class="my-8">
    <div class="prose prose-sm sm:prose-sm mx-auto mb-8">
      <h2 class="text-center text-xl text-gray-800 dark:text-white">
        Nos réseaux sociaux
      </h2>
    </div>

    <div class="mx-auto max-w-5xl">
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <!-- LinkedIn Card -->
        <a
          href="https://www.linkedin.com/company/vie-publique-sn"
          target="_blank"
          rel="noopener noreferrer"
          class="group block"
        >
          <div
            class="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:bg-gray-700/80 hover:shadow-md dark:bg-gray-800/80 dark:ring-1 dark:ring-gray-700 dark:backdrop-blur-md"
          >
            <div class="mb-2 rounded-full bg-[#0A66C2]/10 p-3">
              <UIcon
                name="i-simple-icons-linkedin"
                class="h-8 w-8 text-[#0A66C2]"
              />
            </div>
            <h3 class="mb-1 font-medium text-gray-900 dark:text-white">
              LinkedIn
            </h3>
            <p
              class="mb-2 text-sm font-medium text-[#0A66C2] dark:text-[#60a5fa]"
            >
              50K abonnés
            </p>
          </div>
        </a>

        <!-- Facebook Card -->
        <a
          href="https://www.facebook.com/ViePubliqueSenegal"
          target="_blank"
          rel="noopener noreferrer"
          class="group block"
        >
          <div
            class="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:bg-gray-700/80 hover:shadow-md dark:bg-gray-800/80 dark:ring-1 dark:ring-gray-700 dark:backdrop-blur-md"
          >
            <div class="mb-2 rounded-full bg-[#1877F2]/10 p-3">
              <UIcon
                name="i-simple-icons-facebook"
                class="h-8 w-8 text-[#1877F2]"
              />
            </div>
            <h3 class="mb-1 font-medium text-gray-900 dark:text-white">
              Facebook
            </h3>
            <p
              class="mb-2 text-sm font-medium text-[#1877F2] dark:text-[#60a5fa]"
            >
              20K abonnés
            </p>
          </div>
        </a>

        <!-- Instagram Card -->
        <a
          href="https://www.instagram.com/viepubliquesn"
          target="_blank"
          rel="noopener noreferrer"
          class="group block"
        >
          <div
            class="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:bg-gray-700/80 hover:shadow-md dark:bg-gray-800/80 dark:ring-1 dark:ring-gray-700 dark:backdrop-blur-md"
          >
            <div
              class="mb-2 rounded-full bg-gradient-to-br from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10 p-3"
            >
              <div class="relative">
                <UIcon
                  name="i-simple-icons-instagram"
                  class="h-8 w-8 text-[#E4405F]"
                />
              </div>
            </div>
            <h3 class="mb-1 font-medium text-gray-900 dark:text-white">
              Instagram
            </h3>
            <p
              class="mb-2 text-sm font-medium text-[#E4405F] dark:text-pink-400"
            >
              2000 abonnés
            </p>
          </div>
        </a>

        <!-- Twitter/X Card -->
        <a
          href="https://x.com/ViePubliqueSN"
          target="_blank"
          rel="noopener noreferrer"
          class="group block"
        >
          <div
            class="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:bg-gray-700/80 hover:shadow-md dark:bg-gray-800/80 dark:ring-1 dark:ring-gray-700 dark:backdrop-blur-md"
          >
            <div class="mb-2 rounded-full bg-black/10 p-3">
              <UIcon name="i-simple-icons-x" class="h-8 w-8 text-black" />
            </div>
            <h3 class="mb-1 font-medium text-gray-900 dark:text-white">
              Twitter
            </h3>
            <p class="mb-2 text-sm font-medium text-black dark:text-gray-200">
              16K abonnés
            </p>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Les statistiques sont mises à jour manuellement pour le moment
// TODO: Intégrer les API des réseaux sociaux pour des statistiques en temps réel
</script>
