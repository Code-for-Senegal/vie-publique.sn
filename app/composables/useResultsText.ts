export interface ResultsTextOptions {
  totalItems: Ref<number> | number;
  currentPage: Ref<number> | number;
  itemsPerPage: Ref<number> | number;
  searchQuery: Ref<string> | string;
  filterType?: Ref<string> | string;
  documentType?: Ref<string> | string;
  customLabels?: {
    singular?: string;
    plural?: string;
    noResults?: string;
    noResultsWithSearch?: string;
  };
}

export const useResultsText = (options: ResultsTextOptions) => {
  const totalItems = unref(options.totalItems);
  const currentPage = unref(options.currentPage);
  const itemsPerPage = unref(options.itemsPerPage);
  const searchQuery = unref(options.searchQuery);
  const filterType = unref(options.filterType || "");
  const documentType = unref(options.documentType || "");

  const labels = {
    singular: options.customLabels?.singular || "document",
    plural: options.customLabels?.plural || "documents",
    noResults: options.customLabels?.noResults || "Aucun résultat trouvé",
    noResultsWithSearch:
      options.customLabels?.noResultsWithSearch ||
      'Aucun résultat trouvé pour "{search}"',
    ...options.customLabels,
  };

  const currentPageStart = (currentPage - 1) * itemsPerPage + 1;
  const currentPageEnd = Math.min(
    currentPageStart + itemsPerPage - 1,
    totalItems,
  );

  const searchText = searchQuery ? ` pour "${searchQuery}"` : "";

  // Texte pour le type de filtre (organisme, année, etc.)
  let filterText = "";
  if (filterType && filterType !== "all") {
    if (documentType === "audit_report") {
      filterText = ` de ${filterType}`;
    } else if (documentType === "official_journal") {
      filterText = ` de ${filterType}`;
    } else {
      filterText = ` de type "${filterType}"`;
    }
  }

  if (totalItems === 0) {
    return searchQuery
      ? labels.noResultsWithSearch.replace("{search}", searchQuery)
      : labels.noResults;
  }

  if (totalItems === 1) {
    return `1 ${labels.singular} trouvé${searchText}${filterText}`;
  }

  if (totalItems <= itemsPerPage) {
    return `${totalItems} ${labels.plural} trouvés${searchText}${filterText}`;
  }

  return `${currentPageStart}-${currentPageEnd} sur ${totalItems} ${labels.plural}${searchText}${filterText}`;
};
