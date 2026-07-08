<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

/**
 * Page éditoriale « Les coulisses techniques » - issue du Webinaire technique #1.
 * Reprend UNIQUEMENT la partie technique (architecture, DevOps, pipeline IA).
 * La présentation de l'association vit sur /a-propos (pas de doublon ici).
 */
const YOUTUBE_ID = 'u7-VV-IIClU';

const title = "Les coulisses techniques d'une civic tech";
const description =
  "Comment Vie Publique Sénégal est construit : l'évolution de notre architecture (2024 → cible), nos choix techniques (Nuxt, Directus, n8n, Typesense, MinIO), notre DevOps et notre pipeline de développement assisté par IA.";
const url = `${siteUrl}/tech/coulisses-civic-tech`;
const image = `${siteUrl}/og-image.png`;
const datePublished = '2026-07-04';

// Évolution de l'architecture - rendue en frise HTML (indexable, responsive, dark-mode).
interface ArchiStep {
  year: string;
  version: string;
  tagline: string;
  /** Ajouts/changements marquants de cette étape */
  changes: string[];
  /** Schéma d'architecture (fond blanc) sous /public/img/tech/webinaire1/ */
  image: string;
  imageAlt: string;
  current?: boolean;
  target?: boolean;
}
const archiSteps: ArchiStep[] = [
  {
    year: '2024',
    version: 'v0',
    tagline: 'Les débuts - déployé en 1 heure',
    changes: [
      '1 seul serveur, 1 seul environnement',
      'Pas de backend',
      'Déploiement continu Git → Vercel (prod directe)',
    ],
    image: '/img/tech/webinaire1/vie-publique-sn-v0.webp',
    imageAlt:
      'Architecture v0 de Vie Publique Sénégal : dépôt GitHub avec Nuxt.js déployé sur Vercel, sans backend',
  },
  {
    year: '2025',
    version: 'v1',
    tagline: 'Le minimum viable',
    changes: ['Ajout d’un backend headless Directus', 'Migration de Vercel vers un VPS Hostinger'],
    image: '/img/tech/webinaire1/vie-publique-sn-v1.webp',
    imageAlt:
      'Architecture v1 : frontend Nuxt.js relié en HTTP à un CMS headless Directus, avec cache Redis et base PostgreSQL',
  },
  {
    year: '2026',
    version: 'v2',
    tagline: 'L’architecture actuelle',
    current: true,
    changes: [
      'Séparation des environnements Test et Production',
      'Automatisation des workflows avec n8n',
      'Stockage objet auto-hébergé avec MinIO',
      'Moteur de recherche Typesense',
      'Application mobile PWA / TWA',
    ],
    image: '/img/tech/webinaire1/vie-publique-sn-v2-actuelle.webp',
    imageAlt:
      'Architecture v2 actuelle : Nuxt.js et mobile PWA/TWA, Directus, PostgreSQL, Redis, stockage MinIO, moteur Typesense, automatisation n8n, mails Brevo/Resend, notifications Firebase',
  },
  {
    year: 'Cible',
    version: 'vX',
    tagline: 'Là où nous allons',
    target: true,
    changes: [
      'Firewall et API Gateway',
      'Séparation des VM Application et Base de données',
      'Migration vers un hébergement au Sénégal',
      'Remplacement de MinIO',
    ],
    image: '/img/tech/webinaire1/vie-publique-sn-v3-cible.webp',
    imageAlt:
      'Architecture cible vX : Cloudflare, API Gateway (Gravitee/WSO2), application mobile React Native, séparation des VM, OneSignal et Firebase pour les notifications',
  },
];

// Coûts d'exploitation annuels (FCFA / XOF) - source : webinaire #1 du 4 juillet 2026.
// Hors rémunération de prestataires ; l'équipe est bénévole.
interface CostItem {
  label: string;
  annual: number;
  /** Part du total, en % (source webinaire #1) */
  pct: number;
}
const costItems: CostItem[] = [
  { label: 'Licences IA - Claude (3 développeurs)', annual: 4244400, pct: 70 },
  { label: 'Infrastructure cloud (Hostinger)', annual: 982500, pct: 16 },
  { label: 'Base de données (Supabase)', annual: 196500, pct: 3 },
  { label: 'Autres abonnements (SerpAPI, etc.)', annual: 168000, pct: 3 },
  { label: "Envoi d'e-mails (Resend)", annual: 157200, pct: 3 },
  { label: 'Nom de domaine & DNS', annual: 150000, pct: 2 },
  { label: 'Newsletter (Brevo)', annual: 59605, pct: 1 },
  { label: 'Licence App Store - Apple (99 $)', annual: 55242, pct: 1 },
  { label: 'Licence Play Store - Google (25 $)', annual: 13950, pct: 0 },
];
const costTotal = 6027397;
const formatXOF = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

