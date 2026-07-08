<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// Données hardcodées temporaires (à migrer vers Directus)
const jobsData: Record<string, any> = {
  journaliste: {
    id: 'journaliste',
    slug: 'journaliste',
    title: 'Journaliste Polyvalent',
    description:
      'Vie-publique.sn recherche un journaliste polyvalent pour enrichir ses contenus et couvrir les actualités.',
    date: '2024-11-18',
    deadline: '2024-11-23',
    salary: '150 k -200 k FCFA',
    location: 'Télétravail',
    type: 'Prestation',
    duration: '6 mois',
    category: 'Journalisme',
    status: 'expired',
    sections: [
      {
        title: 'Contexte',
        content:
          "Vie-publique.sn est une plateforme citoyenne dédiée à la transparence et à l'accès à l'information publique au Sénégal. Nous recherchons un journaliste polyvalent pour enrichir nos contenus, couvrir les actualités, et contribuer à la promotion de l'engagement civique.",
      },
      {
        title: 'Description du Poste et Missions principales',
        content:
          "En tant que journaliste polyvalent vous jouerez un rôle clé dans la valorisation des informations publiques officielles et sa vulgarisation.",
        subsections: [
          {
            title: '1. Rédaction de contenus',
            items: [
              "Produire des contenus (articles, vidéos, tribunes et résumés d'actualités) sur des sujets liés à la politique, l'économie, les droits humains, et la gouvernance",
              'Synthétiser des rapports et documents publics pour les rendre accessibles au grand public',
              'Adapter les contenus à différents supports : blog, newsletters, réseaux sociaux',
            ],
          },
          {
            title: "2. Couverture d'événements",
            items: [
              "Assurer la couverture journalistique d'événements publics, conférences, et tables rondes",
            ],
          },
          {
            title: '3. Interviews',
            items: [
              "Réaliser des interviews de personnalités clés ou d'experts",
              'Animer des podcasts',
            ],
          },
          {
            title: '4. Création multimédia',
            items: [
              'Contribuer à la production de contenus visuels et audiovisuels (capsules vidéo, infographies, podcasts)',
              "Collaborer avec l'équipe pour garantir une présentation attractive des contenus",
            ],
          },
          {
            title: '5. Veille et recherche',
            items: [
              'Assurer une veille active sur les actualités politiques et sociales au Sénégal',
              'Identifier des sujets pertinents et proposer des angles innovants pour nos publications',
            ],
          },
        ],
      },
      {
        title: 'Missions accessoires',
        items: [
          'Assistant opérationnel',
          "Démarches administratives ponctuelles pour l'association",
        ],
      },
      {
        title: 'Profil recherché',
        items: [
          'Diplôme en journalisme, communication, ou disciplines connexes',
          'Carte de presse',
          "Minimum 2 ans d'expérience en rédaction journalistique ou communication",
          'Excellentes capacités rédactionnelles en français (wolof est un atout)',
          'Bonne maîtrise des outils numériques et des réseaux sociaux',
          'Notions en création visuelle et audiovisuelle appréciées (Canva, montage vidéo)',
          "Sens de l'organisation, rigueur, et capacité à respecter les délais",
          "Intérêt marqué pour les thématiques liées à la démocratie, la bonne gouvernance et l'actualité publique",
        ],
      },
      {
        title: 'Conditions',
        items: [
          'Type de contrat : Prestation de service',
          'Durée : 6 mois (renouvelable selon performance)',
          'Rémunération : Entre 150 000 et 200 000 FCFA + forfait internet par mois selon profil et expérience',
          "Lieu de travail : Télétravail avec déplacements ponctuels pour des événements et mission au Sénégal",
        ],
      },
      {
        title: 'Comment postuler',
        content: `Envoyez votre CV à l'adresse suivante : **contact@vie-publique.sn**\n\navec l'objet : **Candidature Journaliste**\n\n**Date limite de candidature :** Samedi 23 Novembre 2024`,
      },
      {
        title: 'À propos de Vie-publique.sn',
        content:
          "Vie-publique.sn promeut un accès facilité à l'information publique au Sénégal. Notre plateforme est participative, open source, et indépendante de toute affiliation politique.",
      },
    ],
  },
  'community-manager': {
    id: 'community-manager',
    slug: 'community-manager',
    title: 'Community Manager',
    description:
      'Vie-publique.sn recherche un community manager pour gérer sa présence sur les réseaux sociaux.',
    date: '2024-11-18',
    deadline: '2024-11-23',
    salary: '150 000 FCFA',
    location: 'Télétravail',
    type: 'Prestation',
    duration: '6 mois',
    category: 'Communication',
    status: 'expired',
    sections: [
      {
        title: 'Description du poste',
        content:
          "Nous recherchons un community manager motivé, avec une appétence particulière pour les thématiques liées à la démocratie, la bonne gouvernance, l'actualité économique et politique au Sénégal.",
      },
      {
        title: 'Missions principales',
        items: [
          'Gestion et animation des réseaux sociaux (Twitter, LinkedIn, Facebook, Instagram etc.)',
          'Création et planification de contenus engageants et informatifs',
          'Interaction avec la communauté et gestion des messages/commentaires',
          "Suivi et analyse des performances des publications via des outils d'analyse",
          'Proposition de nouvelles stratégies de communication pour renforcer la visibilité de Vie-publique.sn',
          'Rapport hebdomadaire des flux et messages sur les RS',
          'Proposition de calendrier mensuel',
        ],
      },
      {
        title: 'Profil recherché',
        items: [
          "À l'aise avec les outils numériques et les réseaux sociaux",
          "Capacité à utiliser des outils d'IA pour l'aide à la rédaction",
          'Excellente maîtrise de la communication digitale',
          'Intérêt marqué pour les sujets de citoyenneté et de transparence',
          "Fort intérêt pour l'actualité politique et sociale au Sénégal",
          'Familiarité avec les outils de gestion de réseaux sociaux (Buffer, Hootsuite, etc.)',
          "Autonomie et sens de l'organisation",
          'De préférence bilingue',
        ],
      },
      {
        title: 'Conditions',
        items: [
          "Période d'essai : 1 mois",
          'Type de contrat : Prestation de service, 6 mois, travail à distance.',
          'Rémunération : entre 100 000 et 150 000 FCFA / mois + forfait internet',
          "Évolution : Possibilité d'embauche selon l'évolution de l'association",
        ],
      },
      {
        title: 'Comment postuler',
        content: `Envoyez votre CV à l'adresse suivante : **contact@vie-publique.sn**\n\nAvec l'objet : **Candidature CM**\n\n**Date limite candidatures :** Samedi 23 Novembre 2024`,
      },
      {
        title: 'À propos de Vie-publique.sn',
        content:
          "Vie-publique.sn est une initiative citoyenne, sous forme d'association, dédiée à la promotion de la transparence et de l'accessibilité à l'information publique au Sénégal. Notre objectif est de rendre les affaires publiques compréhensibles et accessibles à tous à travers des contenus engageants et informatifs.",
      },
    ],
  },
};

