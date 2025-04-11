<script setup lang="ts">
import { useNews } from "~/composables/news/useNews";
import { useAssemblyQuestions } from "~/composables/useAssemblyQuestions";
import { useAssemblyVotes } from "~/composables/useAssemblyVotes";

const { news } = useNews({ category: "assemblee-nationale" });
const { questions } = useAssemblyQuestions();
const { votes } = useAssemblyVotes();

const navigationCards = [
  {
    title: "Députés",
    description: "Annuaire des députés",
    image: "/images/elections/deputes.png",
    to: "/assemblee-nationale/deputes",
  },
  {
    title: "Groupes",
    description: "Groupes parlementaires",
    image: "/images/assemblee/assemblee-bureau-1.webp",
    to: "/assemblee-nationale/groupes",
  },
  {
    title: "Commissions",
    description: "commissions permanentes",
    image: "/images/elections/assemble-1.jpg",
    to: "/assemblee-nationale/commissions",
  },
  {
    title: "Bureau",
    description: "organisation Assemblée",
    image: "/images/assemblee/el-malick-pdt-1.jpg",
    to: "/assemblee-nationale/bureau",
  },
  {
    display: true,
    image: "/images/menu/assemblee-nationale-vote-1.jpg",
    title: "Votes",
    description: "Textes et résolutions votées",
    icon: "i-heroicons-document-check",
    to: "/assemblee-nationale/votes",
    color: "bg-emerald-100 text-emerald-500 border border-emerald-50",
  },
  {
    display: true,
    image: "/images/menu/assemblee-nationale-question-1.jpg",
    title: "Questions écrites",
    description: "initiatives parlementaires",
    icon: "i-heroicons-question-mark-circle",
    to: "/assemblee-nationale/questions",
    color: "bg-emerald-100 text-emerald-500 border border-emerald-50",
  },
];

// SEO
const seoTitle =
  "Assemblée nationale du Sénégal - Activité parlementaire | Vie-Publique.sn";
const seoDescription =
  "Suivez l'activité parlementaire de l'Assemblée nationale du Sénégal : séances plénières, commissions, textes adoptés, questions au gouvernement et travaux parlementaires.";
const seoKeywords =
  "Assemblée nationale Sénégal, députés sénégalais, parlement sénégal, lois sénégal, séances plénières, commissions parlementaires";