// Le démarrage - preuves sociales (lancement + première traction).
const tweetUrl = 'https://x.com/malick_yacine/status/1785472745150742983';
const linkedinUrl = 'https://www.linkedin.com/feed/update/urn:li:activity:7206260166911033344/';
const firstVersionImage = '/img/tech/webinaire1/premiere-version-10k-visiteurs.jfif';

// Notre stack technique - chaque outil pointe vers son site officiel.
interface StackTool {
  name: string;
  url: string;
  role: string;
}
interface StackGroup {
  title: string;
  icon: string;
  tools: StackTool[];
}
const stackGroups: StackGroup[] = [
  {
    title: 'Frontend & mobile',
    icon: 'i-heroicons-computer-desktop',
    tools: [
      { name: 'Nuxt', url: 'https://nuxt.com', role: 'Framework web (Vue), SSR & SEO' },
      { name: 'Vue', url: 'https://vuejs.org', role: 'Bibliothèque d’interface' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com', role: 'Design system utilitaire' },
      {
        name: 'PWA / TWA',
        url: 'https://web.dev/explore/progressive-web-apps',
        role: 'Application mobile installable',
      },
    ],
  },
  {
    title: 'Backend & données',
    icon: 'i-heroicons-circle-stack',
    tools: [
      { name: 'Directus', url: 'https://directus.io', role: 'CMS headless' },
      { name: 'PostgreSQL', url: 'https://www.postgresql.org', role: 'Base de données' },
      { name: 'Redis', url: 'https://redis.io', role: 'Cache' },
      { name: 'MinIO', url: 'https://min.io', role: 'Stockage objet auto-hébergé' },
      { name: 'Typesense', url: 'https://typesense.org', role: 'Moteur de recherche' },
    ],
  },
  {
    title: 'Infrastructure & DevOps',
    icon: 'i-heroicons-server-stack',
    tools: [
      {
        name: 'Hostinger',
        url: 'https://www.hostinger.fr/vps-hebergement',
        role: 'VPS (hébergement actuel)',
      },
      { name: 'Coolify', url: 'https://coolify.io', role: 'Déploiement (PaaS auto-hébergé)' },
      { name: 'Docker', url: 'https://www.docker.com', role: 'Conteneurs' },
      { name: 'GitHub Actions', url: 'https://github.com/features/actions', role: 'CI/CD' },
      {
        name: 'SonarQube',
        url: 'https://www.sonarsource.com/products/sonarqube/',
        role: 'Qualité du code',
      },
      { name: 'Cloudflare', url: 'https://www.cloudflare.com', role: 'CDN & sécurité (cible)' },
    ],
  },
  {
    title: 'IA & automatisation',
    icon: 'i-heroicons-cpu-chip',
    tools: [
      {
        name: 'Claude Code',
        url: 'https://www.anthropic.com/claude-code',
        role: 'Développement assisté par IA',
      },
      {
        name: 'GitHub Copilot',
        url: 'https://github.com/features/copilot',
        role: 'Assistant de code',
      },
      { name: 'n8n', url: 'https://n8n.io', role: 'Automatisation des workflows' },
      {
        name: 'changedetection.io',
        url: 'https://changedetection.io',
        role: 'Surveillance des sources',
      },
      { name: 'Mistral AI', url: 'https://mistral.ai', role: 'OCR & résumés' },
      { name: 'OpenAI', url: 'https://openai.com', role: 'Traitement documentaire' },
    ],
  },
  {
    title: 'Services',
    icon: 'i-heroicons-envelope',
    tools: [
      { name: 'Brevo', url: 'https://www.brevo.com', role: 'Newsletter' },
      { name: 'Resend', url: 'https://resend.com', role: 'E-mails transactionnels' },
      { name: 'Firebase', url: 'https://firebase.google.com', role: 'Notifications push' },
    ],
  },
];

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: [
    ...keywords,
    'architecture web sénégal',
    'civic tech sénégal',
    'nuxt directus',
    'n8n automatisation',
    'typesense recherche',
    'minio stockage',
    'devops sénégal',
    'développement assisté par ia',
    'claude code',
    'coulisses techniques vie publique',
  ].join(', '),
});

