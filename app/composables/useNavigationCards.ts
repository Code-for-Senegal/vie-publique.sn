// composables/useNavigationCards.ts

export interface NavigationCard {
  title: string;
  description?: string;
  icon: string;
  to: string;
  count?: number;
  display: boolean;
}

/**
 * Composable pour gérer les cartes de navigation utilisées dans HomeSearch et MenuHomeV4
 * Centralise la configuration des liens principaux du site
 */
export function useNavigationCards() {
  const navigationCards: NavigationCard[] = [
    {
      title: 'Documents',
      description: 'Journal officiel, Codes, Rapports',
      icon: 'i-heroicons-document-text',
      to: '/documents/public',
      count: 1354,
      display: true,
    },
    {
      title: 'Annuaire',
      description: 'Nominations, Sites, Medias...',
      icon: 'i-heroicons-book-open',
      to: '/annuaires',
      count: 89,
      display: false,
    },
    {
      title: 'Assemblée',
      description: "Suivez l'activité parlementaire",
      icon: 'i-heroicons-building-library',
      to: '/assemblee-nationale',
      count: 147,
      display: true,
    },
    {
      title: 'Journal officiel',
      description: 'Lois, Décrets, Arrêtés',
      icon: 'i-heroicons-newspaper',
      to: '/documents/journal-officiel',
      count: 1354,
      display: true,
    },
    {
      title: 'Conseil des ministres',
      description: 'Communiqués Comptes rendus',
      icon: 'i-heroicons-briefcase',
      to: '/conseil-des-ministres',
      count: 54,
      display: true,
    },
    {
      title: 'Budget',
      description: 'Loi de finances 2025',
      icon: 'i-heroicons-banknotes',
      to: '/budget-senegal',
      count: 8,
      display: true,
    },
    {
      title: 'Élections',
      description: 'Scrutins, Listes, Résultats',
      icon: 'i-heroicons-user-group',
      to: '/elections-senegal',
      display: false,
    },
  ];

  // Configuration des couleurs pour chaque type de carte (utilisée dans HomeSearch)
  const cardStyles = {
    Assemblée: {
      border: 'border-blue-200 dark:border-blue-800',
      hover:
        'hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-700 dark:hover:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-100',
    },
    'Journal officiel': {
      border: 'border-red-200 dark:border-red-800',
      hover:
        'hover:border-red-300 hover:bg-red-50 dark:hover:border-red-700 dark:hover:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-900 dark:text-red-100',
    },
    'Budget du Sénégal': {
      border: 'border-emerald-200 dark:border-emerald-800',
      hover:
        'hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20',
      icon: 'text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-900 dark:text-emerald-100',
    },
    'Conseil des ministres': {
      border: 'border-amber-200 dark:border-amber-800',
      hover:
        'hover:border-amber-300 hover:bg-amber-50 dark:hover:border-amber-700 dark:hover:bg-amber-900/20',
      icon: 'text-amber-600 dark:text-amber-400',
      text: 'text-amber-900 dark:text-amber-100',
    },
    Annuaire: {
      border: 'border-violet-200 dark:border-violet-800',
      hover:
        'hover:border-violet-300 hover:bg-violet-50 dark:hover:border-violet-700 dark:hover:bg-violet-900/20',
      icon: 'text-violet-600 dark:text-violet-400',
      text: 'text-violet-900 dark:text-violet-100',
    },
    Documents: {
      border: 'border-indigo-200 dark:border-indigo-800',
      hover:
        'hover:border-indigo-300 hover:bg-indigo-50 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20',
      icon: 'text-indigo-600 dark:text-indigo-400',
      text: 'text-indigo-900 dark:text-indigo-100',
    },
  };

  // Configuration des couleurs pour MenuHomeV4 (différent de HomeSearch)
  const menuCardColors = {
    'Assemblée Nationale': 'text-blue-600',
    'Journal officiel Sénégal': 'text-red-600',
    'Budget du Sénégal': 'text-emerald-600',
    'Conseil des ministres': 'text-amber-600',
    Annuaire: 'text-violet-600',
    Documents: 'text-indigo-600',
  };

  // Fonctions utilitaires pour HomeSearch
  const getCardStyles = (title: string) => {
    const config = cardStyles[title as keyof typeof cardStyles];
    return config ? `${config.border} ${config.hover}` : '';
  };

  const getIconColor = (title: string) => {
    const config = cardStyles[title as keyof typeof cardStyles];
    return config?.icon || 'text-gray-600';
  };

  const getTextColor = (title: string) => {
    const config = cardStyles[title as keyof typeof cardStyles];
    return config?.text || 'text-gray-900 dark:text-white';
  };

  // Fonction utilitaire pour MenuHomeV4
  const getMenuCardColor = (title: string) => {
    return menuCardColors[title as keyof typeof menuCardColors] || 'text-gray-600';
  };

  // Fonctions pour HomeQuickAccess - Arrière-plans des icônes
  const getQuickAccessIconBackground = (title: string): string => {
    const backgrounds: Record<string, string> = {
      Assemblée: 'bg-blue-50 dark:bg-blue-900/20',
      Budget: 'bg-green-50 dark:bg-green-900/20',
      Documents: 'bg-purple-50 dark:bg-purple-900/20',
      Elections: 'bg-red-50 dark:bg-red-900/20',
      Annuaires: 'bg-yellow-50 dark:bg-yellow-900/20',
      Actualités: 'bg-indigo-50 dark:bg-indigo-900/20',
      'Journal officiel': 'bg-red-50 dark:bg-red-900/20',
      'Conseil des ministres': 'bg-amber-50 dark:bg-amber-900/20',
      'Budget du Sénégal': 'bg-green-50 dark:bg-green-900/20',
      Annuaire: 'bg-yellow-50 dark:bg-yellow-900/20',
    };

    return backgrounds[title] || 'bg-gray-50 dark:bg-gray-700';
  };

  // Fonctions pour HomeQuickAccess - Couleurs des icônes
  // deprecated
  const getQuickAccessIconColor = (title: string): string => {
    const colors: Record<string, string> = {
      Assemblée: 'text-blue-600 dark:text-blue-400',
      Budget: 'text-green-600 dark:text-green-400',
      Documents: 'text-purple-600 dark:text-purple-400',
      Elections: 'text-red-600 dark:text-red-400',
      Annuaires: 'text-yellow-600 dark:text-yellow-400',
      Actualités: 'text-indigo-600 dark:text-indigo-400',
      'Journal officiel': 'text-red-600 dark:text-red-400',
      'Conseil des ministres': 'text-amber-600 dark:text-amber-400',
      'Budget du Sénégal': 'text-green-600 dark:text-green-400',
      Annuaire: 'text-yellow-600 dark:text-yellow-400',
    };

    return colors[title] || 'text-gray-600 dark:text-gray-400';
  };

  return {
    navigationCards,
    // Pour HomeSearch
    getCardStyles,
    getIconColor,
    getTextColor,
    // Pour MenuHomeV4
    getMenuCardColor,
    // Pour HomeQuickAccess
    getQuickAccessIconBackground,
    getQuickAccessIconColor,
  };
}
