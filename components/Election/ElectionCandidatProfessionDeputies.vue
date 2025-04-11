<!-- components/DeputesMetiers.vue -->
<template>
  <UCard>
    <template #header>
      <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
        <h2 class="text-center text-xl font-semibold">
          Répartition des profession des 165 Députés
        </h2>
      </div>
    </template>

    <!-- Top 5 métiers -->
    <div class="mb-4 rounded-xl bg-white p-2 shadow-sm">
      <h2 class="mb-2 font-semibold text-gray-900">Top 5 métiers</h2>
      <div ref="chartRef" class="h-80 w-full"></div>
    </div>

    <h2 class="m-4 font-semibold text-gray-900">Groupe de métiers</h2>
    <UAccordion :items="accordionItems" class="space-y-4">
      <template #item="{ item, open }">
        <div
          :class="[
            'flex items-end justify-between rounded-lg p-4 shadow-sm transition-all duration-200',
            open ? 'bg-primary-50' : 'hover:bg-primary-50/50 bg-white',
          ]"
        >
          <!-- Gauche: Icône et Titre -->
          <!-- <div class="flex items-center space-x-4">
            <div
              :class="[
                'rounded-lg p-3 transition-colors duration-200',
                open ? 'bg-primary-200' : 'bg-primary-100',
              ]"
            >
              <Icon :name="item.icon" class="text-primary-700 h-6 w-6" />
            </div>
            <h3 class="text-primary-900 text-lg font-semibold">
              {{ item.nom }}
            </h3>
          </div> -->

          <!-- Droite: Stats -->
          <div class="flex items-center space-x-3">
            <UBadge color="primary" class="text-sm font-medium">
              {{ item.total }} députés
            </UBadge>
          </div>
        </div>

        <!-- Contenu de l'accordéon -->
        <div class="border-primary-100 rounded-b-lg border-2 bg-white p-4">
          <ul class="divide-primary-100 space-y-2 divide-y">
            <li
              v-for="metier in item.metiers"
              :key="metier.nom"
              class="hover:bg-primary-50 flex items-center justify-between rounded p-2 transition-colors"
            >
              <span class="text-primary-800">{{ metier.nom }}</span>
              <div class="flex flex-col items-center space-x-4">
                <span class="text-primary-600 text-sm font-medium">
                  {{ metier.nombre }} député{{ metier.nombre > 1 ? "s" : "" }}
                </span>
                <UBadge size="sm" color="primary" variant="subtle"
                  >{{ metier.pourcentage }}%</UBadge
                >
              </div>
            </li>
          </ul>
        </div>
      </template>
    </UAccordion>
  </UCard>
</template>

<script setup lang="ts">
import * as d3 from "d3";

interface Metier {
  nom: string;
  nombre: number;
  pourcentage: number;
}

interface GroupeMetier {
  nom: string;
  icon: string;
  total: number;
  pourcentage: number;
  metiers: Metier[];
}

