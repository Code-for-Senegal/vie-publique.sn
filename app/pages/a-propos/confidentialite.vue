<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata()

const title = 'Politique de Confidentialité - Vie Publique Sénégal'
const description =
  'Politique de confidentialité du site vie-publique.sn. Protection de vos données personnelles, utilisation de Google Analytics et respect de votre vie privée.'
const url = `${siteUrl}/a-propos/confidentialite`
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
    'politique confidentialité',
    'protection données',
    'vie privée',
    'RGPD',
    'cookies',
    'google analytics',
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
      name: 'Politique de Confidentialité',
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
      innerHTML: JSON.stringify(breadcrumbSchema),
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
      <h1>Politique de Confidentialité</h1>

      <p>Bienvenue sur vie-publique.sn.</p>

      <p>
        Nous respectons votre vie privée et nous engageons à protéger vos informations personnelles.
        Cette politique de confidentialité explique comment nous traitons les informations
        collectées sur ce site.
      </p>

      <h2>Collecte de l'Information</h2>

      <p>
        vie-publique.sn ne collecte aucune donnée personnelle des visiteurs au-delà de celle
        recueillie par les outils standards d'analyse web, notamment Google Analytics.
      </p>

      <h2>Google Analytics</h2>

      <p>
        Nous utilisons Google Analytics pour comprendre comment les visiteurs interagissent avec
        notre site. Cela inclut le suivi des pages visitées, la durée de la visite, les
        interactions avec les pages, et les routes de navigation utilisées sur le site. Google
        Analytics collecte uniquement des données anonymes pour nous aider à améliorer l'expérience
        utilisateur sur notre site.
      </p>

      <p>
        Google Analytics utilise des cookies pour collecter des informations de manière anonyme.
        Les informations générées par les cookies concernant votre utilisation du site web (y
        compris votre adresse IP) seront transmises et stockées par Google sur des serveurs situés
        aux États-Unis.
      </p>

      <p>
        Pour plus d'informations sur les pratiques de confidentialité de Google, vous pouvez
        visiter la page de confidentialité et conditions d'utilisation de Google :
        <a href="https://www.google.com/policies/privacy/" target="_blank"
          >https://www.google.com/policies/privacy/</a
        >.
      </p>

      <h2>Vos Choix</h2>

      <p>
        Vous pouvez choisir de désactiver les cookies en sélectionnant les paramètres appropriés
        sur votre navigateur. Notez cependant que si vous faites cela, il est possible que vous ne
        puissiez pas utiliser toutes les fonctionnalités de ce site.
      </p>

      <h2>Sécurité</h2>

      <p>
        La sécurité de vos informations personnelles est importante pour nous, mais rappelez-vous
        qu'aucune méthode de transmission sur Internet ou méthode de stockage électronique n'est
        sécurisée à 100 %. Bien que nous nous efforcions d'utiliser des moyens commercialement
        acceptables pour protéger vos informations personnelles, nous ne pouvons garantir leur
        sécurité absolue.
      </p>

      <h2>Modifications de Cette Politique de Confidentialité</h2>

      <p>
        Nous pouvons mettre à jour notre Politique de Confidentialité de temps à autre. Nous vous
        notifierons de toute modification en publiant la nouvelle Politique de Confidentialité sur
        cette page. Nous vous conseillons de consulter régulièrement cette page pour vous tenir
        informé de tout changement.
      </p>

      <h2>Contactez-Nous</h2>

      <p>
        Si vous avez des questions sur cette politique de confidentialité, veuillez nous contacter
        via mail sur
        <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>
      </p>

      <UCard class="mt-8 bg-blue-50 dark:bg-blue-900/20">
        <div class="flex items-start gap-4">
          <UIcon name="i-heroicons-shield-check" class="mt-1 h-8 w-8 text-blue-600" />
          <div>
            <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Votre vie privée est importante
            </h3>
            <p class="mt-2 text-sm text-blue-800 dark:text-blue-200">
              Nous nous engageons à protéger vos données et à respecter votre vie privée. Aucune
              donnée personnelle n'est collectée sans votre consentement.
            </p>
          </div>
        </div>
      </UCard>
    </article>
  </div>
</template>
