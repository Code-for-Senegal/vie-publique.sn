<script setup lang="ts">
import { useElectoralFormatting } from '~/composables/elections/dashboard/useElectoralFormatting';
import type { ElectionDetails } from '~~/types/electoral-dashboard';
import type { Coalition } from "~~/types/coalition";
import type { Constituency } from "~/composables/elections/dashboard/useElectoralConstituencies";

interface Props {
  election: ElectionDetails;
  coalitions?: Coalition[];
  constituencies?: Constituency[];
}

const props = defineProps<Props>();

const { formatDate, getStatusColor } = useElectoralFormatting();

const countdown = ref("");
let timerInterval: NodeJS.Timeout | null = null;

const updateTimer = () => {
    if (!props.election.election_date || props.election.status === 'completed') return;

    const status = props.election.status;
    const now = new Date();
    const electionDate = new Date(props.election.election_date);

    let targetTime: Date;
    let prefix = "";

    if (status === 'scheduled') {
        targetTime = new Date(Date.UTC(electionDate.getFullYear(), electionDate.getMonth(), electionDate.getDate(), 8, 0, 0));
        prefix = "Ouverture dans";
    } else if (status === 'ongoing') {
        targetTime = new Date(Date.UTC(electionDate.getFullYear(), electionDate.getMonth(), electionDate.getDate(), 18, 0, 0));
        prefix = "Clôture dans";
    } else {
        return;
    }

    const diff = targetTime.getTime() - now.getTime();

    if (diff <= 0) {
        countdown.value = status === 'scheduled' ? "Scrutin ouvert" : "Scrutin clos";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let timeString = "";
    if (days > 0) timeString += `${days}j `;
    if (hours > 0 || days > 0) timeString += `${hours}h `;
    timeString += `${minutes}m ${seconds}s`;

    countdown.value = `${prefix} ${timeString}`;
};

// --- Results Logic (Completed) ---

const winningCoalition = computed(() => {
  if (!props.coalitions || props.coalitions.length === 0) return null;
  if (props.election.type === 'presidential') {
    const sorted = [...props.coalitions].sort((a, b) => (Number(b.pourcentage) || 0) - (Number(a.pourcentage) || 0));
    // Find the first coalition with a valid head_of_list
    const winner = sorted.find(c => c.head_of_list?.first_name || c.head_of_list?.last_name);
    return winner || null;
  }
  return null;
});

const topLegislativeCoalitions = computed(() => {
  if (props.election.type !== 'legislative' || !props.coalitions) return [];
  return [...props.coalitions].sort((a, b) => {
        const totalA = (Number(a.sieges) || 0) + (Number((a as any).sieges_departement) || 0);
        const totalB = (Number(b.sieges) || 0) + (Number((b as any).sieges_departement) || 0);
        return totalB - totalA;
     }).slice(0, 2);
});


const electionYear = computed(() => {
  if (!props.election.election_date) return 'all';
  return new Date(props.election.election_date).getFullYear().toString();
});

const quickLinks = computed(() => {
  const links = [];
  if (props.election.type === 'presidential') {
    links.push({
      label: 'Résultats définitifs',
      description: 'Proclamés par le Conseil Constitutionnel.',
      to: `/elections-senegal/legislation?type=${props.election.type}&year=${electionYear.value}&q=resultats`,
      icon: 'i-heroicons-document-text'
    });
  } else if (props.election.type === 'legislative') {
    links.push({
      label: 'Annuaire des députés',
      description: 'Liste et profils des représentants.',
      to: '/assemblee-nationale/deputes',
      icon: 'i-heroicons-users'
    });
    links.push({
      label: 'Assemblée nationale',
      description: 'Dashboard de l\'Assemblée nationale.',
      to: '/assemblee-nationale',
      icon: 'i-heroicons-building-library'
    });
  }
  return links;
});

onMounted(() => {
    updateTimer();
    if (props.election.status !== 'completed') timerInterval = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
  <UCard :ui="{ body: { padding: 'p-0' }, base: 'overflow-hidden border-none shadow-md bg-white dark:bg-gray-950 rounded-[1.5rem]' }">
    <!-- View: COMPLETED (Compact & Focused) -->
    <div v-if="election.status === 'completed'" class="flex flex-col lg:flex-row">
      <!-- Info Section -->
      <div class="flex-1 p-4 lg:p-5 space-y-3">
        <div class="flex items-center gap-3">
          <UBadge color="green" variant="subtle" class="rounded-full px-2.5 py-0.5 font-black uppercase text-[9px] tracking-widest">
            Terminée
          </UBadge>
          <div class="flex items-center gap-1 text-gray-400 font-bold text-[9px] uppercase tracking-wider">
            <UIcon name="i-heroicons-calendar" class="h-3 w-3" />
            {{ formatDate(election.election_date) }}
          </div>
        </div>

        <h2 class="text-lg lg:text-xl font-black uppercase tracking-tight leading-none text-gray-900 dark:text-white">
          {{ election.name }}
        </h2>

        <!-- Action Links -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <NuxtLink
              v-for="link in quickLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-2.5 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-800 hover:border-primary-500/50 transition-all group"
            >
              <div class="p-1.5 bg-white dark:bg-gray-900 rounded-lg shadow-sm text-primary-600 group-hover:scale-105 transition-transform shrink-0">
                <UIcon :name="link.icon" class="h-4 w-4" />
              </div>
              <div class="min-w-0">
                <p class="text-[9px] font-black uppercase tracking-wider text-gray-900 dark:text-white leading-none mb-0.5">{{ link.label }}</p>
                <p class="text-[8px] font-medium text-gray-500 truncate">{{ link.description }}</p>
              </div>
            </NuxtLink>
        </div>
      </div>

      <!-- Results Section -->
      <div class="lg:w-[320px] bg-gray-50 dark:bg-gray-900/50 p-5 lg:p-6 border-l dark:border-gray-800 flex flex-col justify-center">

          <!-- Presidential Winner -->
          <div v-if="election.type === 'presidential' && winningCoalition && winningCoalition.head_of_list" class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
              <CmsImage
                v-if="winningCoalition.head_of_list?.photo"
                :src="winningCoalition.head_of_list.photo"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="min-w-0">
                  <p class="text-[8px] uppercase font-black text-primary-600 dark:text-primary-400 tracking-widest mb-0.5">Vainqueur</p>
                  <h3 class="font-black text-gray-900 dark:text-white leading-tight mb-0.5 text-sm">
                      {{ winningCoalition.head_of_list?.first_name }} {{ winningCoalition.head_of_list?.last_name }}
                  </h3>
                  <p class="text-2xl font-black text-primary-600 tracking-tighter leading-none">{{ parseFloat(String(winningCoalition.pourcentage)).toFixed(2) }}%</p>
              </div>
          </div>

          <!-- Legislative Sièges -->
          <div v-else-if="election.type === 'legislative' && topLegislativeCoalitions.length > 0" class="space-y-4">
              <p class="text-[9px] uppercase font-black text-gray-400 tracking-widest">Répartition des sièges</p>
              <div class="grid grid-cols-2 gap-3">
                  <div v-for="(col, idx) in topLegislativeCoalitions" :key="col.id"
                    class="bg-white dark:bg-gray-950 p-3 rounded-2xl border dark:border-gray-800 shadow-sm"
                  >
                      <p class="text-[8px] font-black uppercase text-gray-400 truncate">{{ col.acronym || col.name }}</p>
                      <p class="text-xl font-black text-primary-600">{{ (Number(col.sieges) || 0) + (Number((col as any).sieges_departement) || 0) }}</p>
                      <p class="text-[8px] font-bold text-gray-500">{{ idx === 0 ? 'Majorité' : 'Opposition' }}</p>
                  </div>
              </div>
          </div>

          <!-- Placeholder -->
          <div v-else class="text-center opacity-40">
              <UIcon name="i-heroicons-pause-circle" class="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p class="text-[9px] font-black uppercase tracking-widest text-gray-400">Calcul des résultats...</p>
          </div>
      </div>
    </div>

    <!-- View: ONGOING / SCHEDULED -->
    <div v-else class="flex flex-col lg:flex-row">
      <div class="flex-1 p-6 lg:p-8 space-y-4">
        <div class="flex items-center gap-3">
          <UBadge :color="getStatusColor(election.status)" variant="subtle" class="rounded-full px-3 py-1 font-black uppercase text-[10px] tracking-widest">
            {{ { 'scheduled': 'Programmée', 'ongoing': 'En cours', 'pending': 'À venir' }[election.status] || election.status }}
          </UBadge>
          <div v-if="countdown" class="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-500 animate-pulse">
            <UIcon name="i-heroicons-clock" class="h-3.5 w-3.5" />
            {{ countdown }}
          </div>
        </div>

        <h2 class="text-2xl font-black uppercase tracking-tighter leading-tight text-gray-900 dark:text-white">
          {{ election.name }}
        </h2>

        <div class="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <div class="flex items-center gap-1.5">
             <UIcon name="i-heroicons-calendar" class="h-4 w-4 text-primary-500" />
             Scrutin: {{ formatDate(election.election_date) }}
          </div>
          <div v-if="election.rounds > 1" class="flex items-center gap-1.5">
             <UIcon name="i-heroicons-arrow-path" class="h-4 w-4 text-primary-500" />
             {{ election.rounds }} Tours
          </div>
        </div>
      </div>

      <!-- Campaign Simple Footer/Sideline -->
      <div class="lg:w-64 bg-gray-50 dark:bg-gray-900 p-6 flex flex-col justify-center border-l dark:border-gray-800">
          <div class="space-y-3">
             <p class="text-[9px] uppercase font-black text-gray-400 tracking-widest">Campagne électorale</p>
             <div class="space-y-1">
                <p class="text-xs font-black dark:text-white flex justify-between">
                   <span class="text-gray-400 font-bold uppercase text-[8px]">Incipit:</span>
                   {{ formatDate(election.campaign_start_date) || '—' }}
                </p>
                <p class="text-xs font-black dark:text-white flex justify-between">
                   <span class="text-gray-400 font-bold uppercase text-[8px]">Clôture:</span>
                   {{ formatDate(election.campaign_end_date) || '—' }}
                </p>
             </div>
          </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>
