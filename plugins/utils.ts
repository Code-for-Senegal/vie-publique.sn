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
      getAgeFromBirthdate: (birthdate: string) => {
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        return age;
      },
      // Fonction pour convertir le nom en slug URL-friendly
      getSlugifyUrlPath: (text: string) => {
        return text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-") // Remplace les espaces par des tirets
          .replace(/[^\w\-]+/g, "") // Supprime les caractères spéciaux
          .replace(/\-\-+/g, "-"); // Évite les tirets multiples
      },
      // Fonction pour convertir le nom en slug URL-friendly
      getAssemblyVoteLabel: (text: string) => {
        if (text === "government_bill") {
          return "Projet de loi";
        }
        if (text === "election") {
          return "Élection";
        }
      },
    },
  };
});
