<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

/**
 * Page « Webinaires techniques » — PERMANENTE.
 * À chaque nouvelle séance : ajouter un objet dans `sessions`.
 * Une fois la séance passée : passer `status` à 'past' et renseigner `replayUrl`
 * (lien YouTube du replay). La prochaine séance à venir est mise en avant
 * automatiquement, les séances passées apparaissent dans « Revoir les séances ».
 */
interface Session {
  /** Numéro d'ordre affiché (Séance #N) */
  number: number;
  title: string;
  /** Date ISO 8601 avec fuseau (GMT = +00:00) — sert au schema.org Event */
  startDate: string;
  endDate?: string;
  /** Libellé lisible affiché à l'écran */
  dateLabel: string;
  time: string;
  welcome?: string;
  platform: string;
  /** Ce qui sera abordé pendant la séance */
  topics: string[];
  status: 'upcoming' | 'past';
  /** Lien YouTube du replay (uniquement pour status = 'past') */
  replayUrl?: string;
  /** ID de la vidéo YouTube du replay — sert à l'embed et au schema.org VideoObject */
  youtubeId?: string;
  /** Résumé/accroche du replay affiché sous le lecteur */
  replaySummary?: string;
  /** Lien vers la présentation projetée pendant la séance (PDF ou page HTML) */
  slidesUrl?: string;
  slidesLabel?: string;
}

const sessions: Session[] = [
  {
    number: 1,
    title: "Les coulisses d'une Civic Tech",
    startDate: '2026-07-04T20:00:00+00:00',
    endDate: '2026-07-04T21:30:00+00:00',
    dateLabel: 'Samedi 4 juillet 2026',
    time: '20h00 GMT',
    welcome: 'Accueil dès 19h50',
    platform: 'Google Meet',
    topics: [
      '5 min — Présentation de Vie Publique et du pôle technique',
      '20 min — Les coulisses de nos plateformes : archi, IA, DevOps + démo live',
      '30 min — Questions / Réponses, échanges et opportunités de contribution',
      '5 min — Conclusion',
    ],
    status: 'past',
    replayUrl: 'https://youtu.be/u7-VV-IIClU',
    youtubeId: 'u7-VV-IIClU',
    replaySummary:
      'Replay de la première séance : les coulisses techniques de Vie Publique Sénégal — architecture, IA et RAG, DevOps, open data et open source.',
    slidesUrl: '/tech/coulisses-civic-tech',
    slidesLabel: 'Lire les coulisses techniques',
  },
];

const upcomingSessions = computed(() =>
  sessions
    .filter((s) => s.status === 'upcoming')
    .sort((a, b) => a.startDate.localeCompare(b.startDate)),
);
const pastSessions = computed(() =>
  sessions
    .filter((s) => s.status === 'past')
    .sort((a, b) => b.startDate.localeCompare(a.startDate)),
);
const nextSession = computed(() => upcomingSessions.value[0] ?? null);

const title = 'Webinaires techniques Vie Publique Sénégal';
const description =
  "Série de webinaires gratuits où l'équipe de Vie Publique Sénégal partage les coulisses d'une civic tech : architecture, IA, RAG, DevOps, open data et open source.";
const url = `${siteUrl}/tech`;
const image = `${siteUrl}/og-image.png`;

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScjH3Gx1lZuBS40TBPUiLAEBtKqsTezqRs2ecjoq9NbcBJp1Q/viewform?embedded=true';

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
    'webinaire vie publique sénégal',
    'webinaire technique sénégal',
    'civic tech sénégal',
    'architecture web sénégal',
    'intelligence artificielle sénégal',
    'RAG retrieval augmented generation',
    'DevOps sénégal',
    'open source civic tech',
    'n8n automatisation',
    'open data sénégal',
  ].join(', '),
});

// Le BreadcrumbList est émis par <AppBreadcrumb> (useSchemaOrg) — ne pas le dupliquer ici (cf. CLAUDE.md §7).

// Un nœud VideoObject par séance passée avec replay (indexation vidéo Google).
const videoSchemas = computed(() =>
  pastSessions.value
    .filter((s) => s.youtubeId)
    .map((s) => ({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${s.title} — Webinaire technique Vie Publique Sénégal`,
      description: s.replaySummary || description,
      thumbnailUrl: [`https://i.ytimg.com/vi/${s.youtubeId}/maxresdefault.jpg`],
      uploadDate: s.startDate,
      contentUrl: s.replayUrl,
      embedUrl: `https://www.youtube-nocookie.com/embed/${s.youtubeId}`,
      publisher: { '@type': 'Organization', name: 'Vie Publique Sénégal', url: siteUrl },
      inLanguage: 'fr',
    })),
);

