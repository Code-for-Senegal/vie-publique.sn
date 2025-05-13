<template>
    <div>
        <pre>{{ data }}</pre>
    </div>
</template>

<script setup>
const { data, error } = useFetch("/api/councyl-minister");
</script>