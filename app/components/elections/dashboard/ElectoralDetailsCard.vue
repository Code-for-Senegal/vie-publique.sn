<script setup lang="ts">
import { useElectoralFormatting } from '~/composables/elections/dashboard/useElectoralFormatting';
import type { ElectionDetails } from '~~/types/electoral-dashboard';

interface Props {
  election: ElectionDetails;
}

const props = defineProps<Props>();

const { formatDate, getStatusColor } = useElectoralFormatting();

const countdown = ref("");
let timerInterval: NodeJS.Timeout | null = null;

const updateTimer = () => {
    if (!props.election.election_date) return;

    const status = props.election.status;
    if (status !== 'scheduled' && status !== 'ongoing') {
        countdown.value = "";
        return;
    }

    const now = new Date();
    // Parse election date (YYYY-MM-DD)
    const electionDate = new Date(props.election.election_date);
    
    let targetTime: Date;
    let prefix = "";

    if (status === 'scheduled') {
        // Starts at 8:00 AM GMT
        targetTime = new Date(Date.UTC(electionDate.getFullYear(), electionDate.getMonth(), electionDate.getDate(), 8, 0, 0));
        prefix = "Ouverture du scrutin dans";
    } else { // ongoing
        // Ends at 18:00 GMT
        targetTime = new Date(Date.UTC(electionDate.getFullYear(), electionDate.getMonth(), electionDate.getDate(), 18, 0, 0));
        prefix = "Fermeture du scrutin dans";
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
    timeString += `${minutes}mn ${seconds}s`;

    countdown.value = `${prefix} ${timeString}`;
};

onMounted(() => {
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
  <UCard :ui="{ body: { padding: 'p-4 sm:p-6' }, base: 'overflow-hidden border-none shadow-xl bg-white dark:bg-gray-900 rounded-[2rem]' }">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Info Principale -->
      <div class="flex-1 space-y-4">
      <div class="flex items-center gap-3 flex-wrap">
          <UBadge :color="getStatusColor(election.status)" variant="subtle" class="rounded-full px-3 py-1 font-black uppercase text-[10px] tracking-widest whitespace-nowrap">
            {{ {
              'scheduled': 'Programmée',
              'ongoing': 'En cours',
              'completed': 'Terminée',
              'pending': 'En attente',
              'archived': 'Archivée'
            }[election.status] || election.status }}
          </UBadge>
          <UBadge v-if="countdown" color="gray" variant="solid" class="rounded-full px-3 py-1 font-black uppercase text-[10px] tracking-widest animate-pulse border border-gray-200 dark:border-gray-700 whitespace-nowrap">
            <UIcon name="i-heroicons-clock" class="mr-1 h-3 w-3" />
            {{ countdown }}
          </UBadge>
          <UBadge v-if="election.rounds" color="primary" variant="solid" class="rounded-full px-3 py-1 font-black uppercase text-[10px] tracking-widest whitespace-nowrap">
            {{ election.rounds }} Tour{{ election.rounds > 1 ? 's' : '' }}
          </UBadge>
        </div>

        <h2 class="text-3xl font-black uppercase tracking-tighter leading-none">
          {{ election.name }}
        </h2>

        <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-2xl italic">
          {{ election.description || "Informations détaillées sur le scrutin électoral, les enjeux et les modalités de vote." }}
        </p>

        <div class="flex flex-wrap gap-4 pt-2">
          <div class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-xl border dark:border-gray-800">
            <UIcon name="i-heroicons-calendar" class="text-primary-500 h-5 w-5" />
            <div>
              <p class="text-[9px] uppercase font-black text-gray-400 leading-none">Date du scrutin</p>
              <p class="text-xs font-bold">{{ formatDate(election.election_date) }}</p>
            </div>
          </div>
          <div v-if="election.date_round_2" class="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-xl border border-primary-100 dark:border-primary-900/30">
            <UIcon name="i-heroicons-calendar-days" class="text-primary-600 h-5 w-5" />
            <div>
              <p class="text-[9px] uppercase font-black text-primary-400 leading-none">Second Tour</p>
              <p class="text-xs font-bold text-primary-700 dark:text-primary-300">{{ formatDate(election.date_round_2) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendrier de Campagne -->
      <div class="lg:w-80 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
        <h4 class="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <UIcon name="i-heroicons-megaphone" class="h-4 w-4" />
          Campagne Électorale
        </h4>

        <div class="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
          <div class="relative pl-8">
            <div class="absolute left-0 top-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full border-2 border-primary-500 flex items-center justify-center z-10">
              <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
            </div>
            <p class="text-[10px] uppercase font-black text-gray-400 leading-none mb-1">Démarrage</p>
            <p class="text-sm font-bold">{{ formatDate(election.campaign_start_date) }}</p>
          </div>

          <div class="relative pl-8">
            <div class="absolute left-0 top-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center z-10">
              <div class="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            <p class="text-[10px] uppercase font-black text-gray-400 leading-none mb-1">Clôture</p>
            <p class="text-sm font-bold">{{ formatDate(election.campaign_end_date) }}</p>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