// data.ts
const groupesMetiers: GroupeMetier[] = [
  {
    nom: "Enseignement & Éducation",
    icon: "i-heroicons-academic-cap",
    total: 44,
    pourcentage: 26.7,
    metiers: [
      { nom: "Enseignant(e)", nombre: 34, pourcentage: 20.6 },
      { nom: "Professeur", nombre: 7, pourcentage: 4.2 },
      { nom: "Enseignant chercheur", nombre: 2, pourcentage: 1.2 },
      { nom: "Proviseur", nombre: 1, pourcentage: 0.6 },
    ],
  },
  {
    nom: "Commerce & Entrepreneuriat",
    icon: "i-heroicons-building-storefront",
    total: 36,
    pourcentage: 21.8,
    metiers: [
      { nom: "Commerçant(e)", nombre: 19, pourcentage: 11.5 },
      { nom: "Opérateur économique", nombre: 10, pourcentage: 6 },
      { nom: "Entrepreneur(e)", nombre: 5, pourcentage: 3.0 },
      { nom: "Chef d'entreprise", nombre: 2, pourcentage: 1.2 },
    ],
  },
  {
    nom: "Fonction publique",
    icon: "i-heroicons-building-office",
    total: 14,
    pourcentage: 8.5,
    metiers: [
      {
        nom: "Administrateur de société",
        nombre: 3,
        pourcentage: 1.8,
      },
      { nom: "Administrateur civil", nombre: 2, pourcentage: 1.2 },
      { nom: "Administrateur", nombre: 1, pourcentage: 0.6 },
      { nom: "Inspecteur des impôts", nombre: 1, pourcentage: 0.6 },
      { nom: "Contrôleur des impôts et domaines", nombre: 1, pourcentage: 0.6 },
      { nom: "Agent d'assiette", nombre: 1, pourcentage: 0.6 },
      { nom: "Agent d'assiette à la retraite", nombre: 1, pourcentage: 0.6 },
      { nom: "Agent de recouvrement des impôts", nombre: 1, pourcentage: 0.6 },
      { nom: "Agent municipal", nombre: 1, pourcentage: 0.6 },
      { nom: "Fonctionnaire", nombre: 1, pourcentage: 0.6 },
      { nom: "Expert fiscal", nombre: 1, pourcentage: 0.6 },
    ],
  },
  {
    nom: "Ingénierie et Technique",
    icon: "i-heroicons-wrench-screwdriver",
    total: 8,
    pourcentage: 4.8,
    metiers: [
      { nom: "Ingénieur informaticien", nombre: 1, pourcentage: 0.6 },
      { nom: "Ingénieur télécom", nombre: 1, pourcentage: 0.6 },
      { nom: "Ingénieur hydrologue", nombre: 1, pourcentage: 0.6 },
      { nom: "Ingénieur aviation civile", nombre: 1, pourcentage: 0.6 },
      { nom: "Électricien", nombre: 1, pourcentage: 0.6 },
      { nom: "Technicien génie civil", nombre: 1, pourcentage: 0.6 },
      { nom: "Électrotechnicienne", nombre: 1, pourcentage: 0.6 },
      { nom: "Ingénieur", nombre: 1, pourcentage: 0.6 },
    ],
  },
  {
    nom: "Finance et Gestion",
    icon: "i-heroicons-currency-dollar",
    total: 8,
    pourcentage: 4.8,
    metiers: [
      { nom: "Comptable", nombre: 3, pourcentage: 1.8 },
      { nom: "Économiste", nombre: 2, pourcentage: 1.2 },
      { nom: "Banquier", nombre: 2, pourcentage: 1.2 },
      { nom: "Analyste financier", nombre: 1, pourcentage: 0.6 },
    ],
  },
  {
    nom: "Juridique",
    icon: "i-heroicons-scale",
    total: 6,
    pourcentage: 3.6,
    metiers: [
      { nom: "Juriste", nombre: 3, pourcentage: 1.8 },
      { nom: "Avocat", nombre: 2, pourcentage: 1.2 },
      { nom: "Clerc huissier", nombre: 1, pourcentage: 0.6 },
    ],
  },
  {
    nom: "Santé",
    icon: "i-heroicons-heart",
    total: 5,
    pourcentage: 3.0,
    metiers: [
      { nom: "Pharmacien", nombre: 2, pourcentage: 1.2 },
      { nom: "Anesthésiste", nombre: 1, pourcentage: 0.6 },
      { nom: "Dentiste", nombre: 1, pourcentage: 0.6 },
      { nom: "Infirmier", nombre: 1, pourcentage: 0.6 },
    ],
  },
  {
    nom: "Services & Support",
    icon: "i-heroicons-briefcase",
    total: 15,
    pourcentage: 9.1,
    metiers: [
      { nom: "Secrétaire", nombre: 2, pourcentage: 1.2 },
      { nom: "Consultant", nombre: 2, pourcentage: 1.2 },
      { nom: "Logisticien et Logisticienne", nombre: 2, pourcentage: 1.2 },
      { nom: "Assistant manager", nombre: 1, pourcentage: 0.6 },
      { nom: "Assistant social", nombre: 1, pourcentage: 0.6 },
      { nom: "Gestionnaire de projets", nombre: 1, pourcentage: 0.6 },
      { nom: "Charge de projet", nombre: 1, pourcentage: 0.6 },
      { nom: "Gestionnaire RH", nombre: 1, pourcentage: 0.6 },
      { nom: "Gestionnaire", nombre: 1, pourcentage: 0.6 },
      { nom: "Commercial(e)", nombre: 1, pourcentage: 0.6 },
      { nom: "Transitaire", nombre: 1, pourcentage: 0.6 },
      { nom: "Assistant(e)", nombre: 2, pourcentage: 1.2 },
    ],
  },
  {
    nom: "Autres professions",
    icon: "i-heroicons-user-group",
    total: 29,
    pourcentage: 17.7,
    metiers: [
      { nom: "Ménagère", nombre: 5, pourcentage: 3.0 },
      { nom: "Étudiant(e)", nombre: 3, pourcentage: 1.8 },
      { nom: "Retraité", nombre: 3, pourcentage: 1.8 },
      { nom: "Urbaniste et Géographie", nombre: 2, pourcentage: 1.2 },
      { nom: "Transformatrice", nombre: 1, pourcentage: 0.6 },
      {
        nom: "Agent de developpement communautaire",
        nombre: 1,
        pourcentage: 0.6,
      },
      { nom: "Sociologue", nombre: 1, pourcentage: 0.6 },
      { nom: "Artisan", nombre: 1, pourcentage: 0.6 },
      { nom: "Restauratrice", nombre: 1, pourcentage: 0.6 },
      { nom: "Entrepreneuse", nombre: 1, pourcentage: 0.6 },
      { nom: "Haut conseille", nombre: 1, pourcentage: 0.6 },
      { nom: "Postier", nombre: 1, pourcentage: 0.6 },
      { nom: "Matronne", nombre: 1, pourcentage: 0.6 },
    ],
  },
];

