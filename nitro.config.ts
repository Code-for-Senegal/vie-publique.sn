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

  // Exclure certains modules du bundling si nécessaire
  externals: {
    defu: 'defu'
  }
})