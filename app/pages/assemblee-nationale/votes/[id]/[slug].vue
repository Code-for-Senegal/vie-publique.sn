<!-- pages/assemblee-nationale/votes/[id]/[slug].vue -->
<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-4">
      <AppBreadcrumb
        :items="[
          { label: 'Assemblée nationale', to: '/assemblee-nationale' },
          { label: 'Votes', to: '/assemblee-nationale/votes' },
          { label: vote?.name || 'Détail' },
        ]"
      />
    </div>

    <!-- Hero section avec image de fond -->
    <div
      class="relative h-48 bg-gray-900 bg-cover bg-center md:h-56"
      style="background-image: url('/images/menu/assemblee-nationale-1.jpg')"
    >
      <div class="absolute inset-0 bg-black/50" />
      <div class="absolute right-4 top-4">
        <span
          v-if="vote"
          class="rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
        >
          {{ $getAssemblyVoteLabel(vote.type) }}
        </span>
      </div>
    </div>

    <!-- Contenu principal -->
    <main class="container mx-auto px-4">
      <div class="relative -mt-16 space-y-4">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <div class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <USkeleton class="mb-3 h-4 w-32" />
            <USkeleton class="mb-4 h-8 w-full" />
            <USkeleton class="h-6 w-24 rounded-full" />
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="rounded-2xl bg-red-50 p-6 text-center shadow-lg dark:bg-red-900/20"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="mx-auto mb-3 h-10 w-10 text-red-500"
          />
          <h3 class="font-semibold text-red-800 dark:text-red-200">Erreur de chargement</h3>
          <p class="mt-1 text-sm text-red-600 dark:text-red-300">Impossible de charger ce vote</p>
        </div>

        <!-- Content -->
        <template v-else-if="vote">
          <!-- Vote Info Card -->
          <section
            class="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 md:p-6"
          >
            <!-- Header with meta and share button -->
            <div class="mb-2 flex items-start justify-between gap-3">
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Vote du {{ formatDate(vote.date) }}
              </div>
              <SocialShare :title="vote.name" :url="url" />
            </div>

            <!-- Title -->
            <h1 class="mb-4 text-lg font-bold text-gray-900 dark:text-white md:text-2xl">
              {{ vote.name }}
            </h1>

            <!-- Status Badge -->
            <span
              :class="[
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold',
                vote.status === 'adopted'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              ]"
            >
              <UIcon
                :name="
                  vote.status === 'adopted' ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'
                "
                class="h-4 w-4"
              />
              {{ vote.status === 'adopted' ? 'Adopté' : 'Rejeté' }}
            </span>
          </section>

          <!-- Vote Results Bar -->
          <section
            v-if="vote.voters_for !== null"
            class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 md:p-6"
          >
            <h2 class="mb-3 text-sm font-bold text-gray-900 dark:text-white md:text-base">
              Résultats du scrutin
            </h2>

            <!-- Visual Bar -->
            <div class="mb-4 flex overflow-hidden rounded-xl">
              <!-- Pour (Vert) -->
              <div
                class="flex flex-1 flex-col items-center justify-center bg-emerald-500 py-3 text-white"
              >
                <span class="text-xl font-bold md:text-2xl">{{ vote.voters_for ?? '-' }}</span>
                <span class="text-[10px] font-medium uppercase tracking-wider opacity-90"
                  >Pour</span
                >
              </div>
              <!-- Abstention (Jaune avec étoile verte - drapeau Sénégal) -->
              <div
                class="relative flex flex-1 flex-col items-center justify-center bg-amber-400 py-3 text-white"
              >
                <span
                  class="absolute inset-0 flex items-center justify-center text-4xl text-emerald-600/30"
                  >★</span
                >
                <span class="relative text-xl font-bold md:text-2xl">{{
                  vote.voters_abstention ?? '-'
                }}</span>
                <span class="relative text-[10px] font-medium uppercase tracking-wider opacity-90"
                  >Abstention</span
                >
              </div>
              <!-- Contre (Rouge) -->
              <div
                class="flex flex-1 flex-col items-center justify-center bg-red-500 py-3 text-white"
              >
                <span class="text-xl font-bold md:text-2xl">{{ vote.voters_against ?? '-' }}</span>
                <span class="text-[10px] font-medium uppercase tracking-wider opacity-90"
                  >Contre</span
                >
              </div>
            </div>

            <!-- Summary -->
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Les députés ont
              <span
                :class="
                  vote.status === 'adopted'
                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                    : 'font-semibold text-red-600 dark:text-red-400'
                "
              >
                {{ vote.status === 'adopted' ? 'adopté' : 'rejeté' }}
              </span>
              ce texte le {{ formatDate(vote.date) }}.
            </p>
          </section>

          <!-- Documents associés — placés AVANT la description pour rester visibles
               même si la description est longue. Affichage horizontal responsive (≤3). -->
          <section v-if="vote.documents?.length">
            <h2 class="mb-3 text-sm font-bold text-gray-900 dark:text-white md:text-base">
              {{ vote.documents.length > 1 ? 'Documents associés' : 'Document associé' }}
            </h2>
            <!-- Un document par ligne : le titre s'affiche en entier, même sur desktop. -->
            <div class="space-y-3">
              <DocumentsDocumentListItem
                v-for="doc in vote.documents"
                :key="doc.id"
                :document="doc"
              />
            </div>
          </section>

          <!-- Description -->
          <section
            v-if="vote.desc"
            class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 md:p-6"
          >
            <h2 class="mb-3 text-sm font-bold text-gray-900 dark:text-white md:text-base">
              Description
            </h2>
            <div
              class="prose prose-sm prose-gray max-w-none prose-p:text-gray-600 prose-strong:text-gray-900 prose-li:text-gray-600 dark:prose-headings:text-white dark:prose-p:text-gray-300 dark:prose-strong:text-white dark:prose-li:text-gray-300"
              v-html="vote.desc"
            />
          </section>
        </template>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
