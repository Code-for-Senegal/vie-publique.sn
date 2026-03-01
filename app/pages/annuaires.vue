<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = "Annuaires du Sénégal";
const description = "Accédez aux annuaires du Sénégal: Nominations Gouvernement, Justice, Media, Sites Web publics et plus encore. Informations officielles et contacts.";
const url = `${siteUrl}/annuaires`;

const directorySchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": title,
  "description": description,
  "url": url,
  "isPartOf": {
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
  },
  "about": [
    {
      "@type": "Thing",
      "name": "Annuaires gouvernementaux Sénégal",
    },
    {
      "@type": "Thing",
      "name": "Institutions publiques sénégalaises",
    },
    {
      "@type": "Thing",
      "name": "Médias sénégalais",
    },
  ],
  "mainEntity": {
    "@type": "ItemList",
    "name": "Annuaires du Sénégal",
    "description": "Liste des annuaires officiels du Sénégal",
    "numberOfItems": 6,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Annuaire Gouvernement",
        "description": "Nominations, Ministres, DG",
        "url": `${siteUrl}/nomination-senegal`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Annuaire Sites Web",
        "description": "Annuaire des sites publics",
        "url": `${siteUrl}/annuaire-sites-publics-senegal`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Annuaire Médias",
        "description": "Liste des Médias reconnus",
        "url": `${siteUrl}/medias`,
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Annuaire Députés",
        "description": "Les 165 députés élus",
        "url": `${siteUrl}/assemblee-nationale/deputes`,
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "Aide à la presse",
        "description": "Fond d'aide à la presse",
        "url": `${siteUrl}/medias/aide-presse`,
      },
      {
        "@type": "ListItem",
        "position": 6,
        "name": "Annuaire Justice",
        "description": "Magistrature, acteurs de la justice",
        "url": `${siteUrl}/justice/magistrature`,
      },
    ],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": siteUrl,
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Annuaires",
      "item": url,
    },
  ],
};

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: defaultImage,
  ogUrl: url,
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: defaultImage,
  keywords: [
    ...keywords,
    "annuaire gouvernement Sénégal",
    "nominations officielles",
    "annuaire médias sénégalais",
    "députés assemblée nationale",
    "magistrature Sénégal",
    "sites web publics",
  ].join(", "),
});

useHead({
  htmlAttrs: { lang: "fr-SN" },
  link: [{ rel: "canonical", href: url }],
  meta: [
    { name: "theme-color", content: themeColor },
    { name: "author", content: siteName },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { name: "robots", content: "index, follow" },
    { name: "geo.region", content: "SN" },
    { name: "geo.placename", content: "Dakar" },
    { name: "geo.position", content: "14.7645042;-17.3660286" },
    { name: "ICBM", content: "14.7645042, -17.3660286" },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify(directorySchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(breadcrumbSchema),
    },
  ],
});

const menuCategories = [
  {
    title: "Annuaire Gouvernement",
    description: "Nominations, Ministres, DG...",
    icon: "i-heroicons-user-group",
    to: "/nomination-senegal",
    color: "amber",
  },
  {
    title: "Annuaire Sites Web",
    description: "Annuaire des sites publics",
    icon: "i-heroicons-computer-desktop",
    to: "/annuaire-sites-publics-senegal",
    color: "blue",
  },
  {
    title: "Annuaire Médias",
    description: "Liste des Médias reconnus",
    icon: "i-heroicons-tv",
    to: "/medias",
    color: "red",
  },
  {
    title: "Annuaire Députés",
    description: "les 165 députés élus",
    icon: "i-heroicons-user",
    to: "/assemblee-nationale/deputes",
    color: "green",
  },
  {
    title: "Aide à la presses",
    description: "Fond d'aide à la presse",
    icon: "i-heroicons-radio",
    to: "/medias/aide-presse",
    color: "red",
  },
  {
    title: "Annuaire Justice",
    description: "Magistrature, acteurs de la justice",
    icon: "i-heroicons-scale",
    to: "/justice/magistrature",
    color: "indigo",
  },
];

