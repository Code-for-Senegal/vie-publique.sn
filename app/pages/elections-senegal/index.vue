<script setup lang="ts">
import { useElectoralDashboard } from '~/composables/elections/dashboard/useElectoralDashboard';

const { config, loadingConfig } = useElectoralDashboard();

const featuredElection = computed(() => {
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
    description: "Bureaux de vote",
    icon: "i-heroicons-map",
    to: "/elections-senegal/carte-electorale",
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    title: "Dashboard",
    description: "Filtres et candidats",
    icon: "i-heroicons-chart-bar",
    to: "/elections-senegal/dashboard",
    color: "text-amber-600",
    bg: "bg-amber-50"
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
        <!-- Featured Election Card -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-sm overflow-hidden">
          <div class="p-8 md:p-10 flex flex-col md:flex-row gap-10 items-start">
            <!-- Left: Info -->
            <div class="flex-1 space-y-6">
              <div class="flex items-center gap-3">
                <div class="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <UIcon name="i-heroicons-home" class="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <h1 class="text-2xl font-black uppercase tracking-tight">{{ featuredElection?.name || 'Élections Sénégal' }}</h1>
                  <p class="text-sm text-gray-500 font-bold uppercase tracking-wider italic">Plateforme d'Information Électorale</p>
                </div>
              </div>

              <!-- Mini Stats Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div class="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <p class="text-[10px] font-black uppercase text-amber-600 mb-1 tracking-widest">Calendrier</p>
                    <p class="text-xl font-black text-amber-900 dark:text-amber-400">
                      {{ featuredElection ? getStatusLabel(featuredElection.status) : '--' }}
                    </p>
                    <p class="text-[10px] text-amber-500 mt-1">Saison {{ featuredElection ? featuredElection.year : '2024' }}-{{ featuredElection ? featuredElection.year + 1 : '2025' }}</p>
                 </div>
                 <div class="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <p class="text-[10px] font-black uppercase text-emerald-600 mb-1 tracking-widest">Résultats</p>
                    <p class="text-xl font-black text-emerald-900 dark:text-emerald-400">
                        {{ featuredElection?.processed_pv_rate ? featuredElection.processed_pv_rate + '%' : (featuredElection?.status === 'completed' ? '100%' : (featuredElection?.status === 'scheduled' ? '0%' : 'En cours')) }}
                    </p>
                    <p class="text-[10px] text-emerald-500 mt-1">Taux de traitement PV</p>
                 </div>
                 <div class="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <p class="text-[10px] font-black uppercase text-blue-600 mb-1 tracking-widest">Participation</p>
                    <p class="text-xl font-black text-blue-900 dark:text-blue-400">
                      {{ featuredElection?.participation_rate ? featuredElection.participation_rate + '%' : '-- %' }}
                    </p>
                    <p class="text-[10px] text-blue-500 mt-1">Estimation nationale</p>
                 </div>
              </div>
            </div>

            <!-- Right: Description -->
            <div class="md:w-1/3 bg-slate-50/50 dark:bg-gray-800/30 p-6 rounded-2xl border dark:border-gray-800 italic">
               <p class="text-sm text-gray-500 leading-relaxed font-medium">
                  {{ featuredElection?.description || 'Suivez en direct l\'évolution du scrutin législatif et présidentiel au Sénégal. Accédez aux données officielles compilées pour une transparence totale.' }}
               </p>
            </div>
          </div>

          <NuxtLink
            v-if="featuredElection"
            :to="`/elections-senegal/dashboard?year=${featuredElection.year}&type=${featuredElection.type}&tab=resultats`"
            class="block p-4 bg-slate-50 dark:bg-gray-800/50 border-t dark:border-gray-800 text-center text-sm font-black uppercase tracking-widest text-gray-500 hover:text-primary-600 hover:bg-slate-100 transition-all"
          >
            Voir le tableau de bord complet <UIcon name="i-heroicons-arrow-right" class="ml-2 inline-block h-4 w-4" />
          </NuxtLink>
        </div>

        <!-- Quick Access Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="link in quickLinks"
            v-show="link.title !== 'Dashboard'"
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

        <!-- Section: Articles / Guide -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-sm p-10">
          <div class="flex items-center justify-between mb-8">
            <div>
               <h2 class="text-lg font-black uppercase tracking-tight">Comprendre le processus</h2>
               <p class="text-xs text-gray-500 font-bold uppercase italic tracking-wider">Guides et explications pour chaque citoyen</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Article 1 -->
            <NuxtLink to="/elections-senegal/guide-electoral" class="group">
              <div class="aspect-video bg-slate-100 dark:bg-gray-800 rounded-xl mb-4 overflow-hidden relative">
                 <img src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800" alt="Guide" class="object-cover w-full h-full opacity-80 group-hover:scale-110 transition-all duration-700" />
                 <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <UIcon name="i-heroicons-play-circle" class="absolute center-center h-12 w-12 text-white/80" />
              </div>
              <h4 class="font-black text-sm uppercase tracking-tight group-hover:text-primary-600 transition-colors">Comment voter au Sénégal ?</h4>
              <p class="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Guide pas à pas</p>
            </NuxtLink>

            <!-- Article 2 -->
            <NuxtLink to="/elections-senegal/legislation" class="group">
              <div class="aspect-video bg-slate-100 dark:bg-gray-800 rounded-xl mb-4 overflow-hidden relative">
                 <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800" alt="Legislation" class="object-cover w-full h-full opacity-80 group-hover:scale-110 transition-all duration-700" />
                 <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <UIcon name="i-heroicons-document-text" class="absolute center-center h-12 w-12 text-white/80" />
              </div>
              <h4 class="font-black text-sm uppercase tracking-tight group-hover:text-primary-600 transition-colors">Le nouveau Code Électoral</h4>
              <p class="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Législation 2024</p>
            </NuxtLink>

            <!-- Article 3 -->
            <NuxtLink to="/elections-senegal/carte-electorale" class="group">
              <div class="aspect-video bg-slate-100 dark:bg-gray-800 rounded-xl mb-4 overflow-hidden relative">
                 <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800" alt="Map" class="object-cover w-full h-full opacity-80 group-hover:scale-110 transition-all duration-700" />
                 <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <UIcon name="i-heroicons-map" class="absolute center-center h-12 w-12 text-white/80" />
              </div>
              <h4 class="font-black text-sm uppercase tracking-tight group-hover:text-primary-600 transition-colors">La Carte des bureaux</h4>
              <p class="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Données géographiques</p>
            </NuxtLink>
          </div>

          <div class="mt-12 text-center">
            <UButton to="/elections-senegal/guide-electoral" variant="soft" color="gray" class="rounded-full px-8 text-xs font-black uppercase tracking-widest">
               Voir tout le guide <UIcon name="i-heroicons-arrow-right" class="ml-2" />
            </UButton>
          </div>
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