// Un nœud Event par séance à venir (rich results Google + agenda).
const eventSchemas = computed(() =>
  upcomingSessions.value.map((s) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${s.title} — Webinaire technique Vie Publique Sénégal`,
    description,
    url,
    image,
    startDate: s.startDate,
    ...(s.endDate ? { endDate: s.endDate } : {}),
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'VirtualLocation', url },
    organizer: { '@type': 'Organization', name: 'Vie Publique Sénégal', url: siteUrl },
    inLanguage: 'fr',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'XOF',
      availability: 'https://schema.org/InStock',
      url,
      validFrom: s.startDate,
    },
  })),
);

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
    {
      key: 'ld-events',
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(eventSchemas.value)),
    },
    {
      key: 'ld-videos',
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(videoSchemas.value)),
    },
  ],
});
</script>

<template>
  <div class="container mx-auto min-h-screen max-w-4xl px-2 py-8 pb-16 md:px-4">
    <AppBreadcrumb :items="[{ label: 'Webinaires techniques' }]" />

    <!-- Hero -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">
        Webinaires techniques Vie Publique Sénégal
      </h1>
    </div>

    <!-- Intro -->
    <p class="mb-8 max-w-2xl text-gray-600 dark:text-gray-400">
      Une série de rendez-vous en ligne <strong>gratuits</strong> où nous ouvrons les coulisses
      d'une civic tech : l'architecture technique du site, nos choix d'outils, l'IA et le RAG, le
      DevOps, l'open data et l'open source. Chaque séance est l'occasion de partager nos retours
      d'expérience, nos projets, nos défis et les opportunités de contribution.
      <strong>Inscrivez-vous</strong> pour recevoir l'invitation par e-mail.
    </p>

    <!-- Prochaine(s) séance(s) -->
    <section v-if="nextSession" class="mb-10">
      <h2
        class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >
        Prochaine séance
      </h2>

      <div
        v-for="session in upcomingSessions"
        :key="session.number"
        class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-400"
          >
            Séance #{{ session.number }}
          </span>
          <span
            class="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400"
          >
            Inscriptions ouvertes
          </span>
        </div>

        <h3 class="mt-3 text-lg font-bold text-gray-900 dark:text-white">{{ session.title }}</h3>

        <!-- Infos pratiques -->
        <div class="mt-4 grid gap-2 text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-2">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-calendar-days"
              class="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400"
            />
            <span>{{ session.dateLabel }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-clock"
              class="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400"
            />
            <span
              >{{ session.time
              }}<template v-if="session.welcome"> &middot; {{ session.welcome }}</template></span
            >
          </div>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-video-camera"
              class="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400"
            />
            <span>{{ session.platform }} (lien envoyé aux inscrits)</span>
          </div>
        </div>

        <!-- Au programme -->
        <div class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
          <p class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Au programme</p>
          <ul class="space-y-1.5">
            <li
              v-for="(topic, i) in session.topics"
              :key="i"
              class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <UIcon name="i-heroicons-check-circle" class="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
              <span>{{ topic }}</span>
            </li>
          </ul>
        </div>

        <!-- CTA -->
        <div class="mt-5">
          <a
            href="#formulaire"
            class="inline-flex items-center gap-2 rounded-lg bg-[#FFD400] px-6 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-yellow-400 active:scale-[0.98]"
          >
            S'inscrire pour recevoir l'invitation
            <UIcon name="i-heroicons-arrow-down" class="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>

    <!-- Séances passées (replays) -->
    <section v-if="pastSessions.length" class="mb-10">
      <h2
        class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >
        Revoir les séances
      </h2>
      <ul class="space-y-6">
        <li
          v-for="session in pastSessions"
          :key="session.number"
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <!-- Lecteur embarqué du replay -->
          <div
            v-if="session.youtubeId"
            class="relative w-full bg-gray-900"
            style="padding-bottom: 56.25%"
          >
            <iframe
              :src="`https://www.youtube-nocookie.com/embed/${session.youtubeId}`"
              :title="`Replay — Séance #${session.number} : ${session.title}`"
              class="absolute inset-0 h-full w-full"
              frameborder="0"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
                web-share;
              "
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>

          <div class="p-4">
            <p class="font-semibold text-gray-900 dark:text-white">
              Séance #{{ session.number }} — {{ session.title }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ session.dateLabel }}</p>
            <p v-if="session.replaySummary" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {{ session.replaySummary }}
            </p>

            <div class="mt-3 flex flex-wrap items-center gap-3">
              <a
                v-if="session.replayUrl"
                :href="session.replayUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:underline dark:text-red-400"
              >
                <UIcon name="i-heroicons-play" class="h-4 w-4" />
                Voir sur YouTube
              </a>
              <NuxtLink
                v-if="session.slidesUrl"
                :to="session.slidesUrl"
                class="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                <UIcon name="i-heroicons-document-text" class="h-4 w-4" />
                {{ session.slidesLabel || 'Voir la présentation' }}
              </NuxtLink>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- CTA permanent — visible entre deux séances (aucune séance programmée) -->
    <div v-if="!nextSession" class="mb-12">
      <p class="mb-4 max-w-2xl text-gray-600 dark:text-gray-400">
        La prochaine séance est en préparation. Inscrivez-vous dès maintenant pour être prévenu·e de
        la date et recevoir l'invitation par e-mail.
      </p>
      <a
        href="#formulaire"
        class="inline-flex items-center gap-2 rounded-lg bg-[#FFD400] px-6 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-yellow-400 active:scale-[0.98]"
      >
        S'inscrire aux prochaines séances
        <UIcon name="i-heroicons-arrow-down" class="h-4 w-4" />
      </a>
    </div>

    <!-- Formulaire d'inscription -->
    <section id="formulaire">
      <h2
        class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >
        S'inscrire
      </h2>
      <p class="mb-4 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
        Répondez au formulaire (2 minutes) : nous vous enverrons l'invitation de la prochaine séance
        et adapterons les sujets à ce qui vous intéresse.
      </p>
      <div class="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <iframe
          :src="GOOGLE_FORM_URL"
          class="w-full rounded-lg"
          width="100%"
          height="900"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
          title="Formulaire d'inscription aux webinaires techniques Vie Publique Sénégal"
          loading="lazy"
        >
          Chargement du formulaire…
        </iframe>
      </div>
    </section>
  </div>
</template>
