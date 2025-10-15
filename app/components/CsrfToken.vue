<template>
  <input type="hidden" name="csrf-token" :value="csrfToken" />
</template>

<script setup>
const csrfToken = ref("");

onMounted(async () => {
  try {
    // Récupérer le token CSRF depuis le cookie
    const response = await fetch("/api/csrf-token", {
      credentials: "include",
    });
    const data = await response.json();
    csrfToken.value = data.token;
  } catch (error) {
    console.error("Erreur lors de la récupération du token CSRF:", error);
  }
});
</script>
