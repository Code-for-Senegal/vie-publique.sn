export const useElectionsWithDocuments = () => {
  const { data: electionsWithDocs } = useAsyncData(
    'elections-with-documents-ids',
    () => $fetch('/api/elections/with-documents')
  );

  return {
    electionsWithDocs
  };
};
