import { defineSitemapEventHandler } from '#imports';
import { readItems } from '@directus/sdk';

export default defineSitemapEventHandler(async () => {
  const urls: any[] = [];

  const toISODate = (date: string | null | undefined): string | undefined => {
    if (!date) return undefined;
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString();
  };

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
      const lastmod = toISODate(doc.date_updated) || toISODate(doc.publish_date);
      urls.push({
        loc: `/documents/${doc.id}/${doc.slug}`,
        ...(lastmod && { lastmod }),
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

      const lastmod = toISODate(item.date_updated) || toISODate(item.date_published);
      urls.push({
        loc: path,
        ...(lastmod && { lastmod }),
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
      const lastmod = toISODate(deputy.date_updated);
      urls.push({
        loc: `/assemblee-nationale/deputes/${deputy.id}/${slug}`,
        ...(lastmod && { lastmod }),
        changefreq: 'monthly',
        priority: 0.6,
      });
    }

    // 3b. Dossiers thématiques
    try {
      const dossiers = await directus.request(
        readItems('dossier', {
          fields: ['slug', 'date_updated', 'publish_date'],
          filter: {
            status: { _eq: 'published' },
          },
          limit: -1,
          sort: ['-publish_date'],
        }),
      );

      for (const dossier of dossiers as any[]) {
        if (!dossier.slug) continue;
        const lastmod = toISODate(dossier.date_updated) || toISODate(dossier.publish_date);
        urls.push({
          loc: `/dossiers/${dossier.slug}`,
          ...(lastmod && { lastmod }),
          changefreq: 'weekly',
          priority: 0.9,
        });
      }
    } catch (sitemapError) {
      console.warn('Erreur sitemap dossiers:', sitemapError);
    }

    // 4. Projets Publics
    try {
      // Pages dashboards (PRES et PIP)
      urls.push(
        { loc: '/projets-publics-senegal/pres', changefreq: 'weekly', priority: 0.8 },
        { loc: '/projets-publics-senegal/pip', changefreq: 'weekly', priority: 0.8 },
      );

      // Fiches projets
      const publicProjects = await directus.request(
        readItems('public_project', {
          fields: ['slug', 'date_updated'],
          filter: {
            status: { _eq: 'published' },
          },
          limit: -1,
        }),
      );

      for (const project of publicProjects) {
        const lastmod = toISODate(project.date_updated);
        urls.push({
          loc: `/projets-publics-senegal/${project.slug}`,
          ...(lastmod && { lastmod }),
          changefreq: 'monthly',
          priority: 0.7,
        });
      }
    } catch (sitemapError) {
      console.warn('Erreur sitemap projets publics:', sitemapError);
    }

    // 5. Pages archives par année
    try {
      const yearsData = await directus.request(
        readItems('documents', {
          fields: ['publish_date'],
          filter: { status: { _eq: 'published' }, publish_date: { _nnull: true } },
          groupBy: ['year(publish_date)'],
          aggregate: { countDistinct: 'id' },
          limit: -1,
        }),
      );

      const categories = [
        'journal-officiel-senegal',
        'rapports-audit',
        'strategies',
        'codes',
        'budget',
      ];

      // Page index archives
      urls.push({
        loc: '/documents/annee',
        changefreq: 'monthly',
        priority: 0.6,
      });

      for (const item of yearsData as any[]) {
        const year = item.publish_date_year;
        if (!year) continue;

        // Page année globale
        urls.push({
          loc: `/documents/annee/${year}`,
          changefreq: 'monthly',
          priority: 0.5,
        });

        // Pages année par catégorie
        for (const cat of categories) {
          urls.push({
            loc: `/documents/${cat}/annee/${year}`,
            changefreq: 'monthly',
            priority: 0.5,
          });
        }
      }
    } catch (sitemapError) {
      console.warn('Erreur sitemap archives années:', sitemapError);
    }

    // 6. Personnalités publiques
    try {
      const publicPersons = await directus.request(
        readItems('public_persons', {
          fields: ['id', 'slug', 'full_name', 'date_updated'],
          filter: {
            status: { _eq: 'published' },
          },
          limit: -1,
          sort: ['full_name'],
        }),
      );

      for (const person of publicPersons) {
        const personSlug = person.slug || slugify(person.full_name);
        const lastmod = toISODate(person.date_updated);
        urls.push({
          loc: `/personnalites/${person.id}/${personSlug}`,
          ...(lastmod && { lastmod }),
          changefreq: 'monthly',
          priority: 0.7,
        });
      }
    } catch (sitemapError) {
      console.warn('Erreur sitemap personnalités publiques:', sitemapError);
    }

    // 7. Entités publiques de l'État du Sénégal
    // Source de vérité : les snapshots du décret actif (seules les entités
    // présentes dans ce snapshot existent réellement — les entités supprimées
    // dans n'importe quelle transition passée sont automatiquement exclues).
    try {
      const sitemapDecrees = await directus.request(
        readItems('state_organization_decree', {
          fields: ['id', 'status'],
          filter: { status: { _neq: 'draft' } },
          sort: ['-date_publication'],
          limit: 10,
        }),
      );

      const activeDecree =
        (sitemapDecrees as any[]).find((d: any) => d.status === 'active') ||
        (sitemapDecrees as any[])[0];

      // Pages statiques non auto-découvertes (sous-dossier /organisation)
      urls.push(
        { loc: '/etat-senegal/organisation', changefreq: 'weekly', priority: 0.8 },
        { loc: '/etat-senegal/organisation/changements', changefreq: 'weekly', priority: 0.7 },
      );

      if (activeDecree) {
        // Seules les entités présentes dans le snapshot actif sont vivantes
        const activeSnapshots = await directus.request(
          readItems('state_organization_entity_snapshot', {
            fields: [
              'public_entity.slug',
              'public_entity.date_updated',
              'public_entity.has_public_page',
              'public_entity.entity_type.code',
            ],
            filter: {
              decree: { _eq: activeDecree.id },
              public_entity: {
                has_public_page: { _eq: true },
                slug: { _nnull: true },
                entity_type: { code: { _neq: 'institution' } },
              },
            },
            limit: -1,
          }),
        );

        const seenEntitySlugs = new Set<string>();
        for (const snapshot of activeSnapshots as any[]) {
          const slug = snapshot.public_entity?.slug;
          if (!slug || seenEntitySlugs.has(slug)) continue;
          seenEntitySlugs.add(slug);
          const lastmod = toISODate(snapshot.public_entity?.date_updated);
          urls.push({
            loc: `/etat-senegal/${slug}`,
            ...(lastmod && { lastmod }),
            changefreq: 'monthly',
            priority: 0.7,
          });
        }
      }

      // Institutions : pas de snapshot — requête directe sur state_organization_entity
      // Types concernés : 'institution', 'presidence', 'primature'
      const institutionEntities = await directus.request(
        readItems('state_organization_entity', {
          fields: ['slug', 'date_updated', 'has_public_page'],
          filter: {
            has_public_page: { _eq: true },
            slug: { _nnull: true },
            entity_type: { code: { _in: ['institution', 'presidence', 'primature'] } },
          },
          limit: -1,
        }),
      );

      for (const entity of institutionEntities as any[]) {
        const slug = entity.slug;
        if (!slug) continue;
        const lastmod = toISODate(entity.date_updated);
        urls.push({
          loc: `/etat-senegal/institutions/${slug}`,
          ...(lastmod && { lastmod }),
          changefreq: 'monthly',
          priority: 0.7,
        });
      }
    } catch (sitemapError) {
      console.warn('Erreur sitemap entités état:', sitemapError);
    }

    // 8. Pages détail Budget (entités publiques : ministères et institutions)
    try {
      const budgetEntities = await directus.request(
        readItems('budget_line', {
          fields: ['public_entity.slug'],
          filter: {
            status: { _eq: 'published' },
            public_entity: { slug: { _nnull: true } },
          },
          limit: -1,
        }),
      );

      // Déduplique les slugs
      const seenSlugs = new Set<string>();
      for (const line of budgetEntities as any[]) {
        const slug = line.public_entity?.slug;
        if (slug && !seenSlugs.has(slug)) {
          seenSlugs.add(slug);
          urls.push({
            loc: `/budget-senegal/${slug}`,
            changefreq: 'monthly',
            priority: 0.7,
          });
        }
      }
    } catch (sitemapError) {
      console.warn('Erreur sitemap budget entités:', sitemapError);
    }

    // 9. Pages statiques : Laissées à l'auto-découverte de Nuxt Sitemap
    // Le module @nuxtjs/seo va automatiquement inclure toutes les pages du dossier /pages
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
  }

  return urls;
});
