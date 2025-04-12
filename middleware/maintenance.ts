export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig();

  // Si le mode maintenance est activé et que l'on n'est pas déjà sur la page de maintenance
  if (config.public.maintenanceMode && to.path !== "/maintenance") {
    return navigateTo("/maintenance");
  }

  const isMaintenance = config.public.maintenanceMode as unknown as boolean;
  // Si le mode maintenance est désactivé et qu'on essaie d'accéder à la page de maintenance
  if (!isMaintenance && to.path === "/maintenance") {
    return navigateTo("/");
  }
});
