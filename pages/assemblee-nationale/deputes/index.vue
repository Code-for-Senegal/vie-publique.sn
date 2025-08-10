<template>
  <div>
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour à la liste"
      color="gray"
      @click="handleReturn()"
    />

    <div class="">
      <div class="container">
        <div class="prose prose-sm sm:prose my-2">
          <h1 class="">Annuaire des députés</h1>
        </div>
      </div>
    </div>

    <div class="flex flex-col">
      <p class="text-sm text-gray-600">Les 165 députés de la 15e législature</p>
    </div>

    <ElectionResultDeputiesGrid2
      :deputies="deputies"
      :loading="loading"
      :error="error"
    />
  </div>
</template>

<script setup>
import { useDeputev2 } from "@/composables/parliament/useDeputev2";

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = "Députés de l'Assemblée Nationale du Sénégal | 15e législature";
const description = "Retrouvez tous les 165 députés en activité de l'Assemblée nationale du Sénégal. Liste complète de la 15e législature avec résultats de vote et analyses.";
const url = `${siteUrl}/assemblee-nationale/deputes`;
const image = `${siteUrl}/images/vpsn-share-elections.png`;

const deputiesSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": title,
  "description": description,
  "url": url,
  "image": image,
  "isPartOf": {
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
  },
  "about": [
    {
      "@type": "GovernmentOrganization",
      "name": "Assemblée nationale du Sénégal",
      "description": "Parlement du Sénégal",
    },
    {
      "@type": "Thing",
      "name": "15e législature du Sénégal",
    },
  ],
  "mainEntity": {
    "@type": "ItemList",
    "name": "Députés de la 15e législature",
    "description": "Liste des 165 députés élus de l'Assemblée nationale du Sénégal",
    "numberOfItems": 165,
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
      "name": "Assemblée nationale",
      "item": `${siteUrl}/assemblee-nationale`,
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Députés",
      "item": url,
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LegislativeBuilding",
  "name": "Assemblée nationale du Sénégal",
  "url": `${siteUrl}/assemblee-nationale`,
  "description": "Parlement unicaméral de la République du Sénégal",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avenue Léopold Sédar Senghor",
    "addressLocality": "Dakar",
    "addressCountry": "SN",
  },
  "governmentType": "Legislature",
  "numberOfMembers": 165,
  "politicalSystem": "Démocratie parlementaire",
  "foundingDate": "1960",
  "legislativeTerm": "15e législature",
};

const governmentSchema = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  "name": "Assemblée nationale du Sénégal",
  "url": url,
  "description": "Institution législative de la République du Sénégal composée de 165 députés",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "SN",
    "addressLocality": "Dakar",
  },
  "areaServed": {
    "@type": "Country",
    "name": "Sénégal",
  },
  "parentOrganization": {
    "@type": "GovernmentOrganization",
    "name": "République du Sénégal",
  },
};

// SEO Meta Tags
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: [
    ...keywords,
    "députés Sénégal",
    "Assemblée nationale Sénégal",
    "15e législature",
    "parlement sénégalais",
    "élus nationaux Sénégal",
    "représentants peuple sénégalais",
    "parlementaires Sénégal",
    "législateurs Sénégal",
  ].join(", "),
});

// Head Configuration
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
      children: JSON.stringify(deputiesSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(breadcrumbSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(organizationSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(governmentSchema),
    },
  ],
});

const router = useRouter();

const { deputies, loading, error, fetchElectedDeputies } = useDeputev2();

onMounted(async () => {
  await fetchElectedDeputies();
});

// Liste des routes valides pour le retour
const validReturnPaths = [
  "/assemblee-nationale/deputes",
  "/assemblee-nationale/commissions",
  "/assemblee-nationale/bureau",
  "/assemblee-nationale/groupes",
];

// Gestion du retour
const handleReturn = () => {
  // Vérifie si on a un referer dans l'historique de navigation
  const previousRoute = router.options.history.state.back;

  // Si on a un referer et qu'il fait partie des routes valides
  if (
    previousRoute &&
    validReturnPaths.some((path) => previousRoute.startsWith(path))
  ) {
    router.back();
  } else {
    // Sinon, redirection vers la liste des députés par défaut
    router.push("/assemblee-nationale");
  }
};
</script>