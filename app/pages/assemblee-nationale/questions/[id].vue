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
    class="container mx-auto min-h-screen bg-white py-2 dark:bg-gray-900"
    itemscope
    itemtype="https://schema.org/WebPage"
  >
    <div class="mx-auto max-w-4xl">
      <!-- Bouton retour -->
      <nav
        class="mb-6 flex items-center text-sm text-gray-500 dark:text-gray-400"
        aria-label="Breadcrumb"
      >
        <NuxtLink
          to="/"
          class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          Accueil
        </NuxtLink>
        <span class="mx-2 text-gray-300 dark:text-gray-600">/</span>
        <NuxtLink
          to="/assemblee-nationale"
          class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          Assemblée nationale
        </NuxtLink>
        <span class="mx-2 text-gray-300 dark:text-gray-600">/</span>
        <NuxtLink
          to="/assemblee-nationale/questions"
          class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          Questions écrites
        </NuxtLink>
        <span class="mx-2 text-gray-300 dark:text-gray-600">/</span>
        <span
          class="block max-w-[200px] truncate font-medium text-gray-900 md:max-w-md dark:text-white"
          aria-current="page"
        >
          {{ question?.subject }}
        </span>
      </nav>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      </div>

      <!-- Error state -->
      <UAlert
        v-else-if="error"
        title="Erreur de chargement"
        description="Une erreur est survenue lors du chargement de la question"
        color="red"
        class="dark:text-white"
        icon="i-heroicons-exclamation-triangle"
      />

      <!-- Contenu de la question -->
      <div v-else-if="question" class="space-y-6">
        <!-- Schema.org hidden metadata -->
        <div itemscope itemtype="https://schema.org/Question" itemprop="mainEntity">
          <meta itemprop="url" :content="url" />
          <meta itemprop="dateCreated" :content="formatDateISO(question.question_date)" />
          <meta itemprop="name" :content="question.subject" />

          <!-- En-tête avec info député -->
          <div class="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800 dark:text-gray-100">
            <div itemprop="author" itemscope itemtype="https://schema.org/Person">
              <meta itemprop="name" :content="questionFullName" />
              <meta itemprop="givenName" :content="question.deputy.first_name" />
              <meta itemprop="familyName" :content="question.deputy.last_name" />
              <meta itemprop="jobTitle" content="Député" />
              <meta itemprop="image" :content="getImageUrl(question.deputy.photo)" />

              <div
                itemprop="worksFor"
                itemscope
                itemtype="https://schema.org/GovernmentOrganization"
              >
                <meta itemprop="name" content="Assemblée nationale du Sénégal" />
                <meta itemprop="url" :content="`${siteUrl}/assemblee-nationale`" />
              </div>

              <NuxtLink
                :to="`/assemblee-nationale/deputes/${question.deputy.id}/${$getSlugifyUrlPath(question.deputy.first_name + ' ' + question.deputy.last_name)}`"
                class="block"
                itemprop="url"
              >
                <div class="mb-6 flex items-center gap-4">
                  <img
                    :src="getImageUrl(question.deputy.photo)"
                    :alt="question.deputy.first_name"
                    class="h-20 w-20 rounded-full object-cover"
                    itemprop="image"
                  />
                  <div>
                    <h2 class="text-xl font-bold dark:text-gray-100">
                      <span itemprop="givenName">{{ question.deputy.first_name }}</span>
                      <span itemprop="familyName">{{ question.deputy.last_name }}</span>
                    </h2>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      <time
                        :datetime="formatDateISO(question.question_date)"
                        itemprop="dateCreated"
                      >
                        {{ formatDate(question.question_date) }}
                      </time>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <h1 class="mb-4 text-2xl font-bold dark:text-gray-100" itemprop="name">
              {{ question.subject }}
            </h1>

            <!-- Corps de la question -->
            <div
              class="prose prose-gray max-w-none dark:prose-invert"
              itemprop="text"
              v-html="question.question_text"
            ></div>

            <NuxtLink
              :to="`/assemblee-nationale/deputes/${question.deputy.id}/${$getSlugifyUrlPath(question.deputy.first_name + ' ' + question.deputy.last_name)}`"
              class="block text-blue-600 underline dark:text-blue-300 dark:hover:text-blue-200"
              >Voir son profil</NuxtLink
            >
          </div>

          <!-- About information -->
          <div itemprop="about" itemscope itemtype="https://schema.org/GovernmentOrganization">
            <meta itemprop="name" content="Gouvernement du Sénégal" />
          </div>

          <!-- Part of collection -->
          <div itemprop="isPartOf" itemscope itemtype="https://schema.org/CollectionPage">
            <meta itemprop="name" content="Questions écrites parlementaires" />
            <meta itemprop="url" :content="`${siteUrl}/assemblee-nationale/questions`" />
          </div>
        </div>

        <!-- Pièces jointes -->
        <div
          v-if="question.attachments?.length > 0"
          class="rounded-lg bg-white shadow-sm dark:bg-gray-800 dark:text-gray-100"
        >
          <h3 class="mb-4 text-lg font-bold dark:text-gray-100">Documents joints</h3>
          <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
            <template v-for="attachment in question.attachments" :key="attachment.directus_files_id?.id || attachment.id">
              <div
                v-if="attachment.directus_files_id?.id"
                class="overflow-hidden rounded-lg"
                itemscope
                itemtype="https://schema.org/MediaObject"
              >
                <meta itemprop="contentUrl" :content="getImageUrl(attachment.directus_files_id.id)" />
                <meta itemprop="encodingFormat" :content="attachment.directus_files_id.type" />

                <!-- Image attachments -->
                <img
                  v-if="isImageFile(attachment.directus_files_id.type)"
                  :src="getImageUrl(attachment.directus_files_id.id)"
                  :alt="'Document joint'"
                  class="h-auto w-full rounded border border-gray-200 dark:border-gray-700"
                  itemprop="contentUrl"
                />
                <!-- Non-image attachments -->
                <UButton
                  v-else
                  :href="getImageUrl(attachment.directus_files_id.id)"
                  target="_blank"
                  class="w-full dark:bg-gray-700 dark:text-gray-100"
                >
                  <UIcon name="i-heroicons-document" class="mr-2 h-5 w-5" />
                  Télécharger le document
                </UButton>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Not found state -->
      <div v-else class="py-8 text-center text-gray-500 dark:text-gray-400">
        Question non trouvée
      </div>
    </div>
  </div>
</template>
