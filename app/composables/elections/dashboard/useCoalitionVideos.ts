import { type Ref, unref, computed } from "vue";

export const useCoalitionVideos = (coalitionId: string | number | Ref<string | number | null | undefined>) => {
  const id = computed(() => unref(coalitionId));

  const { data, pending, error, refresh } = useAsyncData(
    () => `coalition-videos-${id.value}`,
    () => {
      if (!id.value) {
        return Promise.resolve({ data: [] });
      }
      return $fetch<{ data: any[] }>('/api/elections/dashboard/coalition-videos', {
        query: { coalitionId: id.value }
      });
    },
    {
      watch: [id],
      immediate: !!id.value
    }
  );

  const videos = computed(() => data.value?.data || []);

  return {
    videos,
    loading: pending,
    error,
    refresh
  };
};
