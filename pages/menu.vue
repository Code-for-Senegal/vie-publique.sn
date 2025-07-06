<template>
  <div class="container mx-auto px-4 py-8">
    <!-- <h1 class="mb-8 text-center text-2xl font-bold text-gray-800">
      Tous les menus
    </h1> -->

    <div
      class="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3"
    >
      <NuxtLink
        v-for="card in navigationCards"
        :key="card.title"
        :to="card.to"
        class="group block"
      >
        <div
          class="custom-shadow flex items-center gap-2 rounded-xl bg-white p-3 shadow-md shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:bg-gray-700/80 hover:shadow-xl sm:p-4 dark:bg-gray-800/80 dark:ring-1 dark:ring-gray-700 dark:backdrop-blur-md"
        >
          <div class="flex-shrink-0">
            <UIcon
              :name="card.icon"
              class="h-6 w-6 transition-transform duration-200 group-hover:scale-110"
              :class="[cardConfigs[card.title]?.color || 'text-gray-600']"
            />
          </div>

          <div class="min-w-0 flex-1">
            <h3
              class="line-clamp-2 text-sm font-medium leading-tight text-gray-900 sm:line-clamp-1 sm:text-base dark:text-white"
            >
              {{ card.title }}
            </h3>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Footer pour mobile -->
    <div class="mt-8 block md:hidden">
      <div class="flex items-center justify-center gap-6 pb-4">
        <ULink
          v-for="social in linksSocial"
          :key="social.label"
          :to="social.to"
          class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          target="_blank"
          :aria-label="social.label"
        >
          <UIcon :name="social.icon" class="h-8 w-8" />
        </ULink>
      </div>

      <div class="flex flex-col items-center justify-center gap-4">
        <ul class="flex flex-col items-center gap-4">
          <li v-for="link in links" :key="link.label">
            <ULink
              :to="link.to"
              class="text-sm text-gray-500 underline hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {{ link.label }}
            </ULink>
          </li>
        </ul>
      </div>
      <div class="mt-4 flex flex-col items-center py-4 text-sm text-gray-500">
        Version {{ version }} &copy; {{ currentYear }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NavigationCard {
  title: string;
  description: string;
  icon: string;
  to: string;
}

interface CardConfig {
  color: string;
}

interface CardConfigs {
  [key: string]: CardConfig;
}

const currentYear = new Date().getFullYear();
const appConfig = useAppConfig();
const version = appConfig.version;

const linksSocial = [
  {
    label: "Linkedin",
    to: "https://www.linkedin.com/company/vie-publique-sn",
    icon: "i-simple-icons-linkedin",
  },
  {
    label: "Twitter",
    to: "https://twitter.com/ViePubliqueSN",
    icon: "i-simple-icons-x",
  },
  {
    label: "Facebook",
    to: "https://www.facebook.com/ViePubliqueSenegal",
    icon: "i-simple-icons-facebook",
  },
];

const links = [
  {
    label: "À Propos",
    to: "/a-propos/qui-sommes-nous",
  },
  {
    label: "Contact",
    to: "/contact",
  },
  {
    label: "Newsletter",
    to: "/newsletter",
  },
  {
    label: "Règles de confidentialité",
    to: "/about/privacy",
  },
  {
    label: "Recrutement",
    to: "/a-propos/recrutement",
  },
  {
    label: "Partenariat",
    to: "/a-propos/travailler-avec-nous",
  },
];

const navigationCards: NavigationCard[] = [
  {
    title: "Actualités",
    description: "Toutes les actualités",
    icon: "i-heroicons-newspaper",
    to: "/actualites",
  },
  {
    title: "Documents",
    description: "Journal officiel, Codes, Rapports",
    icon: "i-heroicons-document-text",
    to: "/documents",
  },
  {
    title: "Assemblée Nationale",
    description: "Informations sur l'Assemblée Nationale",
    icon: "i-heroicons-building-library",
    to: "/assemblee-nationale",
  },
  {
    title: "Journal officiel Sénégal",
    description: "Lois, Décrets, Arrêtés",
    icon: "i-heroicons-newspaper",
    to: "/documents/journal-officiel",
  },
  {
    title: "Conseil des ministres",
    description: "Communiqués du conseil des ministres",
    icon: "i-heroicons-building-office-2",
    to: "/conseil-des-ministres",
  },
  {
    title: "Budget du Sénégal",
    description: "Loi de finances 2025",
    icon: "i-heroicons-banknotes",
    to: "/budget-senegal",
  },
  {
    title: "Annuaire",
    description: "Nominations, Sites, Medias...",
    icon: "i-heroicons-book-open",
    to: "/annuaires",
  },
  {
    title: "Nominations",
    description: "Nominations, Ministres, DG...",
    icon: "i-heroicons-user-group",
    to: "/nomination-senegal",
  },
  {
    title: "Élections",
    description: "Informations sur les élections",
    icon: "i-heroicons-clipboard-document-check",
    to: "/elections",
  },
  {
    title: "Chatbot",
    description: "Posez vos questions sur les documents",
    icon: "i-heroicons-chat-bubble-left-ellipsis",
    to: "/chatbot",
  },
  // {
  //   title: "Chatbot V2",
  //   description: "Posez vos questions sur les documents",
  //   icon: "i-heroicons-chat-bubble-left-ellipsis",
  //   to: "/chat-bot",
  // },
  {
    title: "Dashbord Conseil des Ministres",
    description: "TEST DASHBOARD",
    icon: "i-heroicons-chart-bar",
    to: "/dashboard/conseil-ministre",
  },
  {
    title: "Etat du Sénégal",
    description:
      "Fonctionnement de l'état, Guide, Institutions, Budget, Quiz...",
    icon: "i-heroicons-information-circle",
    to: "/etat-senegal",
  },
  {
    title: "Quiz",
    description: "Jeux QCM sur les institutions publiques",
    icon: "i-heroicons-puzzle-piece",
    to: "/quiz",
  },
  {
    title: "Suivi promesses électorales",
    description:
      "Bientot disponible ici un outil de suivi des promesses électorales",
    icon: "i-heroicons-document-check",
    to: "/barometre-politique/",
  },
];

const cardConfigs: CardConfigs = {
  Actualités: {
    color: "text-blue-600",
  },
  Documents: {
    color: "text-indigo-600",
  },
  "Assemblée Nationale": {
    color: "text-red-600",
  },
  "Journal officiel Sénégal": {
    color: "text-yellow-500",
  },
  Annuaire: {
    color: "text-emerald-600",
  },
  Nominations: {
    color: "text-emerald-600",
  },
  Élections: {
    color: "text-amber-600",
  },
  "Conseil des ministres": {
    color: "text-violet-600",
  },
  "Budget du Sénégal": {
    color: "text-orange-600",
  },
  Chatbot: {
    color: "text-cyan-600",
  },
  Quiz: {
    color: "text-yellow-600",
  },
  "Etat du Sénégal": {
    color: "text-blue-600",
  },
} as const;
</script>

<style scoped>
.footer-mobile {
  border-top: 2px solid #fff;
  border-image: linear-gradient(45deg, green 33%, #ff0 67%, red) 5;
}
</style>
