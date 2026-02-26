/**
 * Feature Flags Configuration
 *
 * Ce fichier définit la configuration par défaut des feature flags.
 * Les valeurs peuvent être surchargées par Directus CMS.
 */

export type AppEnvironment = 'dev' | 'test' | 'production';

export const VALID_ENVIRONMENTS: AppEnvironment[] = ['dev', 'test', 'production'];

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  environments: AppEnvironment[];
  description?: string;
}

/**
 * Configuration par défaut des feature flags
 * Utilisée comme fallback si Directus est indisponible
 */
export const DEFAULT_FEATURES: Record<string, FeatureFlag> = {
  // Menu principal
  menu_actualites: {
    key: 'menu_actualites',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Actualités',
  },
  menu_documents: {
    key: 'menu_documents',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Documents',
  },
  menu_annuaire: {
    key: 'menu_annuaire',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Annuaire',
  },
  menu_conseil_ministres: {
    key: 'menu_conseil_ministres',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Conseil des ministres',
  },
  menu_assemblee_nationale: {
    key: 'menu_assemblee_nationale',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Assemblée Nationale',
  },
  menu_journal_officiel: {
    key: 'menu_journal_officiel',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Journal officiel',
  },
  menu_budget: {
    key: 'menu_budget',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Budget du Sénégal',
  },
  menu_nominations: {
    key: 'menu_nominations',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Nominations',
  },
  menu_elections: {
    key: 'menu_elections',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Élections',
  },
  menu_chatbot: {
    key: 'menu_chatbot',
    enabled: true,
    environments: ['dev', 'test'],
    description: 'Menu Chatbot (beta)',
  },
  menu_recherche: {
    key: 'menu_recherche',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: "Fonctionnalité de recherche (menu, header, page d'accueil)",
  },
  menu_dashboard_conseil: {
    key: 'menu_dashboard_conseil',
    enabled: false,
    environments: ['dev'],
    description: 'Menu Dashboard Conseil des Ministres (dev only)',
  },
  menu_dashboard_corruption: {
    key: 'menu_dashboard_corruption',
    enabled: true,
    environments: ['dev', 'test'],
    description: 'Menu Dashboard Corruption & Gouvernance (PNUD A2)',
  },
  menu_etat_senegal: {
    key: 'menu_etat_senegal',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu État du Sénégal',
  },
  menu_organigramme_etat: {
    key: 'menu_organigramme_etat',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: "Menu Organigramme de l'état",
  },
  menu_quiz: {
    key: 'menu_quiz',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Quiz',
  },
  menu_suivi_promesses: {
    key: 'menu_suivi_promesses',
    enabled: false,
    environments: ['dev', 'test'],
    description: 'Menu Suivi promesses électorales',
  },
  menu_don_bictorys: {
    key: 'menu_don_bictorys',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Don avec Bictorys',
  },
  menu_don_paydunya: {
    key: 'menu_don_paydunya',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Menu Don avec Paydunya',
  },

  // Composants
  social_networks: {
    key: 'social_networks',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Affichage des réseaux sociaux',
  },
  footer_links: {
    key: 'footer_links',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Affichage des liens footer',
  },
};

/**
 * Récupère l'environnement actuel
 */
export function getCurrentEnvironment(): AppEnvironment {
  const env = process.env.NUXT_PUBLIC_APP_ENV as AppEnvironment | undefined;

  if (env && VALID_ENVIRONMENTS.includes(env)) {
    return env;
  }

  // Fallback sur 'production' pour la sécurité
  console.warn(`Invalid or missing NUXT_PUBLIC_APP_ENV: ${env}, defaulting to 'production'`);
  return 'production';
}

/**
 * Vérifie si les feature flags sont activés globalement
 */
export function isFeatureFlagsEnabled(): boolean {
  return process.env.NUXT_FEATURE_FLAGS_ENABLED !== 'false';
}
