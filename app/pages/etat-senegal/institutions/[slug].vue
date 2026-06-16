<script setup lang="ts">
const {
  institution,
  institutionPending: pending,
  institutionError: error,
} = useEtatOrganisationInstitutions();
const route = useRoute();
const slug = computed(() => route.params.slug as string);

watchEffect(() => {
  if (error.value) {
    throw createError({ statusCode: 404, statusMessage: 'Institution non trouvée' });
  }
});

const SOCIAL_ICONS: Record<string, string> = {
  facebook: 'i-simple-icons-facebook',
  twitter: 'i-simple-icons-twitter',
  x: 'i-simple-icons-x',
  linkedin: 'i-simple-icons-linkedin',
  instagram: 'i-simple-icons-instagram',
  youtube: 'i-simple-icons-youtube',
  tiktok: 'i-simple-icons-tiktok',
  telegram: 'i-simple-icons-telegram',
  whatsapp: 'i-simple-icons-whatsapp',
};
const getSocialIcon = (platform: string) =>
  SOCIAL_ICONS[platform.toLowerCase()] || 'i-heroicons-globe-alt';

const socialEntries = computed(() =>
  institution.value?.reseaux_sociaux ? Object.entries(institution.value.reseaux_sociaux) : [],
);

const hasBudget = computed(
  () => institution.value?.has_public_page && institution.value?.code_institution != null,
);

// ── SEO ────────────────────────────────────────────────────────────
const { siteName, siteUrl, themeColor, keywords } = useSiteMetadata();

// Short title for <title> tag — template adds "| Vie-Publique.sn", so keep base short
const pageTitleShort = computed(() => institution.value?.name || 'Institution constitutionnelle');

// Descriptive title for og:title / social sharing (no template applied)
const pageTitle = computed(() =>
  institution.value
    ? `${institution.value.name} | Institutions du Sénégal`
    : 'Institution constitutionnelle | République du Sénégal',
);

// Truncate description to 155 chars for meta tags
const truncateDesc = (str: string, max = 155) =>
  str.length <= max ? str : str.slice(0, str.lastIndexOf(' ', max)) + '\u2026';

// Full description (used in JSON-LD schema — no char limit)
const pageDescriptionFull = computed(() =>
  institution.value?.description
    ? institution.value.description
    : institution.value
      ? `${institution.value.name}, ${institution.value.type_label.toLowerCase()} de la République du Sénégal.`
      : 'Institution constitutionnelle de la République du Sénégal.',
);

// Truncated description for meta tags
const pageDescription = computed(() => truncateDesc(pageDescriptionFull.value));

const pageUrl = computed(() => `${siteUrl}/etat-senegal/institutions/${slug.value}`);

const ogImage = computed(() =>
  institution.value?.logo
    ? useCmsImageAbsolute(institution.value.logo)
    : `${siteUrl}/nomination-3.png`,
);

useSeoMeta({
  title: pageTitleShort,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogImage,
  ogUrl: pageUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: ogImage,
  keywords: computed(() =>
    [
      ...keywords,
      institution.value?.name || '',
      institution.value?.type_label || '',
      'institutions constitutionnelles Sénégal',
    ].join(', '),
  ),
});

const organizationSchema = computed(() => {
  if (!institution.value) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: institution.value.name,
    description: pageDescriptionFull.value,
    url: pageUrl.value,
    inLanguage: 'fr-SN',
    ...(institution.value.web_site && { sameAs: institution.value.web_site }),
    ...(institution.value.email && { email: institution.value.email }),
    ...(institution.value.phone && { telephone: institution.value.phone }),
    ...(institution.value.adresse && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: institution.value.adresse,
        addressCountry: 'SN',
      },
    }),
    ...(institution.value.logo && { logo: useCmsImageAbsolute(institution.value.logo) }),
  };
});

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'État du Sénégal', item: `${siteUrl}/etat-senegal` },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Institutions constitutionnelles',
      item: `${siteUrl}/etat-senegal/institutions`,
    },
    ...(institution.value
      ? [
          {
            '@type': 'ListItem',
            position: 4,
            name: institution.value.name,
            item: pageUrl.value,
          },
        ]
      : []),
  ],
}));

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [
    { name: 'robots', content: 'index, follow' },
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'fr_SN' },
  ],
  script: computed(() => {
    const scripts = [];
    if (organizationSchema.value) {
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify(organizationSchema.value),
      });
    }
    scripts.push({
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema.value),
    });
    return scripts;
  }),
});
</script>

