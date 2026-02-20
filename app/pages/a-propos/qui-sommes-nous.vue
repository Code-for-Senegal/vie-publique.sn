<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

const title = 'À Propos de Vie Publique Sénégal | Qui Sommes-Nous';
const description =
  "Vie-publique.sn est une plateforme citoyenne indépendante dédiée à la promotion de la transparence et de l'accessibilité de l'information publique au Sénégal. Projet ouvert, participatif et open source.";
const url = `${siteUrl}/a-propos/qui-sommes-nous`;
const image = `${siteUrl}/og-image.png`;

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
    'à propos vie publique sénégal',
    'transparence sénégal',
    'information publique sénégal',
    'open source sénégal',
    'plateforme citoyenne',
    'gouvernance transparente',
    'civic tech sénégal',
  ].join(', '),
});

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
      name: 'À Propos',
      item: `${siteUrl}/a-propos/qui-sommes-nous`,
    },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Vie Publique Sénégal',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'SN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@vie-publique.sn',
    telephone: '+221784364444',
    contactType: 'Customer Service',
  },
  sameAs: [
    'https://twitter.com/ViePubliqueSN',
    'https://www.facebook.com/ViePubliqueSenegal',
    'https://www.linkedin.com/company/vie-publique-sn',
    'https://github.com/Code-for-Senegal/vie-publique.sn',
  ],
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'À Propos de Vie Publique Sénégal',
  url,
  inLanguage: 'fr-SN',
  isPartOf: {
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  },
  about: {
    '@type': 'Organization',
    name: 'Vie Publique Sénégal',
    url: siteUrl,
  },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: image,
  },
  description,
};

// Head Configuration
useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'fr_SN' },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
  ],
  script: [
    { type: 'application/ld+json', children: JSON.stringify(organizationSchema) },
    { type: 'application/ld+json', children: JSON.stringify(breadcrumbSchema) },
    { type: 'application/ld+json', children: JSON.stringify(aboutPageSchema) },
  ],
});
</script>

<template>
  <div class="container mx-auto min-h-screen max-w-4xl px-4 py-8 pb-16">
    <AppBreadcrumb :items="[{ label: 'À propos' }]" />

    <article class="prose prose-sm mx-auto sm:prose lg:prose-lg dark:prose-invert">
      <h1>À Propos</h1>

      <p class="text-sm text-gray-600 dark:text-gray-400">
        Dernière modification: 21 décembre 2025
      </p>

      <h3>Projet Citoyen, Ouvert et Open Source</h3>

      <p>
        Vie-publique.sn est une plateforme citoyenne indépendante, dédiée à la promotion de la
        transparence et de l'accessibilité à l'information publique au Sénégal.
      </p>

      <p>
        C'est une plateforme participative, collective, ouverte et open source visant à rendre
        accessible au grand public les informations publiques (rapports d'audit, budget, journal
        officiel, lois et règlements, code général, nominations etc.).
      </p>

      <p>Ce projet n'est affilié à aucun gouvernement ou organisation politique.</p>

      <p>
        Lancée en avril 2024, l’initiative a d’abord fonctionné grâce au bénévolat et aux
        contributions de ses membres, avant de nouer des partenariats de projets à partir de fin
        2025.
      </p>

      <p class="hidden">
        Dans un souci de transparence vis-à-vis de notre communauté, nous publions nos principes de
        financement, de gouvernance et nos garanties d'indépendance éditoriale sur des pages dédiées
        :
        <NuxtLink to="/a-propos/financement-independance">Financement & indépendance</NuxtLink>
        et
        <NuxtLink to="/a-propos/gouvernance">Gouvernance</NuxtLink>.
      </p>

      <p>
        Pour toute question ou suggestion, envoyez-nous un mail à
        <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>
      </p>

      <h3>Objectif du Projet</h3>

      <p>
        L'objectif de vie-publique.sn est de fournir un accès facile aux informations
        gouvernementales afin de promouvoir l'engagement civique, la responsabilisation et une
        meilleure compréhension des affaires publiques par les citoyens. En consolidant ces
        informations et en facilitant leur accès à un seul endroit, nous espérons contribuer à une
        société plus informée et plus engagée.
      </p>

      <p><strong>Notre passage à la RTS</strong></p>

      <div class="video-container my-8">
        <iframe
          class="mx-auto w-full rounded-lg"
          width="100%"
          height="400"
          src="https://www.youtube.com/embed/D7Q5R_a4abU?rel=0&modestbranding=1&origin=https://www.vie-publique.sn"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
        ></iframe>
      </div>

      <h3>Nos valeurs</h3>

      <p>
        <strong>Transparence</strong> L'objectif est de permettre un accès libre et ouvert aux
        informations publiques pour tous
      </p>

      <p>
        <strong>Indépendance</strong> Vie-publique.sn n'est affiliée à aucun gouvernement ou
        organisation politique.
      </p>

      <p>
        <strong>Participation citoyenne</strong> L'initiative est collective, open source, et invite
        à la contribution de tous.
      </p>

      <p>
        <strong>Responsabilité</strong> Promouvoir la responsabilisation des institutions publiques
        et des citoyens en rendant les informations clés accessibles.
      </p>

      <p>
        <strong>Ouverture</strong> Utiliser une approche open source pour favoriser l'innovation et
        l'amélioration continue de la plateforme par la communauté.
      </p>

      <h3>Participation et Contributions</h3>

      <p>
        Nous encourageons la communauté à participer et à contribuer à l'amélioration de cette
        plateforme. Si vous avez des compétences en développement web, en analyse de données, ou si
        vous souhaitez simplement nous transmettre des informations, suggérer des améliorations ou
        signaler des erreurs, n'hésitez pas à:
      </p>

      <ul>
        <li>par téléphone : +221 78 436 44 44</li>
        <li>
          nous contacter par mail à
          <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>
        </li>
        <li>
          contribuer sur le code source sur
          <a
            href="https://github.com/Code-for-Senegal/vie-publique.sn"
            target="_blank"
            rel="noopener noreferrer"
            >GitHub</a
          >
        </li>
      </ul>

      <p>
        Nous sommes ouverts à toutes les formes de collaboration qui peuvent enrichir ce projet et
        servir au mieux les intérêts des citoyens sénégalais.
      </p>

      <h3>Contributeurs</h3>

      <p>Les personnes qui contribuent au projet</p>

      <ProjectContributors class="w-full" />

      <h3>Sources des Données</h3>

      <p>
        Les documents et informations publiés sur la plateforme sont récupérés directement des
        sources publiques, puis centralisés, enrichis, croisés avant d'être publiés sur Vie Publique
        dans le but de faciliter leur accès et leur utilisation par le public.
      </p>
    </article>
  </div>
</template>

<style scoped>
.video-container {
  max-width: 100%;
}
</style>
