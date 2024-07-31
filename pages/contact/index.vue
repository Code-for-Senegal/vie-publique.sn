<script setup lang="ts">

/* SEO */
useHead({
    title: 'Contact | Vie-Publique.sn',
    meta: [
        {
            name: 'description',
            content: 'Contactez-nous via email ou sur nos réseaux sociaux.',
        },
    ],
})

const name = ref('')
const email = ref('')
const message = ref('')

const submitForm = () => {
    // Ajouter la logique pour gérer l'envoi du formulaire
    alert(`Nom: ${name.value}\nEmail: ${email.value}\nMessage: ${message.value}`)
}
</script>

<template>


    <div class="flex flex-col items-center px-4 sm:px-8">

        <div class="prose prose-sm sm:prose mx-auto my-2">
            <h1 class="text-center">
                Contactez-nous
            </h1>
        </div>

        <div class="w-full max-w-4xl text-center">
            <div class="mb-4">
                <h2 class="text-sm text-gray-500">Envoyez nous un Email à l'adresse mail suivante</h2>
                <p class="text-blue-600 hover:text-blue-800 underline">
                    <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>
                </p>
            </div>
            <div class=" hidden mb-4">
                <h2 class="text-md text-gray-500">Twitter</h2>
                <a href="https://x.com/malick_yacine" target="_blank" rel="noopener"
                    class="text-blue-600 hover:text-blue-600 space-x-2">
                    <!-- <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M23.954 4.569a9.918 9.918 0 0 1-2.825.775 4.932 4.932 0 0 0 2.165-2.724 9.865 9.865 0 0 1-3.127 1.195 4.924 4.924 0 0 0-8.388 4.482A13.978 13.978 0 0 1 1.671 3.149a4.905 4.905 0 0 0 1.523 6.574 4.895 4.895 0 0 1-2.231-.616v.061a4.925 4.925 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.224.085 4.93 4.93 0 0 0 4.604 3.417A9.874 9.874 0 0 1 .94 20.895a13.949 13.949 0 0 0 7.548 2.212c9.058 0 14.01-7.498 14.01-13.987 0-.21-.005-.422-.015-.633A10.01 10.01 0 0 0 24 4.59z" />
                    </svg> -->

                    <!-- <UIcon name="i-heroicons-light-bulb" /> -->
                    <span>@malicktech</span>
                </a>
            </div>

            <div class=" hidden mb-4">
                <h2 class="text-md text-gray-500">Linkedin</h2>
                <a href="https://linkedin.com/in/malicktech/" target="_blank" rel="noopener"
                    class="text-blue-600 hover:text-blue-800 space-x-2">
                    <!-- <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0zM7.2 20.45H3.56V9h3.64v11.45zM5.38 7.58c-1.15 0-2.07-.93-2.07-2.07s.93-2.07 2.07-2.07c1.14 0 2.07.93 2.07 2.07.01 1.14-.92 2.07-2.07 2.07zM20.45 20.45h-3.64v-5.91c0-1.41-.03-3.21-1.96-3.21-1.97 0-2.27 1.53-2.27 3.11v6.01H9.5V9h3.49v1.56h.05c.49-.93 1.7-1.91 3.5-1.91 3.74 0 4.43 2.46 4.43 5.66v6.14h-.02z" />
                    </svg> -->
                    <span>@malicktech</span>
                </a>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
