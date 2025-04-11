// composables/d3/useHemicycle.ts
import * as d3 from "d3";

export interface SeatData {
  coalition: string;
  color: string;
  seats: number;
}

export function useHemicycle() {
  const containerRef = ref<HTMLElement | null>(null);

  const createHemicycle = (
    data: SeatData[],
    options = {
      width: 800,
      height: 400,
      innerRadius: 100,
      outerRadius: 200,
    },
  ) => {
    if (!containerRef.value) return;

    // Nettoyer le conteneur
    d3.select(containerRef.value).selectAll("*").remove();

    const { width, height, innerRadius, outerRadius } = options;

    // Créer le SVG
    const svg = d3
      .select(containerRef.value)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2},${height * 0.7})`);

    // Calculer le nombre total de sièges et l'angle par siège
    const totalSeats = data.reduce((acc, curr) => acc + curr.seats, 0);
    const anglePerSeat = Math.PI / totalSeats;

    // Créer un tableau avec la position de chaque siège
    let seats: Array<{ index: number; coalition: string; color: string }> = [];
    let currentSeat = 0;

    data.forEach((coalition) => {
      for (let i = 0; i < coalition.seats; i++) {
        seats.push({
          index: currentSeat,
          coalition: coalition.coalition,
          color: coalition.color,
        });
        currentSeat++;
      }
    });

    // Fonction pour calculer la position de chaque siège
    const calculateSeatPosition = (index: number, radius: number) => {
      const angle = Math.PI - index * anglePerSeat;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    };

    // Créer les rangées de sièges (5 rangées)
    const rowCount = 5;
    const radiusStep = (outerRadius - innerRadius) / (rowCount - 1);

    for (let row = 0; row < rowCount; row++) {
      const radius = innerRadius + row * radiusStep;
      const seatsInRow = Math.floor(totalSeats / rowCount);
      const startSeat = row * seatsInRow;
      const endSeat = startSeat + seatsInRow;

      // Créer les sièges pour cette rangée
      const seatGroup = svg.append("g").attr("class", `row-${row}`);

      for (let i = startSeat; i < endSeat && i < seats.length; i++) {
        const pos = calculateSeatPosition(i, radius);
        const seat = seats[i];

        seatGroup
          .append("circle")
          .attr("cx", pos.x)
          .attr("cy", pos.y)
          .attr("r", 6)
          .attr("fill", seat.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("class", "seat")
          .on("mouseover", function (event) {
            d3.select(this).transition().duration(200).attr("r", 8);
          })
          .on("mouseout", function () {
            d3.select(this).transition().duration(200).attr("r", 6);
          });
      }
    }

    // Ajouter la légende
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${-width / 2 + 20}, ${-height / 2 + 20})`);

    data.forEach((coalition, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", coalition.color);

      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(`${coalition.coalition} (${coalition.seats})`);
    });
  };

  onUnmounted(() => {
    if (containerRef.value) {
      d3.select(containerRef.value).selectAll("*").remove();
    }
  });

  return {
    containerRef,
    createHemicycle,
  };
}
