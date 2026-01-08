<script setup lang="ts">
import { useElectoralCoalitions } from '~/composables/elections/dashboard/useElectoralCoalitions';
import { useElectoralConstituencies } from '~/composables/elections/dashboard/useElectoralConstituencies';
import { useElectoralDashboard } from '~/composables/elections/dashboard/useElectoralDashboard';
import { useNews } from '~/composables/news/useNews';

const { config, loadingConfig } = useElectoralDashboard();

const election = computed(() => {
  if (!config.value?.elections) return null;
  
  // 1. En cours (Priorité absolue)
  const ongoing = config.value.elections.find(e => e.status === 'ongoing');
  if (ongoing) return ongoing;

  // 2. Terminé (Le plus récent) - PAR DÉFAUT
  const completed = config.value.elections
    .filter(e => e.status === 'completed')
    .sort((a, b) => new Date(b.election_date).getTime() - new Date(a.election_date).getTime())[0];
  if (completed) return completed;

  // 3. Programmé (Le plus proche)
  const scheduled = config.value.elections
    .filter(e => e.status === 'scheduled')
    .sort((a, b) => new Date(a.election_date).getTime() - new Date(b.election_date).getTime())[0];
  
  return scheduled;
});

// Chargement des données (Restauré)
// Charger les coalitions pour les élections présidentielles et législatives
const {
  coalitions,
  loading: loadingCoalitions
} = useElectoralCoalitions({
  year: computed(() => election.value?.year),
  type: computed(() => election.value?.type),
  ranking: true,
  search: ref('')
});

// Charger les circonscriptions pour les élections locales
const {
  constituencies,
  loading: loadingConstituencies
} = useElectoralConstituencies({
  year: computed(() => election.value?.year),
  type: computed(() => election.value?.type),
  search: ref('')
});

const { 
  articles: electionNews, 
  loading: loadingNews, 
  error: errorNews 
} = useNews({ 
  category: 'Election',
  limit: 3,
  sort: '-date_published',
  syncUrl: false
});

const winningCoalition = computed(() => {
  if (!coalitions.value || coalitions.value.length === 0) return null;
  if (election.value?.type === 'presidential') {
    return [...coalitions.value].sort((a, b) => (Number(b.pourcentage) || 0) - (Number(a.pourcentage) || 0))[0];
  }
  return null;
});

const topLegislativeCoalitions = computed(() => {
  if (election.value?.type !== 'legislative' || !coalitions.value) return [];
  return [...coalitions.value].sort((a, b) => {
        const totalA = (Number(a.sieges) || 0) + (Number((a as any).sieges_departement) || 0);
        const totalB = (Number(b.sieges) || 0) + (Number((b as any).sieges_departement) || 0);
        return totalB - totalA;
     }).slice(0, 2);
});

const top3LocalConstituencies = computed(() => {
  if (election.value?.type !== 'locale' || !constituencies.value) return [];
  return [...constituencies.value].sort((a, b) => (Number(b.seats) || 0) - (Number(a.seats) || 0)).slice(0, 3);
});


useHead({
  title: 'Élections au Sénégal | Plateforme d\'Information Électorale',
  meta: [
    { name: 'description', content: 'Accédez à toutes les informations sur les élections au Sénégal : guide électoral, législation, cartographie et résultats.' }
  ]
});

const quickLinks = [
  {
    title: "Guide Électoral",
    description: "Comment voter ?",
    icon: "i-heroicons-book-open",
    to: "/elections-senegal/guide-electoral",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    title: "Législation",
    description: "Textes de lois et décrets",
    icon: "i-heroicons-scale",
    to: "/elections-senegal/legislation",
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    title: "Carte Électorale",
    description: "Lieux et bureaux de vote",
    icon: "i-heroicons-map",
    to: "/elections-senegal/carte-electorale",
    color: "text-purple-600",
    bg: "bg-purple-50"
  }
];

  const getStatusLabel = (status: string) => {
    switch(status) {
        case 'ongoing': return 'En Cours';
        case 'scheduled': return 'Programmée';
        case 'completed': return 'Terminée';
        default: return status;
    }
};

useHead({
  title: 'Élections au Sénégal | Plateforme d\'Information Électorale',
  meta: [
    { name: 'description', content: 'Accédez à toutes les informations sur les élections au Sénégal : guide électoral, législation, cartographie et résultats.' }
  ]
});
</script>

