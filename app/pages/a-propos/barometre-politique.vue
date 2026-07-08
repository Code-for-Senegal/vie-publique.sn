<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata()

const title = 'Baromètre Politique - Suivi des Engagements du Président Diomaye'
const description =
  'Outil de suivi citoyen et vérificateur des promesses électorales et engagements du président Bassirou Diomaye Faye et du premier ministre Ousmane Sonko durant leurs mandats au Sénégal.'
const url = `${siteUrl}/a-propos/barometre-politique`
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
    'baromètre politique sénégal',
    'promesses électorales',
    'suivi engagements diomaye',
    'ousmane sonko',
    'projet présidentiel',
    'suivi citoyen',
    'accountability',
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
      name: 'Baromètre Politique',
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
    { name: 'robots', content: 'noindex, nofollow' },
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
  <div class="container mx-auto min-h-screen max-w-4xl px-4 py-8 pb-16">
    <AppBreadcrumb
      :items="[
        { label: 'À propos', to: '/a-propos/qui-sommes-nous' },
        { label: 'Baromètre politique' },
      ]"
    />

    <article class="prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto">
      <h1>À propos du Baromètre politique</h1>

      <h3>Késako ?</h3>

      <p>
        Le baromètre politique est de outil de suivi citoyen, un vérificateur des promesses
        électorales et engagements du président Diomaye Faye et du premier ministre Ousmane Sonko
        durant leurs mandats.
      </p>

      <h3>Objectif</h3>

      <p>
        L'objectif est, du point de vue citoyen, de faire le suivi des différents projets
        prioritaire de l'état et leurs avancements avec des indicateurs simple.
      </p>

      <p>
        Le but est de mesurer l'adéquation entre les promesses de campage fait dans le programme
        (le PROJET) avec les politiques gouvernementales et les actions réelles qui sont menées par
        le gouvernement du Sénégal.
      </p>

      <h3>Approche</h3>

      <ul>
        <li>crowdsourcing, production participative</li>
        <li>Evaluation indépendante, neutre, sourcée, référencée</li>
      </ul>

      <h3>Étapes</h3>

      <ol>
        <li>
          <strong>Collecte des Documents de Références</strong> (documents institutionnels +
          Programme Présidentiel)
        </li>
        <li><strong>Identifier les promesses électorales</strong></li>
        <li><strong>Classer par thématique/Secteur</strong></li>
        <li>
          <strong>Suivre leur réalisation</strong> à travers les communications officielles
          <ul>
            <li>
              Suivi des Communications : Créez un système de suivi où chaque promesse peut être
              associée à des actions ou des réalisations rapportées dans les documents
              institutionnels.
            </li>
          </ul>
        </li>
        <li><strong>Mettre à jour les statuts</strong></li>
      </ol>

      <h3>Sources</h3>

      <ul>
        <li>le programme et livre programme</li>
        <li>discours d'investiture du 2 Avril</li>
        <li>discours message à la nation du 3 avril 2024</li>
        <li>Face à la Presse du 13 Juillet 2024</li>
        <li>communiqué conseil des ministres</li>
        <li>Autre communiqués de la présidence, de la primature et des ministères</li>
        <li>le discours de politique générale du Premier ministre</li>
      </ul>

      <h3>Structure d'une promesse électorale</h3>

      <ul>
        <li>Le secteur (économie, éducation, santé, numérique, défense etc.)</li>
        <li>La promesse</li>
        <li>L'objectif</li>
        <li>Les délais annoncés</li>
        <li>La source (programme, DPG, discours, communiqués, conseil des ministres etc.)</li>
        <li>Les actions réalisés</li>
      </ul>

      <h3>Les secteurs / Thématiques</h3>

      <ul>
        <li>Gouvernance et Réformes Institutionnelles</li>
        <li>Économie</li>
        <li>Éducation et Formation</li>
        <li>Santé</li>
        <li>Défense et Sécurité</li>
        <li>Protection Sociale et Inclusion</li>
        <li>Infrastructure et Transport</li>
        <li>Agriculture et Sécurité Alimentaire</li>
        <li>Énergie et Environnement</li>
        <li>Culture et Tourisme</li>
        <li>Jeunesse et Sport</li>
        <li>Diplomatie et Affaires Étrangères</li>
        <li>Technologie et Innovation</li>
        <li>Justice et Droits Humains</li>
      </ul>

      <UCard class="mt-8 bg-amber-50 dark:bg-amber-900/20">
        <div class="flex items-start gap-4">
          <UIcon name="i-heroicons-chart-bar" class="mt-1 h-8 w-8 text-amber-600" />
          <div>
            <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-100">
              Projet en cours de développement
            </h3>
            <p class="mt-2 text-sm text-amber-800 dark:text-amber-200">
              Le baromètre politique est actuellement en phase de développement. Nous travaillons à
              collecter et structurer les promesses électorales pour vous offrir un outil de suivi
              transparent et fiable.
            </p>
            <UButton
              to="/barometre-politique"
              color="amber"
              variant="soft"
              class="mt-4"
              icon="i-heroicons-arrow-right"
            >
              Accéder au baromètre
            </UButton>
          </div>
        </div>
      </UCard>

      <div class="mt-8 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
        <h4 class="mb-4 text-lg font-semibold">Contribuer au projet</h4>
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Ce projet est participatif et open source. Vous pouvez contribuer en :
        </p>
        <ul class="space-y-2 text-sm">
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check-circle" class="mt-1 h-5 w-5 text-green-500" />
            <span>Signalant des promesses manquantes</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check-circle" class="mt-1 h-5 w-5 text-green-500" />
            <span>Proposant des sources officielles</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check-circle" class="mt-1 h-5 w-5 text-green-500" />
            <span>Partageant des mises à jour sur les réalisations</span>
          </li>
        </ul>
        <div class="mt-4 flex items-center gap-3">
          <UIcon name="i-heroicons-envelope" class="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <a href="mailto:contact@vie-publique.sn" class="text-primary hover:underline">
            contact@vie-publique.sn
          </a>
        </div>
      </div>
    </article>
  </div>
</template>
