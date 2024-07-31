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
      dateMonthYearformat: (dateStr: string) => {
        const date = new Date(dateStr);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${month} ${year}`;
      },
    },
  };
});
