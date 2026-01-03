import type { Document } from "~~/types/document";
import { type Ref, unref, computed } from "vue";

export const useElectionDocuments = (electionId: string | Ref<string | null>) => {
  const id = computed(() => unref(electionId));

  const { items, loading, error, refresh } = useCmsCollection<Document>({
    collection: 'documents',
    filters: computed(() => id.value ? { election_id: id.value } : {}),
    limit: -1,
    sort: '-publish_date'
  });

  return {
    documents: items,
    loading,
    error,
    refresh
  };
};
