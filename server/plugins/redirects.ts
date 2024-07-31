export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    const config = useRuntimeConfig();
    if (!config || !config.public || !config.public.redirects) {
      console.error("Redirects configuration is missing");
      return;
    }

    const redirects = config.public.redirects;
    const pathname = new URL(event.node.req.url, "http://localhost").pathname;

    if (!Array.isArray(redirects)) {
      console.error("Redirects should be an array");
      return;
    }

    const redirect = redirects.find((r) => new RegExp(r.from).test(pathname));

    if (redirect) {
      const newPath = pathname.replace(new RegExp(redirect.from), redirect.to);
      return sendRedirect(event, newPath, 301);
    }
  });
});
