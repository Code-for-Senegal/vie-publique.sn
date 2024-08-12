export default defineNuxtPlugin(() => {
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
        var days = [
          "Dimanche",
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
        ];
        var dayName = days[date.getDay()];
        return `${dayName} ${day} ${month} ${year}`;
      },
      dateMonthYearformat: (dateStr: string) => {
        const date = new Date(dateStr);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${month} ${year}`;
      },
    },
  };
});
