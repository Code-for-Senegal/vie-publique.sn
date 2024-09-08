// composables/useInstitution.ts

export function getInstitutionColor(index: number): string {
  const colors = [
    "#4299E1",
    "#48BB78",
    "#ED8936",
    "#ECC94B",
    "#9F7AEA",
    "#ED64A6",
    "#38B2AC",
    "#F56565",
  ];
  return colors[index % colors.length];
}