const seoImgPath = "https://vie-publique.sn/seo-img-assemblee.png";
const seoPageUrl = "https://vie-publique.sn/assemblee-nationale";
useHead({
  title:
    "Assemblée nationale du Sénégal - Activité parlementaire | Vie-Publique.sn",
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    {
      name: "keywords",
      content: seoKeywords,
    },
    // Twitter Card Meta Tags
    {
      name: "twitter:title",
      content: seoTitle,
    },
    {
      name: "twitter:description",
      content: seoDescription,
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    // Open Graph Meta Tags
    {
      property: "og:title",
      content: seoTitle,
    },
    {
      property: "og:description",
      content: seoDescription,
    },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});
</script>

<template>
  <div>
    <!-- En-tête compacte -->
    <header class="border-b bg-white">
      <div class="container mx-auto py-4 sm:px-4">
        <div class="flex items-center justify-between">
          <div class="prose prose-sm sm:prose">
            <h1 class="">Assemblée nationale</h1>
          </div>
          <!-- <UBadge color="emerald" class="hidden md:block"> 2024 - 2029 </UBadge> -->
        </div>
        <p class="mt-2 text-sm text-gray-500">15ème législature 2024-2029</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto sm:px-4">
      <!-- Navigation Cards -->
      <div class="mb-2 grid grid-cols-2 gap-2 lg:grid-cols-3">
        <NuxtLink
          v-for="card in navigationCards"
          :key="card.title"
          :to="card.to"
          class="group relative h-20 overflow-hidden rounded-lg shadow-sm transition hover:shadow-md md:h-24"
        >
          <img
            :src="card.image"
            :alt="card.title"
            class="h-full w-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"
          ></div>
          <div class="absolute inset-0 flex items-center p-2 sm:p-4">
            <div class="text-white">
              <h3 class="text-xl font-extrabold">{{ card.title }}</h3>
              <p
                class="hidden text-sm font-medium leading-relaxed opacity-90 md:block"
              >
                {{ card.description }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
      <div class="mb-2 grid hidden grid-cols-1 gap-0">
        <NuxtLink
          to="/code-senegal/reglement-interieur-assemblee-nationale"
          class="group relative h-24 overflow-hidden rounded-lg shadow-sm transition hover:shadow-md md:h-32"
        >
          <img
            src="/images/menu/assemblee-docs.webp"
            class="h-full w-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"
          ></div>
          <div class="absolute inset-0 flex items-center p-2 sm:p-4">
            <div class="text-white">
              <h3 class="text-xl font-extrabold">Documents</h3>
              <p
                class="hidden text-sm font-medium leading-relaxed opacity-90 md:block"
              >
                Réglement intérieur, rapports, textes de loi
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
      <!-- Recent Content Sections -->
      <div>
        <!-- Version desktop -->
        <div class="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
          <!-- Latest News -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-xl font-bold">Actualités</h2>
              <NuxtLink
                to="/assemblee-nationale/actualites"
                class="flex items-center text-sm text-blue-800 hover:text-blue-800"
              >
                Voir tout
                <UIcon name="i-heroicons-arrow-right" class="ml-1 h-4 w-4" />
              </NuxtLink>
            </div>
            <AssemblyHomeNews :news="news" />
          </section>

          <!-- Latest Questions -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-xl font-bold">Questions</h2>
              <NuxtLink
                to="/assemblee-nationale/questions"
                class="flex items-center text-sm text-blue-800 hover:text-blue-800"
              >
                Voir tout
                <UIcon name="i-heroicons-arrow-right" class="ml-1 h-4 w-4" />
              </NuxtLink>
            </div>
            <AssemblyHomeQuestions :questions="questions" />
          </section>

          <!-- Latest Votes -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-xl font-bold">Derniers votes</h2>
              <NuxtLink
                to="/assemblee-nationale/votes"
                class="flex items-center text-sm text-blue-800 hover:text-blue-800"
              >
                Voir tout
                <UIcon name="i-heroicons-arrow-right" class="ml-1 h-4 w-4" />
              </NuxtLink>
            </div>
            <AssemblyHomeVotes :votes="votes" />
          </section>
        </div>

        <!-- Version mobile avec tabs -->
        <div class="md:hidden">
          <UTabs
            :items="[
              {
                id: 'news',
                label: 'Actualités',
                icon: 'i-heroicons-newspaper',
              },
              {
                id: 'questions',
                label: 'Questions',
                icon: 'i-heroicons-question-mark-circle',
              },
              { id: 'votes', label: 'Votes', icon: 'i-heroicons-check-circle' },
            ]"
          >
            <template #item="{ item }">
              <!-- En-tête de section commune -->
              <div class="mb-4 border-b border-gray-100">
                <div class="flex items-center justify-between p-2">
                  <!-- Titre de la section -->
                  <h3 class="text-lg font-semibold">
                    {{
                      item.id === "news"
                        ? "Les derniers  communiqués"
                        : item.id === "questions"
                          ? "Les questions écrites"
                          : "Les votes récents"
                    }}
                  </h3>
                  <!-- Bouton Voir tout avec style amélioré -->
                  <NuxtLink
                    :to="`/assemblee-nationale/${
                      item.id === 'news'
                        ? 'actualites'
                        : item.id === 'questions'
                          ? 'questions'
                          : 'votes'
                    }`"
                    class="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
                  >
                    Voir tout
                    <UIcon
                      name="i-heroicons-arrow-right"
                      class="ml-1.5 h-4 w-4"
                    />
                  </NuxtLink>
                </div>
              </div>
              <!-- Contenu des sections -->
              <template v-if="item.id === 'news'">
                <AssemblyHomeNews :news="news" />
              </template>
              <template v-if="item.id === 'questions'">
                <AssemblyHomeQuestions :questions="questions" />
              </template>
              <template v-if="item.id === 'votes'">
                <AssemblyHomeVotes :votes="votes" />
              </template>
            </template>
          </UTabs>
        </div>
      </div>
    </main>
  </div>
</template>
