export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  return {
    provide: {
      dateformat: (dateStr: string) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
      },
      dateformatWithDayName: (dateStr: string) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const days = [
          "Dimanche",
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
        ];
        const dayName = days[date.getDay()];
        return `${dayName} ${day} ${month} ${year}`;
      },
      dateMonthYearformat: (dateStr: string) => {
        const date = new Date(dateStr);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${month} ${year}`;
      },
      formatAmount: (amount: number) => {
        return new Intl.NumberFormat("fr-FR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      },
      directusImageUrl: (photoId: string, quality: string) => {
        return `${config.public.cmsApiUrl}/assets/${photoId}?fit=cover&quality=${quality}`;
      },
    },
  };
});
