<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
    <!-- Header sticky mobile -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95 md:relative md:border-0 md:bg-transparent md:backdrop-blur-none"
    >
      <div class="container mx-auto px-4 py-3 md:py-6">
        <h1 class="text-lg font-bold text-gray-900 dark:text-white md:text-2xl">Menu</h1>
      </div>
    </header>

    <main class="container mx-auto px-4 py-4">
      <!-- Navigation Cards - Mobile: 2 cols compact, Desktop: 3 cols -->
      <div class="grid grid-cols-2 gap-1.5 md:grid-cols-3 md:gap-3">
        <NuxtLink
          v-for="card in navigationCards"
          :key="card.title"
          :to="card.to"
          class="group flex items-center gap-2 rounded-lg bg-white p-2 ring-1 ring-gray-100 transition-all active:scale-[0.98] dark:bg-gray-800 dark:ring-gray-700 md:gap-3 md:rounded-xl md:p-4 md:hover:shadow-md md:hover:ring-gray-300"
        >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md md:h-10 md:w-10 md:rounded-lg"
            :class="cardConfigs[card.title]?.bgColor || 'bg-gray-100 dark:bg-gray-700'"
          >
            <UIcon
              :name="card.icon"
              class="h-4 w-4 transition-transform group-hover:scale-110 md:h-5 md:w-5"
              :class="cardConfigs[card.title]?.color || 'text-gray-600 dark:text-gray-400'"
            />
          </div>
          <div class="min-w-0 flex-1">
            <h3
              class="line-clamp-2 text-[11px] font-medium leading-tight text-gray-900 dark:text-white md:line-clamp-1 md:text-sm md:font-semibold"
            >
              {{ card.title }}
            </h3>
            <p class="hidden truncate text-xs text-gray-500 dark:text-gray-400 md:block">
              {{ card.description }}
            </p>
          </div>
        </NuxtLink>
      </div>

      <!-- Footer mobile only -->
      <div class="mt-8 md:hidden">
        <!-- Social Links -->
        <div class="flex items-center justify-center gap-5 pb-6">
          <ULink
            v-for="social in linksSocial"
            :key="social.label"
            :to="social.to"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors active:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
            target="_blank"
            :aria-label="social.label"
          >
            <UIcon :name="social.icon" class="h-5 w-5" />
          </ULink>
        </div>

        <!-- Quick Links -->
        <div
          class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-gray-200 py-4 dark:border-gray-700"
        >
          <ULink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {{ link.label }}
          </ULink>
        </div>

        <!-- Version -->
        <p class="text-center text-[11px] text-gray-400 dark:text-gray-500">
          v{{ version }} &copy; {{ currentYear }} Vie Publique SN
        </p>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
interface NavigationCard {
  title: string;
  description: string;
  icon: string;
  to: string;
  featureKey?: string; // Clé du feature flag pour contrôler la visibilité
}

interface CardConfig {
  color: string;
  bgColor: string;
}

interface CardConfigs {
  [key: string]: CardConfig;
}

const currentYear = new Date().getFullYear();
const appConfig = useAppConfig();
const version = appConfig.version;

// Utiliser le composable des feature flags
const { isFeatureEnabled } = useFeatureFlags();

const linksSocial = [
  {
    label: 'Linkedin',
    to: 'https://www.linkedin.com/company/vie-publique-sn',
    icon: 'i-simple-icons-linkedin',
  },
  {
    label: 'Twitter',
    to: 'https://twitter.com/ViePubliqueSN',
    icon: 'i-simple-icons-x',
  },
  {
    label: 'Facebook',
    to: 'https://www.facebook.com/ViePubliqueSenegal',
    icon: 'i-simple-icons-facebook',
  },
];

const links = [
  {
    label: 'À Propos',
    to: '/a-propos/qui-sommes-nous',
  },
  {
    label: 'Contact',
    to: '/contact',
  },
  {
    label: 'Newsletter',
    to: '/newsletter',
  },
  {
    label: 'Règles de confidentialité',
    to: '/a-propos/confidentialite',
  },
  {
    label: 'Recrutement',
    to: '/a-propos/recrutement',
  },
  {
    label: 'Partenariat',
    to: '/a-propos/travailler-avec-nous',
  },
];

