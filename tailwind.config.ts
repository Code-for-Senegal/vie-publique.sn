import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

export default {
  content: [],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode "Dim" palette - Twitter/X inspired
        // Bleu-noir profond, plus doux que le noir pur
        dark: {
          50: '#E7E9EA',   // Texte principal
          100: '#D6D9DB',  // Texte secondaire clair
          200: '#8899A6',  // Texte secondaire
          300: '#6E767D',  // Texte tertiaire
          400: '#536471',  // Icônes inactives
          500: '#38444D',  // Bordures, séparateurs
          600: '#2F3336',  // Surface élevée hover
          700: '#1E2732',  // Surface élevée (cartes)
          800: '#192734',  // Surface principale
          900: '#15202B',  // Background principal
          950: '#0D1520',  // Background plus profond
        },
      },
      backgroundColor: {
        // Raccourcis pour le dark mode
        'dim': '#15202B',
        'dim-card': '#1E2732',
        'dim-hover': '#2F3336',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
