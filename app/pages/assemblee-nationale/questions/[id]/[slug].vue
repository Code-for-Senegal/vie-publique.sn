<!-- pages/assemblee-nationale/questions/[id]/[slug].vue -->
<script setup lang="ts">
const { siteName, siteUrl, defaultImage, themeColor } = useSiteMetadata();

const route = useRoute();
const id = computed(() => route.params.id as string);

const { question, loading, error } = useAssemblyQuestions({ id });

// ── Helpers (déclarés avant tout computed/getter SEO — anti-TDZ, cf. CLAUDE.md) ──
const formatDate = (date?: string | null) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateISO = (date?: string | null) => {
  if (!date) return undefined;
  const d = new Date(date);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

const stripHtml = (html?: string | null) =>
  (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (text: string, max = 160) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

const questionFullName = computed(() => {
  if (!question.value?.deputy) return '';
  return `${question.value.deputy.first_name} ${question.value.deputy.last_name}`;
});

// ── SEO ──────────────────────────────────────────────────────────────
const canonicalSlug = computed(
  () => question.value?.slug || (route.params.slug as string) || 'question',
);
const url = computed(
  () => `${siteUrl}/assemblee-nationale/questions/${id.value}/${canonicalSlug.value}`,
);

const title = computed(() =>
  question.value?.subject
    ? question.value.subject
    : "Question écrite à l'Assemblée nationale du Sénégal",
);

const description = computed(() => {
  if (!question.value) return "Question écrite d'un député de l'Assemblée nationale du Sénégal.";
  const excerpt = stripHtml(question.value.question_text) || question.value.subject;
  return truncate(
    `Question écrite posée par ${questionFullName.value} le ${formatDate(question.value.question_date)}. ${excerpt}`,
  );
});

// Pré-extraire siteUrl pour éviter d'appeler useSiteMetadata dans un computed
const cmsImageBase = `${siteUrl}/cms`;

const image = computed(() => {
  if (!question.value?.deputy?.photo) return defaultImage;
  const photo = question.value.deputy.photo;
  if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
  if (photo.startsWith('/')) return `${siteUrl}${photo}`;
  return `${cmsImageBase}/${photo}`;
});

const questionSchema = computed(() => {
  if (!question.value) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Question',
    name: question.value.subject,
    text: stripHtml(question.value.question_text) || question.value.subject,
    ...(formatDateISO(question.value.question_date) && {
      dateCreated: formatDateISO(question.value.question_date),
    }),
    url: url.value,
    inLanguage: 'fr-SN',
    ...(question.value.deputy && {
      author: {
        '@type': 'Person',
        name: questionFullName.value,
        givenName: question.value.deputy.first_name,
        familyName: question.value.deputy.last_name,
        jobTitle: 'Député',
        ...(question.value.deputy.photo && {
          image: question.value.deputy.photo.startsWith('http')
            ? question.value.deputy.photo
            : `${cmsImageBase}/${question.value.deputy.photo}`,
        }),
        worksFor: {
          '@type': 'GovernmentOrganization',
          name: 'Assemblée nationale du Sénégal',
          url: `${siteUrl}/assemblee-nationale`,
        },
      },
    }),
    about: {
      '@type': 'GovernmentOrganization',
      name: 'Gouvernement du Sénégal',
    },
    isPartOf: {
      '@type': 'CollectionPage',
      name: 'Questions écrites parlementaires',
      url: `${siteUrl}/assemblee-nationale/questions`,
    },
  };
});

useSeoMeta({
  title: () => title.value,
  ogTitle: () => title.value,
  description: () => description.value,
  ogDescription: () => description.value,
  ogImage: () => image.value,
  ogUrl: () => url.value,
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  twitterImage: () => image.value,
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: () => [{ rel: 'canonical', href: url.value }],
  meta: [
    { name: 'robots', content: 'index, follow' },
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: () => questionFullName.value || siteName },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'fr_SN' },
    {
      property: 'article:published_time',
      content: () => (question.value && formatDateISO(question.value.question_date)) || '',
    },
    { property: 'article:author', content: () => questionFullName.value },
    { property: 'article:section', content: 'Questions parlementaires' },
  ],
  script: computed(() =>
    questionSchema.value
      ? [
          {
            key: 'ld-question',
            type: 'application/ld+json',
            innerHTML: JSON.stringify(questionSchema.value),
          },
        ]
      : [],
  ),
});

// Breadcrumb : émis par <AppBreadcrumb> (source unique du fil d'Ariane, §7 CLAUDE.md).

// Helper functions
const getImageUrl = (imageId: string) => {
  return useCmsImage(imageId);
};

