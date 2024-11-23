// components/SenegalMapGenerator.vue
<template>
  <UCard>
    <div ref="svgContainer"></div>
    <UButton @click="downloadSVG" icon="i-heroicons-download" class="mt-4">
      Télécharger SVG
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as d3 from "d3";

const svgContainer = ref<HTMLElement | null>(null);

const drawSenegalMap = () => {
  if (!svgContainer.value) return;

  const width = 400;
  const height = 300;

  const svg = d3
    .select(svgContainer.value)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

  // Définir les gradients et filtres
  const defs = svg.append("defs");

  // Gradient pour le fond
  const backgroundGradient = defs
    .append("linearGradient")
    .attr("id", "backgroundGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  backgroundGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#00853F")
    .attr("stop-opacity", 0.2);

  backgroundGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#00853F")
    .attr("stop-opacity", 0.1);

  // Filtre pour l'ombre
  const dropShadow = defs
    .append("filter")
    .attr("id", "dropShadow")
    .attr("height", "130%");

  dropShadow
    .append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 3)
    .attr("result", "blur");

  dropShadow
    .append("feOffset")
    .attr("in", "blur")
    .attr("dx", 2)
    .attr("dy", 2)
    .attr("result", "offsetBlur");

  const feMerge = dropShadow.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "offsetBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  // Groupe principal
  const g = svg.append("g").attr("transform", `translate(50, 50)`);

  // Dessiner une forme simplifiée du Sénégal
  const senegalPath = `M0,0 L300,0 L300,200 L0,200 Z`; // Exemple simplifié

  g.append("path")
    .attr("d", senegalPath)
    .attr("fill", "url(#backgroundGradient)")
    .attr("stroke", "#00853F")
    .attr("stroke-width", 2)
    .attr("filter", "url(#dropShadow)");

  // Ajouter des marqueurs pour les principales villes
  const cities = [
    { name: "Dakar", x: 30, y: 100 },
    { name: "Saint-Louis", x: 80, y: 50 },
    { name: "Thiès", x: 60, y: 120 },
    // Ajoutez d'autres villes
  ];

  const cityGroups = g
    .selectAll(".city")
    .data(cities)
    .enter()
    .append("g")
    .attr("class", "city")
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

  // Cercles pour les villes
  cityGroups
    .append("circle")
    .attr("r", 4)
    .attr("fill", "#E31B23")
    .attr("stroke", "white")
    .attr("stroke-width", 1);

  // Labels des villes
  cityGroups
    .append("text")
    .attr("x", 8)
    .attr("y", 4)
    .text((d) => d.name)
    .attr("font-size", "10px")
    .attr("fill", "#333");
};

const downloadSVG = () => {
  if (!svgContainer.value) return;

  const svgData = svgContainer.value.innerHTML;
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  const downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = "senegal_map.svg";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(svgUrl);
};

onMounted(() => {
  drawSenegalMap();
});
</script>
