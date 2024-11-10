<!-- components/GenderDistributionChart.vue -->
<template>
  <UCard class="custom-shadow">
    <template #header>
      <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
        <h2 class="text-xl font-semibold">
          Répartition des électeurs par sexe
        </h2>
        <div class="flex items-center gap-4">
          <div
            v-for="(color, type) in genderColors"
            :key="type"
            class="flex items-center gap-2"
          >
            <div
              class="h-4 w-4 rounded shadow-sm"
              :style="{ backgroundColor: color }"
            ></div>
            <span>{{ type }}</span>
          </div>
        </div>
      </div>
    </template>

    <div class="w-full" ref="chartContainer">
      <svg ref="chartSvg" class="w-full"></svg>
    </div>

    <!-- Tableau des données -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th class="px-4 py-2 text-left">Sexe</th>
            <th class="px-4 py-2 text-right">Nombre d'électeurs</th>
            <th class="px-4 py-2 text-right">Pourcentage</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in genderData" :key="item.sexe">
            <td class="py-2">
              <div class="flex items-center gap-2">
                <div
                  class="h-4 w-4 rounded-full"
                  :style="{
                    background: `linear-gradient(to bottom, ${getGradientColors(item.sexe).light}, ${getGradientColors(item.sexe).dark})`,
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }"
                ></div>
                {{ item.sexe }}
              </div>
            </td>
            <td class="px-4 py-2 text-right">
              {{ formatNumber(item.nombre) }}
            </td>
            <td class="px-4 py-2 text-right">
              {{ calculatePercentage(item.nombre) }}%
            </td>
          </tr>
          <tr class="font-bold">
            <td class="px-4 py-2">Total</td>
            <td class="px-4 py-2 text-right">
              {{ formatNumber(totalVoters) }}
            </td>
            <td class="px-4 py-2 text-right">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import type { GenderData } from "~/types/election-stats-elector";

const genderData: GenderData[] = [
  { sexe: "HOMME", nombre: 3708224 },
  { sexe: "FEMME", nombre: 3663666 },
];

// const genderColors = {
//   HOMME: "bg-red-500",
//   FEMME: "bg-blue-500",
// };
const genderColors = {
  HOMME: "#FF6B6B", // Rouge doux
  FEMME: "#4ECDC4", // Turquoise
};

// Ajout de la fonction pour obtenir les couleurs du gradient
const getGradientColors = (sexe: "HOMME" | "FEMME") => {
  const baseColor = genderColors[sexe];
  return {
    light: d3.color(baseColor)!.brighter(0.3).toString(),
    dark: d3.color(baseColor)!.darker(0.2).toString(),
  };
};

const chartContainer = ref<HTMLDivElement | null>(null);
const chartSvg = ref<SVGElement | null>(null);
const totalVoters = computed(() =>
  genderData.reduce((acc, curr) => acc + curr.nombre, 0),
);

const formatNumber = (num: number) =>
  new Intl.NumberFormat("fr-FR").format(num);
const calculatePercentage = (num: number) =>
  ((num / totalVoters.value) * 100).toFixed(1);

const drawChart = () => {
  if (!chartContainer.value || !chartSvg.value) return;

  d3.select(chartSvg.value).selectAll("*").remove();

  const containerWidth = chartContainer.value.offsetWidth;
  const width = containerWidth;
  const height = Math.min(containerWidth * 0.7, 500); // Hauteur augmentée
  const radius = Math.min(width, height) / 2.2; // Rayon ajusté

  // Configuration du gradient pour l'effet 3D
  const svg = d3
    .select(chartSvg.value)
    .attr("width", width)
    .attr("height", height);

  // Définition des gradients
  const defs = svg.append("defs");

  // Gradient pour les hommes
  defs
    .append("linearGradient")
    .attr("id", "gradientMale")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    .selectAll("stop")
    .data([
      { offset: "0%", color: "#FF8F8F" },
      { offset: "100%", color: "#FF6B6B" },
    ])
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  // Gradient pour les femmes
  defs
    .append("linearGradient")
    .attr("id", "gradientFemale")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    .selectAll("stop")
    .data([
      { offset: "0%", color: "#76E5DE" },
      { offset: "100%", color: "#4ECDC4" },
    ])
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Ajout d'un filtre pour l'ombre
  const filter = defs
    .append("filter")
    .attr("id", "shadow")
    .attr("height", "130%");

  filter
    .append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 3)
    .attr("result", "blur");

  filter
    .append("feOffset")
    .attr("in", "blur")
    .attr("dx", 2)
    .attr("dy", 2)
    .attr("result", "offsetBlur");

  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "offsetBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  // Configuration du pie chart
  const pie = d3
    .pie<GenderData>()
    .value((d) => d.nombre)
    .sort(null)
    .padAngle(0.03); // Espace entre les segments

  const arc = d3
    .arc<d3.PieArcDatum<GenderData>>()
    .innerRadius(0) // Augmentation du rayon interne
    .outerRadius(radius * 0.85) // Augmentation du rayon externe
    .cornerRadius(8); // Coins arrondis

  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(["HOMME", "FEMME"])
    .range(["url(#gradientMale)", "url(#gradientFemale)"]);

  const arcs = g
    .selectAll("path")
    .data(pie(genderData))
    .enter()
    .append("g")
    .attr("filter", "url(#shadow)");

  // Animation d'entrée
  arcs
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => colorScale(d.data.sexe))
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .style("filter", "url(#shadow)")
    .transition()
    .duration(0)
    .attrTween("d", function (d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t) {
        return arc(i(t))!;
      };
    });

  // Labels
  arcs.append("text").each(function (d) {
    const self = d3.select(this);
    const arcLength =
      (d.endAngle - d.startAngle) * (arc.outerRadius()() - arc.innerRadius()());

    // Calcul de la position optimale
    const centroid = arc.centroid(d);
    const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    const radius = arc.outerRadius()() * 0.72; // Position à 72% du rayon
    const x = Math.sin(midAngle) * radius;
    const y = -Math.cos(midAngle) * radius;

    // Ajuster la taille du texte en fonction de l'espace disponible
    let fontSize = 16;
    if (arcLength < 50) fontSize = 12;
    if (arcLength < 30) fontSize = 10;

    self
      .attr("transform", `translate(${x},${y})`)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", `${fontSize}px`)
      .attr("font-weight", "bold")
      .text(`${((d.data.nombre / totalVoters.value) * 100).toFixed(1)}%`);
  });

  // Labels secondaires
  //   arcs
  //     .append("text")
  //     .attr("transform", (d) => {
  //       const pos = arc.centroid(d);
  //       return `translate(${pos[0] * 1.2},${pos[1] * 1.2 + 20})`;
  //     })
  //     .attr("dy", "0.35em")
  //     .attr("text-anchor", "middle")
  //     .attr("fill", "#718096")
  //     .attr("font-size", "12px")
  //     .text((d) => formatNumber(d.data.nombre))
  //     .style("opacity", 0)
  //     .transition()
  //     .delay(1200)
  //     .duration(500)
  //     .style("opacity", 1);
};

// Redessiner le graphique lors du redimensionnement
const handleResize = () => {
  drawChart();
};

onMounted(() => {
  drawChart();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
