<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const route = useRoute();
const config = useRuntimeConfig();

// ✅ Nouvelle architecture : useCmsCollection avec mode détail (id)
// Plus besoin de onMounted ni de fetchById
const { question, loading, error } = useAssemblyQuestions({
  id: computed(() => route.params.id as string),
});

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
        ? (question.value.deputy.photo.startsWith('http') ? question.value.deputy.photo : `${cmsImageBase}/${question.value.deputy.photo}`)
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

const getImageUrl = (imageId: string) => {
  return useCmsImage(imageId);
};

const isImageFile = (fileType: string) => {
  return fileType.startsWith('image/');
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
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(breadcrumbSchema.value)),
    },
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(questionSchema.value)),
    },
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(webPageSchema.value)),
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
      <AppBreadcrumb :items="[
        { label: 'Assemblée nationale', to: '/assemblee-nationale' },
        { label: 'Questions', to: '/assemblee-nationale/questions' },
        { label: 'Question' }
      ]" />
    </div>

    <!-- Sticky Header mobile -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm md:relative md:border-0 md:bg-transparent md:backdrop-blur-none dark:border-gray-800 dark:bg-gray-900/95">
      <div class="container mx-auto px-4 py-3 md:py-4">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/assemblee-nationale/questions"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 md:hidden dark:bg-gray-800"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <h1 class="truncate text-sm font-semibold text-gray-900 md:text-lg dark:text-white">
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
        <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto mb-3 h-10 w-10 text-red-500" />
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
      <article v-else-if="question" itemscope itemtype="https://schema.org/Question" itemprop="mainEntity">
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
          class="mb-4 flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-100 transition-all active:scale-[0.99] md:p-4 md:hover:ring-amber-200 dark:bg-gray-800 dark:ring-gray-700"
        >
          <img
            :src="getImageUrl(question.deputy.photo)"
            :alt="question.deputy.first_name"
            class="h-12 w-12 rounded-full object-cover md:h-14 md:w-14"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-900 md:text-base dark:text-white">
              {{ question.deputy.first_name }} {{ question.deputy.last_name }}
            </p>
            <p class="text-xs text-amber-600 dark:text-amber-400">Député</p>
          </div>
          <time
            :datetime="formatDateISO(question.question_date)"
            class="text-xs text-gray-400 dark:text-gray-500"
          >
            {{ formatDate(question.question_date) }}
          </time>
        </NuxtLink>

        <!-- Question Content -->
        <div class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 md:p-6 dark:bg-gray-800 dark:ring-gray-700">
          <h2 class="mb-4 text-lg font-bold text-gray-900 md:text-xl dark:text-white" itemprop="name">
            {{ question.subject }}
          </h2>

          <div
            class="prose prose-sm prose-gray max-w-none dark:prose-invert"
            itemprop="text"
            v-html="question.question_text"
          ></div>
        </div>

        <!-- Attachments -->
        <div
          v-if="question.attachments?.length > 0"
          class="mt-4 rounded-2xl bg-white p-4 ring-1 ring-gray-100 md:p-6 dark:bg-gray-800 dark:ring-gray-700"
        >
          <h3 class="mb-3 text-sm font-bold text-gray-900 md:text-base dark:text-white">
            Documents joints
          </h3>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <template v-for="attachment in question.attachments" :key="attachment.directus_files_id?.id || attachment.id">
              <div
                v-if="attachment.directus_files_id?.id"
                class="overflow-hidden rounded-xl"
                itemscope
                itemtype="https://schema.org/MediaObject"
              >
                <meta itemprop="contentUrl" :content="getImageUrl(attachment.directus_files_id.id)" />
                <meta itemprop="encodingFormat" :content="attachment.directus_files_id.type" />

                <!-- Image attachments -->
                <img
                  v-if="isImageFile(attachment.directus_files_id.type)"
                  :src="getImageUrl(attachment.directus_files_id.id)"
                  alt="Document joint"
                  class="h-auto w-full rounded-xl ring-1 ring-gray-200 dark:ring-gray-700"
                  itemprop="contentUrl"
                />
                <!-- Non-image attachments -->
                <a
                  v-else
                  :href="getImageUrl(attachment.directus_files_id.id)"
                  target="_blank"
                  class="flex items-center gap-3 rounded-xl bg-amber-50 p-3 text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
                >
                  <UIcon name="i-heroicons-document-arrow-down" class="h-5 w-5" />
                  <span class="text-sm font-medium">Télécharger le document</span>
                </a>
              </div>
            </template>
          </div>
        </div>

        <!-- Deputy Profile Link -->
        <div class="mt-4">
          <NuxtLink
            :to="`/assemblee-nationale/deputes/${question.deputy.id}/${$getSlugifyUrlPath(question.deputy.first_name + ' ' + question.deputy.last_name)}`"
            class="flex items-center justify-center gap-2 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-700 transition-colors active:bg-amber-100 md:hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
          >
            <UIcon name="i-heroicons-user" class="h-4 w-4" />
            Voir le profil du député
          </NuxtLink>
        </div>
      </article>

      <!-- Not found -->
      <div v-else class="rounded-2xl bg-gray-100 p-8 text-center dark:bg-gray-800">
        <UIcon name="i-heroicons-document-magnifying-glass" class="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <p class="text-gray-500 dark:text-gray-400">Question non trouvée</p>
        <NuxtLink
          to="/assemblee-nationale/questions"
          class="mt-3 inline-block text-sm text-amber-600 underline dark:text-amber-400"
        >
          Retourner aux questions
        </NuxtLink>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>
