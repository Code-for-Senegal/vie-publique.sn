export const useSiteMetadata = () => {
  const config = useRuntimeConfig();
  const siteUrl = config.public.siteUrl || 'https://www.vie-publique.sn';

  return {
    siteName: 'Vie Publique Sénégal',
    siteUrl,
    defaultTitle: 'Vie Publique Sénégal - Information citoyenne et actualité politique',
    defaultDescription:
      "Accédez aux documents officiels du Sénégal : journal officiel, lois, décrets, codes juridiques, budget, rapports d'audit (OFNAC, Cour des Comptes), nominations et travaux parlementaires.",
    defaultImage: `${siteUrl}/logos/logo2.webp`,
    defaultLocale: 'fr_SN',
    twitterHandle: '@viepubliquesn',
    twitterCardType: 'summary_large_image',
    themeColor: '#1E40AF',
    keywords: [
      'journal officiel Sénégal',
      'lois et décrets Sénégal',
      'code juridique Sénégal',
      'documents officiels Sénégal',
      'budget Sénégal',
      'conseil des ministres Sénégal',
      'nominations Sénégal',
      'assemblée nationale Sénégal',
      'rapports audit OFNAC',
      'Cour des Comptes Sénégal',
      'vie publique Sénégal',
      'gouvernement Sénégal',
      'transparence gouvernementale',
      'élections Sénégal',
    ],
  };
};
