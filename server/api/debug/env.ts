/**
 * Route de debug pour vérifier les variables d'environnement
 * À SUPPRIMER après débogage !
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Test URL construction comme dans les routes proxy
  const testPath = '0f09d9ee-6043-4602-8be9-9373087d1198'
  let constructedUrl = ''
  
  if (process.env.CMS_API_URL_ASSETS) {
    constructedUrl = `${process.env.CMS_API_URL_ASSETS}/${testPath}`
  }
  
  return {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      CMS_API_URL: process.env.CMS_API_URL ? '✅ SET' : '❌ NOT SET',
      CMS_API_URL_ASSETS: process.env.CMS_API_URL_ASSETS ? '✅ SET' : '❌ NOT SET',
      publicCmsApiUrl: config.public.cmsApiUrl ? '✅ SET' : '❌ NOT SET'
    },
    urls: {
      CMS_API_URL: process.env.CMS_API_URL || 'undefined',
      CMS_API_URL_ASSETS: process.env.CMS_API_URL_ASSETS || 'undefined',
      publicCmsApiUrl: config.public.cmsApiUrl || 'undefined'
    },
    urlConstruction: {
      originalAssets: process.env.CMS_API_URL_ASSETS,
      testPath: testPath,
      constructedUrl: constructedUrl,
      hasDoubleSlash: constructedUrl.includes('//'),
      hasTrailingSlash: process.env.CMS_API_URL_ASSETS?.endsWith('/') || false
    },
    testUrls: {
      proxyImage: `/medias/${testPath}`,
      directCMS: constructedUrl,
      qualityTest: `/medias/${testPath}?quality=50`
    }
  }
})