// Fonction pour obtenir la couleur de fond de l'icône
const getIconBgColor = (color: string, isDark = false) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30",
    green: "bg-emerald-100 dark:bg-emerald-900/30",
    red: "bg-rose-100 dark:bg-rose-900/30",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
  };
  return colorMap[color] || "bg-gray-100 dark:bg-gray-700";
};

// Fonction pour obtenir la couleur de l'icône
const getIconColor = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-emerald-600 dark:text-emerald-400",
    red: "text-rose-600 dark:text-rose-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
    amber: "text-amber-600 dark:text-amber-400",
  };
  return colorMap[color] || "text-gray-600 dark:text-gray-400";
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
    <!-- Breadcrumb -->
    <div class="hidden md:block container mx-auto px-4 pt-4">
      <AppBreadcrumb :items="[{ label: 'Annuaires' }]" />
    </div>

    <!-- Sticky Header mobile -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm md:relative md:border-0 md:bg-transparent md:backdrop-blur-none dark:border-gray-800 dark:bg-gray-900/95">
      <div class="container mx-auto px-4 py-3 md:py-6">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 md:hidden dark:bg-gray-800"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <h1 class="text-lg font-bold text-gray-900 md:text-2xl dark:text-white">
              Annuaires
            </h1>
            <p class="hidden text-sm text-gray-500 md:block dark:text-gray-400">
              Accédez aux différents annuaires du Sénégal
            </p>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-4">
      <!-- Intro mobile -->
      <p class="mb-4 text-sm text-gray-600 md:hidden dark:text-gray-400">
        Nominations, médias, députés et plus encore
      </p>

      <!-- Grid -->
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
        <NuxtLink
          v-for="menu in menuCategories"
          :key="menu.title"
          :to="menu.to"
          class="flex items-center gap-4 rounded-xl bg-white p-4 ring-1 ring-gray-100 transition-all active:scale-[0.98] md:hover:ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 dark:md:hover:ring-gray-600"
        >
          <!-- Icon -->
          <div
            :class="[
              getIconBgColor(menu.color),
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl md:h-14 md:w-14'
            ]"
          >
            <UIcon
              :name="menu.icon"
              :class="[getIconColor(menu.color), 'h-6 w-6 md:h-7 md:w-7']"
            />
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <h2 class="text-sm font-semibold text-gray-900 md:text-base dark:text-white">
              {{ menu.title }}
            </h2>
            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {{ menu.description }}
            </p>
          </div>

          <!-- Arrow -->
          <UIcon
            name="i-heroicons-chevron-right"
            class="h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600"
          />
        </NuxtLink>
      </div>

      <!-- Stats section -->
      <div class="mt-6 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-4 text-white md:p-6">
        <h3 class="mb-3 text-sm font-semibold md:text-base">À propos des annuaires</h3>
        <p class="text-xs leading-relaxed text-white/90 md:text-sm">
          Les annuaires de Vie Publique Sénégal regroupent les informations officielles
          sur les nominations gouvernementales, les représentants élus, les médias reconnus
          et les sites web des institutions publiques.
        </p>
        <div class="mt-4 grid grid-cols-3 gap-2">
          <div class="rounded-lg bg-white/10 p-2 text-center">
            <div class="text-lg font-bold md:text-xl">165</div>
            <div class="text-[10px] text-white/80 md:text-xs">Députés</div>
          </div>
          <div class="rounded-lg bg-white/10 p-2 text-center">
            <div class="text-lg font-bold md:text-xl">30+</div>
            <div class="text-[10px] text-white/80 md:text-xs">Ministères</div>
          </div>
          <div class="rounded-lg bg-white/10 p-2 text-center">
            <div class="text-lg font-bold md:text-xl">100+</div>
            <div class="text-[10px] text-white/80 md:text-xs">Sites web</div>
          </div>
        </div>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>
