<template>
    <NuxtLink :to="`/`">
        <div class="flex flex-col items-center py-2">
            <!-- <div class="flag-logo px-2.5">
                <img src="~/assets/logos/logo.svg" loading="lazy" alt="Logo" class="flag-logo" />
            </div> -->
            <div class="text-xs">
                <h2 class="text-gray-500 tracking-wide font-bold ">Vie-Publique.sn</h2>
                <img src="~/assets/logos/flag.png" loading="lazy" alt="Logo" class="flag-logo" />
                <p class="text-gray-500">Au cœur du débat public au Sénégal</p>
            </div>
        </div>
    </NuxtLink>
</template>

<style scoped>
.flag-logo {
    height: auto;
    width: 80px;
}
</style>