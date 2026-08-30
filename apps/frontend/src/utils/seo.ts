/**
 * AluProfileBiz Dynamic SEO & Meta Manager
 * Ensures optimal search engine crawling, title tags, and rich social sharing.
 */

export interface PageSeoConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
}

const SEO_DEFAULTS: Record<string, Record<'de' | 'en', PageSeoConfig>> = {
  home: {
    de: {
      title: 'AluProfileBiz - B2B Aluminium-Profilsuche & CAD Datenblätter',
      description: 'AluProfileBiz: Finden Sie Standard- und Sonderprofile aus Aluminium, vergleichen Sie technische Datenblätter, CAD-Dateien (STEP, DXF) und senden Sie direkte Preisanfragen.',
      keywords: 'AluProfileBiz, Aluminiumprofile, Profilsuche, CAD Modelle, Nut 8, Nut 10, Bosch Rexroth kompatibel, Item kompatibel, Maschinenbau',
    },
    en: {
      title: 'AluProfileBiz - Leading Aluminum Profile Search & CAD Engineering Catalog',
      description: 'AluProfileBiz: Discover and compare standard and custom aluminum extrusion profiles with technical data sheets, 3D CAD files (STEP, DXF), and direct supplier B2B inquiries.',
      keywords: 'AluProfileBiz, aluminum profiles, extrusion search, CAD models, slot 8, slot 10, Bosch Rexroth compatible, Item compatible, structural profiles',
    },
  },
  catalog: {
    de: {
      title: 'Aluminium-Profilsuche - AluProfileBiz Technischer Datenkatalog',
      description: 'Durchsuchen und filtern Sie den vollständigen Aluminium-Profilkatalog von AluProfileBiz mit Filtern nach Nutgröße, Abmessungen, Gewicht und Legierung.',
      keywords: 'AluProfileBiz Profilsuche, Aluminiumprofil Katalog, T-Nut Profile, Konstruktionsprofile, Strangpressprofile',
    },
    en: {
      title: 'Aluminum Profile Search - AluProfileBiz Technical Engineering Catalog',
      description: 'Search, filter, and inspect structural aluminum extrusion profiles with full technical data sheets, CAD dimensions, and supplier details on AluProfileBiz.',
      keywords: 'AluProfileBiz profile search, aluminum extrusion catalog, t-slot profiles, structural framing profiles',
    },
  },
  search: {
    de: {
      title: 'Erweiterte Profilsuche & CAD Portal - AluProfileBiz',
      description: 'Nutzen Sie die erweiterte parametrische Profilsuche von AluProfileBiz: Filtern nach Querschnitten, Trägheitsmomenten, Nutgrößen und CAD-Downloads.',
      keywords: 'AluProfileBiz Erweiterte Profilsuche, Parametrische Suche, CAD Download, DXF, STEP, Aluminiumprofile',
    },
    en: {
      title: 'Advance Profile Search & CAD Portal - AluProfileBiz',
      description: 'Use the advanced parametric search on AluProfileBiz: filter by moment of inertia, slot size, dimensions, and download 2D/3D CAD files instantly.',
      keywords: 'AluProfileBiz advance profile search, parametric aluminum search, CAD engineering portal, STEP download',
    },
  },
  customer: {
    de: {
      title: 'Hersteller- & Kundenportal - AluProfileBiz',
      description: 'Verwalten Sie Ihre eigenen Aluminiumprofile, listen Sie Produkte im AluProfileBiz B2B-Marktplatz und bearbeiten Sie technische Daten.',
      keywords: 'AluProfileBiz Kundenportal, Hersteller B2B, Aluprofile verwalten',
    },
    en: {
      title: 'Manufacturer & Customer Portal - AluProfileBiz',
      description: 'Manage and publish your custom aluminum extrusion profiles on the AluProfileBiz B2B network.',
      keywords: 'AluProfileBiz customer portal, manufacturer workspace, list profiles',
    },
  },
  imprint: {
    de: {
      title: 'Impressum - AluProfileBiz',
      description: 'Rechtliche Angaben und Kontaktinformationen für AluProfileBiz.',
    },
    en: {
      title: 'Imprint - AluProfileBiz',
      description: 'Legal notices and corporate contact information for AluProfileBiz.',
    },
  },
  privacy: {
    de: {
      title: 'Datenschutzerklärung - AluProfileBiz',
      description: 'Datenschutzbestimmungen und DSGVO-Konformität von AluProfileBiz.',
    },
    en: {
      title: 'Privacy Policy - AluProfileBiz',
      description: 'Privacy policy and GDPR compliance statement for AluProfileBiz.',
    },
  },
  terms: {
    de: {
      title: 'Allgemeine Geschäftsbedingungen (AGB) - AluProfileBiz',
      description: 'Nutzungsbedingungen und AGB der B2B-Plattform AluProfileBiz.',
    },
    en: {
      title: 'Terms of Service - AluProfileBiz',
      description: 'General terms and B2B platform conditions for AluProfileBiz.',
    },
  },
};

export function updatePageSeo(pageKey: string, lang: 'de' | 'en' = 'de', customConfig?: Partial<PageSeoConfig>) {
  if (typeof document === 'undefined') return;

  const pageGroup = SEO_DEFAULTS[pageKey] || SEO_DEFAULTS.home;
  const config = {
    ...pageGroup[lang],
    ...customConfig,
  };

  // 1. Update Title
  document.title = config.title;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  // 3. Update OG Title & Description
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', config.title);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', config.description);

  let twitterTitle = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', config.title);

  let twitterDesc = document.querySelector('meta[property="twitter:description"]');
  if (twitterDesc) twitterDesc.setAttribute('content', config.description);

  // 4. Update Keywords if provided
  if (config.keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', config.keywords);
  }
}
