## Tailwind Viewer

http://localhost:3000/\_tailwind/

## SEO links

http://localhost:3000/robots.txt
http://localhost:3000//sitemap.xml
http://localhost:3000/sitemap.xml?canonical

## install dependencies

## Creation

Project was created with this command

```bash
pnpm dlx nuxi@latest init nuxt-senegal-reports
```

nexui was added with following command

```bash
pnpm dlx nuxi@latest module add ui
```

others module added with following command

```bash
pnpm dlx nuxi@latest module add content
pnpm dlx nuxi@latest module add seo
pnpm dlx nuxi@latest module add web-vitals
pnpm dlx nuxi@latest module add image

pnpm install @tailwindcss/typography
```

To add dynamics url on sitemap.xml

```bash
pnpm dlx nuxi@latest module add sitemap
```

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

## youtube vidéo in markdown

https://dev.to/devbyrayray/how-to-embed-youtube-in-nuxt-website-via-markdown-file-5bpe

pnpm install lite-youtube-embed

## fetch

https://github.com/nuxt/nuxt/discussions/16294

useStore or cache

##JO

Ajout du plugin @tailwindcss/typography qui ajoute un ensemble de classes utilitaires pour styler du contenu typographique riche, particulièrement utile pour le contenu généré par un CMS ou des fichiers Markdown.

##

# add PR section on readme

https://raw.githubusercontent.com/decaporg/decap-cms/main/CONTRIBUTING.md
Pull Requests

We actively welcome your pull requests!

If you need help with Git or our workflow, please ask in our [community chat](https://decapcms.org/chat). We want your contributions even if you're just learning Git. Our maintainers are happy to help!

Decap CMS uses the [Forking Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow) + [Feature Branches](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow). Additionally, PR's should be [rebased](https://www.atlassian.com/git/tutorials/merging-vs-rebasing) on main when opened, and again before merging.

1. Fork the repo.
2. Create a branch from `main`. If you're addressing a specific issue, prefix your branch name with the issue number.
3. If you've added code that should be tested, add tests.
4. If you've changed APIs, update the documentation.
5. Run `npm run test` and ensure the test suite passes.
6. Use `npm run format` to format and lint your code.
7. PR's must be rebased before merge (feel free to ask for help).
8. PR should be reviewed by two maintainers prior to merging.
