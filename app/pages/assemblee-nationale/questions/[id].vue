<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const route = useRoute();
const config = useRuntimeConfig();

// ✅ Nouvelle architecture : useCmsCollection avec mode détail (id)
// Plus besoin de onMounted ni de fetchById
const { question, loading, error } = useAssemblyQuestions({
  id: computed(() => route.params.id as string),
});

// Helpers de date — déclarés AVANT les computed/schemas qui les utilisent (sinon TDZ :
// @unhead évalue les getters useSeoMeta/useHead à l'hydratation avant l'init → 500).
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateISO = (date: string) => {
  return new Date(date).toISOString();
};

const questionFullName = computed(() => {
  if (!question.value) return '';
  return `${question.value.deputy.first_name} ${question.value.deputy.last_name}`;
});

const title = computed(() => {
  if (!question.value) return 'Chargement...';
  return `${question.value.subject} | Question écrite de ${questionFullName.value}`;
});

const description = computed(() => {
  if (!question.value) return '';
  // Extraire du texte brut du contenu HTML
  const plainText = question.value.question_text?.replace(/<[^>]*>/g, '') || question.value.subject;
  const excerpt = plainText.length > 160 ? plainText.substring(0, 157) + '...' : plainText;
  return `Question écrite posée par ${questionFullName.value} le ${formatDate(question.value.question_date)}. ${excerpt}`;
});

const url = computed(() => {
  if (!route.params.id) return siteUrl;
  return `${siteUrl}/assemblee-nationale/questions/${route.params.id}`;
});

// Pré-extraire siteUrl pour éviter d'appeler useSiteMetadata dans un computed
const cmsImageBase = `${siteUrl}/cms`;

const image = computed(() => {
  if (!question.value) return defaultImage;
  if (!question.value.deputy.photo) return defaultImage;
  // Construction manuelle de l'URL absolue pour éviter l'appel de composable dans computed
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
    text: question.value.question_text?.replace(/<[^>]*>/g, '') || question.value.subject,
    dateCreated: formatDateISO(question.value.question_date),
    url: url.value,
    author: {
      '@type': 'Person',
      name: questionFullName.value,
      givenName: question.value.deputy.first_name,
      familyName: question.value.deputy.last_name,
      jobTitle: 'Député',
      image: question.value.deputy.photo
        ? question.value.deputy.photo.startsWith('http')
          ? question.value.deputy.photo
          : `${cmsImageBase}/${question.value.deputy.photo}`
        : undefined,
      worksFor: {
        '@type': 'GovernmentOrganization',
        name: 'Assemblée nationale du Sénégal',
        url: `${siteUrl}/assemblee-nationale`,
      },
    },
    about: {
      '@type': 'GovernmentOrganization',
      name: 'Gouvernement du Sénégal',
    },
    isPartOf: {
      '@type': 'CollectionPage',
      name: 'Questions écrites parlementaires',
      url: `${siteUrl}/assemblee-nationale/questions`,
    },
    mainEntity: {
      '@type': 'GovernmentOrganization',
      name: 'Assemblée nationale du Sénégal',
    },
  };
});

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Assemblée nationale',
      item: `${siteUrl}/assemblee-nationale`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Questions écrites',
      item: `${siteUrl}/assemblee-nationale/questions`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: question.value?.subject || 'Question',
      item: url.value,
    },
  ],
}));

const webPageSchema = computed(() => {
  if (!question.value) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title.value,
    description: description.value,
    url: url.value,
    image: image.value,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
    },
    about: {
      '@type': 'GovernmentOrganization',
      name: 'Assemblée nationale du Sénégal',
    },
    mainEntity: questionSchema.value,
  };
});

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

