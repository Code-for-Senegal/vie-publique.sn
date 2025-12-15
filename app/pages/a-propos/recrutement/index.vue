<script setup lang="ts">
const seoTitle = 'Nos offres recrutement';
const seoDescription = 'Découvrez nos opportunités de recrutement chez Vie-publique.sn';
const seoImgPath = 'https://vie-publique.sn/images/share-linkedin.png';
const seoPageUrl = 'https://vie-publique.sn/a-propos/recrutement';

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImgPath,
  ogUrl: seoPageUrl,
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: seoImgPath,
  twitterCard: 'summary_large_image',
});

// Données hardcodées temporaires (à migrer vers Directus)
const jobs = ref([
  {
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
    status: 'expired', // Date limite dépassée
  },
  {
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
    status: 'expired', // Date limite dépassée
  },
]);

const activeJobs = computed(() => jobs.value.filter((job) => job.status === 'active'));
const expiredJobs = computed(() => jobs.value.filter((job) => job.status === 'expired'));
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="prose prose-sm mx-auto mb-8 sm:prose lg:prose-md">
      <h1 class="text-center dark:text-white">
        Rejoignez notre équipe
        <span class="mt-2 block text-lg font-normal text-gray-600 dark:text-gray-400">
          Découvrez nos opportunités
        </span>
      </h1>
    </div>

    <!-- Offres actives -->
    <div v-if="activeJobs.length > 0" class="mb-12">
      <h2 class="mb-6 text-2xl font-bold">Postes actuellement ouverts</h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <NuxtLink
          v-for="job in activeJobs"
          :key="job.id"
          :to="`/a-propos/recrutement/${job.slug}`"
          class="block"
        >
          <UCard
            class="custom-shadow hover:scale-102 group h-full transition-transform duration-300 hover:shadow-lg"
          >
            <!-- Job title -->
            <h3
              class="mb-4 text-xl font-bold text-gray-900 transition-colors group-hover:text-emerald-700 dark:text-white"
            >
              {{ job.title }}
            </h3>

            <!-- Job description -->
            <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ job.description }}</p>

            <!-- Dates -->
            <div class="mb-4 space-y-2 text-sm">
              <div class="flex items-center text-gray-800 dark:text-gray-300">
                <UIcon name="i-heroicons-calendar" class="mr-2 h-5 w-5" />
                <span>Publié le {{ $dateformatWithDayName(job.date) }}</span>
              </div>
              <div class="flex items-center text-gray-700 dark:text-gray-300">
                <UIcon name="i-heroicons-clock" class="mr-2 h-5 w-5" />
                <span>Date limite : {{ $dateformatWithDayName(job.deadline) }}</span>
              </div>
              <div class="flex items-center text-gray-700 dark:text-gray-300">
                <UIcon name="i-heroicons-banknotes" class="mr-2 h-5 w-5" />
                <span>{{ job.salary }}</span>
              </div>
            </div>

            <!-- Apply button -->
            <div class="text-right">
              <span
                class="inline-flex items-center font-medium text-emerald-700 group-hover:text-emerald-800"
              >
                Voir le poste
                <UIcon
                  name="i-heroicons-arrow-right"
                  class="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>

    <!-- Offres expirées -->
    <div v-if="expiredJobs.length > 0">
      <h2 class="mb-6 text-2xl font-bold text-gray-500 dark:text-gray-400">
        Postes pourvus ou expirés
      </h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <NuxtLink
          v-for="job in expiredJobs"
          :key="job.id"
          :to="`/a-propos/recrutement/${job.slug}`"
          class="block"
        >
          <UCard class="h-full opacity-60 transition-opacity hover:opacity-80">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">
                  {{ job.title }}
                </h3>
                <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">{{ job.description }}</p>
                <div class="flex items-center text-sm text-gray-500">
                  <UIcon name="i-heroicons-calendar" class="mr-2 h-4 w-4" />
                  <span>Date limite : {{ $dateformatWithDayName(job.deadline) }}</span>
                </div>
              </div>
              <UBadge color="gray" variant="subtle">Expiré</UBadge>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>

    <!-- Message si aucune offre -->
    <div
      v-if="activeJobs.length === 0 && expiredJobs.length === 0"
      class="mt-8 flex flex-col items-center text-center"
    >
      <UIcon name="i-heroicons-exclamation-circle" class="mb-4 h-16 w-16 text-gray-400" />
      <p class="text-xl text-gray-500 dark:text-gray-400">
        Aucun poste disponible actuellement
      </p>
      <p class="mt-2 text-gray-600 dark:text-gray-500">
        Revenez bientôt pour découvrir nos prochaines opportunités
      </p>
    </div>

    <div class="mt-12 border-t pt-8 text-center">
      <NuxtLink
        to="/a-propos/qui-sommes-nous"
        class="text-lg font-normal text-blue-600 underline hover:text-blue-800"
      >
        En savoir plus sur nous
      </NuxtLink>
    </div>
  </div>
</template>
