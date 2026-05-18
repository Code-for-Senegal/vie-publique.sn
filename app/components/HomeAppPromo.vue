<script setup lang="ts">
const APP_STORE_URL = 'https://apps.apple.com/us/app/vie-publique-s%C3%A9n%C3%A9gal/id6757257552';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=sn.viepublique.app';
</script>

<template>
  <div class="my-8">
    <h2 class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white">
      Disponible sur mobile
    </h2>

    <NuxtLink
      to="/app"
      class="group block overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 transition-shadow hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
    >
      <div class="flex flex-col items-center gap-4 p-4 sm:flex-row sm:justify-center">
        <!-- Screenshot light -->
        <img
          src="/mobile/capture%20iphone%20app%20mobile%20light.png"
          alt="App Vie Publique Sénégal"
          class="hidden h-36 w-auto flex-shrink-0 rounded-lg shadow-md sm:block"
          loading="lazy"
        />

        <!-- QR Code - desktop only -->
        <div class="hidden flex-shrink-0 flex-col items-center gap-1 lg:flex">
          <div class="rounded-lg bg-white p-2 shadow-sm">
            <img
              src="/qr-app.png"
              alt="QR Code - Télécharger l'app"
              class="h-24 w-24"
            />
          </div>
          <p class="text-[10px] text-gray-400 dark:text-gray-500">
            Scannez pour télécharger
          </p>
        </div>

        <!-- Content -->
        <div class="text-center sm:text-left">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            10 000+ documents officiels dans votre poche. Gratuit, sans pub.
          </p>

          <!-- Store buttons -->
          <div class="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <a
              :href="PLAY_STORE_URL"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 dark:bg-[#E2BA13] dark:text-gray-900"
              @click.stop
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z" fill="#4285F4"/>
                <path d="M14.499 12.707L16.801 15.009 5.864 21.342 14.499 12.707z" fill="#FBBC04"/>
                <path d="M17.698 11.507L20.532 13.146A1 1 0 0120.532 14.854L17.698 16.493 15.166 13.961 17.698 11.507z" fill="#EA4335"/>
                <path d="M5.864 3.458L16.8 9.79 14.498 12.092 5.864 3.458z" fill="#34A853"/>
              </svg>
              Télécharger sur Google Play
            </a>
            <a
              :href="APP_STORE_URL"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 dark:bg-[#E2BA13] dark:text-gray-900"
              @click.stop
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                />
              </svg>
              Télécharger sur App Store
            </a>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
