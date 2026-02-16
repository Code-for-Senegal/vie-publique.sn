import type { Ref } from 'vue';

export interface GuideVideo {
  id: number;
  titre: string;
  description: string;
  url_youtube: string;
  type_election: string;
  langue: string;
}

interface UseGuideElectoralOptions {
  type?: string | Ref<string>;
  language?: string | Ref<string>;
}

export const useGuideElectoral = (options: UseGuideElectoralOptions = {}) => {
  const type = isRef(options.type) ? options.type : ref(options.type);
  const language = isRef(options.language) ? options.language : ref(options.language);

  // Fetch videos
  const { data, pending, error, refresh } = useFetch<{ data: GuideVideo[] }>(
    '/api/elections/dashboard/guide/videos',
    {
      query: computed(() => ({
        type: type.value,
        language: language.value
      })),
      watch: [type, language],
      key: computed(() => `guide-${type.value || 'all'}-${language.value || 'all'}`)
    }
  );

  // Fetch available languages
  const { data: languagesData } = useFetch<{ data: { text: string; value: string }[] }>(
    '/api/elections/dashboard/guide/languages',
    {
        key: 'guide-languages',
        lazy: true,
        server: false 
    }
  );

  return {
    videos: computed(() => data.value?.data || []),
    languages: computed(() => {
        const langs = languagesData.value?.data || [];
        
        const langMap: Record<string, string> = {};
        langs.forEach((l) => {
            langMap[l.value] = l.text;
        });
        return langMap;
    }),
    loading: pending,
    error,
    refresh
  };
};
