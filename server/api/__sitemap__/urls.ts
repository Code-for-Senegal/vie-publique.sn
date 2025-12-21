import { defineSitemapEventHandler } from '#imports';
import { readItems } from '@directus/sdk';

export default defineSitemapEventHandler(async () => {
  const urls: any[] = [];

  try {
    const directus = getCmsClient();

    // 1. Documents
    const documents = await directus.request(
      readItems('documents', {
        fields: ['slug', 'id', 'date_updated', 'publish_date'],
        filter: {
          status: { _eq: 'published' },
        },
        limit: -1,
        sort: ['-publish_date'],
      }),
    );

    for (const doc of documents) {
      urls.push({
        loc: `/documents/${doc.id}/${doc.slug}`,
        lastmod: doc.date_updated || doc.publish_date,
        changefreq: 'monthly',
        priority: 0.7,
      });
    }

    // 2. Actualités et Conseil des ministres
    const news = await directus.request(
      readItems('news', {
        fields: ['slug', 'id', 'date_updated', 'date_published', 'category.name'],
        filter: {
          status: { _eq: 'published' },
        },
        limit: -1,
        sort: ['-date_published'],
      }),
    );

    for (const item of news) {
      let path = `/actualites/${item.id}/${item.slug}`;
      let priority = 0.8;

      if (item.category?.name === 'Conseil des ministres') {
        path = `/conseil-des-ministres/${item.id}/${item.slug}`;
        priority = 0.9;
      }

      urls.push({
        loc: path,
        lastmod: item.date_updated || item.date_published,
        changefreq: 'weekly',
        priority: priority,
      });
    }

    // 3. Députés
    const deputies = await directus.request(
      readItems('assembly_deputy', {
        fields: ['id', 'first_name', 'last_name', 'date_updated'],
        limit: -1,
        sort: ['last_name'],
      }),
    );

    const slugify = (text: string) => {
      return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
    };

    for (const deputy of deputies) {
      const fullName = `${deputy.first_name} ${deputy.last_name}`;
      const slug = slugify(fullName);
      urls.push({
        loc: `/assemblee-nationale/deputes/${deputy.id}/${slug}`,
        lastmod: deputy.date_updated,
        changefreq: 'monthly',
        priority: 0.6,
      });
    }

    // 4. Pages statiques : Laissées à l'auto-découverte de Nuxt Sitemap
    // Le module @nuxtjs/seo va automatiquement inclure toutes les pages du dossier /pages
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
  }

  return urls;
});
