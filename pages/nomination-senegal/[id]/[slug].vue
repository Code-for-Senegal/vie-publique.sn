<script setup lang="ts">
import type { GovernmentMember } from '~/types/government-member'

const route = useRoute()
const nominationId = route.params.id as string

// Utilisation du composable pour récupérer la nomination
const { nomination, loading, error } = useNominations({ id: nominationId })

// Utilisation du composable pour les métadonnées
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata()

// Computed pour les métadonnées dynamiques
const title = computed(() =>
  nomination.value
    ? `${nomination.value.name} - ${nomination.value.role} | Vie-Publique.sn`
    : 'Nomination | Vie-Publique.sn',
)

const description = computed(() => {
  if (!nomination.value) return 'Détails de la nomination présidentielle'
  const org = nomination.value.organisation ? ` à ${nomination.value.organisation}` : ''
  return nomination.value.description
    ? `${nomination.value.description.substring(0, 155)}...`
    : `${nomination.value.name} - ${nomination.value.role}${org}. Nomination du président Bassirou Diomaye Faye.`
})

const url = computed(() => `${siteUrl}/nomination-senegal/${route.params.id}/${route.params.slug}`)

const image = computed(() => {
  if (!nomination.value?.photo) return `${siteUrl}/nomination-3.png`
  return useCmsImage(nomination.value.photo)
})

// SEO Meta Tags
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: computed(() =>
    [
      ...keywords,
      nomination.value?.name || '',
      nomination.value?.role || '',
      nomination.value?.organisation || '',
      'nomination Sénégal',
      'Diomaye Faye',
    ].join(', '),
  ),
})

// Schema.org pour le référencement
const personSchema = computed(() => {
  if (!nomination.value) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: nomination.value.name,
    jobTitle: nomination.value.role,
    worksFor: nomination.value.organisation
      ? {
          '@type': 'Organization',
          name: nomination.value.organisation,
        }
      : undefined,
    image: image.value,
    description: description.value,
    url: url.value,
    gender: nomination.value.sexe === 'M' ? 'Male' : 'Female',
    alumniOf: nomination.value.formation
      ? {
          '@type': 'EducationalOrganization',
          name: nomination.value.formation,
        }
      : undefined,
  }
})

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
      name: 'Nominations',
      item: `${siteUrl}/nomination-senegal`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: nomination.value?.name || 'Nomination',
      item: url.value,
    },
  ],
}))

// Head Configuration
useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url.value }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'profile' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
  ],
  script: computed(() => {
    const scripts = []
    if (personSchema.value) {
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify(personSchema.value),
      })
    }
    scripts.push({
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema.value),
    })
    return scripts
  }),
})

// Formatage de la date
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-SN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// Type labels
const typeLabels: Record<string, string> = {
  ministre: 'Ministre',
  dg: 'Directeur Général',
  pca: 'PCA',
  sg: 'Secrétaire Général',
  autre: 'Autre',
}

const getTypeLabel = (type: string | null) => {
  if (!type) return 'Non spécifié'
  return typeLabels[type.toLowerCase()] || type
}

// Conserver les query params pour le retour
const backUrl = computed(() => {
  const query = { ...route.query }
  return {
    path: '/nomination-senegal',
    query,
  }
})
</script>