const allNavigationCards: NavigationCard[] = [
  {
    title: 'Actualités',
    description: 'Toutes les actualités',
    icon: 'i-heroicons-newspaper',
    to: '/actualites',
    featureKey: 'menu_actualites',
  },
  {
    title: 'Documents',
    description: 'Journal officiel, Codes, Rapports',
    icon: 'i-heroicons-document-text',
    to: '/documents',
    featureKey: 'menu_documents',
  },
  {
    title: 'Annuaire',
    description: 'Nominations, Sites, Medias...',
    icon: 'i-heroicons-book-open',
    to: '/annuaires',
    featureKey: 'menu_annuaire',
  },
  {
    title: 'Conseil des ministres',
    description: 'Communiqués du conseil des ministres',
    icon: 'i-heroicons-building-office-2',
    to: '/conseil-des-ministres',
    featureKey: 'menu_conseil_ministres',
  },
  {
    title: 'Assemblée Nationale',
    description: "Informations sur l'Assemblée Nationale",
    icon: 'i-heroicons-building-library',
    to: '/assemblee-nationale',
    featureKey: 'menu_assemblee_nationale',
  },
  {
    title: 'Journal officiel Sénégal',
    description: 'Lois, Décrets, Arrêtés',
    icon: 'i-heroicons-newspaper',
    to: '/documents/journal-officiel',
    featureKey: 'menu_journal_officiel',
  },
  {
    title: 'Budget du Sénégal',
    description: 'Transparence des finances publiques',
    icon: 'i-heroicons-banknotes',
    to: '/budget-senegal',
    featureKey: 'menu_budget',
  },
  {
    title: 'Gouvernement du Sénégal',
    description: 'Composition du gouvernement actuel',
    icon: 'i-heroicons-building-office',
    to: '/gouvernement-senegal',
    featureKey: 'menu_gouvernement',
  },
  {
    title: 'Nominations',
    description: 'Nominations, Ministres, DG...',
    icon: 'i-heroicons-user-group',
    to: '/nomination-senegal',
    featureKey: 'menu_nominations',
  },
  {
    title: 'Élections',
    description: 'Informations sur les élections',
    icon: 'i-heroicons-clipboard-document-check',
    to: '/elections-senegal',
    featureKey: 'menu_elections',
  },
  {
    title: 'Chatbot',
    description: 'Posez vos questions sur les documents',
    icon: 'i-heroicons-chat-bubble-left-ellipsis',
    to: '/chatbot',
    featureKey: 'menu_chatbot',
  },
  {
    title: 'Recherche',
    description: 'Recherchez dans les actualités et documents',
    icon: 'i-heroicons-magnifying-glass',
    to: '/recherche',
    featureKey: 'menu_recherche',
  },
  {
    title: 'Dashbords & Observatoires',
    description: 'TEST DASHBOARD',
    icon: 'i-heroicons-chart-bar',
    to: '/dashboard',
    featureKey: 'menu_dashboard',
  },
  {
    title: 'Etat du Sénégal',
    description: "Fonctionnement de l'état, Guide, Institutions, Budget, Quiz...",
    icon: 'i-heroicons-information-circle',
    to: '/etat-senegal',
    featureKey: 'menu_etat_senegal',
  },
  {
    title: "Organigramme de l'etat",
    description: "Annuaire de l'état",
    icon: 'i-heroicons-information-circle',
    to: '/etat-senegal/annuaire',
    featureKey: 'menu_organigramme_etat',
  },
  {
    title: 'Quiz',
    description: 'Jeux QCM sur les institutions publiques',
    icon: 'i-heroicons-puzzle-piece',
    to: '/quiz',
    featureKey: 'menu_quiz',
  },
  {
    title: 'Suivi promesses électorales',
    description: 'Bientot disponible ici un outil de suivi des promesses électorales',
    icon: 'i-heroicons-document-check',
    to: '/barometre-politique/',
    featureKey: 'menu_suivi_promesses',
  },
  {
    title: 'Don avec Bictorys',
    description: 'Soutenez-nous via Bictorys',
    icon: 'i-heroicons-heart',
    to: '/don/bictorys',
    featureKey: 'menu_don_bictorys',
  },
  {
    title: 'Don avec Paydunya',
    description: 'Soutenez-nous via Paydunya',
    icon: 'i-heroicons-heart',
    to: '/don/paydunya',
    featureKey: 'menu_don_paydunya',
  },
  {
    title: 'Podcasts',
    description: 'Lives, Spaces, Interviews en replay',
    icon: 'i-heroicons-microphone',
    to: '/podcasts',
    featureKey: 'menu_podcasts',
  },
  {
    title: 'Projets Publics',
    description: 'Suivi des investissements PIP, PRES',
    icon: 'i-heroicons-clipboard-document-list',
    to: '/projets-publics',
    featureKey: 'menu_projets_publics',
  },
];

// Filtrer les cartes en fonction des feature flags
const navigationCards = computed(() =>
  allNavigationCards.filter((card) => {
    // Si pas de feature key définie, afficher par défaut
    if (!card.featureKey) return true;

    // Vérifier si la feature est activée
    return isFeatureEnabled(card.featureKey);
  }),
);

const cardConfigs: CardConfigs = {
  Actualités: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  Documents: {
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  'Assemblée Nationale': {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  'Journal officiel Sénégal': {
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  Annuaire: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  Nominations: {
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
  },
  Élections: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  'Conseil des ministres': {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  'Budget du Sénégal': {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  'Gouvernement du Sénégal': {
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  Chatbot: {
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  Quiz: {
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
  },
  'Etat du Sénégal': {
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-100 dark:bg-sky-900/30',
  },
  "Organigramme de l'etat": {
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-900/30',
  },
  'Don avec Bictorys': {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  'Don avec Paydunya': {
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
  },
  Podcasts: {
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
  },
  Recherche: {
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
  },
  'Suivi promesses électorales': {
    color: 'text-lime-600 dark:text-lime-400',
    bgColor: 'bg-lime-100 dark:bg-lime-900/30',
  },
  'Dashbord Conseil des Ministres': {
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bgColor: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
  },
  'Dashboard Corruption': {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  'Projets Publics': {
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
} as const;
</script>
