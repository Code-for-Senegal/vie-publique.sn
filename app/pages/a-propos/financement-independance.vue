<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

const title = 'Financement & indépendance | Vie Publique Sénégal';
const description =
  "Vie Publique Sénégal publie ses principes de financement, ses garanties d'indépendance éditoriale et la liste de ses partenaires de projets, dans un souci de transparence.";
const url = `${siteUrl}/financement-independance`;
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
    'financement vie publique sénégal',
    'indépendance éditoriale',
    'transparence financière association',
    'partenaires vie publique',
    'open data sénégal',
    'civic tech sénégal',
    'gouvernance associative',
  ].join(', '),
});

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Financement & indépendance', item: url },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Vie Publique Sénégal',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description,
  address: { '@type': 'PostalAddress', addressCountry: 'SN' },
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

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Un partenaire peut-il influencer vos contenus ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Non. Aucun partenaire n'a de droit de regard préalable sur nos contenus. Les choix éditoriaux relèvent exclusivement de Vie Publique Sénégal.",
      },
    },
    {
      '@type': 'Question',
      name: 'Publiez-vous vos comptes ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui. Nous publierons un résumé annuel de nos comptes après clôture, certification et déclaration, conformément à nos engagements de transparence.',
      },
    },
    {
      '@type': 'Question',
      name: 'Pourquoi travailler avec plusieurs partenaires ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Pour financer des projets distincts, diversifier les ressources et préserver l'indépendance de l'organisation.",
      },
    },
  ],
};

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
    { type: 'application/ld+json', children: JSON.stringify(organizationSchema) },
    { type: 'application/ld+json', children: JSON.stringify(breadcrumbSchema) },
    { type: 'application/ld+json', children: JSON.stringify(faqSchema) },
  ],
});

interface PartnerProject {
  id: string;
  name: string;
  type: string;
  period: string;
  amount: string;
  object: string;
  finances: string;
  doesNotFinance: string;
  isVisible: boolean;
  callForProjects?: {
    description: string;
    linkUrl: string;
    linkText: string;
    suffix?: string;
  };
}

