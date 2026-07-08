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

const TOP_LEVEL_TYPES = new Set(['presidence', 'primature']);
const hasEntityPage = computed(
  () =>
    institution.value?.has_public_page === true &&
    TOP_LEVEL_TYPES.has(institution.value?.type_code ?? ''),
);

// ── Body éditorial repliable (UX mobile) ───────────────────────────
const bodyExpanded = ref(false);
const isBodyLong = computed(() => (institution.value?.body?.length ?? 0) > 600);

// ── FAQ ─────────────────────────────────────────────────────────────
const faqItems = computed(() =>
  (institution.value?.faq ?? []).filter((f) => f?.question && f?.answer),
);

// ── SEO ────────────────────────────────────────────────────────────
const { siteName, siteUrl, themeColor, keywords } = useSiteMetadata();

const pageTitle = computed(() =>
  institution.value
    ? `${institution.value.name} | Institutions du Sénégal`
    : 'Institution constitutionnelle | République du Sénégal',
);

const pageDescription = computed(() =>
  institution.value?.description
    ? institution.value.description
    : institution.value
      ? `${institution.value.name}, ${institution.value.type_label.toLowerCase()} de la République du Sénégal.`
      : 'Institution constitutionnelle de la République du Sénégal.',
);

const pageUrl = computed(() => `${siteUrl}/etat-senegal/institutions/${slug.value}`);

const toAbsoluteCms = (id: string) => {
  const rel = useCmsImage(id);
  return rel.startsWith('http') ? rel : `${siteUrl}${rel}`;
};

// og:image : couverture paysage d'abord (meilleur rendu social qu'un logo carré).
const ogImage = computed(() => {
  if (institution.value?.cover_image) return toAbsoluteCms(institution.value.cover_image);
  if (institution.value?.logo) return toAbsoluteCms(institution.value.logo);
  return `${siteUrl}/nomination-3.png`;
});

useSeoMeta({
  title: pageTitle,
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
    description: pageDescription.value,
    url: pageUrl.value,
    inLanguage: 'fr-SN',
    areaServed: { '@type': 'Country', name: 'Sénégal' },
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
    ...(institution.value.logo && { logo: toAbsoluteCms(institution.value.logo) }),
    ...(institution.value.cover_image && { image: toAbsoluteCms(institution.value.cover_image) }),
  };
});

const faqSchema = computed(() => {
  if (!faqItems.value.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.value.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [
    { name: 'robots', content: 'index, follow' },
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
  ],
  script: computed(() => {
    const scripts = [];
    if (organizationSchema.value) {
      scripts.push({
        key: 'ld-organization',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(organizationSchema.value),
      });
    }
    if (faqSchema.value) {
      scripts.push({
        key: 'ld-faq',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(faqSchema.value),
      });
    }
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

            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {{ institution.name }}
            </h1>
            <p
              v-if="institution.description"
              class="mx-auto mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-300"
            >
              {{ institution.description }}
            </p>

            <!-- Liens : organisation + budget -->
            <div v-if="hasEntityPage || hasBudget" class="mt-4 flex flex-wrap justify-center gap-2">
              <NuxtLink
                v-if="hasEntityPage"
                :to="`/etat-senegal/${institution.slug}`"
                class="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
              >
                <UIcon name="i-heroicons-building-office-2" class="h-4 w-4" />
                Voir l'organisation
              </NuxtLink>
              <NuxtLink
                v-if="hasBudget"
                :to="`/budget-senegal/${institution.slug}`"
                class="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
              >
                <UIcon name="i-heroicons-banknotes" class="h-4 w-4" />
                Voir le budget
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── Présentation (body éditorial repliable) ─────────────── -->
      <!-- Pas de titre de carte : le body WYSIWYG porte déjà ses propres titres (H2/H3). -->
      <section v-if="institution.body" class="mx-auto mt-6 max-w-4xl px-4">
        <div
          class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
        >
          <div class="px-5 py-4">
            <div class="relative">
              <div
                class="prose-a:text-primary-600 dark:prose-a:text-primary-400 prose prose-sm max-w-none overflow-hidden transition-all prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-li:text-gray-600 prose-img:rounded-xl dark:prose-headings:text-white dark:prose-p:text-gray-300 dark:prose-strong:text-white dark:prose-li:text-gray-300"
                :class="isBodyLong && !bodyExpanded ? 'max-h-64' : ''"
                v-html="institution.body"
              />
              <div
                v-if="isBodyLong && !bodyExpanded"
                class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-gray-800"
              />
            </div>
            <button
              v-if="isBodyLong"
              type="button"
              class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              @click="bodyExpanded = !bodyExpanded"
            >
              {{ bodyExpanded ? 'Réduire' : 'Lire la suite' }}
              <UIcon
                :name="bodyExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="h-4 w-4"
              />
            </button>
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

      <!-- ─── FAQ ─────────────────────────────────────────────────── -->
      <section v-if="faqItems.length" class="mx-auto mt-6 max-w-4xl px-4">
        <div
          class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
        >
          <div class="border-b border-gray-100 px-5 py-3 dark:border-gray-700">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
              Questions fréquentes
            </h2>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <details v-for="(item, i) in faqItems" :key="i" class="group px-5 py-3">
              <summary
                class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-gray-800 dark:text-gray-100"
              >
                {{ item.question }}
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                />
              </summary>
              <p
                class="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300"
              >
                {{ item.answer }}
              </p>
            </details>
          </div>
        </div>
      </section>

      <!-- ─── Vote d'abrogation ──────────────────────────────────── -->
      <section v-if="institution.dissolution_vote_slug" class="mx-auto mt-6 max-w-4xl px-4">
        <div
          class="rounded-xl border border-red-200 bg-red-50/50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20"
        >
          <p class="mb-2 text-xs font-medium text-red-700 dark:text-red-400">
            Cette institution a été supprimée par la loi.
          </p>
          <NuxtLink
            :to="`/assemblee-nationale/votes/${institution.dissolution_vote_slug}`"
            class="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline dark:text-red-500"
          >
            <UIcon name="i-heroicons-document-text" class="h-4 w-4 shrink-0" />
            Voir le vote de la loi d'abrogation
          </NuxtLink>
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
