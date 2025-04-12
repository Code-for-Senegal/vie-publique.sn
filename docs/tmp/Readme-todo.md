# TODO LIST

## dette technique

- [ ] Test

  - Cypress https://www.cypress.io

- [ ] factoriser la route api pour les nominations
- [ ] créer route page /conseils-interministeriels/

- code style https://nuxt.com/docs/guide/concepts/code-style

  - [ ] Eslint

    - https://eslint.nuxt.com/
    - https://dev.to/nikitadmitr/configure-eslint-prettier-for-nuxt-3-45f7

    npx nuxi module add eslint
    npm i -D prettier eslint
    npm i -D @nuxt/eslint-config eslint-plugin-prettier eslint-config-prettier @types/eslint-config-prettier
    npm add -D prettier-plugin-tailwindcss

    configure your

## Feat

- [x] Report - List
- [x] Report - Filter by date or institution
- [x] Report - search by name
- [*] Report - Detail page
  - [ ] Preview pdf
  - [x] resumé
  - [ ] pinned people
- [x] Download report

- [x] List pinned peoples
- [ ] Blog / List financial scandal

- [x] Privacy
- [x] About us / qui somme nous https://www.vie-publique.fr/qui-sommes-nous

- [x] Website - List
- [x] Website - Filter by type and search

- [x] Nomination - List
- [x] Nomination - Search and Filter by role

- [ ] page de contact avec mail pro
- [ ] bouton de contribution
- [ ] page de contact avec le mail - contact@vie-publique.sn

- liste ambassadeur
- liste maire
- liste députés
-

## Deployment

- [x] Deploy to VERCEL
- [x] Deploy to netlify
- [ ] Deploy to firebase

## SEO

- [ ] SEO [100%](https://nuxtseo.com/)
- [x] robots.txt https://nuxt.com/modules/robots
- [x] sitemap https://nuxt.com/modules/sitemap
- [] se nuxtseo in place of module https://nuxtseo.com/nuxt-seo/getting-started/what-is-nuxt-seo
- [ ] Includes recommended SEO meta tags and description
- [ ] header and cache
- submit sitemap https://nuxtseo.com/sitemap/guides/submitting-sitemap
- https://1.fr/
- smrush

## Performance

- [ ] Headless CMS

- [ ] Backend firebase

- [ ] PWA avec @nuxtjs/pwa
- [ ] SSR
- [ ] cache
      https://developer.mozilla.org/fr/docs/Web/API/Cache
- [ ] Optimiser les images :
  - format image webP
  - utiliser @nuxt/image
- [x] web vital
  - https://dev.to/jacobandrewsky/measuring-nuxt-performance-with-web-vitals-1l1e
  - https://nuxt.com/modules/web-vitals
  - https://web.dev/articles/vitals?hl=fr
- [ ] enable gzip

- [ ] filtrage et pagination côté serveur
- active cache on api request, async fetch , https://www.youtube.com/watch?v=aQPR0xn-MMk

https://web.dev/explore/fast?hl=fr

https://web.dev/learn/performance/why-speed-matters?hl=fr

https://developers.google.com/speed?hl=fr

## UI/UX

- [ ] UI - Dark/Ligh theme
- [x] UI - Fixed header menu

- [x] Display a placeholder while content is loading https://ui.nuxt.com/components/skeleton
- [ ] Dark mode https://ui.nuxt.com/getting-started/theming#dark-mode
- [ ] shadcdn https://www.shadcn-vue.com/

- Tailwindcss
  - [ ] tailwind.config.ts (https://www.youtube.com/watch?v=SE_ysS_ZXbk)

* UI - entete
  like https://www.service-public.fr/
  drapeaux vie-publique.sn
  Sénégal référentiel des info publiques au Sénégal

- Refactor
  - UButton, can take property to="/"
- CMS

  - combiner avec un CMS robuste pour la gestion du contenu.

- Docker

  - https://markus.oberlehner.net/blog/running-nuxt-3-in-a-docker-container/

- [] Newsletter

https://www.brevo.com/fr/blog/conseils-pour-ameliorer-formulaire-newsletter/

https://www.brevo.com/fr/blog/creer-une-newsletter/

https://devbits.ph/azelalynetan/how-to-setup-brevo-with-nuxtjs-and-dqxm

- update package

  - npm update @getbrevo/brevo @nuxtjs/seo

- Sécurité
  - vol de contenu
  - scrapping
  - attaques ddos
  - https://claude.ai/chat/c6fc2b88-9d37-4a85-8793-8ba83cf9ab29
  - https://chatgpt.com/c/e8e2b11d-7d48-4d0e-bdab-2f6f15b9ffde
  - https://nuxt-security.vercel.app/documentation/middleware/csrf

## Meta Pixel

- porteilfeille business
- avoir compte business manager
- créer pixel
- config sur nuxt

https://scripts.nuxt.com/scripts/tracking/meta-pixel*

1557184355168678

```

<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1648393469361096');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1648393469361096&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->

```
