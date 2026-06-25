import type { Dossier } from '~~/types/dossier';

/**
 * Composable pour le DÉTAIL d'un dossier (page /dossiers/[slug]).
 *
 * Récupère un dossier publié par son slug, relations résolues côté serveur.
 * Le fetch est SSR (useAsyncData) pour que les meta SEO et le contenu soient
 * présents dans le HTML servi aux crawlers.
 *
 * @example
 * const { dossier, loading, error } = useDossier(() => route.params.slug as string);
 */
export const useDossier = (slug: string | Ref<string>) => {
  const key = computed(() => `dossier-${unref(slug)}`);

  const { data, pending, error, refresh } = useAsyncData(
    key.value,
    () => $fetch<{ dossier: Dossier }>(`/api/dossiers/${unref(slug)}`),
    {
      watch: [() => unref(slug)],
    },
  );

  return {
    dossier: computed<Dossier | undefined>(() => data.value?.dossier),
    loading: pending,
    error,
    refresh,
  };
};