// Le BreadcrumbList est émis par <AppBreadcrumb> (useSchemaOrg) - ne pas le dupliquer ici (cf. CLAUDE.md §7).
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  image: [image],
  datePublished,
  inLanguage: 'fr',
  author: { '@type': 'Organization', name: siteName, url: siteUrl },
  publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
  mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  video: {
    '@type': 'VideoObject',
    name: 'Webinaire technique #1 - Les coulisses de Vie Publique Sénégal',
    description,
    thumbnailUrl: [`https://i.ytimg.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`],
    uploadDate: datePublished,
    contentUrl: `https://youtu.be/${YOUTUBE_ID}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}`,
  },
};

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'fr_SN' },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
  ],
  script: [
    {
      key: 'ld-article',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(articleSchema),
    },
  ],
});
</script>

<template>
  <div class="container mx-auto min-h-screen max-w-3xl px-2 py-8 pb-16 md:px-4">
    <AppBreadcrumb
      :items="[
        { label: 'Webinaires techniques', to: '/tech' },
        { label: 'Les coulisses techniques' },
      ]"
    />

    <!-- En-tête -->
    <header class="mb-6">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
        Webinaire technique #1
      </p>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
        Les coulisses techniques d'une civic tech
      </h1>
      <p class="mt-3 text-gray-600 dark:text-gray-400">
        Vie Publique Sénégal est une infrastructure civique open source, construite et améliorée par
        des bénévoles. Voici comment elle fonctionne sous le capot : l'évolution de son
        architecture, nos choix techniques, notre DevOps et notre manière de développer avec l'IA.
        Pour découvrir l'association et son histoire, rendez-vous sur
        <NuxtLink
          to="/a-propos/qui-sommes-nous"
          class="text-sky-600 hover:underline dark:text-sky-400"
          >la page À propos</NuxtLink
        >.
      </p>
    </header>

    <!-- Replay du webinaire -->
    <section class="mb-10">
      <div
        class="relative w-full overflow-hidden rounded-xl bg-gray-900"
        style="padding-bottom: 56.25%"
      >
        <iframe
          :src="`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}`"
          title="Replay - Webinaire technique #1 : les coulisses de Vie Publique Sénégal"
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
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Replay de la séance du 4 juillet 2026.
      </p>
    </section>

    <!-- Le démarrage -->
    <section class="mb-12">
      <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Le démarrage</h2>
      <p class="mb-6 text-gray-600 dark:text-gray-400">
        Tout a commencé simplement. La toute première version du site a été développée et
        <strong>mise en ligne en une heure</strong> - sans backend, directement déployée depuis Git.
        L'objectif : aller vite pour confronter l'idée au réel plutôt que de peaufiner dans notre
        coin.
      </p>

      <!-- Tweet de lancement -->
      <a
        :href="tweetUrl"
        target="_blank"
        rel="noopener"
        class="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-sky-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-sky-500/40"
      >
        <UIcon
          name="i-simple-icons-x"
          class="mt-0.5 h-5 w-5 shrink-0 text-gray-900 dark:text-white"
        />
        <span class="min-w-0 flex-1">
          <span class="block text-sm text-gray-700 dark:text-gray-300">
            «&nbsp;Le projet a été poussé en production en 1&nbsp;heure.&nbsp;»
          </span>
          <span class="mt-1 block text-xs text-gray-500 dark:text-gray-400">
            Le tweet de lancement, avril 2024 - voir sur X
          </span>
        </span>
        <UIcon
          name="i-heroicons-arrow-top-right-on-square"
          class="mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-sky-500"
        />
      </a>

      <p class="mt-6 text-gray-600 dark:text-gray-400">
        Un mois après le lancement, la plateforme franchissait déjà les
        <strong>10 000 visiteurs</strong> - le signal que le besoin de transparence était bien réel.
      </p>

      <figure
        class="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700"
      >
        <img
          :src="firstVersionImage"
          alt="Capture des statistiques de la première version de Vie Publique Sénégal : plus de 10 000 visiteurs atteints un mois après le lancement"
          loading="lazy"
          class="mx-auto h-auto w-full rounded"
        />
        <figcaption class="mt-2 text-center text-xs text-gray-400">
          Premiers résultats : 10 000 visiteurs un mois après la mise en ligne
        </figcaption>
      </figure>

      <a
        :href="linkedinUrl"
        target="_blank"
        rel="noopener"
        class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
      >
        <UIcon name="i-simple-icons-linkedin" class="h-4 w-4" />
        Lire le post LinkedIn
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-3 w-3" />
      </a>
    </section>

    <!-- Évolution de l'architecture -->
    <section class="mb-12">
      <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        L'évolution de notre architecture
      </h2>
      <p class="mb-6 text-gray-600 dark:text-gray-400">
        Nous n'avons pas commencé avec l'architecture d'aujourd'hui. Elle a grandi étape par étape,
        au rythme des besoins réels et des moyens d'une association bénévole - du prototype déployé
        en une heure vers une plateforme robuste et souveraine.
      </p>

      <ol class="relative space-y-6 border-l border-gray-200 pl-6 dark:border-gray-700">
        <li v-for="step in archiSteps" :key="step.version" class="relative">
          <span
            class="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900"
            :class="
              step.target
                ? 'bg-gray-300 dark:bg-gray-600'
                : step.current
                  ? 'bg-sky-500'
                  : 'bg-gray-400 dark:bg-gray-500'
            "
          />
          <div
            class="rounded-xl border bg-white p-5 dark:bg-gray-800"
            :class="
              step.current
                ? 'border-sky-200 dark:border-sky-500/30'
                : 'border-gray-200 dark:border-gray-700'
            "
          >
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ step.year }}</span>
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="
                  step.current
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                "
              >
                {{ step.version }}
              </span>
              <span
                v-if="step.current"
                class="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400"
              >
                Actuelle
              </span>
              <span
                v-else-if="step.target"
                class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                Cible
              </span>
            </div>
            <p class="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ step.tagline }}
            </p>
            <ul class="mt-3 space-y-1.5">
              <li
                v-for="(change, i) in step.changes"
                :key="i"
                class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <UIcon
                  :name="step.target ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-plus-circle'"
                  class="mt-0.5 h-4 w-4 shrink-0"
                  :class="step.target ? 'text-gray-400' : 'text-sky-500'"
                />
                <span>{{ change }}</span>
              </li>
            </ul>

            <!-- Schéma d'architecture (fond blanc conservé en dark mode) -->
            <figure class="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-3">
              <img
                :src="step.image"
                :alt="step.imageAlt"
                loading="lazy"
                class="mx-auto h-auto w-full"
              />
              <figcaption class="mt-2 text-center text-xs text-gray-400">
                Architecture {{ step.year }} - {{ step.version }}
              </figcaption>
            </figure>
          </div>
        </li>
      </ol>
    </section>

    <!-- Notre stack technique -->
    <section class="mb-12">
      <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Notre stack technique</h2>
      <p class="mb-6 text-gray-600 dark:text-gray-400">
        Nous privilégions l'open source et l'auto-hébergement pour rester souverains et maîtriser
        nos coûts. Voici les principaux outils qui font tourner la plateforme.
      </p>

      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="group in stackGroups"
          :key="group.title"
          class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
        >
          <h3 class="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <UIcon :name="group.icon" class="h-5 w-5 text-sky-500" />
            {{ group.title }}
          </h3>
          <ul class="mt-3 space-y-2">
            <li v-for="tool in group.tools" :key="tool.name" class="text-sm leading-snug">
              <a
                :href="tool.url"
                target="_blank"
                rel="noopener"
                class="group inline-flex items-center gap-1 font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                {{ tool.name }}
                <UIcon
                  name="i-heroicons-arrow-top-right-on-square"
                  class="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </a>
              <span class="text-gray-500 dark:text-gray-400"> - {{ tool.role }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- DevOps & pipeline IA -->
    <section class="mb-12">
      <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        DevOps &amp; développement assisté par IA
      </h2>
      <p class="mb-6 text-gray-600 dark:text-gray-400">
        Avec une petite équipe bénévole, tout repose sur l'outillage : l'IA pour développer,
        l'automatisation pour traiter la donnée publique.
      </p>

      <div
        class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
      >
        <h3 class="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <UIcon name="i-heroicons-cpu-chip" class="h-5 w-5 text-sky-500" />
          Développer avec l'IA
        </h3>
        <ul class="mt-3 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check" class="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
            <span>Assistants de code : GitHub Copilot et Claude Code</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check" class="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
            <span>Méthodes de travail structurées (BMAD, etc.)</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check" class="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
            <span>
              Un fichier
              <code class="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-700"
                >claude.md</code
              >
              /
              <code class="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-700"
                >Agents.md</code
              >
              à la racine de chaque projet + des Skills sur-mesure pour donner le contexte à l'IA
            </span>
          </li>
        </ul>
      </div>

      <!-- Pipeline CI/CD -->
      <div class="mt-6">
        <h3 class="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <UIcon name="i-heroicons-arrow-path" class="h-5 w-5 text-sky-500" />
          Notre pipeline CI/CD
        </h3>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Le code est ouvert : un contributeur externe propose une Pull Request sur le dépôt
          <em>Code for Senegal</em>, qui se synchronise avec le dépôt applicatif. Chaque build passe
          par GitHub Actions (image Docker publiée au registre, contrôle qualité SonarQube), puis
          l'infrastructure récupère l'image à jour.
        </p>
        <figure class="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-3">
          <img
            src="/img/tech/webinaire1/vie-publique-sn-ci-cd.webp"
            alt="Pipeline CI/CD de Vie Publique Sénégal : Pull Request depuis le dépôt Code for Senegal, GitHub Actions, build Docker, registre GitHub, contrôle qualité SonarQube et déploiement sur la VM infra"
            loading="lazy"
            class="mx-auto h-auto w-full"
          />
          <figcaption class="mt-2 text-center text-xs text-gray-400">
            Pipeline CI/CD : de la Pull Request au déploiement
          </figcaption>
        </figure>
      </div>

      <!-- Automatisation & traitement documentaire -->
      <div class="mt-6">
        <h3 class="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <UIcon name="i-heroicons-bolt" class="h-5 w-5 text-sky-500" />
          Automatisation &amp; traitement documentaire
        </h3>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Les documents publics sont dispersés et rarement exploitables. Un workflow n8n surveille
          les sources gouvernementales (changedetection.io), déclenche le scraping, applique de
          l'OCR et du résumé via des modèles d'IA (Mistral AI, OpenAI), puis met à jour la base
          Directus.
        </p>
        <figure class="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-3">
          <img
            src="/img/tech/webinaire1/vie-publique-sn-idp.webp"
            alt="Traitement documentaire intelligent : surveillance des sources gouv.sn et Drive, workflow n8n, OCR et résumé via Mistral AI et OpenAI, mise à jour de Directus, PostgreSQL et MinIO"
            loading="lazy"
            class="mx-auto h-auto w-full"
          />
          <figcaption class="mt-2 text-center text-xs text-gray-400">
            Traitement documentaire intelligent (IDP) piloté par n8n
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Modèle de données -->
    <section class="mb-12">
      <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Notre modèle de données</h2>
      <p class="mb-4 text-gray-600 dark:text-gray-400">
        Notre objectif : bâtir la base de données publiques la plus complète et fiable du Sénégal.
        Assemblée nationale, collectivités locales, données électorales, personnalités publiques,
        budget, documents et contenus éditoriaux : tout est relié dans un référentiel cohérent.
      </p>
      <figure class="overflow-hidden rounded-lg border border-gray-200 bg-white p-3">
        <img
          src="/img/tech/webinaire1/vie-publique-sn-data.webp"
          alt="Modèle de données de Vie Publique Sénégal reliant Assemblée nationale, collectivités locales, données électorales, personnalités publiques, structure de l'État, budget, documents et contenus éditoriaux"
          loading="lazy"
          class="mx-auto h-auto w-full"
        />
        <figcaption class="mt-2 text-center text-xs text-gray-400">
          Vue d'ensemble du modèle de données publiques
        </figcaption>
      </figure>
    </section>

    <!-- L'audience aujourd'hui -->
    <section class="mb-12">
      <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        Près de 60 000 visiteurs uniques chaque mois
      </h2>
      <p class="mb-6 text-gray-600 dark:text-gray-400">
        Deux ans après ce premier cap des 10 000 visiteurs, l'audience a changé d'échelle. La
        majorité de notre trafic vient aujourd'hui de la recherche Google - signe que les pages
        répondent à de vraies questions des citoyens.
      </p>

      <!-- Chiffres clés -->
      <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <p class="text-2xl font-bold text-gray-900 dark:text-white">59&nbsp;k</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Utilisateurs actifs / mois</p>
        </div>
        <div
          class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <p class="text-2xl font-bold text-gray-900 dark:text-white">252&nbsp;k</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Pages vues / mois</p>
        </div>
        <div
          class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <p class="text-2xl font-bold text-gray-900 dark:text-white">137&nbsp;k</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Clics Google (3 mois)</p>
        </div>
        <div
          class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <p class="text-2xl font-bold text-gray-900 dark:text-white">3,42&nbsp;M</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Impressions (3 mois)</p>
        </div>
      </div>

      <!-- Google Analytics -->
      <figure class="overflow-hidden rounded-lg border border-gray-200 bg-white p-3">
        <img
          src="/img/tech/webinaire1/google-analytcis.png"
          alt="Tableau de bord Google Analytics de vie-publique.sn : 59 000 utilisateurs actifs, 481 000 événements et 252 000 vues sur le dernier mois, en hausse d'environ 45 à 50 % par rapport à la période précédente"
          loading="lazy"
          class="mx-auto h-auto w-full"
        />
        <figcaption class="mt-2 text-center text-xs text-gray-400">
          Google Analytics - fréquentation en forte croissance (+45&nbsp;% à +50&nbsp;%)
        </figcaption>
      </figure>

      <!-- Google Search Console -->
      <figure class="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-3">
        <img
          src="/img/tech/webinaire1/google-search.png"
          alt="Google Search Console de vie-publique.sn sur 3 mois : 137 000 clics, 3,42 millions d'impressions et un CTR moyen de 4 % dans les résultats de recherche"
          loading="lazy"
          class="mx-auto h-auto w-full"
        />
        <figcaption class="mt-2 text-center text-xs text-gray-400">
          Google Search Console - 137&nbsp;k clics pour 3,42&nbsp;M d'impressions sur 3&nbsp;mois
        </figcaption>
      </figure>
    </section>

    <!-- Combien ça coûte -->
    <section class="mb-12">
      <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Combien ça coûte&nbsp;?</h2>
      <p class="mb-6 text-gray-600 dark:text-gray-400">
        Par transparence, voici ce que coûte le fonctionnement de nos plateformes sur une année. Ces
        montants couvrent l'infrastructure, les licences et les services&nbsp;; ils
        <strong>n'incluent pas</strong> la rémunération des stagiaires&nbsp;: la majorité de
        l'équipe est bénévole.
      </p>

      <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <ul class="divide-y divide-gray-100 dark:divide-gray-700">
          <li
            v-for="item in costItems"
            :key="item.label"
            class="flex items-center justify-between gap-4 bg-white px-4 py-3 dark:bg-gray-800"
          >
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.label }}</span>
            <span class="flex shrink-0 items-baseline gap-2">
              <span class="w-10 text-right text-xs tabular-nums text-gray-400"
                >{{ item.pct }}%</span
              >
              <span
                class="w-32 text-right text-sm font-medium tabular-nums text-gray-900 dark:text-white"
              >
                {{ formatXOF(item.annual) }}
              </span>
            </span>
          </li>
          <li
            class="flex items-center justify-between gap-4 bg-gray-50 px-4 py-3 dark:bg-gray-900/40"
          >
            <span class="text-sm font-semibold text-gray-900 dark:text-white">Total annuel</span>
            <span class="flex shrink-0 items-baseline gap-2">
              <span class="w-10 text-right text-xs tabular-nums text-gray-400">100%</span>
              <span
                class="w-32 text-right text-sm font-bold tabular-nums text-gray-900 dark:text-white"
              >
                {{ formatXOF(costTotal) }}
              </span>
            </span>
          </li>
        </ul>
      </div>
      <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Soit environ {{ formatXOF(Math.round(costTotal / 12)) }} par mois. À elles seules, les
        licences d'IA représentent 70&nbsp;% du budget. Ces coûts sont couverts par les dons et le
        bénévolat.
      </p>
    </section>

    <!-- CTA vers les prochains webinaires -->
    <section
      class="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 class="text-lg font-bold text-gray-900 dark:text-white">
        Envie de suivre les prochaines séances ?
      </h2>
      <p class="mx-auto mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-400">
        Les prochains webinaires aborderont le chatbot, le workflow de développement IA et le DevOps
        en profondeur. Inscrivez-vous pour recevoir l'invitation par e-mail.
      </p>
      <NuxtLink
        to="/tech#formulaire"
        class="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#FFD400] px-6 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-yellow-400 active:scale-[0.98]"
      >
        S'inscrire aux webinaires
        <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
      </NuxtLink>
    </section>
  </div>
</template>
