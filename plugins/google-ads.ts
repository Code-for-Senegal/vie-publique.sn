import { defineNuxtPlugin } from "#app";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const googleAdsId = runtimeConfig.public.googleAdsId;

  if (process.client && googleAdsId) {
    nuxtApp.hook("app:mounted", () => {
      window.gtag("config", googleAdsId);
    });
  }

  return {
    provide: {
      trackConversion: (conversionLabel: string) => {
        if (process.client && window.gtag && googleAdsId) {
          window.gtag("event", "conversion", {
            send_to: `${googleAdsId}/${conversionLabel}`,
          });
        }
      },
    },
  };
});
