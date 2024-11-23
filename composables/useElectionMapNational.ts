import type {
  PollingStation,
  DepartmentStats,
} from "~/types/election-map-national";

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export function useElectionData() {
  const config = useRuntimeConfig();
  const baseURL = `${config.public.cmsApiUrl}/items/election_map_national`;
  const CACHE_DURATION = {
    departments: 3600000, // 1 heure pour la liste des départements
    details: 1800000, // 30 minutes pour les détails d'un département
  };

  // Fonction utilitaire pour vérifier la validité du cache
  const isCacheValid = (timestamp: number, duration: number) => {
    return Date.now() - timestamp < duration;
  };

  // Fonction pour récupérer les données du cache
  const getFromCache = <T>(key: string, duration: number): T | null => {
    if (process.server) return null;

    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached) as CacheData<T>;
    if (!isCacheValid(timestamp, duration)) {
      sessionStorage.removeItem(key);
      return null;
    }

    return data;
  };

  // Fonction pour mettre en cache les données
  const setInCache = <T>(key: string, data: T) => {
    if (process.server) return;

    sessionStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    );
  };

  // Récupération de la liste des départements avec statistiques
  const fetchDepartmentsStats = () => {
    return useFetch<{ data: DepartmentStats[] }>(baseURL, {
      key: "departments-stats",
      params: {
        groupBy: ["department"],
        aggregate: {
          count: ["polling_place", "office_number"],
          sum: ["voters"],
          countDistinct: ["municipality", "polling_place"],
        },
      },
      headers: {
        Authorization: `Bearer ${config.public.cmsApiKey}`,
      },
      transform: (response) => response.data,
      cache: "force-cache",
      getCachedData: (key) =>
        getFromCache<DepartmentStats[]>(key, CACHE_DURATION.departments),
      setCachedData: (key, data) => setInCache(key, data),
      watch: false,
      server: false,
    });
  };

  // Récupération des détails d'un département spécifique
  const fetchDepartmentDetails = (department: string) => {
    const cacheKey = `department-${department}`;

    return useFetch<{ data: PollingStation[] }>(baseURL, {
      key: cacheKey,
      params: {
        filter: {
          department: {
            _eq: department,
          },
        },
        limit: 2000,
        sort: ["municipality", "polling_place", "office_number"],
      },
      headers: {
        Authorization: `Bearer ${config.public.cmsApiKey}`,
      },
      transform: (response) => response.data,
      cache: "force-cache",
      getCachedData: (key) =>
        getFromCache<PollingStation[]>(key, CACHE_DURATION.details),
      setCachedData: (key, data) => setInCache(key, data),
      watch: false,
      server: false,
    });
  };

  // Fonction pour rafraîchir manuellement les données
  const refreshData = async (department?: string) => {
    if (process.server) return;

    if (department) {
      // Rafraîchir les données d'un département spécifique
      const cacheKey = `department-${department}`;
      sessionStorage.removeItem(cacheKey);
      await fetch(`${baseURL}?department=${department}`, { cache: "reload" });
      return fetchDepartmentDetails(department);
    } else {
      // Rafraîchir la liste complète des départements
      sessionStorage.removeItem("departments-stats");
      await fetch(baseURL, { cache: "reload" });
      return fetchDepartmentsStats();
    }
  };

  // Fonction pour vider le cache
  const clearCache = (department?: string) => {
    if (process.server) return;

    if (department) {
      sessionStorage.removeItem(`department-${department}`);
    } else {
      // Supprimer tous les caches liés aux élections
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("department-") || key === "departments-stats") {
          sessionStorage.removeItem(key);
        }
      });
    }
  };

  // Stats en temps réel pour un département
  const getDepartmentStats = (department: string) => {
    return useFetch<{ data: DepartmentStats[] }>(baseURL, {
      key: `department-stats-${department}`,
      params: {
        filter: {
          department: {
            _eq: department,
          },
        },
        groupBy: ["department"],
        aggregate: {
          count: ["office_number"],
          sum: ["voters"],
          countDistinct: ["municipality", "polling_place"],
        },
      },
      headers: {
        Authorization: `Bearer ${config.public.cmsApiKey}`,
      },
      transform: (response) => response.data[0], // Retourne directement les stats du département
      watch: false,
      server: false,
    });
  };

  return {
    fetchDepartmentsStats,
    fetchDepartmentDetails,
    getDepartmentStats,
    refreshData,
    clearCache,
  };
}
