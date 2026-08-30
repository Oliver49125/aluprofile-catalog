/**
 * AluProfileBiz Dynamic SEO & Meta Manager
 * Ensures optimal search engine crawling, title tags, and rich social sharing.
 * Highly tuned for regional & keyword queries:
 * - "aluminium profile in austria", "aluminium industries in austria", "aluminium companies in austria"
 * - "Aluminiumprofile Österreich", "Aluminium Industrie Österreich", "Aluminium Hersteller Österreich"
 * - "aluprofile", "aluprofilebiz", "Alu Profile Biz", "Alu Profile", "Aluminium Profile", "AluminiumProfile", "aluminium profile", "Aluminium Profiles"
 */

export interface PageSeoConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
}

const COMMON_KEYWORDS = 'aluminium profile in austria, aluminium industries in austria, aluminium companies in austria, aluminium suppliers austria, Aluminiumprofile Österreich, Aluminium Hersteller Österreich, Aluminium Industrie Österreich, aluprofile, aluprofilebiz, Alu Profile Biz, Alu Profile, Aluminium Profile, AluminiumProfile, aluminium profile, Aluminium Profiles, Aluminiumprofile, Aluminum Profile, Aluminum Extrusions, Alu Profil Suche, CAD Profile, Nut 8, Nut 10, Bosch Rexroth kompatibel, Item kompatibel, Maschinenbau, B2B Aluminium Profile';

const SEO_DEFAULTS: Record<string, Record<'de' | 'en', PageSeoConfig>> = {
  home: {
    de: {
      title: 'AluProfileBiz - Aluminiumprofile Österreich, Aluprofile & CAD Katalog',
      description: 'AluProfileBiz: Führende Plattform für Aluminiumprofile in Österreich, Deutschland & Europa. Finden Sie Profile nach Maßen, Nutgröße und CAD-Downloads (STEP, DXF).',
      keywords: COMMON_KEYWORDS,
    },
    en: {
      title: 'AluProfileBiz - Aluminium Profile in Austria, Aluminum Extrusions & CAD Search',
      description: 'AluProfileBiz: Discover aluminium profile in Austria and top European aluminium companies. Search industrial extrusions, download 3D STEP & 2D DXF CAD models.',
      keywords: COMMON_KEYWORDS,
    },
  },
  catalog: {
    de: {
      title: 'Aluminiumprofile Suche & Hersteller Österreich - AluProfileBiz Katalog',
      description: 'Durchsuchen Sie den kompletten B2B-Katalog für Aluprofile und Aluminiumprofile in Österreich & Europa. Filtern Sie nach Abmessungen, Nut 8 / Nut 10 und CAD-Daten.',
      keywords: COMMON_KEYWORDS,
    },
    en: {
      title: 'Aluminium Profile in Austria & Extrusions Catalog - AluProfileBiz',
      description: 'Search, filter, and compare standard and custom aluminium profiles with full technical datasheets, CAD models, and verified manufacturers in Austria & Europe.',
      keywords: COMMON_KEYWORDS,
    },
  },
  search: {
    de: {
      title: 'Erweiterte Aluminium Profile Suche Österreich & CAD Portal - AluProfileBiz',
      description: 'Erweiterte parametrische Profilsuche für Aluprofile und Aluminiumprofile: Berechnen Sie Trägheitsmomente, Nut-Systeme und laden Sie CAD STEP/DXF-Dateien herunter.',
      keywords: COMMON_KEYWORDS,
    },
    en: {
      title: 'Advance Aluminium Profile Search & 3D CAD Portal - AluProfileBiz',
      description: 'Parametric search engine for aluminium profiles, aluminium industries in Austria, and extrusions: filter by moments of inertia, slot sizes, and download CAD.',
      keywords: COMMON_KEYWORDS,
    },
  },
  customer: {
    de: {
      title: 'Hersteller- & Kundenportal für Aluminium Profile Österreich - AluProfileBiz',
      description: 'Verwalten und listen Sie Ihre Aluminiumprofile auf dem AluProfileBiz B2B-Marktplatz für Maschinenbau in Österreich und ganz Europa.',
      keywords: COMMON_KEYWORDS,
    },
    en: {
      title: 'Manufacturer & Customer Portal for Aluminium Companies in Austria - AluProfileBiz',
      description: 'Manage, publish, and distribute your custom aluminium profile catalog to structural engineers across Austria, Germany, and worldwide.',
      keywords: COMMON_KEYWORDS,
    },
  },
  imprint: {
    de: {
      title: 'Impressum - AluProfileBiz Aluminium Profile Plattform',
      description: 'Rechtliche Angaben und Kontaktinformationen für die B2B-Plattform AluProfileBiz.',
      keywords: COMMON_KEYWORDS,
    },
    en: {
      title: 'Imprint - AluProfileBiz Aluminum Profile Platform',
      description: 'Legal notices and corporate contact information for AluProfileBiz.',
      keywords: COMMON_KEYWORDS,
    },
  },
  privacy: {
    de: {
      title: 'Datenschutzerklärung - AluProfileBiz Aluminium Profile',
      description: 'Datenschutzbestimmungen und DSGVO-Konformität von AluProfileBiz.',
      keywords: COMMON_KEYWORDS,
    },
    en: {
      title: 'Privacy Policy - AluProfileBiz Aluminum Profiles',
      description: 'Privacy policy and GDPR compliance statement for AluProfileBiz.',
      keywords: COMMON_KEYWORDS,
    },
  },
  terms: {
    de: {
      title: 'Allgemeine Geschäftsbedingungen (AGB) - AluProfileBiz',
      description: 'Nutzungsbedingungen und AGB der B2B-Plattform AluProfileBiz für Aluminiumprofile.',
      keywords: COMMON_KEYWORDS,
    },
    en: {
      title: 'Terms of Service - AluProfileBiz Aluminum Profiles',
      description: 'General terms and B2B platform conditions for AluProfileBiz.',
      keywords: COMMON_KEYWORDS,
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

  // 4. Update Keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', config.keywords || COMMON_KEYWORDS);
}
