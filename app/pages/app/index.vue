<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

const title = 'Vie Publique Sénégal — App gratuite | Budget, Lois, Journal Officiel';
const description =
  "Téléchargez l'app Vie Publique Sénégal. 10 000+ documents officiels : journal officiel, lois, décrets, budgets, nominations. Gratuit sur Android et iPhone.";
const url = `${siteUrl}/app`;
const image = `${siteUrl}/logos/logo2.webp`;

const APP_STORE_URL = 'https://apps.apple.com/us/app/vie-publique-s%C3%A9n%C3%A9gal/id6757257552';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=sn.viepublique.app';

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: [
    ...keywords,
    'application vie publique sénégal',
    'télécharger vie publique',
    'app civic tech sénégal',
    'documents officiels mobile',
    'journal officiel application',
  ].join(', '),
});

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Application', item: url },
  ],
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: 'Vie Publique Sénégal',
  operatingSystem: 'Android, iOS',
  applicationCategory: 'ReferenceApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'XOF',
  },
  description,
  url,
  image,
  author: {
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
  },
};

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
  ],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(softwareAppSchema) },
  ],
});

const lightScreenshots = [
  {
    src: '/mobile/capture%20iphone%20app%20mobile%20light.png',
    alt: 'Documents officiels du Sénégal',
  },
  {
    src: '/mobile/cpatur%20iphone%20budget%20ligth.png',
    alt: 'Budget et finances publiques',
  },
  {
    src: '/mobile/cpatur%20iphone%20journal%20officiel%20page%20d%C3%A9tail%20document%20ligth.png',
    alt: 'Journal Officiel du Sénégal',
  },
];

const darkScreenshots = [
  {
    src: '/mobile/capture%20iphone%20app%20mobile%20dark.png',
    alt: "Page d'accueil mode sombre",
  },
  {
    src: '/mobile/cpatur%20iphone%20budget%20dark.png',
    alt: 'Budget mode sombre',
  },
  {
    src: '/mobile/cpatur%20iphone%20journal%20officiel%20page%20d%C3%A9tai%20ldocument.png',
    alt: 'Journal Officiel mode sombre',
  },
];
</script>

