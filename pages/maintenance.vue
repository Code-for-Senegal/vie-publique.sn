<template>
  <div class="maintenance-page">
    <div class="maintenance-content">
      <h1>Site en maintenance</h1>
      <p>
        Notre site est actuellement en maintenance. Nous serons bientôt de
        retour !
      </p>
      <div class="maintenance-image">
        <!-- <img src="/maintenance.svg" alt="Maintenance en cours" /> -->
      </div>
      <p class="eta">Temps estimé : 2 heures</p>
    </div>
  </div>
</template>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.maintenance-content {
  text-align: center;
  max-width: 600px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 20px;
}

p {
  color: #666;
  font-size: 1.2rem;
  line-height: 1.6;
}

.maintenance-image {
  margin: 40px 0;
}

.maintenance-image img {
  max-width: 300px;
  height: auto;
}

.eta {
  font-style: italic;
  margin-top: 20px;
  color: #999;
}
</style>
