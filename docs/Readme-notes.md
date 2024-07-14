## Tailwind Viewer

http://localhost:3000/\_tailwind/

## SEO links

http://localhost:3000/robots.txt
http://localhost:3000//sitemap.xml
http://localhost:3000/sitemap.xml?canonical

## install dependencies

````bash
pnpm clean
rm -rf node_modules
pnpm install
```bash

## Development Server with Docker

Start the development server on `http://localhost:3000`:

```bash
docker-compose up
docker compose -f docker-compose.dev.yml up --build

````

## Partage sur les réseaux sociaux

Tester la Configuration
Facebook Debugger : Utilise l'outil Facebook Debugger pour vérifier que l'image est correctement détectée.
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

Twitter Card Validator : Utilise cet outil pour valider que les balises Twitter Card fonctionnent correctement.
[Twitter Card Validator](https://cards-dev.twitter.com/validator)

https://www.bannerbear.com/tools/twitter-card-preview-tool/#image_result

## photos inconnu

https://www.alleganyco.gov/wp-content/uploads/unknown-person-icon-Image-from.png

https://www.pngitem.com/pimgs/m/618-6183618_transparent-unknown-person-png-transparent-background-female-user.png

## colors

palette colors tailwind css
https://tailwindcss.com/docs/customizing-colors#color-palette-reference

## SEO Config

```
 robots: {
    allow: [
      "/",
      "/reports",
      "/individuals-cited",
      "/about/us",
      "/about/privacy",
    ],
    disallow: [
      "/financial-scandals",
      "/nominations",
      "/siteweb"
    ],
  },
  sitemap: {
    include: [
      "/",
      "/reports/**",
      "/individuals-cited/**",
      "/about/us/",
      "/about/privacy/",
    ],
    exclude: [
      "/financial-scandals/**",
      "/nominations",
      "/siteweb/**",
    ],
  }
```

## Ajout rapport details

```
{
        "id": "xxx",
        "summary": [
            {
                "title": "",
                "content": ""
            },
            {
                "title": "",
                "content": ""
            }
        ],
        "title": "",
        "investigations": []
    }
```

## Site web

- liste site
- paginattion
- recherche nom
- filtre par type
- details site (ip, localisation)
- analytics events
- total site

```bash
pnpm install papaparse
```

https://github.com/senegalouvert/annuaire-sites-publics-senegal

https://raw.githubusercontent.com/senegalouvert/annuaire-sites-publics-senegal/master/data/annuaire.csv

https://github.com/malicktech/annuaire-sites-publics-senegal-ui/blob/main/src/components/SitesTable.vue

http://localhost:3000/api/reports
http://localhost:3000/api/websites

## Quiz

https://motion.vueuse.org/getting-started/nuxt

pnpm install @vueuse/motion

Aléatoire et Limitation : Nous avons ajouté une fonction shuffleArray pour randomiser les questions et limiter le quiz à 10 questions.
Feedback Immedié : Les explications et les résultats sont affichés immédiatement après chaque réponse.
Responsive : L'interface utilise TailwindCSS, qui est responsive par défaut.
Animations : Nous avons intégré vueuse/motion pour ajouter des animations aux éléments qui changent, comme les feedbacks corrects ou incorrects.

v-if="question !== null && question.length > 1"

http://localhost:3000/api/quiz

pnpm install vue3-circle-progress
pnpm uninstall vue3-circle-progress

## fetch

https://github.com/nuxt/nuxt/discussions/16294

useStore or cache

## menu

```
<script setup lang="ts">
const route = useRoute()

const links = [
  {
    label: 'Rapports publics',
    // icon: 'i-heroicons-document-chart-bar',
    to: '/',
  },
  {
    label: 'Personnes épinglées',
    // icon: 'i-heroicons-user',
    to: '/individuals-cited',
  },
  {
    label: 'Annuaire site web',
    // icon: 'i-heroicons-newspaper',
    to: '/annuaire-sites-publics-senegal',
  },
  // {
  //   label: 'À Propos',
  //    icon: 'i-heroicons-newspaper',
  //   to: '/about/us',
  // }
]

const people = [{
  id: 'benjamincanac',
  label: 'benjamincanac',
  href: 'https://github.com/benjamincanac',
  target: '_blank',
  icon: 'i-heroicons-user',
}, {
  id: 'smarroufin',
  label: 'smarroufin',
  href: 'https://github.com/smarroufin',
  target: '_blank',
  icon: 'i-heroicons-newspaper',
}, {
  id: 'nobody',
  label: 'Nobody',
  icon: 'i-heroicons-user-circle'
}]

const selected = ref('');
</script>

<template>
  <UContainer class="mt-2 px-0 sm:px-10 md:px-20 lg:px-40">

    <div class="flex flex-row	items-center">
      <HeaderBrand />

      <!-- <USelectMenu v-model="selected" :options="links">
    <template #leading>
      <NuxtLink :to="${selected.to}" class="flex flex-row gap-2">
      <UIcon v-if="selected.icon" :name="(selected.icon as string)" class="w-5 h-5" />
      <UAvatar v-else-if="selected.avatar" v-bind="(selected.avatar as Avatar)" size="2xs" />
    </NuxtLink>
    </template>
</USelectMenu> -->

      <!-- <USelectMenu v-slot="{ open }" v-model="selected" :options="people">
        <template #leading>
          <UIcon v-if="selected.icon" :name="(selected.icon as string)" class="w-5 h-5" />
        </template>
      </USelectMenu> -->
    </div>

    <UDivider />

    <UHorizontalNavigation :links="links"
      class="border-b border-gray-200 dark:border-gray-800 mx-auto mb-3 top-0 z-50 sm:justify-center">
      <template #default="{ link }">
        <span class="group-hover:text-primary relative">{{ link.label }}</span>
      </template>
    </UHorizontalNavigation>


    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <Footer />

  </UContainer>
</template>

```