<template>
  <div class="min-h-screen pb-20">
    <AppBreadcrumb
      :items="[
        { label: 'État du Sénégal', to: '/etat-senegal' },
        { label: 'Institutions constitutionnelles', to: '/etat-senegal/institutions' },
        { label: institution?.name || 'Détail' },
      ]"
      class="px-4"
    />

    <!-- ─── Loading ───────────────────────────────────────────────── -->
    <section v-if="pending" class="flex flex-col items-center gap-3 py-20">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-emerald-500" />
      <p class="text-sm text-gray-500">Chargement de la fiche…</p>
    </section>

    <template v-else-if="institution">
      <!-- ─── Header : avatar circulaire centré ─────────────────── -->
      <section class="mx-auto mt-4 max-w-4xl px-4">
        <div
          class="rounded-2xl border border-gray-200 bg-white px-6 pb-6 pt-8 shadow-sm dark:border-gray-700 dark:bg-gray-800/50 sm:px-8"
        >
          <!-- Avatar centré -->
          <div class="flex flex-col items-center text-center">
            <div
              class="mb-4 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-emerald-100 dark:ring-emerald-900/40"
              :class="
                institution.logo
                  ? 'border border-gray-200 bg-white dark:border-gray-700'
                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
              "
            >
              <CmsImage
                v-if="institution.logo"
                :src="institution.logo"
                :alt="institution.name"
                class="h-full w-full object-contain"
                loading="eager"
              />
              <UIcon v-else name="i-heroicons-building-library" class="h-9 w-9" />
            </div>

            <!-- Badge type -->
            <span
              class="mb-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
            >
              <UIcon name="i-heroicons-building-library" class="h-3.5 w-3.5" />
              {{ institution.type_label }}
            </span>

            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {{ institution.name }}
            </h1>
            <p
              v-if="institution.description"
              class="mx-auto mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-300"
            >
              {{ institution.description }}
            </p>

            <!-- Lien budget -->
            <NuxtLink
              v-if="hasBudget"
              :to="`/budget-senegal/${institution.slug}`"
              class="mt-4 inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
            >
              <UIcon name="i-heroicons-banknotes" class="h-4 w-4" />
              Voir le budget de l'institution
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ─── Fiche de contact ────────────────────────────────────── -->
      <section class="mx-auto mt-6 max-w-4xl px-4">
        <div
          class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
        >
          <div class="border-b border-gray-100 px-5 py-3 dark:border-gray-700">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Coordonnées</h2>
          </div>

          <dl class="divide-y divide-gray-100 dark:divide-gray-700">
            <div v-if="institution.adresse" class="flex items-start gap-4 px-5 py-3.5">
              <dt class="flex w-36 shrink-0 items-center gap-1.5 text-xs text-gray-500">
                <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
                Adresse
              </dt>
              <dd class="text-sm text-gray-800 dark:text-gray-100">{{ institution.adresse }}</dd>
            </div>

            <div v-if="institution.email" class="flex items-start gap-4 px-5 py-3.5">
              <dt class="flex w-36 shrink-0 items-center gap-1.5 text-xs text-gray-500">
                <UIcon name="i-heroicons-envelope" class="h-4 w-4" />
                Email
              </dt>
              <dd>
                <a
                  :href="`mailto:${institution.email}`"
                  class="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  {{ institution.email }}
                </a>
              </dd>
            </div>

            <div v-if="institution.phone" class="flex items-start gap-4 px-5 py-3.5">
              <dt class="flex w-36 shrink-0 items-center gap-1.5 text-xs text-gray-500">
                <UIcon name="i-heroicons-phone" class="h-4 w-4" />
                Téléphone
              </dt>
              <dd>
                <a
                  :href="`tel:${institution.phone}`"
                  class="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  {{ institution.phone }}
                </a>
              </dd>
            </div>

            <div v-if="institution.web_site" class="flex items-start gap-4 px-5 py-3.5">
              <dt class="flex w-36 shrink-0 items-center gap-1.5 text-xs text-gray-500">
                <UIcon name="i-heroicons-globe-alt" class="h-4 w-4" />
                Site web
              </dt>
              <dd>
                <a
                  :href="institution.web_site"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  {{ institution.web_site.replace(/^https?:\/\//, '') }}
                </a>
              </dd>
            </div>

            <!-- Réseaux sociaux : icônes seules sur mobile, icône + label sur sm+ -->
            <div v-if="socialEntries.length > 0" class="flex items-start gap-4 px-5 py-3.5">
              <dt class="flex w-36 shrink-0 items-center gap-1.5 text-xs text-gray-500">
                <UIcon name="i-heroicons-share" class="h-4 w-4" />
                <span class="sm:inline">Réseaux sociaux</span>
              </dt>
              <dd class="flex flex-wrap gap-2">
                <a
                  v-for="[platform, url] in socialEntries"
                  :key="platform"
                  :href="url"
                  :title="platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-blue-400 sm:px-3"
                >
                  <UIcon :name="getSocialIcon(platform)" class="h-4 w-4 shrink-0" />
                  <span class="hidden capitalize sm:inline">{{ platform }}</span>
                </a>
              </dd>
            </div>

            <!-- Aucune info -->
            <div
              v-if="
                !institution.adresse &&
                !institution.email &&
                !institution.phone &&
                !institution.web_site &&
                socialEntries.length === 0
              "
              class="px-5 py-6 text-center text-sm text-gray-400 dark:text-gray-600"
            >
              Aucune coordonnée disponible pour le moment.
            </div>
          </dl>
        </div>
      </section>

      <!-- ─── Retour ─────────────────────────────────────────────── -->
      <section class="mx-auto mt-6 max-w-4xl px-4">
        <NuxtLink
          to="/etat-senegal/institutions"
          class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-700 dark:hover:text-emerald-400"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          Toutes les institutions constitutionnelles
        </NuxtLink>
      </section>
    </template>
  </div>
</template>
