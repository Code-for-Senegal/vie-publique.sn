<script setup lang="ts">
import type { GovernmentMember } from '~/types/government-member'

const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata()

const title = 'Gouvernement du Sénégal 2024 | Ministres et Premier Ministre'
const description =
  'Composition actuelle du gouvernement du Sénégal sous la présidence de Bassirou Diomaye Faye. Liste complète des ministres, secrétaires d\'État avec photos et fonctions.'
const url = `${siteUrl}/gouvernement-senegal`
const image = `${siteUrl}/nomination-3.png`

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
  keywords: [
    ...keywords,
    'gouvernement sénégal',
    'ministres sénégal 2024',
    'premier ministre sénégal',
    'Ousmane Sonko',
    'cabinet ministériel sénégal',
    'composition gouvernement sénégal',
    'secrétaires d\'état sénégal',
    'gouvernement Diomaye Faye',
  ].join(', '),
})

// Récupération des données du gouvernement via composable (conforme aux guidelines)
const {
  governmentData,
  primeMinister,
  ministers,
  secretariesOfState,
  stats,
  loading: pending,
  error,
} = useGovernment()

// Schema JSON-LD pour le gouvernement
const governmentSchema = computed(() => {
  if (!governmentData.value) return {}

  const members = [
    primeMinister.value,
    ...ministers.value,
    ...secretariesOfState.value,
  ].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: 'Gouvernement de la République du Sénégal',
    url: url,
    description: description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SN',
      addressLocality: 'Dakar',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sénégal',
    },
    parentOrganization: {
      '@type': 'GovernmentOrganization',
      name: 'République du Sénégal',
    },
    member: members.map((member: GovernmentMember) => ({
      '@type': 'Person',
      name: member.name,
      jobTitle: member.role,
      gender: member.sexe === 'F' ? 'Female' : 'Male',
      image: member.photo ? useCmsImage(member.photo) : undefined,
      worksFor: {
        '@type': 'GovernmentOrganization',
        name: 'Gouvernement du Sénégal',
      },
    })),
  }
})

const breadcrumbSchema = {
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
      name: 'Gouvernement du Sénégal',
      item: url,
    },
  ],
}

// Head Configuration
useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(governmentSchema.value),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema),
    },
  ],
})

// Fonction pour générer l'URL du portrait
const getPortraitUrl = (member: GovernmentMember) => {
  // Utiliser le slug de l'API (généré côté serveur si non fourni par Directus)
  const slug = member.slug || member.id
  return `/personnalites/${member.id}/${slug}?ref=gouvernement`
}

// Fonction pour obtenir les initiales si pas de photo
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

