export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const isProduction = config.public.siteUrl === 'https://vie-publique.sn';

  // Ajouter X-Robots-Tag header en environnement de test
  if (!isProduction) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow');
  }
});
