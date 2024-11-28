<template>
  <div class="mb-6 mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
    <ElectionMenuSieges />
    <ElectionMenuDepute />
    <ElectionMenuClassement />
    <ElectionMenuInfo />
  </div>
</template>

<style scoped>
.grid {
  gap: 0.5rem; /* Espacement entre les deux blocs */
}

.relative {
  transition: transform 0.3s ease-in-out;
}

.relative:hover {
  transform: scale(1.02);
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
