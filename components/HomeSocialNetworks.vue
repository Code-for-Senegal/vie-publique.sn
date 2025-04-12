<template>
  <div class="my-8">
    <div class="prose prose-sm sm:prose mx-auto mb-8">
      <h2 class="text-center text-gray-800">Nos réseaux sociaux</h2>
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
            class="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md"
          >
            <div class="mb-2 rounded-full bg-[#0A66C2]/10 p-3">
              <UIcon
                name="i-simple-icons-linkedin"
                class="h-8 w-8 text-[#0A66C2]"
              />
            </div>
            <h3 class="mb-1 font-medium text-gray-900">LinkedIn</h3>
            <p class="mb-2 text-sm font-medium text-[#0A66C2]">33K abonnés</p>
            <p class="text-xs text-gray-600">Suivez-nous</p>
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
            class="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md"
          >
            <div class="mb-2 rounded-full bg-[#1877F2]/10 p-3">
              <UIcon
                name="i-simple-icons-facebook"
                class="h-8 w-8 text-[#1877F2]"
              />
            </div>
            <h3 class="mb-1 font-medium text-gray-900">Facebook</h3>
            <p class="mb-2 text-sm font-medium text-[#1877F2]">16K abonnés</p>
            <p class="text-xs text-gray-600">Rejoignez-nous</p>
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
            class="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md"
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
            <h3 class="mb-1 font-medium text-gray-900">Instagram</h3>
            <p class="mb-2 text-sm font-medium text-[#E4405F]">500 abonnés</p>
            <p class="text-xs text-gray-600">Découvrez nos stories</p>
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
            class="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md"
          >
            <div class="mb-2 rounded-full bg-black/10 p-3">
              <UIcon name="i-simple-icons-x" class="h-8 w-8 text-black" />
            </div>
            <h3 class="mb-1 font-medium text-gray-900">Twitter</h3>
            <p class="mb-2 text-sm font-medium text-black">14K abonnés</p>
            <p class="text-xs text-gray-600">Suivez nos actualités</p>
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