// Fonction pour formater la durée en fonction
const getDuration = (nominationDate: string): string => {
  const start = new Date(nominationDate)
  const now = new Date()
  const months = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))

  if (months < 1) return 'Récemment nommé'
  if (months < 12) return `${months} mois en fonction`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `${years} an${years > 1 ? 's' : ''} en fonction`
  return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois en fonction`
}
</script>

<template>
  <div class="min-h-screen space-y-6 p-0 pb-16">
    <AppBreadcrumb
      :items="[
        { label: 'Gouvernement' },
      ]"
    />

    <!-- Header -->
    <UCard class="custom-shadow">
      <template #header>
        <div class="space-y-4">
          <h1 class="text-2xl font-bold sm:text-3xl">
            Gouvernement du Sénégal
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Composition du gouvernement sous la présidence de Bassirou Diomaye Faye
          </p>

          <!-- Statistiques -->
          <div v-if="stats" class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ stats.total }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Membres</p>
            </div>
            <div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ stats.ministers }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Ministres</p>
            </div>
            <div class="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {{ stats.women }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Femmes</p>
            </div>
            <div class="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
              <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {{ Math.round((stats.women / stats.total) * 100) }}%
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Parité</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="pending" class="space-y-6">
        <div v-for="i in 3" :key="i" class="animate-pulse space-y-4">
          <div class="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="j in 3" :key="j" class="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <UAlert
        v-else-if="error"
        title="Erreur"
        description="Impossible de charger le gouvernement"
        color="red"
        icon="i-heroicons-exclamation-triangle"
      />

      <!-- Contenu -->
      <div v-else-if="governmentData" class="space-y-8">
        <!-- Premier Ministre -->
        <div v-if="primeMinister" class="space-y-4">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <UIcon name="i-heroicons-star" class="h-6 w-6 text-yellow-500" />
            Premier Ministre
          </h2>

          <NuxtLink
            :to="getPortraitUrl(primeMinister)"
            class="block transition hover:scale-[1.02]"
          >
            <UCard class="border-l-4 border-yellow-500">
              <div class="flex items-center gap-4">
                <UAvatar
                  :src="useCmsImage(primeMinister.photo)"
                  :alt="primeMinister.name"
                  :text="getInitials(primeMinister.name)"
                  size="xl"
                  class="flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold">
                    {{ primeMinister.name }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ primeMinister.role }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ getDuration(primeMinister.nominationDate) }}
                  </p>
                </div>
                <UIcon name="i-heroicons-arrow-right" class="h-5 w-5 text-gray-400" />
              </div>
            </UCard>
          </NuxtLink>
        </div>

        <!-- Ministres -->
        <div v-if="ministers.length > 0" class="space-y-4">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <UIcon name="i-heroicons-user-group" class="h-6 w-6 text-blue-500" />
            Ministres ({{ ministers.length }})
          </h2>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NuxtLink
              v-for="minister in ministers"
              :key="minister.id"
              :to="getPortraitUrl(minister)"
              class="block transition hover:scale-[1.02]"
            >
              <UCard class="h-full hover:shadow-lg">
                <div class="flex flex-col items-center space-y-3 text-center">
                  <UAvatar
                    :src="useCmsImage(minister.photo)"
                    :alt="minister.name"
                    :text="getInitials(minister.name)"
                    size="lg"
                  />
                  <div class="min-w-0 w-full">
                    <h3 class="font-bold text-sm line-clamp-2">
                      {{ minister.name }}
                    </h3>
                    <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {{ minister.role }}
                    </p>
                    <UBadge
                      v-if="minister.sexe === 'F'"
                      color="purple"
                      variant="soft"
                      size="xs"
                      class="mt-2"
                    >
                      Femme
                    </UBadge>
                  </div>
                </div>
              </UCard>
            </NuxtLink>
          </div>
        </div>

        <!-- Secrétaires d'État -->
        <div v-if="secretariesOfState.length > 0" class="space-y-4">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <UIcon name="i-heroicons-user" class="h-6 w-6 text-green-500" />
            Secrétaires d'État ({{ secretariesOfState.length }})
          </h2>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NuxtLink
              v-for="secretary in secretariesOfState"
              :key="secretary.id"
              :to="getPortraitUrl(secretary)"
              class="block transition hover:scale-[1.02]"
            >
              <UCard class="h-full hover:shadow-md">
                <div class="flex flex-col items-center space-y-2 text-center">
                  <UAvatar
                    :src="useCmsImage(secretary.photo)"
                    :alt="secretary.name"
                    :text="getInitials(secretary.name)"
                    size="md"
                  />
                  <div class="min-w-0 w-full">
                    <h3 class="font-semibold text-xs line-clamp-2">
                      {{ secretary.name }}
                    </h3>
                    <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {{ secretary.role }}
                    </p>
                  </div>
                </div>
              </UCard>
            </NuxtLink>
          </div>
        </div>

        <!-- Lien vers toutes les nominations -->
        <div class="border-t pt-6">
          <NuxtLink
            to="/nomination-senegal"
            class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            <UIcon name="i-heroicons-arrow-right" class="h-5 w-5" />
            Voir toutes les nominations présidentielles
          </NuxtLink>
        </div>
      </div>
    </UCard>

    <!-- Note de mise à jour -->
    <div class="text-center text-sm text-gray-500">
      <p>
        Dernière mise à jour : {{ governmentData?.lastUpdate || 'N/A' }}
      </p>
      <p class="mt-1">
        Source : Décrets présidentiels de la République du Sénégal
      </p>
    </div>
  </div>
</template>

<style scoped>
.custom-shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>