<template>
  <div class="min-h-screen pb-20">
    <!-- Main Container -->
    <div class="container mx-auto px-4 max-w-5xl py-12 space-y-8">

      <!-- Top Section: Overview Card -->
      <div v-if="loadingConfig" class="bg-white dark:bg-gray-900 rounded-3xl p-12 border dark:border-gray-800 shadow-sm text-center animate-pulse">
          <UIcon name="i-heroicons-arrow-path" class="h-10 w-10 animate-spin text-primary-500 mx-auto mb-4" />
          <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronisation des données...</p>
      </div>

      <template v-else>
        <!-- Featured Election Card (Compact Design) -->
        <div class="bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 shadow-sm overflow-hidden transition-all hover:shadow-md group">
          <div class="flex flex-col lg:flex-row">
            
            <!-- Left Panel: Election Info & Quick Actions -->
            <div class="flex-1 p-6 lg:p-8 flex flex-col justify-center space-y-4">
              
              <!-- Header & Badge -->
              <div class="flex flex-wrap items-center gap-3">
                <UBadge 
                  :color="election.status === 'completed' ? 'green' : 'primary'" 
                  variant="subtle" 
                  class="rounded-full px-2.5 py-0.5 font-black uppercase text-[10px] tracking-widest"
                >
                  {{ election ? getStatusLabel(election.status) : '--' }}
                </UBadge>
                <div class="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5" />
                  {{ election ? new Date(election.election_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : '' }}
                </div>
                <div v-if="election.participation_rate" class="flex items-center gap-1.5 text-blue-500 font-bold text-[10px] uppercase tracking-wider ml-auto lg:ml-0">
                  <UIcon name="i-heroicons-chart-pie" class="h-3.5 w-3.5" />
                  Participation: {{ election.participation_rate }}%
                </div>
              </div>

              <!-- Title -->
              <div>
                 <h1 class="text-2xl lg:text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-tight">
                    {{ election.name || 'Élections Sénégal' }}
                 </h1>
                 <p class="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Plateforme d'Information Électorale</p>
              </div>

              <!-- Specific Action Links (Compact Grid) -->
              <div v-if="election.status === 'completed'" class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                 <!-- Actions Présidentielle -->
                 <template v-if="election.type === 'presidential'">
                    <UButton to="/elections-senegal/legislation?q=resultats2024" color="gray" variant="solid" size="xs" icon="i-heroicons-document-check" class="justify-start">Résultats Définitifs</UButton>
                    <UButton to="/barometre-politique/diomaye-faye" color="gray" variant="solid" size="xs" icon="i-heroicons-chart-bar-square" class="justify-start">Suivi des Promesses</UButton>
                    <UButton to="/gouvernement-senegal" color="gray" variant="solid" size="xs" icon="i-heroicons-building-office" class="justify-start">Composition Gouvernement</UButton>
                 </template>

                 <!-- Actions Législative -->
                 <template v-else-if="election.type === 'legislative'">
                    <UButton to="/assemblee-nationale/deputes" color="gray" variant="solid" size="xs" icon="i-heroicons-users" class="justify-start">Annuaire des Députés</UButton>
                    <UButton to="/assemblee-nationale/votes" color="gray" variant="solid" size="xs" icon="i-heroicons-hand-raised" class="justify-start">Votes & Scrutins</UButton>
                 </template>

                 <!-- Actions Locale -->
                 <template v-else-if="election.type === 'locale'">
                    <UButton to="/mairies" color="gray" variant="solid" size="xs" icon="i-heroicons-building-library" class="justify-start">Annuaire des Maires</UButton>
                 </template>
              </div>
            </div>

            <!-- Right Panel: Results Highlight (Compact) -->
            <div class="lg:w-[380px] bg-gray-50 dark:bg-gray-800/50 border-t lg:border-t-0 lg:border-l dark:border-gray-800 p-6 flex flex-col justify-center relative overflow-hidden">
                <!-- Background Decoration -->
                <div class="absolute -right-6 -top-6 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>

                <!-- PRESIDENTIAL WINNER -->
                <div v-if="election.type === 'presidential' && winningCoalition" class="flex flex-row items-center gap-5">
                   <!-- Winner Photo/Icon -->
                   <div class="relative">
                      <div v-if="winningCoalition?.head_of_list?.photo" class="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-900 shadow-md">
                         <CmsImage :src="winningCoalition.head_of_list.photo" class="w-full h-full object-cover" />
                      </div>
                      <div v-else class="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center ring-4 ring-white dark:ring-gray-900">
                         <UIcon name="i-heroicons-trophy" class="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div class="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">Élu</div>
                   </div>

                   <!-- Winner Info -->
                   <div class="flex-1 min-w-0">
                      <p class="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Président de la République</p>
                      <h3 class="text-lg font-black text-gray-900 dark:text-white leading-none mb-1.5">
                         {{ winningCoalition.head_of_list?.first_name }} {{ winningCoalition.head_of_list?.last_name }}
                      </h3>
                      <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {{ winningCoalition.pourcentage ? winningCoalition.pourcentage.toFixed(2) + '%' : '--%' }}
                        </span>
                        <span class="text-[10px] font-bold text-gray-500">{{ winningCoalition.voix?.toLocaleString() || 0 }} voix</span>
                      </div>
                   </div>
                </div>

                <!-- LEGISLATIVE RESULTS -->
                <div v-if="election.type === 'legislative' && topLegislativeCoalitions.length > 0" class="space-y-4">
                   <p class="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Les deux coalitions en tête
                   </p>
                   <div class="space-y-3">
                      <div v-for="(coalition, idx) in topLegislativeCoalitions.slice(0, 2)" :key="coalition.id" class="flex items-center justify-between">
                          <div class="flex items-center gap-3 min-w-0">
                             <div 
                                :class="[
                                  'w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0',
                                  idx === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                ]"
                             >
                                {{ idx + 1 }}
                             </div>
                             <div class="min-w-0">
                                <p class="text-xs font-bold text-gray-900 dark:text-white truncate">{{ coalition.name }}</p>
                                <p class="text-[9px] text-gray-500">{{ coalition.voix?.toLocaleString() || 0 }} voix</p>
                             </div>
                          </div>
                          <div class="text-right pl-4">
                             <p :class="['text-lg font-black', idx === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white']">
                                {{ (Number(coalition.sieges) || 0) + (Number((coalition as any).sieges_departement) || 0) }}
                             </p>
                             <p class="text-[8px] font-bold uppercase text-gray-400">Sièges</p>
                          </div>
                      </div>
                   </div>
                </div>

                <!-- LOCAL RESULTS -->
                <div v-if="election.type === 'locale' && top3LocalConstituencies.length > 0" class="space-y-4">
                   <p class="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                      <UIcon name="i-heroicons-map" class="w-3 h-3" /> Top Circonscriptions
                   </p>
                   <div class="space-y-2">
                      <NuxtLink v-for="(constituency, idx) in top3LocalConstituencies" :key="constituency.id" 
                        :to="`/elections-senegal/dashboard?year=${election.year}&type=${election.type}&constituency=${constituency.id}`"
                        class="flex items-center justify-between p-2.5 rounded-xl hover:bg-white dark:hover:bg-gray-900 hover:shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-all group cursor-pointer"
                      >
                         <div class="flex items-center gap-3">
                             <span :class="['font-black text-xs', idx === 0 ? 'text-primary-600' : 'text-gray-400']">#{{ idx + 1 }}</span>
                             <span class="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{{ constituency.name }}</span>
                         </div>
                         <div class="flex items-center gap-1.5">
                            <span class="text-xs font-black text-gray-900 dark:text-white">{{ constituency.seats || 0 }}</span>
                            <span class="text-[8px] uppercase font-bold text-gray-400">Sièges</span>
                         </div>
                      </NuxtLink>
                   </div>
                </div>

                <!-- Fallback / Empty -->
                <div v-else class="text-center opacity-50 py-4">
                    <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p class="text-[10px] uppercase font-black tracking-widest text-gray-400">En attente des résultats</p>
                </div>
            </div>
          </div>
          <NuxtLink
            v-if="election"
            :to="`/elections-senegal/dashboard?year=${election.year}&type=${election.type}&tab=resultats`"
            class="block p-4 bg-slate-50 dark:bg-gray-800/50 border-t dark:border-gray-800 text-center text-sm font-black uppercase tracking-widest text-gray-500 hover:text-primary-600 hover:bg-slate-100 transition-all"
          >
            Voir le tableau de bord complet <UIcon name="i-heroicons-arrow-right" class="ml-2 inline-block h-4 w-4" />
          </NuxtLink>
        </div>

        <!-- Quick Access Grid (Restauré) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.title"
            :to="link.to"
            class="flex items-center gap-5 p-6 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div :class="[link.bg, link.color]" class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <UIcon :name="link.icon" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-sm font-black uppercase tracking-tight group-hover:text-primary-600 transition-colors">{{ link.title }}</h3>
              <p class="text-xs text-gray-400">{{ link.description }}</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Section: Dernières actualités électorales (Simplified) -->
        <div class="mt-8">
           <div class="flex items-center justify-between mb-6 px-2">
               <h2 class="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <span class="w-8 h-1 bg-primary-500 rounded-full"></span>
                  Actualités Électorales
               </h2>
               <UButton to="/actualites?category=Election" variant="ghost" color="gray" size="xs">
                  Voir tout <UIcon name="i-heroicons-arrow-right" class="ml-1" />
               </UButton>
           </div>
           
           <NewsGrid
             :articles="electionNews"
             :loading="loadingNews"
             :error="errorNews"
             :limit="3"
             :show-view-all="false"
             empty-message="Aucune actualité électorale disponible pour le moment"
           />
        </div>
      </template>

      <!-- Footer Simplified -->
      <div class="text-center pt-10 border-t dark:border-gray-800">
        <p class="text-[10px] text-gray-500 mt-2">Toutes les informations sont issues de sources officielles : DGE, Conseil Constitutionnel.</p>
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
