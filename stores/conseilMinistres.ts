import { defineStore } from "pinia";

interface ConseilMinistresState {
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  isLoading: boolean;
}

export const useConseilMinistresStore = defineStore("conseilMinistres", {
  state: (): ConseilMinistresState => ({
    searchQuery: "",
    currentPage: 1,
    itemsPerPage: 9,
    totalItems: 0,
    isLoading: false,
  }),

  getters: {
    totalPages: (state) => Math.ceil(state.totalItems / state.itemsPerPage),
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    setCurrentPage(page: number) {
      this.currentPage = page;
    },

    setTotalItems(total: number) {
      this.totalItems = total;
    },

    setLoading(loading: boolean) {
      this.isLoading = loading;
    },

    resetFilters() {
      this.searchQuery = "";
      this.currentPage = 1;
    },
  },
});