const isImageFile = (fileType?: string) => {
  return !!fileType && fileType.startsWith('image/');
};

const isPdfFile = (attachment: { type?: string; filename?: string }) => {
  return (
    attachment.type === 'application/pdf' || !!attachment.filename?.toLowerCase().endsWith('.pdf')
  );
};

// URL du fichier (proxy SEO-friendly /docs/<id>/<filename>)
const getFileUrl = (attachment: { id?: string; filename?: string }) => {
  if (!attachment.id) return '';
  return useCmsFile(
    attachment.filename ? `${attachment.id}/${attachment.filename}` : attachment.id,
  );
};

const formatFileSize = (size?: number | string) => {
  if (size == null) return null;
  const bytes = typeof size === 'string' ? parseInt(size, 10) : size;
  if (isNaN(bytes)) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// État de la visionneuse PDF modale
const showPdfViewer = ref(false);
const activePdf = ref<{ src: string; title: string } | null>(null);

const openPdf = (attachment: { id?: string; filename?: string }) => {
  const src = getFileUrl(attachment);
  if (!src) return;
  activePdf.value = { src, title: attachment.filename || 'Document PDF' };
  showPdfViewer.value = true;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-4">
      <AppBreadcrumb
        :items="[
          { label: 'Assemblée nationale', to: '/assemblee-nationale' },
          { label: 'Questions', to: '/assemblee-nationale/questions' },
          { label: 'Question' },
        ]"
      />
    </div>

    <!-- Sticky Header mobile (titre de nav en <p>, le h1 est le sujet de la question) -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95 md:relative md:border-0 md:bg-transparent md:backdrop-blur-none"
    >
      <div class="container mx-auto px-4 py-3 md:py-4">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/assemblee-nationale/questions"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 md:hidden"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-gray-900 dark:text-white md:text-lg">
              Question écrite
            </p>
          </div>
          <SocialShare v-if="question" :title="question.subject" :url="url" />
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-4">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div class="flex items-center gap-3">
          <USkeleton class="h-14 w-14 rounded-full" />
          <div class="space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-24" />
          </div>
        </div>
        <USkeleton class="h-6 w-3/4" />
        <div class="space-y-2">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-2xl bg-red-50 p-6 text-center dark:bg-red-900/20">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="mx-auto mb-3 h-10 w-10 text-red-500"
        />
        <h3 class="font-semibold text-red-800 dark:text-red-200">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-red-600 dark:text-red-300">Une erreur est survenue</p>
        <NuxtLink
          to="/assemblee-nationale/questions"
          class="mt-4 inline-block text-sm text-red-600 underline dark:text-red-400"
        >
          Retourner aux questions
        </NuxtLink>
      </div>

      <!-- Content -->
      <article v-else-if="question">
        <!-- Deputy Card -->
        <NuxtLink
          :to="`/assemblee-nationale/deputes/${question.deputy.id}/${$getSlugifyUrlPath(question.deputy.first_name + ' ' + question.deputy.last_name)}`"
          class="mb-4 flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-100 transition-all active:scale-[0.99] dark:bg-gray-800 dark:ring-gray-700 md:p-4 md:hover:ring-blue-200"
        >
          <img
            :src="getImageUrl(question.deputy.photo)"
            :alt="question.deputy.first_name"
            class="h-12 w-12 rounded-full object-cover md:h-14 md:w-14"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-900 dark:text-white md:text-base">
              {{ question.deputy.first_name }} {{ question.deputy.last_name }}
            </p>
            <p class="text-xs text-blue-800 dark:text-blue-400">Député</p>
          </div>
          <time
            :datetime="formatDateISO(question.question_date)"
            class="text-xs text-gray-400 dark:text-gray-500"
          >
            {{ formatDate(question.question_date) }}
          </time>
        </NuxtLink>

        <!-- Question Content -->
        <div
          class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 md:p-6"
        >
          <h1 class="mb-4 text-lg font-bold text-gray-900 dark:text-white md:text-xl">
            {{ question.subject }}
          </h1>

          <div
            class="prose prose-sm prose-gray max-w-none prose-p:text-gray-600 prose-strong:text-gray-900 prose-li:text-gray-600 dark:prose-headings:text-white dark:prose-p:text-gray-300 dark:prose-strong:text-white dark:prose-li:text-gray-300"
            v-html="question.question_text"
          ></div>
        </div>

        <!-- Attachments -->
        <div
          v-if="question.attachments && question.attachments.length > 0"
          class="mt-4 rounded-2xl bg-white p-4 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 md:p-6"
        >
          <h2 class="mb-3 text-sm font-bold text-gray-900 dark:text-white md:text-base">
            Documents joints
          </h2>
          <div class="space-y-6">
            <template v-for="attachment in question.attachments" :key="attachment.id">
              <div v-if="attachment.id">
                <!-- Image attachments -->
                <img
                  v-if="isImageFile(attachment.type)"
                  :src="getImageUrl(attachment.id)"
                  alt="Document joint"
                  class="h-auto w-full rounded-xl ring-1 ring-gray-200 dark:ring-gray-700"
                />

                <!-- PDF attachments : barre d'actions + viewer inline -->
                <div v-else-if="isPdfFile(attachment)">
                  <!-- Barre d'actions (style page document) -->
                  <div
                    class="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100 dark:bg-gray-700/40 dark:ring-gray-700"
                  >
                    <div
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"
                    >
                      <UIcon name="i-heroicons-document-text" class="h-5 w-5" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {{ attachment.filename || 'Document PDF' }}
                      </p>
                      <p
                        v-if="formatFileSize(attachment.filesize)"
                        class="text-xs text-gray-400 dark:text-gray-500"
                      >
                        PDF · {{ formatFileSize(attachment.filesize) }}
                      </p>
                    </div>
                    <button
                      type="button"
                      class="bg-primary-500 hover:bg-primary-600 flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-white transition-colors active:scale-95"
                      @click="openPdf(attachment)"
                    >
                      <UIcon name="i-heroicons-eye" class="h-3.5 w-3.5" />
                      Lire
                    </button>
                    <button
                      type="button"
                      class="flex h-8 items-center gap-1 rounded-lg bg-[#FFD400] px-2.5 text-xs font-medium text-gray-900 transition-colors hover:bg-yellow-400 active:scale-95"
                      @click="downloadCmsFile(getFileUrl(attachment), attachment.filename)"
                    >
                      <UIcon name="i-heroicons-arrow-down-tray" class="h-3.5 w-3.5" />
                      Télécharger
                    </button>
                    <a
                      :href="getFileUrl(attachment)"
                      target="_blank"
                      class="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-3.5 w-3.5" />
                      Ouvrir
                    </a>
                  </div>

                  <!-- Viewer PDF inline -->
                  <ClientOnly>
                    <PdfViewerInline
                      :src="getFileUrl(attachment)"
                      max-height="700px"
                      @open-fullscreen="openPdf(attachment)"
                    />
                  </ClientOnly>
                </div>

                <!-- Autres fichiers : lien de téléchargement -->
                <a
                  v-else
                  :href="getFileUrl(attachment)"
                  :download="attachment.filename"
                  target="_blank"
                  class="flex items-center gap-3 rounded-xl bg-blue-50 p-3 text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  <UIcon name="i-heroicons-document-arrow-down" class="h-5 w-5" />
                  <span class="truncate text-sm font-medium">
                    {{ attachment.filename || 'Télécharger le document' }}
                  </span>
                </a>
              </div>
            </template>
          </div>
        </div>

        <!-- Deputy Profile Link -->
        <div class="mt-4">
          <NuxtLink
            :to="`/assemblee-nationale/deputes/${question.deputy.id}/${$getSlugifyUrlPath(question.deputy.first_name + ' ' + question.deputy.last_name)}`"
            class="flex items-center justify-center gap-2 rounded-xl bg-blue-50 p-3 text-sm font-medium text-blue-700 transition-colors active:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 md:hover:bg-blue-100"
          >
            <UIcon name="i-heroicons-user" class="h-4 w-4" />
            Voir le profil du député
          </NuxtLink>
        </div>
      </article>

      <!-- Not found -->
      <div v-else class="rounded-2xl bg-gray-100 p-8 text-center dark:bg-gray-800">
        <UIcon
          name="i-heroicons-document-magnifying-glass"
          class="mx-auto mb-3 h-10 w-10 text-gray-400"
        />
        <p class="text-gray-500 dark:text-gray-400">Question non trouvée</p>
        <NuxtLink
          to="/assemblee-nationale/questions"
          class="mt-3 inline-block text-sm text-blue-600 underline dark:text-blue-400"
        >
          Retourner aux questions
        </NuxtLink>
      </div>
    </main>

    <!-- Visionneuse PDF Modal -->
    <ClientOnly>
      <PdfViewerModal
        v-if="showPdfViewer && activePdf"
        :src="activePdf.src"
        :title="activePdf.title"
        @close="showPdfViewer = false"
      />
    </ClientOnly>

    <ScrollToTopButton />
  </div>
</template>
