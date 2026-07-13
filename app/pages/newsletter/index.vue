<script setup lang="ts">
const { siteUrl } = useSiteMetadata();

const title = "Newsletter : l'essentiel de l'information publique par email";
const description =
  "Recevez par email l'essentiel de l'information publique au Sénégal : Conseil des ministres, Journal officiel, lois et décrets, nominations, dossiers. Gratuit, désabonnement en un clic.";

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogUrl: `${siteUrl}/newsletter`,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
});
</script>

<template>
  <div class="container mx-auto min-h-screen max-w-3xl px-4 py-4 pb-16">
    <AppBreadcrumb :items="[{ label: 'Newsletter' }]" />

    <h1 class="mt-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Newsletter</h1>

    <p class="mt-3 text-gray-600 dark:text-gray-300">
      Recevez par email l'essentiel de l'information publique au Sénégal, à partir des textes
      officiels. Gratuit, sans publicité.
    </p>

    <!-- Formulaire d'inscription -->
    <div class="mt-8 rounded-lg bg-gray-50 p-5 dark:bg-gray-800 sm:p-6">
      <NewsletterForm />
      <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Votre adresse n'est jamais partagée. Désabonnement en un clic depuis chaque email.
      </p>
    </div>

    <!-- Ce que vous recevez -->
    <section class="mt-12">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Ce que vous recevez</h2>
      <ul class="mt-2 divide-y divide-gray-100 dark:divide-gray-700">
        <li class="py-3">
          <p class="font-medium text-gray-900 dark:text-white">Conseil des ministres</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Communiqués, décisions et nominations, dès leur publication.
          </p>
        </li>
        <li class="py-3">
          <p class="font-medium text-gray-900 dark:text-white">Journal officiel et documents</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Lois, décrets, arrêtés et rapports publics ajoutés au site.
          </p>
        </li>
        <li class="py-3">
          <p class="font-medium text-gray-900 dark:text-white">Dossiers thématiques</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Les grands sujets expliqués simplement : réformes, budget, institutions.
          </p>
        </li>
        <li class="py-3">
          <p class="font-medium text-gray-900 dark:text-white">Actualités de la plateforme</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Nouvelles fonctionnalités et nouveaux contenus de Vie-Publique Sénégal.
          </p>
        </li>
      </ul>
      <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Nous envoyons peu d'emails : uniquement quand il y a de l'information qui compte.
      </p>
    </section>

    <!-- Autres moyens de nous suivre -->
    <section class="mt-12 border-t border-gray-100 pt-8 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Autres moyens de nous suivre
      </h2>
      <ul class="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
        <li>
          <a href="/rss.xml" class="text-primary font-medium hover:underline">Flux RSS</a>
          — suivez les nouvelles publications depuis votre lecteur RSS.
        </li>
        <li>
          <NuxtLink to="/app" class="text-primary font-medium hover:underline"
            >Application mobile</NuxtLink
          >
          — toute l'information publique sur Android et iPhone.
        </li>
      </ul>
    </section>
  </div>
</template>
