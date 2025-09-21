/**
 * Debug version info
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  return {
    timestamp: new Date().toISOString(),
    version: {
      raw: config.public.appVersion,
      buildTime: config.public.buildTime,
      gitCommit: config.public.gitCommit,
      nodeEnv: config.public.nodeEnv
    },
    process: {
      NODE_ENV: process.env.NODE_ENV,
      platform: process.platform,
      version: process.version
    },
    computed: {
      isProduction: config.public.nodeEnv === 'production',
      hasGitCommit: !!(config.public.gitCommit && config.public.gitCommit !== 'unknown'),
      hasBuildTime: !!config.public.buildTime
    }
  }
})