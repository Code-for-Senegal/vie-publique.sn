// composables/useDepute.ts
import { ref } from 'vue';
import { useVote } from './useVote';
import deputies from '@/assets/data/parliament/deputies.json';
import type { Deputy } from '@/types/deputy';

export const useDepute = (deputyId: number) => {
    const deputy = ref<Deputy | null>(null);
    const { votes, loading, fetchDeputyVotes } = useVote();

    onMounted(async () => {
        // Rechercher le député dans les données locales
        const foundDeputy = deputies.find((depute: Deputy) => depute.id === deputyId);

        if (!foundDeputy) {
            throw new Error('Député non trouvé');
        }

        // Récupérer les votes du député
        await fetchDeputyVotes(deputyId);

        deputy.value = {
            ...foundDeputy,
            votes: votes.value,
        };
    });

    return {deputy, loading};
};