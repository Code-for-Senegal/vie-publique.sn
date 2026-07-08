<script setup lang="ts">
import { useElectoralCoalitions } from '~/composables/elections/dashboard/useElectoralCoalitions';
import { useElectoralDashboard } from '~/composables/elections/dashboard/useElectoralDashboard';
import { useNews } from '~/composables/news/useNews';

const { config, loadingConfig } = useElectoralDashboard();

const election = computed(() => {
  if (!config.value?.elections) return null;

  // 1. En cours (Priorité absolue)
  const ongoing = config.value.elections.find((e) => e.status === 'ongoing');
  if (ongoing) return ongoing;

  // 2. Terminé (Le plus récent) - PAR DÉFAUT
  const completed = config.value.elections
    .filter((e) => e.status === 'completed')
    .sort((a, b) => new Date(b.election_date).getTime() - new Date(a.election_date).getTime())[0];
  if (completed) return completed;

  // 3. Programmé (Le plus proche)
  const scheduled = config.value.elections
    .filter((e) => e.status === 'scheduled')
    .sort((a, b) => new Date(a.election_date).getTime() - new Date(b.election_date).getTime())[0];

  return scheduled;
});

// Chargement des données
// Charger les coalitions pour les élections présidentielles et législatives
const { coalitions, loading: loadingCoalitions } = useElectoralCoalitions({
  year: computed(() => election.value?.year),
  type: computed(() => election.value?.type),
  ranking: true,
  search: ref(''),
});

const {
  articles: electionNews,
  loading: loadingNews,
  error: errorNews,
} = useNews({
  category: 'Election',
  limit: 3,
  sort: '-date_published',
  syncUrl: false,
});

const winningCoalition = computed(() => {
  if (!coalitions.value || coalitions.value.length === 0) return null;
  if (election.value?.type === 'presidential') {
    return [...coalitions.value].sort(
      (a, b) => (Number(b.pourcentage) || 0) - (Number(a.pourcentage) || 0),
    )[0];
  }
  return null;
});

const topLegislativeCoalitions = computed(() => {
  if (election.value?.type !== 'legislative' || !coalitions.value) return [];
  return [...coalitions.value]
    .sort((a, b) => {
      const totalA = (Number(a.sieges) || 0) + (Number((a as any).sieges_departement) || 0);
      const totalB = (Number(b.sieges) || 0) + (Number((b as any).sieges_departement) || 0);
      return totalB - totalA;
    })
    .slice(0, 2);
});

// SEO avec Open Graph
useSeoMeta({
  title: "Élections au Sénégal | Plateforme d'Information Électorale",
  description:
    'Accédez à toutes les informations sur les élections au Sénégal : guide électoral, législation, cartographie et résultats.',
  ogTitle: 'Élections au Sénégal',
  ogDescription:
    "Plateforme d'information électorale du Sénégal : résultats, candidats, carte électorale et guide de l'électeur.",
});

const quickLinks = computed(() => [
  {
    title: 'Guide Électoral',
    description: 'Comment voter ?',
    icon: 'i-heroicons-book-open',
    to: '/elections-senegal/guide-electoral',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Législation',
    description: 'Textes de lois et décrets',
    icon: 'i-heroicons-scale',
    to: '/elections-senegal/legislation',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Carte Électorale',
    description: 'Lieux et bureaux de vote',
    icon: 'i-heroicons-map',
    to: election.value
      ? `/elections-senegal/carte-electorale?type=${election.value.type}&year=${election.value.year}`
      : '/elections-senegal/carte-electorale',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
]);

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ongoing':
      return 'En Cours';
    case 'scheduled':
      return 'Programmée';
    case 'completed':
      return 'Terminée';
    default:
      return status;
  }
};
</script>

