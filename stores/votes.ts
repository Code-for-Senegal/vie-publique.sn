// stores/votes.ts
import { defineStore } from "pinia";

interface Vote {
  id: number;
  status: "adopted" | "rejected";
  date: string;
  name: string;
  description: string;
  type: string;
  voters?: number;
  voters_for?: number;
  voters_against?: number;
  voters_abstention?: number;
  voters_invalid?: number;
}

export const useVotesStore = defineStore("votes", {
  state: () => ({
    votes: [] as Vote[],
    currentVote: null as Vote | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchVotes() {
      this.loading = true;
      try {
        const { data: response } = await useFetch(
          "https://api.vie-publique.sn/items/votes",
          {
            headers: {
              Authorization: `Bearer ${useRuntimeConfig().public.directusToken}`,
            },
          },
        );
        this.votes = response.value?.data || [];
      } catch (e) {
        this.error = "Erreur lors du chargement des votes";
      } finally {
        this.loading = false;
      }
    },

    setCurrentVote(vote: Vote) {
      this.currentVote = vote;
    },

    getCurrentVoteById(id: number) {
      if (!this.currentVote || this.currentVote.id !== id) {
        this.currentVote = this.votes.find((v) => v.id === id) || null;
      }
      return this.currentVote;
    },
  },
});
