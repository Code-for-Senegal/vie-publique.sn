<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata()

const title = 'Travailler avec Vie Publique Sénégal | Partenariat'
const description =
  'Partenariat et collaboration avec Vie-publique.sn. Proposition de partenariat, recrutement, stage et opportunités de contribution à la transparence de l\'information publique au Sénégal.'
const url = `${siteUrl}/a-propos/travailler-avec-nous`
const image = `${siteUrl}/og-image.png`

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
    'partenariat vie publique sénégal',
    'collaboration vie publique',
    'recrutement vie publique',
    'stage sénégal',
    'opportunités civic tech',
    'travailler avec vie publique',
  ].join(', '),
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
      name: 'Travailler avec nous',
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
      children: JSON.stringify(breadcrumbSchema),
    },
  ],
})
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <!-- Breadcrumb -->
    <NuxtLink
      to="/"
      class="mb-4 inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-200"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
      Retour
    </NuxtLink>

    <article class="prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto">
      <h1>Travailler avec Vie-publique.sn</h1>

      <p class="text-sm text-gray-600 dark:text-gray-400">Dernière modification: 01 janvier 2025</p>

      <h3>Partenariats</h3>

      <p>
        Vous souhaitez nous soumettre une proposition de partenariat, vous pouvez contacter le
        responsable des partenariats
      </p>

      <ul>
        <li>
          par courrier électronique :
          <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>
        </li>
        <li>par téléphone : +221 78 436 44 44</li>
      </ul>

      <p>
        Nous sommes ouverts à toutes les formes de collaboration qui peuvent enrichir ce projet et
        servir au mieux les intérêts des citoyens sénégalais
      </p>

      <h3>Recrutement</h3>

      <p>
        Vous recherchez un stage, une formation en apprentissage. Vous souhaitez nous adresser une
        candidature spontanée.
      </p>

      <p>
        Vous trouverez des précisions
        <NuxtLink to="/a-propos/recrutement" class="text-primary hover:underline">ici</NuxtLink>
      </p>

      <UCard class="mt-8 bg-blue-50 dark:bg-blue-900/20">
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-blue-900 dark:text-blue-100">
            <UIcon name="i-heroicons-light-bulb" class="mr-2 h-6 w-6" />
            Pourquoi travailler avec nous ?
          </h4>
          <ul class="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li class="flex items-start gap-2">
              <UIcon name="i-heroicons-check-circle" class="mt-1 h-5 w-5 flex-shrink-0" />
              <span>Impact direct sur la transparence et la démocratie au Sénégal</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-heroicons-check-circle" class="mt-1 h-5 w-5 flex-shrink-0" />
              <span>Projet open source avec une communauté active</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-heroicons-check-circle" class="mt-1 h-5 w-5 flex-shrink-0" />
              <span>Opportunités d'apprentissage et de développement de compétences</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-heroicons-check-circle" class="mt-1 h-5 w-5 flex-shrink-0" />
              <span>Organisation indépendante et citoyenne</span>
            </li>
          </ul>
        </div>
      </UCard>

      <div class="mt-8 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
        <h4 class="mb-4 text-lg font-semibold">Contact</h4>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-envelope" class="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <a
              href="mailto:contact@vie-publique.sn"
              class="text-primary hover:underline"
            >
              contact@vie-publique.sn
            </a>
          </div>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-phone" class="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <a href="tel:+221784364444" class="text-primary hover:underline">+221 78 436 44 44</a>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>