<template>
  <div class="overflow-hidden">
    <!-- HERO + CTA + PHONES : tout visible avant le scroll -->
    <section class="relative px-4 pb-4 pt-10 text-center sm:pt-16">
      <h1
        class="mx-auto max-w-2xl text-2xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl"
      >
        Trouvez n'importe quel document officiel du Sénégal.<br />
        <span class="font-medium text-[#E2BA13]">En quelques secondes.</span>
      </h1>

      <p class="mx-auto mt-4 max-w-lg text-sm text-gray-500 dark:text-gray-400 sm:text-base">
        Journal officiel, lois, décrets, budgets, nominations — 10 000+ documents accessibles
        gratuitement sur Android et iPhone.
      </p>

      <!-- CTA STORE BUTTONS -->
      <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <a
          :href="PLAY_STORE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="store-btn inline-flex items-center gap-3 rounded-2xl bg-gray-900 px-6 py-3.5 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-[#E2BA13] dark:text-gray-900"
        >
          <svg class="h-8 w-8" viewBox="0 0 24 24">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z" fill="#4285F4"/>
            <path d="M14.499 12.707L16.801 15.009 5.864 21.342 14.499 12.707z" fill="#FBBC04"/>
            <path d="M17.698 11.507L20.532 13.146A1 1 0 0120.532 14.854L17.698 16.493 15.166 13.961 17.698 11.507z" fill="#EA4335"/>
            <path d="M5.864 3.458L16.8 9.79 14.498 12.092 5.864 3.458z" fill="#34A853"/>
          </svg>
          <div class="text-left">
            <div class="text-[10px] uppercase leading-tight opacity-70">Disponible sur</div>
            <div class="text-lg font-semibold leading-tight">Google Play</div>
          </div>
        </a>

        <a
          :href="APP_STORE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="store-btn inline-flex items-center gap-3 rounded-2xl bg-gray-900 px-6 py-3.5 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-[#E2BA13] dark:text-gray-800"
        >
          <svg class="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
            />
          </svg>
          <div class="text-left">
            <div class="text-[10px] uppercase leading-tight opacity-70">Télécharger sur</div>
            <div class="text-lg font-semibold leading-tight">App Store</div>
          </div>
        </a>
      </div>

      <!-- PHONE FAN - Light mode -->
      <div class="phone-showcase mt-12 sm:mt-16">
        <div class="phone-fan">
          <div class="phone phone-left">
            <img
              :src="lightScreenshots[0].src"
              :alt="lightScreenshots[0].alt"
              class="phone-img"
              loading="eager"
            />
          </div>
          <div class="phone phone-center">
            <img
              :src="lightScreenshots[1].src"
              :alt="lightScreenshots[1].alt"
              class="phone-img"
              loading="eager"
            />
          </div>
          <div class="phone phone-right">
            <img
              :src="lightScreenshots[2].src"
              :alt="lightScreenshots[2].alt"
              class="phone-img"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES COMPACTS - une ligne chacun -->
    <section class="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="flex items-start gap-3 rounded-xl p-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/30"
          >
            <UIcon
              name="i-heroicons-document-text"
              class="h-5 w-5 text-sky-600 dark:text-sky-400"
            />
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              10 000+ documents publics
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Journal officiel, lois, décrets, codes juridiques
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3 rounded-xl p-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30"
          >
            <UIcon
              name="i-heroicons-chart-bar"
              class="h-5 w-5 text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              Budgets et tableaux de bord
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Finances publiques avec graphiques clairs
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3 rounded-xl p-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30"
          >
            <UIcon
              name="i-heroicons-building-library"
              class="h-5 w-5 text-amber-600 dark:text-amber-400"
            />
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              Conseils des ministres
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Nominations, décisions, communiqués
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3 rounded-xl p-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30"
          >
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="h-5 w-5 text-violet-600 dark:text-violet-400"
            />
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              Recherche instantanée
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Trouvez n'importe quel document en secondes
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DARK MODE SHOWCASE -->
    <section class="bg-gray-900 px-4 py-10 text-center dark:bg-gray-900 sm:py-14">
      <h2 class="text-lg font-semibold text-white sm:text-xl">Aussi beau de nuit que de jour</h2>
      <p class="mx-auto mt-2 max-w-md text-sm text-gray-400">
        Mode sombre intégré pour une lecture confortable à toute heure.
      </p>

      <div class="phone-showcase mt-10">
        <div class="phone-fan">
          <div class="phone phone-left">
            <img
              :src="darkScreenshots[0].src"
              :alt="darkScreenshots[0].alt"
              class="phone-img"
              loading="lazy"
            />
          </div>
          <div class="phone phone-center">
            <img
              :src="darkScreenshots[1].src"
              :alt="darkScreenshots[1].alt"
              class="phone-img"
              loading="lazy"
            />
          </div>
          <div class="phone phone-right">
            <img
              :src="darkScreenshots[2].src"
              :alt="darkScreenshots[2].alt"
              class="phone-img"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- SOCIAL PROOF -->
    <section class="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div class="rounded-2xl bg-sky-50 p-4 text-center dark:bg-sky-950/30">
          <div class="text-2xl font-bold text-sky-700 dark:text-sky-300 sm:text-3xl">50 000+</div>
          <div class="mt-1 text-xs text-sky-600/70 dark:text-sky-400/70">consultations / mois</div>
        </div>
        <div class="rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
          <div class="text-2xl font-bold text-emerald-700 dark:text-emerald-300 sm:text-3xl">
            10 000+
          </div>
          <div class="mt-1 text-xs text-emerald-600/70 dark:text-emerald-400/70">
            documents accessibles
          </div>
        </div>
        <div class="rounded-2xl bg-amber-50 p-4 text-center dark:bg-amber-950/30">
          <div class="text-2xl font-bold text-amber-700 dark:text-amber-300 sm:text-3xl">100%</div>
          <div class="mt-1 text-xs text-amber-600/70 dark:text-amber-400/70">gratuit, sans pub</div>
        </div>
        <div class="rounded-2xl bg-violet-50 p-4 text-center dark:bg-violet-950/30">
          <div class="text-2xl font-bold text-violet-700 dark:text-violet-300 sm:text-3xl">
            24/7
          </div>
          <div class="mt-1 text-xs text-violet-600/70 dark:text-violet-400/70">
            accessible partout
          </div>
        </div>
      </div>

      <!-- WHO USES IT -->
      <div class="mt-8 text-center">
        <p
          class="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500"
        >
          Utilisé par
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <span
            v-for="user in [
              'Journalistes',
              'Étudiants',
              'Chercheurs',
              'Citoyens',
              'Juristes',
              'Élus locaux',
            ]"
            :key="user"
            class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            {{ user }}
          </span>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="border-t border-gray-100 px-4 py-10 text-center dark:border-gray-800 sm:py-14">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
        Prêt à télécharger ?
      </h2>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Gratuit. Sans publicité. Pour tous les citoyens.
      </p>

      <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <a
          :href="PLAY_STORE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-3 rounded-2xl bg-gray-900 px-6 py-3.5 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-[#E2BA13] dark:text-gray-900"
        >
          <svg class="h-6 w-6" viewBox="0 0 24 24">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z" fill="#4285F4"/>
            <path d="M14.499 12.707L16.801 15.009 5.864 21.342 14.499 12.707z" fill="#FBBC04"/>
            <path d="M17.698 11.507L20.532 13.146A1 1 0 0120.532 14.854L17.698 16.493 15.166 13.961 17.698 11.507z" fill="#EA4335"/>
            <path d="M5.864 3.458L16.8 9.79 14.498 12.092 5.864 3.458z" fill="#34A853"/>
          </svg>
          <span class="text-sm font-semibold sm:text-base">Télécharger sur Google Play</span>
        </a>
        <a
          :href="APP_STORE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-3 rounded-2xl bg-gray-900 px-6 py-3.5 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-[#E2BA13] dark:text-gray-900"
        >
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
            />
          </svg>
          <span class="text-sm font-semibold sm:text-base">Télécharger sur App Store</span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Phone fan showcase - inspired by TrustDm layout */
.phone-showcase {
  perspective: 1200px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.phone-fan {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  position: relative;
  height: 340px;
}

@media (min-width: 640px) {
  .phone-fan {
    height: 440px;
  }
}

.phone {
  position: absolute;
  transition: transform 0.4s ease;
}

.phone-img {
  height: 300px;
  width: auto;
  border-radius: 20px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);
}

@media (min-width: 640px) {
  .phone-img {
    height: 400px;
  }
}

/* Left phone */
.phone-left {
  transform: translateX(-65%) rotate(-8deg);
  z-index: 1;
}

/* Center phone - prominent */
.phone-center {
  transform: translateY(-10px);
  z-index: 3;
}

/* Right phone */
.phone-right {
  transform: translateX(65%) rotate(8deg);
  z-index: 1;
}

/* Hover effects */
.phone-left:hover {
  transform: translateX(-65%) rotate(-4deg) translateY(-8px);
  z-index: 4;
}

.phone-center:hover {
  transform: translateY(-18px) scale(1.02);
}

.phone-right:hover {
  transform: translateX(65%) rotate(4deg) translateY(-8px);
  z-index: 4;
}

/* Dark section phone shadows */
.bg-gray-950 .phone-img {
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}

/* Mobile adjustments */
@media (max-width: 639px) {
  .phone-fan {
    height: 260px;
  }

  .phone-img {
    height: 220px;
    border-radius: 14px;
  }

  .phone-left {
    transform: translateX(-55%) rotate(-6deg);
  }

  .phone-right {
    transform: translateX(55%) rotate(6deg);
  }
}

/* Store button pulse on mobile */
@media (max-width: 639px) {
  .store-btn:first-child {
    animation: subtle-pulse 3s ease-in-out infinite;
  }
}

@keyframes subtle-pulse {
  0%,
  100% {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  }
  50% {
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.25),
      0 0 0 3px rgba(226, 186, 19, 0.2);
  }
}
</style>