const partnersProjects = ref<PartnerProject[]>([
  {
    id: 'polaris',
    name: 'Polaris Association',
    type: 'Subvention & accompagnement technique',
    period: 'juillet 2025 - octobre 2025 (3 mois)',
    amount: '',
    object: 'Renforcement de la plateforme Vie Publique Sénégal',
    finances:
      'amélioration UX/UI, fonctionnalités de la plateforme, renforcement organisationnel sur un périmètre défini.',
    doesNotFinance: 'gouvernance, orientation politique, choix éditoriaux.',
    isVisible: true,
    callForProjects: {
      description: "Ce financement est issu d'un appel à projets de",
      linkUrl: 'https://polaris-asso.org/',
      linkText: 'Polaris Asso',
      suffix:
        ', en partenariat avec la Fondation de l’innovation pour la démocratie et l’Ambassade de France au Sénégal.',
    },
  },
  {
    id: 'africtivist',
    name: 'Africtivist',
    type: 'Subvention de projet (Election Civic Tech Fund)',
    period: 'novembre 2025 - octobre 2026 (12 mois)',
    amount: '',
    object: '« Plateforme électorale citoyenne »',
    finances:
      'outils civiques liés aux processus électoraux, information citoyenne, participation et transparence.',
    doesNotFinance:
      "activités partisanes, prises de position politiques, structure globale de l'association.",
    isVisible: true,
    callForProjects: {
      description: 'Ce projet a été sélectionné dans le cadre de l’appel à projets',
      linkUrl: 'https://electioncivictechfund.africtivistes.com/fr',
      linkText: 'Election Civic Tech Fund',
      suffix: ', lancé par Africtivist.',
    },
  },
  {
    id: 'pnud',
    name: 'PNUD - Programme des Nations Unies pour le développement',
    type: 'Partenaire de mise en œuvre',
    period: 'décembre 2025 - mai 2026 (6 mois)',
    amount: '',
    object:
      "Initiative phare pour l'espace civique et la promotion de nouveaux modèles d'engagement citoyen (3P4D)",
    finances:
      "activités de participation citoyenne, animation d'espaces civiques, coordination et reporting.",
    doesNotFinance:
      "la ligne éditoriale, les prises de position publiques, la gouvernance de l'association.",
    isVisible: true,
    callForProjects: {
      description:
        'Ce partenariat fait suite à un appel à projets public du Programme des Nations Unies pour le développement (PNUD), publié sur la plateforme officielle des avis de passation de marchés.',
      linkUrl: 'https://procurement-notices.undp.org/view_negotiation.cfm?nego_id=33996',
      linkText: 'Voir l’appel à projets',
    },
  },
]);
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <!-- Breadcrumb / Back -->
    <nav
      class="mb-6 flex items-center text-sm text-gray-500 dark:text-gray-400"
      aria-label="Breadcrumb"
    >
      <NuxtLink to="/" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        Accueil
      </NuxtLink>
      <span class="mx-2 text-gray-300 dark:text-gray-600">/</span>
      <NuxtLink
        to="/a-propos/qui-sommes-nous"
        class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        À propos
      </NuxtLink>
      <span class="mx-2 text-gray-300 dark:text-gray-600">/</span>
      <span class="truncate font-medium text-gray-900 dark:text-white" aria-current="page">
        Financement & indépendance
      </span>
    </nav>

    <article class="prose prose-sm mx-auto sm:prose lg:prose-lg dark:prose-invert">
      <h1>Financement & indépendance</h1>

      <p class="text-sm text-gray-600 dark:text-gray-400">
        Dernière modification: 21 décembre 2025
      </p>

      <h2 id="pourquoi">Pourquoi cette page</h2>
      <p>
        Vie Publique Sénégal est une initiative citoyenne indépendante dédiée à l'accès à
        l'information publique, à la transparence et à l'engagement civique. Dans un souci de
        confiance, nous publions ici nos principes de financement, nos garde-fous d'indépendance
        éditoriale et la liste de nos partenaires de projets.
      </p>

      <h2 id="principes">Nos principes d'indépendance</h2>
      <ul>
        <li>
          <strong>Neutralité politique stricte</strong> : aucune affiliation partisane, aucun
          soutien à une candidature.
        </li>
        <li>
          <strong>Indépendance éditoriale</strong> : aucun partenaire n'intervient dans le choix des
          sujets ou la validation des contenus.
        </li>
        <li>
          <strong>Pluralité des partenaires</strong> : chaque partenaire finance un périmètre de
          projet, sur une période définie.
        </li>
        <li>
          <strong>Traçabilité</strong> : les dépenses sont justifiées et reportées selon les
          obligations contractuelles.
        </li>
      </ul>

      <h2 id="modele">Comment Vie Publique est financée</h2>
      <p>
        Nos ressources proviennent de partenariats de projets (subventions ciblées), de
        contributions citoyennes et, à terme, de services et productions propres.
      </p>

      <h3 id="phase-lancement">Phase de lancement (avril 2024 - septembre 2025)</h3>
      <p>
        Lors de sa première phase, Vie Publique Sénégal a fonctionné sans financement
        institutionnel, grâce aux contributions volontaires de ses membres, au bénévolat et à des
        ressources propres. Les premiers partenariats financiers ont démarré à partir de fin 2025.
      </p>

      <h2 id="partenaires">Nos partenaires</h2>
      <p>
        Les partenariats ci-dessous financent des projets distincts. Ils ne confèrent aucun droit de
        regard sur la ligne éditoriale de Vie Publique Sénégal.
      </p>

      <template v-for="project in partnersProjects" :key="project.id">
        <div v-if="project.isVisible">
          <hr />
          <h3 :id="project.id">{{ project.name }}</h3>
          <ul>
            <li><strong>Type</strong> : {{ project.type }}</li>
            <li><strong>Période</strong> : {{ project.period }}</li>
            <li v-if="project.object"><strong>Objet</strong> : {{ project.object }}</li>
          </ul>
          <p><strong>Finance</strong> : {{ project.finances }}</p>
          <p><strong>Ne finance pas</strong> : {{ project.doesNotFinance }}</p>

          <p v-if="project.callForProjects" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ project.callForProjects.description }}
            <a
              :href="project.callForProjects.linkUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 hover:underline"
              >{{ project.callForProjects.linkText }}</a
            >{{ project.callForProjects.suffix }}
          </p>
        </div>
      </template>

      <h2 id="gouvernance">Gouvernance & garde-fous</h2>
      <p>
        Vie Publique Sénégal est structurée autour d'une gouvernance associative (Assemblée
        Générale, Conseil d'Administration, Bureau Exécutif) et d'équipes opérationnelles
        distinctes. L'indépendance éditoriale relève de l'organisation et de ses procédures
        internes.
      </p>

      <h2 id="transparence">Transparence financière</h2>
      <p>
        Vie Publique Sénégal a démarré ses activités en avril 2024. Notre premier exercice comptable
        complet sera clôturé en décembre 2025. Une fois les comptes certifiés et déclarés, nous
        publierons un résumé annuel (ressources, dépenses et principaux postes) sur la plateforme.
      </p>

      <h2 id="faq">Questions fréquentes</h2>
      <h4>Un partenaire peut-il influencer vos contenus ?</h4>
      <p>
        Non. Aucun partenaire n'a de droit de regard préalable sur nos contenus. Les choix
        éditoriaux relèvent exclusivement de Vie Publique Sénégal.
      </p>

      <h4>Pourquoi travailler avec plusieurs partenaires ?</h4>
      <p>
        Pour financer des projets distincts, diversifier les ressources et préserver l'indépendance
        de l'organisation.
      </p>

      <h4>Publiez-vous vos comptes ?</h4>
      <p>
        Conformément à nos règles associatives, nos comptes sont établis et présentés à nos
        instances. Dans un souci de transparence, Vie Publique Sénégal s’engage également à publier
        un résumé annuel de ses comptes une fois ceux-ci clôturés, certifiés et déclarés.
      </p>

      <hr />

      <p class="text-sm text-gray-600 dark:text-gray-400">
        Pour toute question : <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>
      </p>
    </article>
  </div>
</template>
