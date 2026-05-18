export default defineAppConfig({
  version: "07-05-2026",
  ui: {
    primary: "sky", // Bleu plus vif pour les accents (comme Twitter)
    gray: "slate",  // Slate pour des tons bleu-gris en dark mode
    container: {
      padding: "px-2 sm:px-6 lg:px-8",
    },
    card: {
      header: {
        padding: "px-2 py-3 sm:py-4 sm:px-6",
      },
      body: {
        padding: "px-2 py-3 sm:py-4 sm:p-6",
      },
      background: "bg-white dark:bg-gray-800",
      ring: "ring-1 ring-gray-200 dark:ring-gray-700",
    },
    button: {
      color: {
        primary: {
          solid: "bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-600 dark:hover:bg-sky-500",
        },
      },
    },
    input: {
      color: {
        white: {
          outline: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500",
        },
      },
    },
  },
});