// SEO Setup
useSeoMeta({
  title: () => title.value,
  ogTitle: () => title.value,
  description: () => description.value,
  ogDescription: () => description.value,
  ogImage: () => image.value,
  ogUrl: () => url.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  twitterImage: () => image.value,
  keywords: () =>
    [
      ...keywords,
      `${questionFullName.value}`,
      'question écrite',
      'député Sénégal',
      'Assemblée nationale Sénégal',
      'contrôle parlementaire',
      question.value?.subject || '',
    ]
      .filter(Boolean)
      .join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: () => [{ rel: 'canonical', href: url.value }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: () => questionFullName.value },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: siteName },
    {
      property: 'article:published_time',
      content: () => (question.value ? formatDateISO(question.value.question_date) : ''),
    },
    { property: 'article:author', content: () => questionFullName.value },
    { property: 'article:section', content: 'Questions parlementaires' },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
    { name: 'geo.position', content: '14.7645042;-17.3660286' },
    { name: 'ICBM', content: '14.7645042, -17.3660286' },
  ],
  script: () => [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbSchema.value),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(questionSchema.value),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(webPageSchema.value),
    },
  ],
});

// ✅ Plus besoin de onMounted : les données sont chargées automatiquement via SSR
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900"
    itemscope
    itemtype="https://schema.org/WebPage"
  >
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

    <!-- Sticky Header mobile -->
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
            <h1 class="truncate text-sm font-semibold text-gray-900 dark:text-white md:text-lg">
              Question écrite
            </h1>
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
      <article
        v-else-if="question"
        itemscope
        itemtype="https://schema.org/Question"
        itemprop="mainEntity"
      >
        <!-- Schema.org hidden metadata -->
        <div class="hidden">
          <meta itemprop="url" :content="url" />
          <meta itemprop="dateCreated" :content="formatDateISO(question.question_date)" />
          <meta itemprop="name" :content="question.subject" />
          <div itemprop="author" itemscope itemtype="https://schema.org/Person">
            <meta itemprop="name" :content="questionFullName" />
            <meta itemprop="givenName" :content="question.deputy.first_name" />
            <meta itemprop="familyName" :content="question.deputy.last_name" />
            <meta itemprop="jobTitle" content="Député" />
            <meta itemprop="image" :content="getImageUrl(question.deputy.photo)" />
            <div itemprop="worksFor" itemscope itemtype="https://schema.org/GovernmentOrganization">
              <meta itemprop="name" content="Assemblée nationale du Sénégal" />
              <meta itemprop="url" :content="`${siteUrl}/assemblee-nationale`" />
            </div>
          </div>
          <div itemprop="about" itemscope itemtype="https://schema.org/GovernmentOrganization">
            <meta itemprop="name" content="Gouvernement du Sénégal" />
          </div>
          <div itemprop="isPartOf" itemscope itemtype="https://schema.org/CollectionPage">
            <meta itemprop="name" content="Questions écrites parlementaires" />
            <meta itemprop="url" :content="`${siteUrl}/assemblee-nationale/questions`" />
          </div>
        </div>

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
          <h2
            class="mb-4 text-lg font-bold text-gray-900 dark:text-white md:text-xl"
            itemprop="name"
          >
            {{ question.subject }}
          </h2>

          <div
            class="prose prose-sm prose-gray max-w-none prose-p:text-gray-600 prose-strong:text-gray-900 prose-li:text-gray-600 dark:prose-headings:text-white dark:prose-p:text-gray-300 dark:prose-strong:text-white dark:prose-li:text-gray-300"
            itemprop="text"
            v-html="question.question_text"
          ></div>
        </div>

        <!-- Attachments -->
        <div
          v-if="question.attachments && question.attachments.length > 0"
          class="mt-4 rounded-2xl bg-white p-4 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 md:p-6"
        >
          <h3 class="mb-3 text-sm font-bold text-gray-900 dark:text-white md:text-base">
            Documents joints
          </h3>
          <div class="space-y-6">
            <template v-for="attachment in question.attachments" :key="attachment.id">
              <div v-if="attachment.id" itemscope itemtype="https://schema.org/MediaObject">
                <meta itemprop="contentUrl" :content="getFileUrl(attachment)" />
                <meta itemprop="encodingFormat" :content="attachment.type" />

                <!-- Image attachments -->
                <img
                  v-if="isImageFile(attachment.type)"
                  :src="getImageUrl(attachment.id)"
                  alt="Document joint"
                  class="h-auto w-full rounded-xl ring-1 ring-gray-200 dark:ring-gray-700"
                  itemprop="contentUrl"
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
