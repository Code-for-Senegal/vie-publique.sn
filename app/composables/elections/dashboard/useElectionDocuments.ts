import type { Document } from "~~/types/document";
import { type Ref, unref, computed } from "vue";

/**
 * Composable pour récupérer les documents liés à une élection spécifique
 * Utilise la relation O2M directe : documents.election_id -> elections.id
 */
export const useElectionDocuments = (electionId: string | Ref<string | null>) => {
  const id = computed(() => unref(electionId));

  // Utiliser useCmsCollection pour récupérer les documents via la route serveur
  const { items, loading, error, refresh } = useCmsCollection<Document>({
    collection: 'documents',
    filters: computed(() => id.value ? { election_id: id.value } : {}),
    limit: -1, // Pas de limite pour récupérer tous les documents de l'élection
    sort: '-publish_date'
  });

  return {
    documents: items,
    loading,
    error,
    refresh
  };
};