const job = computed(() => jobsData[slug]);

// 404 si offre non trouvée
if (!job.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Offre non trouvée',
    fatal: true,
  });
}

// SEO
const seoTitle = `${job.value.title} - Recrutement | Vie-publique.sn`;
const seoDescription = job.value.description;

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
});
</script>

<template>
  <div class="container mx-auto min-h-screen px-4 py-8 pb-16">
    <AppBreadcrumb
      :items="[
        { label: 'À propos', to: '/a-propos/qui-sommes-nous' },
        { label: 'Recrutement', to: '/a-propos/recrutement' },
        { label: job.title || 'Offre' },
      ]"
    />

    <!-- En-tête -->
    <div class="mb-8">
      <div class="mb-4 flex items-start justify-between">
        <div class="flex-1">
          <h1 class="mb-2 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            {{ job.title }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">{{ job.description }}</p>
        </div>
        <UBadge v-if="job.status === 'expired'" color="gray" size="lg" class="ml-4">
          Expiré
        </UBadge>
        <UBadge v-else color="green" size="lg" class="ml-4"> Ouvert </UBadge>
      </div>

      <!-- Infos clés -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          <UIcon name="i-heroicons-calendar" class="h-5 w-5" />
          <span class="text-sm">Publié le {{ $dateformatWithDayName(job.date) }}</span>
        </div>
        <div class="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          <UIcon name="i-heroicons-clock" class="h-5 w-5" />
          <span class="text-sm">Limite : {{ $dateformatWithDayName(job.deadline) }}</span>
        </div>
        <div class="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          <UIcon name="i-heroicons-banknotes" class="h-5 w-5" />
          <span class="text-sm">{{ job.salary }}</span>
        </div>
        <div class="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          <UIcon name="i-heroicons-map-pin" class="h-5 w-5" />
          <span class="text-sm">{{ job.location }}</span>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="prose prose-sm mx-auto max-w-4xl sm:prose lg:prose-lg dark:prose-invert">
      <div v-for="(section, idx) in job.sections" :key="idx" class="mb-8">
        <h2 v-if="section.title" class="mb-4 text-2xl font-bold">{{ section.title }}</h2>
        <div v-if="section.content" class="whitespace-pre-wrap text-gray-600 dark:text-gray-300" v-html="section.content"></div>

        <ul v-if="section.items" class="list-disc space-y-2 pl-6">
          <li v-for="(item, i) in section.items" :key="i">{{ item }}</li>
        </ul>

        <div v-if="section.subsections" class="space-y-6">
          <div v-for="(subsection, subIdx) in section.subsections" :key="subIdx" class="ml-4">
            <h3 class="mb-3 text-xl font-semibold">{{ subsection.title }}</h3>
            <ul class="list-disc space-y-2 pl-6">
              <li v-for="(item, i) in subsection.items" :key="i">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Postuler -->
    <div class="mt-12 border-t pt-8">
      <div class="mx-auto max-w-2xl text-center">
        <h3 class="mb-4 text-2xl font-bold">Intéressé(e) par ce poste ?</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-400">
          Envoyez votre candidature à
          <a href="mailto:contact@vie-publique.sn" class="font-semibold text-blue-600 hover:underline"
            >contact@vie-publique.sn</a
          >
        </p>
        <div class="flex justify-center gap-4">
          <UButton
            to="/a-propos/recrutement"
            color="gray"
            variant="outline"
            size="lg"
            icon="i-heroicons-arrow-left"
          >
            Retour aux offres
          </UButton>
          <UButton
            v-if="job.status !== 'expired'"
            to="mailto:contact@vie-publique.sn"
            color="primary"
            size="lg"
            icon="i-heroicons-paper-airplane"
            external
          >
            Postuler
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
