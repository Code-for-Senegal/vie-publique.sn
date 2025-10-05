import { defineStore } from "pinia";

interface PublicDocumentsState {
  searchQuery: string;
  selectedType: string;
  sortBy: string;
  currentPage: number;
  itemsPerPage: number | 10;
  totalItems: number;
}

export const useDocumentsStore = defineStore("documents", {
  state: (): PublicDocumentsState => ({
    searchQuery: "",
    selectedType: "all",
    sortBy: "-publish_date",
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  }),

  getters: {
    totalPages: (state): number =>
      Math.ceil(state.totalItems / state.itemsPerPage),
    hasActiveFilters: (state): boolean =>
      state.searchQuery !== "" ||
      state.selectedType !== "all" ||
      state.sortBy !== "-publish_date",
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },
    setSelectedType(type: string) {
      this.selectedType = type;
    },
    setSortBy(sort: string) {
      this.sortBy = sort;
    },
    setCurrentPage(page: number) {
      this.currentPage = page;
    },
    setTotalItems(total: number) {
      this.totalItems = total;
    },
    resetFilters() {
      this.searchQuery = "";
      this.selectedType = "all";
      this.sortBy = "-publish_date";
      this.currentPage = 1;
    },
  },
});