const accordionItems = groupesMetiers.map((groupe) => ({
  ...groupe,
  label: groupe.nom + " " + groupe.pourcentage.toFixed(0) + "%",
  defaultOpen: false,
}));

// Récupérer les 5 métiers les plus représentés
const top5Metiers = groupesMetiers
  .flatMap((groupe) => groupe.metiers)
  .sort((a, b) => b.nombre - a.nombre)
  .slice(0, 5);

const chartRef = ref<HTMLDivElement | null>(null);

const initChart = () => {
  if (!chartRef.value) return;

  const margin = { top: 20, right: 10, bottom: 70, left: 20 };
  const width = chartRef.value.clientWidth - margin.left - margin.right;
  const height = 320 - margin.top - margin.bottom; // Hauteur fixe

  // Nettoyer le SVG existant
  d3.select(chartRef.value).selectAll("svg").remove();

  // Créer le SVG
  const svg = d3
    .select(chartRef.value)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Échelles
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(top5Metiers.map((d) => d.nom))
    .padding(0.3);

  const y = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(top5Metiers, (d) => d.nombre)]);

  // Couleurs
  const color = d3
    .scaleOrdinal()
    .domain(top5Metiers.map((d) => d.nom))
    .range(["#FF6B6B", "#4ECDC4", "#FFD93D", "#6C5CE7", "#A8E6CF"]);

  // Axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g").call(d3.axisLeft(y));

  // Barres
  svg
    .selectAll("rect")
    .data(top5Metiers)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.nom))
    .attr("y", (d) => y(d.nombre))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.nombre))
    .attr("fill", (d) => color(d.nom));

  // Labels sur les barres
  svg
    .selectAll(".label")
    .data(top5Metiers)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", (d) => x(d.nom) + x.bandwidth() / 2)
    .attr("y", (d) => y(d.nombre) - 5)
    .attr("text-anchor", "middle")
    .text((d) => d.nombre);
};

// Attendre le montage et redimensionnement
onMounted(() => {
  initChart();
  window.addEventListener("resize", initChart);
});

onUnmounted(() => {
  window.removeEventListener("resize", initChart);
});
</script>

<style scoped>
.u-accordion-item {
  @apply overflow-hidden rounded-lg border border-gray-200;
}
</style>
