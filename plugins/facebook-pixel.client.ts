export default defineNuxtPlugin(() => {
  if (process.client && process.env.NODE_ENV === "production") {
    const config = useRuntimeConfig();
    const fbPixelId = config.public.fbPixelId as string;

    // Charger le script Pixel
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = "https://connect.facebook.net/en_US/fbevents.js";
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script");

    // Initialiser le pixel avec votre ID Pixel
    fbq("init", fbPixelId);
    fbq("track", "PageView");
  }
});
