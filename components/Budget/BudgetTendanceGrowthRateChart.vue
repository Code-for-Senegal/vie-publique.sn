<template>
  <div ref="chartContainer" class="growth-rate-chart"></div>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import { onMounted, ref, watch } from "vue";

interface GrowthRateData {
  year: number;
  rate: number;
}

const props = defineProps<{
  growthRates: GrowthRateData[];
}>();

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

    // Clear previous SVG elements
    d3.select(chartContainer.value).selectAll("*").remove();

    // Get dimensions of the parent container
    const containerWidth = chartContainer.value.clientWidth;
    // const containerHeight = chartContainer.value.clientHeight;
    const containerHeight = 300; // Reduced height for a more compact design

    const margin = { top: 10, right: 20, bottom: 30, left: 20 };
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
      .scaleLinear()
      .domain([
        d3.min(props.growthRates, (d) => d.year) as number,
        d3.max(props.growthRates, (d) => d.year) as number,
      ])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(props.growthRates, (d) => d.rate) as number])
      .nice()
      .range([height, 0]);

    const line = d3
      .line<GrowthRateData>()
      .x((d) => x(d.year))
      .y((d) => y(d.rate));

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(props.growthRates.length)
          .tickFormat(d3.format("d")),
      );

    svg.append("g").call(d3.axisLeft(y));

    // #44403c #69b3a2

    svg
      .append("path")
      .datum(props.growthRates)
      .attr("fill", "none")
      .attr("stroke", "#1c1917")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .selectAll("dot")
      .data(props.growthRates)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.rate))
      .attr("r", 4)
      .attr("fill", "#ff7f0e");

    svg
      .selectAll("text.label")
      .data(props.growthRates)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.rate) - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#000")
      .text((d) => `${d.rate}%`);
  }
});
</script>

<style scoped>
.growth-rate-chart {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
</style>
