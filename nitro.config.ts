import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  // Optimisations pour réduire la taille du bundle
  minify: true,
  sourceMap: false,
  
  // Compression
  compressPublicAssets: true,
  
  // Configuration du serveur
  node: {
    asyncContext: true
  },
  
  // Optimisation des chunks
  rollupConfig: {
    output: {
      manualChunks(id) {
        // Séparer les gros fichiers JSON en chunks séparés
        if (id.includes('carte-jsonminifier') || id.includes('carte-result-jsonminifier')) {
          return 'carte-data'
        }
      }
    }
  },

  // Exclure les gros fichiers du bundling si possible
  externals: {
    defu: 'defu'
  }
})