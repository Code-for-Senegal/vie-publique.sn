import { defineStore } from "pinia";

interface JournalOfficielState {
  searchQuery: string;
  selectedYear: string;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  isLoading: boolean;
}

export const useJournalOfficielStore = defineStore({
  id: "journalOfficiel",
  state: (): JournalOfficielState => ({
    searchQuery: "",
    selectedYear: "all",
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    isLoading: false,
  }),

  getters: {
    totalPages: (state): number => {
      return Math.ceil(state.totalItems / state.itemsPerPage);
    },
  },

  actions: {
    setSearchQuery(query: string): void {
      this.searchQuery = query;
    },

    setSelectedYear(year: string): void {
      this.selectedYear = year;
    },

    setCurrentPage(page: number): void {
      this.currentPage = page;
    },

    resetFilters(): void {
      this.searchQuery = "";
      this.selectedYear = "all";
      this.currentPage = 1;
    },

    setLoading(loading: boolean): void {
      this.isLoading = loading;
    },

    setTotalItems(total: number): void {
      this.totalItems = total;
    },
  },
});
