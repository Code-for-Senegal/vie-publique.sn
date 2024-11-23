import organisationData from "~/assets/data/etat-organisation.json";

export default defineEventHandler((): any => {
  return {
    flatData: flattenData3(organisationData),
    brutData: organisationData,
  };
});

const flattenData1 = (data: any[], parent = ""): any[] => {
  let result: any[] = [];
  data.forEach((item) => {
    result.push({
      name: item.name,
      type:
        item.type || parent === "Établissements publics"
          ? "Établissements publics"
          : "Entité",
      parent: parent,
    });
    if (item.children) {
      result = result.concat(flattenData1(item.children, item.name));
    }
  });
  return result;
};

const flattenData2 = (data: any[], parent = ""): any[] => {
  let result: any[] = [];
  data.forEach((item) => {
    // Déterminer le type de l'entité en fonction du nom de son parent
    let type = "Entité"; // Type par défaut
    if (parent === "Établissements publics") {
      type = "Établissement public";
    } else if (parent === "Sociétés nationales et à participation publique") {
      type = "Société nationale";
    } else if (parent === "Ministères") {
      type = "Ministère";
    } else if (parent === "Directions") {
      type = "Direction";
    } else if (parent === "Secrétariat général et Services rattachés") {
      type = "Service";
    } else if (parent === "Autres administrations") {
      type = "Autre";
    }

    // Ajouter l'entité au résultat
    result.push({
      name: item.name,
      type: type,
      parent: parent,
    });

    // Traiter les enfants récursivement
    if (item.children) {
      result = result.concat(flattenData2(item.children, item.name));
    }
  });
  return result;
};

const flattenData3 = (data: any[], parentPath = ""): any[] => {
  let result: any[] = [];
  data.forEach((item) => {
    // Construire le chemin des parents sans inclure le nom de l'entité actuelle
    // const currentParentPath = parentPath
    //   ? `${parentPath} > ${item.name}`
    //   : item.name;

    const currentParentPath = [...parentPath, item.name];

    // Déterminer le type de l'entité en fonction du nom de son parent
    let type = "Entité"; // Type par défaut
    if (parentPath.includes("Établissements publics")) {
      type = "Établissement public";
    } else if (
      parentPath.includes("Sociétés nationales et à participation publique")
    ) {
      type = "Société nationale";
    } else if (parentPath.includes("Ministères")) {
      type = "Ministère";
    } else if (parentPath.includes("Directions")) {
      type = "Direction";
    } else if (
      parentPath.includes("Secrétariat général et Services rattachés")
    ) {
      type = "Service";
    } else if (parentPath.includes("Autres administrations")) {
      type = "Autre";
    }

    // Ajouter l'entité au résultat sans inclure son propre nom dans le parent
    result.push({
      name: item.name,
      type: type,
      parents: parentPath, // On conserve uniquement le chemin des parents
    });

    // Traiter les enfants récursivement
    if (item.children) {
      result = result.concat(flattenData3(item.children, currentParentPath));
    }
  });
  return result;
};
