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

  const calculateAge = (birthdate: string | null) => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getYoutubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    // Handle various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

  return { formatDate, getStatusColor, getCoalitionColor, calculateAge, getYoutubeEmbedUrl };
}
