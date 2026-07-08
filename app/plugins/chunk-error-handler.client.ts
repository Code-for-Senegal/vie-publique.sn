/**
 * Plugin client pour gérer les erreurs de chargement de chunks JS/CSS
 * après un déploiement. Quand un nouveau build est déployé, les fichiers
 * hashés changent et les anciens chunks deviennent introuvables (404).
 *
 * Ce plugin détecte ces erreurs et force un rechargement propre de la page
 * pour récupérer le HTML frais qui référence les bons chunks.
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Clé pour éviter les boucles de reload infinies
  const RELOAD_KEY = 'vpsn-chunk-reload';
  const RELOAD_MAX = 3;
  const RELOAD_WINDOW_MS = 30_000; // 30 secondes

  function shouldReload(): boolean {
    try {
      const raw = sessionStorage.getItem(RELOAD_KEY);
      if (!raw) return true;

      const { count, timestamp } = JSON.parse(raw);
      const elapsed = Date.now() - timestamp;

      // Reset le compteur si la fenêtre est dépassée
      if (elapsed > RELOAD_WINDOW_MS) return true;

      // Empêcher les boucles infinies
      return count < RELOAD_MAX;
    } catch {
      return true;
    }
  }

  function recordReload(): void {
    try {
      const raw = sessionStorage.getItem(RELOAD_KEY);
      let count = 1;

      if (raw) {
        const data = JSON.parse(raw);
        const elapsed = Date.now() - data.timestamp;
        count = elapsed > RELOAD_WINDOW_MS ? 1 : data.count + 1;
      }

      sessionStorage.setItem(
        RELOAD_KEY,
        JSON.stringify({ count, timestamp: Date.now() })
      );
    } catch {
      // sessionStorage indisponible — on continue quand même
    }
  }

  function isChunkLoadError(error: unknown): boolean {
    if (!error) return false;

    const message = error instanceof Error ? error.message : String(error);

    return (
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Importing a module script failed') ||
      message.includes('error loading dynamically imported module') ||
      message.includes('Unable to preload CSS') ||
      message.includes('Loading chunk') ||
      message.includes('ChunkLoadError') ||
      // Erreur Vite spécifique
      message.includes('Failed to load module script')
    );
  }

  function handleChunkError(): void {
    if (shouldReload()) {
      recordReload();
      // Forcer un reload "hard" qui bypass le SW cache
      window.location.reload();
    } else {
      console.warn('[VPSN] Chunk reload limit reached — skipping auto-reload');
    }
  }

  // Hook Nuxt pour les erreurs Vue (erreurs dans les composants)
  nuxtApp.hook('vue:error', (error) => {
    if (isChunkLoadError(error)) {
      console.warn('[VPSN] Chunk load error detected in Vue, reloading...', error);
      handleChunkError();
    }
  });

  // Hook Nuxt pour les erreurs d'app
  nuxtApp.hook('app:error', (error) => {
    if (isChunkLoadError(error)) {
      console.warn('[VPSN] Chunk load error detected in App, reloading...', error);
      handleChunkError();
    }
  });

  // Erreurs globales non capturées (import() dynamiques hors Vue)
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      if (isChunkLoadError(event.reason)) {
        console.warn('[VPSN] Unhandled chunk load error, reloading...', event.reason);
        event.preventDefault();
        handleChunkError();
      }
    });
  }
});
