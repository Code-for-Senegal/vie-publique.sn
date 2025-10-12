export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const isProduction = config.public.siteUrl === 'https://vie-publique.sn';

  if (isProduction) {
    // Production: Autoriser l'indexation
    return `# Production - Autoriser tous les robots
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://vie-publique.sn/sitemap.xml
`;
  } else {
    // Test/Staging: Bloquer l'indexation
    return `# Test/Staging - Bloquer tous les robots
User-agent: *
Disallow: /

# Explication: Environnement de test non indexable
# Si vous voyez ceci sur vie-publique.sn, contactez l'équipe tech
`;
  }
});
