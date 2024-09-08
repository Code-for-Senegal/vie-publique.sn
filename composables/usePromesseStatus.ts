// composables/useStatus.ts

export function getStatusIcon(status: string): string {
  const statusIcons: { [key: string]: string } = {
    "non tenue": "i-heroicons-x-circle",
    "en cours": "i-heroicons-arrow-path",
    tenue: "i-heroicons-check-circle",
    "non évaluée": "i-heroicons-question-mark-circle",
  };

  return (
    statusIcons[status.toLowerCase()] || "i-heroicons-question-mark-circle"
  );
}

export function getStatusBackgroundClass(status: string): string {
  switch (status.toLowerCase()) {
    case "tenue":
      return "bg-green-100";
    case "non tenue":
      return "bg-red-100";
    case "en cours":
      return "bg-yellow-100";
    default:
      return "bg-gray-100";
  }
}

export function getStatusIconClass(status: string): string {
  switch (status.toLowerCase()) {
    case "tenue":
      return "text-green-600";
    case "non tenue":
      return "text-red-600";
    case "en cours":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
}

export function getStatusTextClass(status: string): string {
  switch (status.toLowerCase()) {
    case "tenue":
      return "text-green-800";
    case "non tenue":
      return "text-red-800";
    case "en cours":
      return "text-yellow-800";
    default:
      return "text-gray-800";
  }
}