<template>
  <div class="min-h-screen pb-16">
    <!-- Main Container -->
    <div class="container mx-auto max-w-5xl space-y-8 px-4 py-12">
      <AppBreadcrumb :items="[{ label: 'Élections' }]" />

      <!-- Hero Section -->
      <section class="mb-8 text-center">
        <div class="mx-auto max-w-4xl">
          <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Élections Sénégal
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Retrouvez ci-dessous les informations de la dernière élection
            <span v-if="election" class="text-primary-600 font-bold lowercase">
              {{
                election.type === 'presidential'
                  ? 'présidentielle'
                  : election.type === 'legislative'
                    ? 'législative'
                    : election.type === 'locale'
                      ? 'locale'
                      : ''
              }}
            </span>
            ainsi que l'ensemble des ressources électorales.
          </p>
        </div>
      </section>

      <!-- Top Section: Overview Card -->
      <div
        v-if="loadingConfig"
        class="animate-pulse rounded-3xl border bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="text-primary-500 mx-auto mb-4 h-10 w-10 animate-spin"
        />
        <p class="text-xs font-bold uppercase tracking-widest text-gray-400">
          Synchronisation des données...
        </p>
      </div>

      <template v-else>
        <!-- Featured Election Card -->
        <div
          class="group overflow-hidden rounded-3xl border bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div class="flex flex-col lg:flex-row">
            <!-- Left Panel: Election Info & Quick Actions -->
            <div class="flex flex-1 flex-col justify-center space-y-4 p-6 lg:p-8">
              <!-- Header & Badge -->
              <div class="flex flex-wrap items-center gap-3">
                <UBadge
                  :color="election.status === 'completed' ? 'green' : 'primary'"
                  variant="subtle"
                  class="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest"
                >
                  {{ election ? getStatusLabel(election.status) : '--' }}
                </UBadge>
                <div
                  class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400"
                >
                  <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5" />
                  {{
                    election
                      ? new Date(election.election_date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : ''
                  }}
                </div>
                <div
                  v-if="election.participation_rate"
                  class="ml-auto flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-500 lg:ml-0"
                >
                  <UIcon name="i-heroicons-chart-pie" class="h-3.5 w-3.5" />
                  Participation: {{ election.participation_rate }}%
                </div>
              </div>

              <!-- Title -->
              <div>
                <h2
                  class="text-2xl font-black uppercase leading-tight tracking-tighter text-gray-900 dark:text-white lg:text-3xl"
                >
                  {{ election.name || 'Élections Sénégal' }}
                </h2>
              </div>

              <!-- Specific Action Links -->
              <div
                v-if="election.status === 'completed'"
                class="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2"
              >
                <!-- Actions Présidentielle -->
                <template v-if="election.type === 'presidential'">
                  <UButton
                    to="/elections-senegal/legislation?q=resultats"
                    color="gray"
                    variant="solid"
                    size="xs"
                    icon="i-heroicons-document-check"
                    class="justify-start"
                    >Résultats Définitifs</UButton
                  >
                </template>

                <!-- Actions Législative -->
                <template v-else-if="election.type === 'legislative'">
                  <UButton
                    to="/assemblee-nationale/deputes"
                    color="gray"
                    variant="solid"
                    size="xs"
                    icon="i-heroicons-users"
                    class="justify-start"
                    >Annuaire des Députés</UButton
                  >
                  <UButton
                    to="/assemblee-nationale"
                    color="gray"
                    variant="solid"
                    size="xs"
                    icon="i-heroicons-building-library"
                    class="justify-start"
                    >Assemblée nationale</UButton
                  >
                </template>
              </div>
            </div>

            <!-- Right Panel: Results Highlight -->
            <div
              class="relative flex flex-col justify-center overflow-hidden border-t bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-800/50 lg:w-[380px] lg:border-l lg:border-t-0"
            >
              <!-- Background Decoration -->
              <div
                class="bg-primary-500/5 absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl"
              ></div>

              <!-- PRESIDENTIAL WINNER -->
              <div
                v-if="election.type === 'presidential' && winningCoalition"
                class="flex flex-row items-center gap-5"
              >
                <!-- Winner Photo/Icon -->
                <div class="relative">
                  <div
                    v-if="winningCoalition?.head_of_list?.photo"
                    class="h-20 w-20 overflow-hidden rounded-full shadow-md ring-4 ring-white dark:ring-gray-900"
                  >
                    <CmsImage
                      :src="winningCoalition.head_of_list.photo"
                      class="h-full w-full object-cover"
                    />
                  </div>
                  <div
                    v-else
                    class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-white dark:bg-emerald-900/30 dark:ring-gray-900"
                  >
                    <UIcon
                      name="i-heroicons-trophy"
                      class="h-10 w-10 text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div
                    class="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm"
                  >
                    Élu
                  </div>
                </div>

                <!-- Winner Info -->
                <div class="min-w-0 flex-1">
                  <p class="mb-1 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Président de la République
                  </p>
                  <h3 class="mb-1.5 text-lg font-black leading-none text-gray-900 dark:text-white">
                    {{ winningCoalition.head_of_list?.first_name }}
                    {{ winningCoalition.head_of_list?.last_name }}
                  </h3>
                  <div class="flex items-baseline gap-2">
                    <span
                      class="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400"
                    >
                      {{
                        winningCoalition.pourcentage
                          ? winningCoalition.pourcentage.toFixed(2) + '%'
                          : '--%'
                      }}
                    </span>
                    <span class="text-[10px] font-bold text-gray-500"
                      >{{ winningCoalition.voix?.toLocaleString() || 0 }} voix</span
                    >
                  </div>
                </div>
              </div>

              <!-- LEGISLATIVE RESULTS -->
              <div
                v-if="election.type === 'legislative' && topLegislativeCoalitions.length > 0"
                class="space-y-4"
              >
                <p
                  class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Les deux coalitions
                  en tête
                </p>
                <div class="space-y-3">
                  <div
                    v-for="(coalition, idx) in topLegislativeCoalitions.slice(0, 2)"
                    :key="coalition.id"
                    class="flex items-center justify-between"
                  >
                    <div class="flex min-w-0 items-center gap-3">
                      <div
                        :class="[
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black',
                          idx === 0
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                        ]"
                      >
                        {{ idx + 1 }}
                      </div>
                      <div class="min-w-0">
                        <p class="truncate text-xs font-bold text-gray-900 dark:text-white">
                          {{ coalition.name }}
                        </p>
                        <p class="text-[9px] text-gray-500">
                          {{ coalition.voix?.toLocaleString() || 0 }} voix
                        </p>
                      </div>
                    </div>
                    <div class="pl-4 text-right">
                      <p
                        :class="[
                          'text-lg font-black',
                          idx === 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-900 dark:text-white',
                        ]"
                      >
                        {{
                          (Number(coalition.sieges) || 0) +
                          (Number((coalition as any).sieges_departement) || 0)
                        }}
                      </p>
                      <p class="text-[8px] font-bold uppercase text-gray-400">Sièges</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Desktop: Link text -->
          <NuxtLink
            v-if="election"
            :to="`/elections-senegal/dashboard/${election.type}/${election.year}?tab=resultats`"
            class="hover:text-primary-600 hidden border-t bg-slate-50 p-4 text-center text-sm font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-slate-100 dark:border-gray-800 dark:bg-gray-800/50 md:block"
          >
            Voir le tableau de bord complet
            <UIcon name="i-heroicons-arrow-right" class="ml-2 inline-block h-4 w-4" />
          </NuxtLink>
          <!-- Mobile: Card style CTA -->
          <NuxtLink
            v-if="election"
            :to="`/elections-senegal/dashboard/${election.type}/${election.year}?tab=resultats`"
            class="from-primary-50 via-primary-100 to-primary-200 dark:from-primary-900/30 dark:via-primary-800/25 dark:to-primary-900/20 group flex items-center justify-center gap-3 border-t bg-gradient-to-br p-4 transition hover:shadow-lg dark:border-gray-800 md:hidden"
          >
            <UIcon
              name="i-heroicons-chart-bar-square"
              class="text-primary-600 dark:text-primary-400 h-6 w-6 transition group-hover:scale-110"
            />
            <span class="text-primary-800 dark:text-primary-300 text-sm font-bold">
              Tableau de bord complet
            </span>
            <UIcon
              name="i-heroicons-arrow-right"
              class="text-primary-600 dark:text-primary-400 h-4 w-4 transition group-hover:translate-x-1"
            />
          </NuxtLink>
        </div>

        <!-- Quick Access Grid  -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.title"
            :to="link.to"
            class="group flex items-center gap-5 rounded-2xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div
              :class="[link.bg, link.color]"
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
            >
              <UIcon :name="link.icon" class="h-6 w-6" />
            </div>
            <div>
              <h3
                class="group-hover:text-primary-600 text-sm font-black uppercase tracking-tight transition-colors"
              >
                {{ link.title }}
              </h3>
              <p class="text-xs text-gray-400">{{ link.description }}</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Section: Dernières actualités électorales-->
        <section class="mb-12 mt-8">
          <UCard
            class="border-primary/20 hover:border-primary/30 dark:via-primary/10 dark:to-primary/20 border-1 overflow-hidden bg-white shadow-lg transition hover:shadow-xl dark:bg-gradient-to-br dark:from-gray-800"
            :ui="{ body: { padding: 'p-4 sm:p-6' } }"
          >
            <div class="mb-6">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Actualités Électorales
              </h3>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                Analyses et mises à jour sur le processus électoral
              </p>
            </div>

            <NewsGrid
              :articles="electionNews"
              :loading="loadingNews"
              :error="errorNews"
              :limit="3"
              :show-view-all="true"
              empty-message="Aucune actualité électorale disponible pour le moment"
              view-all-text="Voir toutes les actualités"
              view-all-link="/actualites"
            />
          </UCard>
        </section>
      </template>

      <!-- Footer Simplified -->
      <div class="border-t pt-10 text-center dark:border-gray-800">
        <p class="mt-2 text-[10px] text-gray-500">
          Toutes les informations sont issues de sources officielles : DGE, Conseil Constitutionnel.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.center-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
