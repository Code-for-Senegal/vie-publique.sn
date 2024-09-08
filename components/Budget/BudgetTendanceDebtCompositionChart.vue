<script setup lang="ts">
import * as d3 from "d3";
import { onMounted, ref } from "vue";

interface DebtData {
  year: number;
  totalDebt: number;
  fiscalDeficit: number;
}

const data: DebtData[] = [
  { year: 2018, totalDebt: 63.2, fiscalDeficit: -3.5 },
  { year: 2019, totalDebt: 64.0, fiscalDeficit: -3.9 },
  { year: 2020, totalDebt: 69.1, fiscalDeficit: -6.4 },
  { year: 2021, totalDebt: 73.2, fiscalDeficit: -5.4 },
  { year: 2022, totalDebt: 77.0, fiscalDeficit: -4.8 },
  { year: 2023, totalDebt: 74.2, fiscalDeficit: -4.9 },
  { year: 2024, totalDebt: 70.1, fiscalDeficit: -3.9 },
];

const chartContainer = ref(null);

onMounted(() => {
  const resizeObserver = new ResizeObserver(() => {
    drawChart();
  });

  if (chartContainer.value) {
    resizeObserver.observe(chartContainer.value);
    drawChart();
  }

  function drawChart() {
    if (!chartContainer.value) return;

    d3.select(chartContainer.value).selectAll("*").remove();

    const containerWidth = chartContainer.value.clientWidth;
    const containerHeight = 350;

    const margin = { top: 10, right: 20, bottom: 80, left: 20 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3
      .select(chartContainer.value)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.year.toString()))
      .range([0, width])
      .padding(0.2);

    const yLeft = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.totalDebt)!])
      .range([height, 0]);

    const yRight = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.fiscalDeficit)! - 1, 0])
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(yLeft));

    svg
      .append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yRight));

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.year.toString())!)
      .attr("y", (d) => yLeft(d.totalDebt))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - yLeft(d.totalDebt))
      .attr("fill", "#1f77b4");

    const line = d3
      .line<DebtData>()
      .x((d) => x(d.year.toString())! + x.bandwidth() / 2)
      .y((d) => yRight(d.fiscalDeficit))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#FFD700")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.year.toString())! + x.bandwidth() / 2)
      .attr("cy", (d) => yRight(d.fiscalDeficit))
      .attr("r", 8)
      .attr("fill", "#ff7f0e");

    // Ajouter une légende
    // Ajouter une légende
    const legend = svg
      .append("g")
      .attr("transform", `translate(0, ${height + 40})`); // Positionnement de la première ligne

    // Première ligne de légendes
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#1f77b4"); // Couleur des barres

    legend
      .append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text("Dette publique totale (% PIB)");

    // Deuxième ligne de légendes (décalée en y)
    const legendLine2 = svg
      .append("g")
      .attr("transform", `translate(0, ${height + 60})`);

    legendLine2
      .append("circle")
      .attr("cx", 9)
      .attr("cy", 9)
      .attr("r", 6) // Taille du point dans la légende
      .style("fill", "#ff7f0e"); // Couleur des points

    legendLine2
      .append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text("Déficit budgétaire (% PIB)");
  }
});
</script>

<template>
  <div ref="chartContainer" class="debt-composition-chart"></div>
</template>

<style scoped>
.debt-composition-chart {
  width: 100%;
  height: 100%;
}
</style>