const { siteName, siteUrl, themeColor } = useSiteMetadata();

const route = useRoute();
const id = computed(() => route.params.id as string);
const { vote, loading, error } = useAssemblyVotes({ id });

// ── Helpers (déclarés avant tout computed/getter SEO — anti-TDZ, cf. CLAUDE.md) ──
const formatDate = (date?: string | null) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateISO = (date?: string | null) => {
  if (!date) return undefined;
  const d = new Date(date);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

// cleanCmsText : strip HTML + décode les entités + NFKC (retire le pseudo-gras
// astral qui casse le JSON-LD → GSC « Truncated Unicode character »).
const { cleanCmsText, truncateText } = useCleanText();

// ── SEO ──────────────────────────────────────────────────────────────
const canonicalSlug = computed(() => vote.value?.slug || (route.params.slug as string) || 'vote');
const url = computed(
  () => `${siteUrl}/assemblee-nationale/votes/${id.value}/${canonicalSlug.value}`,
);

const ogImage = `${siteUrl}/images/menu/assemblee-nationale-1.jpg`;

const pageTitle = computed(() =>
  vote.value?.name ? vote.value.name : "Vote de l'Assemblée nationale du Sénégal",
);

const pageDescription = computed(() => {
  if (!vote.value) return "Détail d'un vote de l'Assemblée nationale du Sénégal.";
  const fromDesc = cleanCmsText(vote.value.desc || vote.value.description);
  if (fromDesc) return truncateText(fromDesc);
  const verdict = vote.value.status === 'adopted' ? 'adopté' : 'rejeté';
  return truncateText(
    `${vote.value.name} : texte ${verdict} par l'Assemblée nationale du Sénégal le ${formatDate(vote.value.date)}.`,
  );
});

const articleSchema = computed(() => {
  if (!vote.value) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: pageTitle.value,
    description: pageDescription.value,
    ...(formatDateISO(vote.value.date) && { datePublished: formatDateISO(vote.value.date) }),
    ...(cleanCmsText(vote.value.desc) && {
      articleBody: truncateText(cleanCmsText(vote.value.desc), 1200),
    }),
    ...(vote.value.documents?.length && {
      citation: vote.value.documents.map((d) => ({
        '@type': 'CreativeWork',
        name: d.title,
        url: `${siteUrl}/documents/${d.id}/${d.slug}`,
      })),
    }),
    inLanguage: 'fr-SN',
    url: url.value,
    image: ogImage,
    author: { '@type': 'Organization', name: siteName, url: siteUrl },
    publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
    isPartOf: {
      '@type': 'CollectionPage',
      name: "Votes de l'Assemblée nationale",
      url: `${siteUrl}/assemblee-nationale/votes`,
    },
  };
});

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogImage,
  ogUrl: url,
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: ogImage,
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'robots', content: 'index, follow' },
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'fr_SN' },
  ],
  script: computed(() =>
    articleSchema.value
      ? [
          {
            key: 'ld-article',
            type: 'application/ld+json',
            innerHTML: JSON.stringify(articleSchema.value),
          },
        ]
      : [],
  ),
});

// Breadcrumb : émis par <AppBreadcrumb> (source unique du fil d'Ariane, §7 CLAUDE.md).
</script>
