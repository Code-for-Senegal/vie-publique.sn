export function useElectoralFormatting() {
  const config = useRuntimeConfig();

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      'scheduled': 'orange',
      'registration': 'blue',
      'campaign': 'yellow',
      'ongoing': 'primary',
      'completed': 'green'
    };
    return map[status] || 'primary';
  };

  const getCoalitionColor = (color: string | null) => color || '#10b981';

  const getCmsAsset = (id: string | null) => {
    if (!id) return null;
    const baseUrl = config.public.cmsLocalApiUrl ||
                     config.public.sunuElectionApiUrl ||
                     'https://cms.vie-publique.sn';
    return `${baseUrl}/assets/${id}`;
  };

  return { formatDate, getStatusColor, getCoalitionColor, getCmsAsset };
}