<template>
  <div class="space-y-4 p-0">
    <!-- Bouton retour -->
    <NuxtLink
      :to="backUrl"
      class="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-200"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
      Retour à la liste
    </NuxtLink>

    <!-- Loading state avec skeleton -->
    <UCard v-if="loading" class="custom-shadow">
      <div class="animate-pulse space-y-6">
        <div class="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div class="h-48 w-48 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 md:h-56 md:w-56"></div>
          <div class="flex-1 space-y-3">
            <div class="h-8 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div class="h-6 w-1/2 rounded bg-gray-200 dark:bg-gray-600"></div>
            <div class="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>
        </div>
        <div class="space-y-4">
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
      description="Impossible de charger les informations de la nomination"
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Contenu principal -->
    <UCard v-else-if="nomination" class="custom-shadow">
      <!-- En-tête avec photo et informations principales -->
      <div class="mb-6 flex flex-col items-center gap-6 md:flex-row md:items-start">
        <img
          v-if="nomination.photo"
          :src="useCmsImage(nomination.photo)"
          :alt="nomination.name"
          class="h-48 w-48 rounded-full object-cover shadow-lg md:h-56 md:w-56"
        />
        <UAvatar v-else :alt="nomination.name" size="3xl" class="h-48 w-48 md:h-56 md:w-56" />
        <div class="flex-1 text-center md:text-left">
          <h1 class="mb-2 text-3xl font-bold">{{ nomination.name }}</h1>
          <p class="mb-3 text-xl text-gray-600 dark:text-gray-400">
            {{ nomination.role }}
          </p>
          <div class="flex flex-wrap justify-center gap-2 md:justify-start">
            <UBadge v-if="nomination.type" variant="soft" size="lg">
              {{ getTypeLabel(nomination.type) }}
            </UBadge>
            <UBadge :color="nomination.sexe === 'M' ? 'blue' : 'pink'" variant="soft" size="lg">
              {{ nomination.sexe === 'Monsieur' ? 'Homme' : 'Femme' }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- Informations détaillées -->
      <div class="space-y-6">
        <!-- Organisation -->
        <div v-if="nomination.organisation" class="border-b pb-4">
          <h2 class="mb-2 text-sm font-medium text-gray-500">Organisation</h2>
          <p class="text-lg font-medium">{{ nomination.organisation }}</p>
        </div>

        <!-- Description -->
        <div v-if="nomination.description" class="border-b pb-4">
          <h2 class="mb-2 text-sm font-medium text-gray-500">Description</h2>
          <p class="text-gray-700 dark:text-gray-300">{{ nomination.description }}</p>
        </div>

        <!-- Dates -->
        <div class="grid gap-4 border-b pb-4 md:grid-cols-2">
          <div>
            <h2 class="mb-2 text-sm font-medium text-gray-500">Date de nomination</h2>
            <p class="text-lg">{{ formatDate(nomination.nominationDate) }}</p>
          </div>
          <div v-if="nomination.endDate">
            <h2 class="mb-2 text-sm font-medium text-gray-500">Date de fin</h2>
            <p class="text-lg">{{ formatDate(nomination.endDate) }}</p>
          </div>
        </div>

        <!-- Formation -->
        <div v-if="nomination.formation" class="border-b pb-4">
          <h2 class="mb-2 text-sm font-medium text-gray-500">Formation</h2>
          <p class="text-gray-700 dark:text-gray-300">{{ nomination.formation }}</p>
        </div>

        <!-- Prédécesseur -->
        <div v-if="nomination.predecessor" class="border-b pb-4">
          <h2 class="mb-2 text-sm font-medium text-gray-500">Prédécesseur</h2>
          <p class="text-lg font-medium">{{ nomination.predecessor }}</p>
        </div>

        <!-- Portrait (si présent) -->
        <div v-if="nomination.portrait">
          <h2 class="mb-2 text-sm font-medium text-gray-500">Portrait</h2>
          <p class="text-gray-700 dark:text-gray-300">{{ nomination.portrait }}</p>
        </div>

        <!-- Évaluation (cachée pour l'instant) -->
        <!-- <div v-if="nomination.rating" class="pb-4">
          <h2 class="mb-2 text-sm font-medium text-gray-500">Évaluation</h2>
          <div class="flex items-center gap-2">
            <div class="flex">
              <UIcon
                v-for="i in 5"
                :key="i"
                name="i-heroicons-star-solid"
                :class="['h-5 w-5', i <= nomination.rating ? 'text-yellow-400' : 'text-gray-300']"
              />
            </div>
            <span class="text-sm text-gray-600">{{ nomination.rating }}/5</span>
          </div>
        </div> -->
      </div>
    </UCard>
  </div>
</template>
