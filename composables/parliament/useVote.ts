// composables/useVote.ts
import { ref, computed } from 'vue'
import votesLocal from '@/assets/data/parliament/votes.json'
import motionsLocal from '@/assets/data/parliament/motions.json'
import type { Vote } from '@/types/vote'

export const useVote = () => {
  const votes = ref<Vote[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchDeputyVotes = async (deputyId: number) => {
    loading.value = true;
    error.value = null;

    try {
      if (process.env.NODE_ENV !== 'production') {
        // Filtrer les votes du député
        const deputyVotes = votesLocal.filter(vote => vote.deputy_id === deputyId);
        votes.value = deputyVotes;

        // Récupérer uniquement les motions liées aux votes du député
        deputyVotes.map(vote => {
            const motion = motionsLocal.find(motion => motion.id === vote.motion_id);
            if (motion) {
                vote.motion = motion;
            }
        });
      } else {
        // En prod, appel API
        const config = useRuntimeConfig();
        const response = await fetch(
          `https://cms.vie-publique.sn/items/votes?filter[deputy_id][_eq]=${deputyId}&fields=*,motion.*`,
          {
            headers: {
              Authorization: `Bearer ${config.public.cmsApiKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        votes.value = data.data;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error('Erreur lors du chargement des votes:', err);
    } finally {
      loading.value = false;
    }
  };

  return {
    votes,
    loading,
    error,
    fetchDeputyVotes,
  };
};