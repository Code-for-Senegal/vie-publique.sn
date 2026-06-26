<script setup lang="ts">
import type { MediaType } from "../../../../types/media";
import { typeDisplayMap, typeColorMap, typeIconMap } from "../../../../types/media";

const route = useRoute();
const router = useRouter();
const mediaId = route.params.id as string;

// Utilisation du composable pour récupérer le média
const { media, loading, error } = useMedias({ id: mediaId });

// Utilisation du composable pour les métadonnées
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

// Computed pour les métadonnées dynamiques
const title = computed(() =>
  media.value
    ? `${media.value.name} - ${typeDisplayMap[media.value.type as MediaType]} | Vie-Publique.sn`
    : "Média | Vie-Publique.sn",
);

const description = computed(() => {
  if (!media.value) return "Détails du média sénégalais";
  const typeLabel = typeDisplayMap[media.value.type as MediaType];
  return media.value.description
    ? `${media.value.description.substring(0, 155)}...`
    : `${media.value.name} - ${typeLabel} reconnu au Sénégal par le MCTN.`;
});

const url = computed(() => `${siteUrl}/medias/${route.params.id}/${route.params.slug}`);

const image = computed(() => {
  if (!media.value?.logo) return `${siteUrl}/images/share-media.JPG`;
  return useCmsImage(media.value.logo);
});

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
  keywords: computed(() => [
    ...keywords,
    media.value?.name || "",
    typeDisplayMap[media.value?.type as MediaType] || "",
    "média sénégalais",
    "MCTN Sénégal",
  ].join(", ")),
});

// Schema.org pour le référencement
const organizationSchema = computed(() => {
  if (!media.value) return null;

  const sameAs = [];
  if (media.value.facebook) sameAs.push(media.value.facebook);
  if (media.value.instagram) sameAs.push(media.value.instagram);
  if (media.value.twitter) sameAs.push(media.value.twitter);
  if (media.value.youtube) sameAs.push(media.value.youtube);
  if (media.value.tiktok) sameAs.push(media.value.tiktok);

  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: media.value.name,
    url: media.value.website || url.value,
    logo: image.value,
    image: image.value,
    description: description.value,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    address: {
      "@type": "PostalAddress",
      addressCountry: "SN",
      addressLocality: "Dakar",
    },
    areaServed: {
      "@type": "Country",
      name: "Sénégal",
    },
    parentOrganization: media.value.group?.name
      ? {
          "@type": "Organization",
          name: media.value.group.name,
        }
      : undefined,
  };
});

const breadcrumbSchema = computed(() => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Annuaires",
      item: `${siteUrl}/annuaires`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Médias",
      item: `${siteUrl}/medias`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: media.value?.name || "Média",
      item: url.value,
    },
  ],
}));

// Head Configuration
useHead({
  htmlAttrs: { lang: "fr-SN" },
  link: [{ rel: "canonical", href: url.value }],
  meta: [
    { name: "theme-color", content: themeColor },
    { name: "author", content: siteName },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { name: "robots", content: "index, follow" },
  ],
  script: computed(() => {
    const scripts = [];
    if (organizationSchema.value) {
      scripts.push({
        type: "application/ld+json",
        innerHTML: JSON.stringify(organizationSchema.value),
      });
    }
    scripts.push({
      type: "application/ld+json",
      innerHTML: JSON.stringify(breadcrumbSchema.value),
    });
    return scripts;
  }),
});

// Computed pour les réseaux sociaux
const socialPlatforms = [
  { key: "facebook", icon: "i-simple-icons-facebook", label: "Facebook" },
  { key: "instagram", icon: "i-simple-icons-instagram", label: "Instagram" },
  { key: "twitter", icon: "i-simple-icons-x", label: "X (Twitter)" },
  { key: "tiktok", icon: "i-simple-icons-tiktok", label: "TikTok" },
  { key: "youtube", icon: "i-simple-icons-youtube", label: "YouTube" },
];

const availableSocialLinks = computed(() => {
  if (!media.value) return [];
  return socialPlatforms.filter(
    (platform) => media.value?.[platform.key as keyof typeof media.value],
  );
});

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

// Conserver les query params pour le retour
const backUrl = computed(() => {
  const query = { ...route.query };
  return {
    path: "/medias",
    query,
  };
});
</script>

<template>
  <div class="min-h-screen space-y-4 p-0 pb-16">
    <AppBreadcrumb
:items="[
      { label: 'Médias', to: '/medias' },
      { label: media?.name || 'Média' }
    ]" />

    <!-- Loading state avec skeleton -->
    <UCard v-if="loading" class="custom-shadow">
      <div class="animate-pulse space-y-4">
        <div class="flex items-center gap-4">
          <div class="h-20 w-20 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div class="flex-1 space-y-2">
            <div class="h-6 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div class="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>
        </div>
        <div class="space-y-2">
          <div class="h-4 w-full rounded bg-gray-300 dark:bg-gray-700"></div>
          <div class="h-4 w-full rounded bg-gray-300 dark:bg-gray-700"></div>
          <div class="h-4 w-2/3 rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    </UCard>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Erreur"
      description="Impossible de charger les informations du média"
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Contenu principal -->
    <UCard v-else-if="media" class="custom-shadow">
      <template #header>
        <div class="flex items-center gap-4">
          <UAvatar
            :src="useCmsImage(media.logo)"
            :alt="media.name"
            :text="getInitials(media.name)"
            size="xl"
          />
          <div>
            <h1 class="text-2xl font-bold">{{ media.name }}</h1>
            <UBadge variant="soft" class="mt-2" size="md">
              <UIcon
                :name="typeIconMap[media.type as MediaType]"
                class="mr-1 h-4 w-4"
              />
              {{ typeDisplayMap[media.type as MediaType] }}
            </UBadge>
          </div>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Groupe de presse -->
        <div v-if="media.group?.name" class="border-b pb-4">
          <h2 class="mb-2 text-sm font-medium text-gray-500">Groupe de presse</h2>
          <p class="text-lg font-medium">{{ media.group.name }}</p>
        </div>

        <!-- Description -->
        <div v-if="media.description" class="border-b pb-4">
          <h2 class="mb-2 text-sm font-medium text-gray-500">Description</h2>
          <p class="text-gray-700 dark:text-gray-300">{{ media.description }}</p>
        </div>

        <!-- Site web -->
        <div v-if="media.website" class="border-b pb-4">
          <h2 class="mb-3 text-sm font-medium text-gray-500">Site web</h2>
          <ULink
            :to="media.website"
            class="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            target="_blank"
          >
            <UIcon name="i-heroicons-globe-alt" class="h-5 w-5" />
            <span>{{ media.website }}</span>
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-4 w-4" />
          </ULink>
        </div>

        <!-- Réseaux sociaux -->
        <div v-if="availableSocialLinks.length > 0">
          <h2 class="mb-3 text-sm font-medium text-gray-500">Réseaux sociaux</h2>
          <div class="flex flex-wrap gap-4">
            <ULink
              v-for="platform in availableSocialLinks"
              :key="platform.key"
              :to="media[platform.key as keyof typeof media] as string"
              class="flex items-center gap-2 rounded-lg border border-gray-200 p-3 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600"
              target="_blank"
            >
              <UIcon :name="platform.icon" class="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ platform.label }}
              </span>
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="h-4 w-4 text-gray-400"
              />
            </ULink>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
