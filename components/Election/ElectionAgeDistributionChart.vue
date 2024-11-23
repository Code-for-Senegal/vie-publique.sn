<!-- components/AgeDistributionChart.vue -->
<template>
  <UCard>
    <template #header>
      <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
        <h2 class="text-center text-xl font-semibold">
          Répartition des électeurs par âge
        </h2>
      </div>
    </template>

    <div class="w-full" ref="chartContainer">
      <svg ref="chartSvg" class="w-full"></svg>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th class="px-4 py-2 text-left">Tranche d'âge</th>
            <th class="px-4 py-2 text-right">Nombre d'électeurs</th>
            <th class="px-4 py-2 text-right">Pourcentage</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="(item, index) in ageData"
            :key="item.tranche"
            class="transition-colors hover:bg-gray-50"
          >
            <td class="py-2">
              <div class="flex items-center gap-2">
                <div
                  class="h-4 w-4 rounded-full"
                  :style="{
                    background: `linear-gradient(to bottom, ${getGradientColors(index).light}, ${getGradientColors(index).dark})`,
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }"
                ></div>
                {{ item.tranche }}
              </div>
            </td>
            <td class="px-4 py-2 text-right">
              {{ formatNumber(item.nombre) }}
            </td>
            <td class="px-4 py-2 text-right">{{ item.pourcentage }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import type { AgeGroupData } from "~/types/statistics";

const ageData: AgeGroupData[] = [
  { tranche: "18-25", nombre: 783084, pourcentage: 11 },
  { tranche: "26-35", nombre: 1969052, pourcentage: 27 },
  { tranche: "36-45", nombre: 1741948, pourcentage: 24 },
  { tranche: "46-60", nombre: 1739614, pourcentage: 23 },
  { tranche: ">60", nombre: 1138192, pourcentage: 15 },
];

// Ajout de la fonction pour obtenir les couleurs du gradient
const getGradientColors = (index: number) => {
  const baseColor = colors[index];
  return {
    light: d3.color(baseColor)!.brighter(0.3).toString(),
    dark: d3.color(baseColor)!.darker(0.2).toString(),
  };
};

const chartContainer = ref<HTMLDivElement | null>(null);
const chartSvg = ref<SVGElement | null>(null);
const totalVoters = computed(() =>
  ageData.reduce((acc, curr) => acc + curr.nombre, 0),
);

const formatNumber = (num: number) =>
  new Intl.NumberFormat("fr-FR").format(num);

// Nouvelle palette de couleurs harmonieuse
const colors = [
  "#FFB447", // Orange doré
  "#FF6B6B", // Rouge corail
  "#4ECDC4", // Turquoise
  "#45B7D1", // Bleu ciel
  "#96CEB4", // Vert menthe
];

const drawChart = () => {
  if (!chartContainer.value || !chartSvg.value) return;

  d3.select(chartSvg.value).selectAll("*").remove();

  const containerWidth = chartContainer.value.offsetWidth;
  const width = containerWidth;
  const height = Math.min(containerWidth * 0.7, 500);
  const radius = Math.min(width, height) / 2.2;

  // Configuration des gradients et du SVG
  const svg = d3
    .select(chartSvg.value)
    .attr("width", width)
    .attr("height", height);

  const defs = svg.append("defs");

  // Création des gradients pour chaque section
  colors.forEach((color, i) => {
    const gradient = defs
      .append("linearGradient")
      .attr("id", `gradient-${i}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", d3.color(color)!.brighter(0.3).toString());

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", d3.color(color)!.darker(0.2).toString());
  });

  // Configuration de l'ombre
  const filter = defs
    .append("filter")
    .attr("id", "shadow-pie")
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

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Configuration du pie chart
  const pie = d3
    .pie<AgeGroupData>()
    .value((d) => d.nombre)
    .sort(null)
    .padAngle(0.03);

  const arc = d3
    .arc<d3.PieArcDatum<AgeGroupData>>()
    .innerRadius(0)
    .outerRadius(radius * 0.8)
    .cornerRadius(8);

  // Création des segments
  const arcs = g
    .selectAll("path")
    .data(pie(ageData))
    .enter()
    .append("g")
    .attr("filter", "url(#shadow-pie)");

  // Ajout des segments avec animation
  arcs
    .append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => `url(#gradient-${i})`)
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .transition()
    .duration(300)
    .attrTween("d", function (d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t) {
        return arc(i(t))!;
      };
    });

  // Ajout des labels avec positionnement optimisé
  arcs.append("text").each(function (d) {
    const self = d3.select(this);
    const arcLength =
      (d.endAngle - d.startAngle) * (arc.outerRadius()() - arc.innerRadius()());

    // Calcul de la position optimale
    const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    const radius = arc.outerRadius()() * 0.65; // Position à 65% du rayon externe
    const x = Math.sin(midAngle) * radius;
    const y = -Math.cos(midAngle) * radius;

    // Ajustement de la taille du texte selon l'espace disponible
    let fontSize = 16;
    if (arcLength < 50) fontSize = 14;
    if (arcLength < 30) fontSize = 12;

    self
      .attr("transform", `translate(${x},${y})`)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", `${fontSize}px`)
      .attr("font-weight", "bold")
      .text(`${d.data.pourcentage}%`)
      .style("opacity", 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style("opacity", 1);
  });

  // Ajout des labels de tranches d'âge
  arcs.append("text").each(function (d) {
    const self = d3.select(this);
    const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    const radius = arc.outerRadius()() * 0.85; // Position à 95% du rayon externe
    const x = Math.sin(midAngle) * radius;
    const y = -Math.cos(midAngle) * radius;

    self
      .attr("transform", `translate(${x},${y})`)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#4A5568")
      .attr("font-size", "12px")
      .text(d.data.tranche)
      .style("opacity", 0)
      .transition()
      .delay(1200)
      .duration(500)
      .style("opacity", 1);
  });
};

// Gestionnaire de redimensionnement
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

<style scoped>
.chart-container {
  position: relative;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}
</style>
