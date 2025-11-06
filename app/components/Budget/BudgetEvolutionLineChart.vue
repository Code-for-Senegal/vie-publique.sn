<script setup lang="ts">
import * as d3 from 'd3';

interface EvolutionData {
  year: string;
  amount: number;
  label: string;
  versionLabel?: string;
}

interface Props {
  data: EvolutionData[];
  title: string;
  color?: 'green' | 'red' | 'blue' | 'purple' | 'orange' | 'yellow';
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
});

const chartContainer = ref<HTMLDivElement | null>(null);
const chartSvg = ref<SVGElement | null>(null);

// Mapping des couleurs
const colorMap = {
  green: { line: '#10B981', gradient1: '#34D399', gradient2: '#10B981', area: '#10B98120' },
  red: { line: '#EF4444', gradient1: '#F87171', gradient2: '#EF4444', area: '#EF444420' },
  blue: { line: '#3B82F6', gradient1: '#60A5FA', gradient2: '#3B82F6', area: '#3B82F620' },
  purple: { line: '#5924b2', gradient1: '#7c3aed', gradient2: '#5924b2', area: '#5924b220' },
  orange: { line: '#f97316', gradient1: '#fb923c', gradient2: '#f97316', area: '#f9731620' },
  yellow: { line: '#EAB308', gradient1: '#FDE047', gradient2: '#EAB308', area: '#EAB30820' },
};

const selectedColor = computed(() => colorMap[props.color]);

const drawChart = () => {
  if (!chartContainer.value || !chartSvg.value || !props.data || props.data.length === 0) return;

  // Nettoyer le SVG existant
  d3.select(chartSvg.value).selectAll('*').remove();

  const containerWidth = chartContainer.value.offsetWidth;
  const margin = { top: 20, right: 30, bottom: 50, left: 30 };
  const width = containerWidth - margin.left - margin.right;
  const height = Math.min(containerWidth * 0.5, 350) - margin.top - margin.bottom;

  const svg = d3
    .select(chartSvg.value)
    .attr('width', containerWidth)
    .attr('height', height + margin.top + margin.bottom);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // Échelles - utiliser le label complet (année + version) pour l'axe X
  const x = d3
    .scalePoint()
    .domain(props.data.map((d) => d.label))
    .range([0, width])
    .padding(0.5);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(props.data, (d) => d.amount) || 0])
    .nice()
    .range([height, 0]);

  // Defs pour les gradients
  const defs = svg.append('defs');

  // Gradient pour la ligne
  const lineGradient = defs
    .append('linearGradient')
    .attr('id', `lineGradient-${props.color}`)
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '0%');

  lineGradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', selectedColor.value.gradient1);
  lineGradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', selectedColor.value.gradient2);

  // Axe X avec année + version
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('font-weight', '500')
    .style('fill', '#6B7280');

  // Générateur de ligne
  const line = d3
    .line<EvolutionData>()
    .x((d) => x(d.label)!)
    .y((d) => y(d.amount))
    .curve(d3.curveMonotoneX);

  // Générateur d'aire
  const area = d3
    .area<EvolutionData>()
    .x((d) => x(d.label)!)
    .y0(height)
    .y1((d) => y(d.amount))
    .curve(d3.curveMonotoneX);

  // Aire avec animation
  g.append('path')
    .datum(props.data)
    .attr('fill', selectedColor.value.area)
    .attr('d', area)
    .style('opacity', 0)
    .transition()
    .duration(800)
    .style('opacity', 1);

  // Ligne avec animation
  const path = g
    .append('path')
    .datum(props.data)
    .attr('fill', 'none')
    .attr('stroke', `url(#lineGradient-${props.color})`)
    .attr('stroke-width', 3)
    .attr('d', line);

  const totalLength = path.node()!.getTotalLength();

  path
    .attr('stroke-dasharray', totalLength + ' ' + totalLength)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(1200)
    .ease(d3.easeLinear)
    .attr('stroke-dashoffset', 0);

  // Points sur la courbe
  g.selectAll('.dot')
    .data(props.data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', (d) => x(d.label)!)
    .attr('cy', (d) => y(d.amount))
    .attr('r', 0)
    .attr('fill', 'white')
    .attr('stroke', selectedColor.value.line)
    .attr('stroke-width', 2)
    .transition()
    .delay(1200)
    .duration(400)
    .attr('r', 5);

  // Labels au-dessus des points (arrondis sans décimales)
  g.selectAll('.label')
    .data(props.data)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', (d) => x(d.label)!)
    .attr('y', (d) => y(d.amount) - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('font-weight', 'bold')
    .style('fill', selectedColor.value.line)
    .style('opacity', 0)
    .text((d) => Math.round(d.amount).toLocaleString())
    .transition()
    .delay(1600)
    .duration(400)
    .style('opacity', 1);
};

// Redessiner le graphique lors du redimensionnement
const handleResize = () => {
  drawChart();
};

// Watcher pour redessiner quand les données changent
watch(
  () => [props.data, props.color],
  () => {
    drawChart();
  },
  { deep: true },
);

onMounted(() => {
  drawChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="rounded-xl bg-white p-2 shadow-sm sm:p-6 dark:bg-gray-800">
    <h3 class="mb-4 text-center text-lg font-bold text-gray-900 dark:text-white">
      {{ title }}
    </h3>
    <div ref="chartContainer" class="w-full">
      <svg ref="chartSvg" class="w-full"></svg>
    </div>
  </div>
</template>
