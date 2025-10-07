import { defineStore } from "pinia";

interface CollectionState {
  searchQuery: string;
  selectedFilter: string;
  sortBy: string;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  currentCollection?: string;
}

export const useCollectionStore = defineStore("collection", {
  state: (): CollectionState => ({
    searchQuery: "",
    selectedFilter: "all",
    sortBy: "-publish_date", // ou '-date_created' selon le contexte
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    currentCollection: undefined,
  }),

  getters: {
    totalPages: (state): number =>
      Math.ceil(state.totalItems / state.itemsPerPage),
    hasActiveFilters: (state): boolean =>
      state.searchQuery !== "" || state.selectedFilter !== "all",
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },
    setSelectedFilter(filter: string) {
      this.selectedFilter = filter;
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
    setCurrentCollection(collection: string) {
      this.currentCollection = collection;
    },
    resetFilters() {
      this.searchQuery = "";
      this.selectedFilter = "all";
      this.currentPage = 1;
    },
  },
});
