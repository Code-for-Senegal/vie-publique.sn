// stores/itemStore.ts
import { defineStore } from "pinia";
import type { Promesse } from "~/types/promesse";

export const usePromesseStore = defineStore("promesse", {
  state: () => ({
    items: [] as Promesse[],
    selectedItem: null as Promesse | null,
  }),
  actions: {
    selectItem(item: Promesse) {
      this.selectedItem = item;
    },
  },
});
