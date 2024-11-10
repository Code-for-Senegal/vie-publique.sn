// stores/departments.ts
import { defineStore } from "pinia";
import { departmentsData } from "@/assets/data/departments";
import type { MapState, DepartmentGeoData } from "@/types/departments";

export const useDepartmentsStore = defineStore("departments", {
  state: (): MapState => ({
    selectedDepartment: null,
    hoveredDepartment: null,
    departments: departmentsData,
  }),

  getters: {
    getDepartmentById: (state) => (id: string) => {
      return state.departments.find((dept) => dept.id === id);
    },
  },

  actions: {
    setSelectedDepartment(id: string | null) {
      this.selectedDepartment = id;
    },

    setHoveredDepartment(id: string | null) {
      this.hoveredDepartment = id;
    },
  },
});
