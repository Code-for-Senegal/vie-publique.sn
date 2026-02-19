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
const getIconBgColor = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100",
    green: "bg-emerald-100",
    red: "bg-rose-100",
    indigo: "bg-indigo-100",
    amber: "bg-amber-100",
  };
  return colorMap[color] || "bg-gray-100";
};

// Fonction pour obtenir la couleur de l'icône
const getIconColor = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-emerald-600",
    red: "text-rose-600",
    indigo: "text-indigo-600",
    amber: "text-amber-600",
  };
  return colorMap[color] || "text-gray-600";
};
</script>

<template>
  <div class="container mx-auto min-h-screen pb-16">
    <AppBreadcrumb
      :items="[
        { label: 'Annuaires' },
      ]"
    />

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center dark:text-white">Annuaires</h1>
    </div>

    <div class="mt-2 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
      <NuxtLink
        v-for="menu in menuCategories"
        :key="menu.title"
        :to="menu.to"
        class="no-underline"
      >
        <UCard
          :ui="{
            base: 'transition-all duration-300 h-full',
            body: {
              base: 'p-0 h-full',
              padding: '',
            },
            ring: '',
            divide: '',
          }"
          class="hover:scale-102 overflow-hidden shadow-md transition-all hover:shadow-xl"
        >
          <div class="flex h-full">
            <!-- Partie gauche avec l'icône sur fond coloré -->
            <div
              :class="[
                getIconBgColor(menu.color),
                'flex items-center justify-center',
                'w-16 py-4 sm:w-20 sm:py-6',
              ]"
            >
              <div class="flex flex-col items-center">
                <UIcon
                  :name="menu.icon"
                  :class="[getIconColor(menu.color), 'h-10 w-10']"
                />
              </div>
            </div>

            <!-- Partie droite avec le texte -->
            <div class="flex flex-1 flex-col justify-center p-4">
              <h2 class="text-base font-bold text-gray-800 dark:text-gray-200">
                {{ menu.title }}
              </h2>
              <p class="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                {{ menu.description }}
              </p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.hover\:scale-102:hover {
  transform: scale(1.02);
}
</style>
