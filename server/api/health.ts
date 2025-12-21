/**
 * GET /api/health
 * Health check endpoint pour monitoring (Coolify, load balancer, etc.)
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now();

  // Vérifications de base
  const checks = {
    status: 'ok' as 'ok' | 'error',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      server: { status: 'ok' as const },
      cms: { status: 'unknown' as 'ok' | 'error' | 'unknown', responseTime: 0 },
    },
  };

  // Test connexion CMS (optionnel)
  try {
    const config = useRuntimeConfig();
    if (config.cmsApiUrl) {
      const cmsStart = Date.now();
      const response = await $fetch(`${config.cmsApiUrl}/server/health`, {
        timeout: 5000,
      }).catch(() => null);

      checks.checks.cms = {
        status: response ? 'ok' : 'error',
        responseTime: Date.now() - cmsStart,
      };
    }
  } catch {
    checks.checks.cms.status = 'error';
  }

  // Statut global
  const hasError = Object.values(checks.checks).some((c) => c.status === 'error');
  checks.status = hasError ? 'error' : 'ok';

  // Code HTTP
  setResponseStatus(event, hasError ? 503 : 200);

  return {
    ...checks,
    responseTime: Date.now() - startTime,
  };
});
