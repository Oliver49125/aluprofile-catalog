/**
 * AluProfileBiz Dynamic SEO & Meta Manager
 * Ensures optimal search engine crawling, title tags, and rich social sharing.
 * Highly tuned for keywords: "aluprofile", "aluprofilebiz", "Alu Profile Biz",
 * "Alu Profile", "Aluminium Profile", "AluminiumProfile", "aluminium profile", "Aluminium Profiles".
 */

export interface PageSeoConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
}

const COMMON_KEYWORDS = 'aluprofile, aluprofilebiz, Alu Profile Biz, Alu Profile, Aluminium Profile, AluminiumProfile, aluminium profile, Aluminium Profiles, Aluminiumprofile, Aluminum Profile, Aluminum Extrusions, Alu Profil Suche, CAD Profile, Nut 8, Nut 10, Bosch Rexroth kompatibel, Item kompatibel, Maschinenbau, B2B Aluminium Profile';

const SEO_DEFAULTS: Record<string, Record<'de' | 'en', PageSeoConfig>> = {
  home: {
    de: {
      title: 'AluProfileBiz - Aluprofile & Aluminium Profile Suchmaschine, CAD Katalog',
      description: 'AluProfileBiz: Finden und vergleichen Sie Aluprofile und Aluminium Profile nach Maßen, Nutgröße und Trägheitsmoment. 3D-CAD-Downloads (STEP, DXF) und direkte B2B-Anfragen.',
      keywords: COMMON_KEYWORDS,
    },
    en: {
      title: 'AluProfileBiz - Aluminum Profile, Aluminium Profiles & CAD Catalog Search',
      description: 'AluProfileBiz: Search, discover, and compare industrial aluminium profiles, aluminum extrusions, and download 3D STEP & 2D DXF CAD models with structural engineering specs.',
      keywords: COMMON_KEYWORDS,
    },
  },
  catalog: {
    de: {
      title: 'Aluminium Profile & Aluprofile Suche - AluProfileBiz Technischer Katalog',
      description: 'Durchsuchen Sie den kompletten B2B-Katalog für Aluprofile und Aluminium Profile. Filtern Sie nach Abmessungen, Nut 8 / Nut 10 und Trägheitsmomenten auf AluProfileBiz.',
      keywords: COMMON_KEYWORDS,
    },
    en: {
      title: 'Aluminium Profiles & Aluminum Profile Search - AluProfileBiz Catalog',
      description: 'Search, filter, and compare standard and custom aluminium profiles with full technical datasheets, CAD models, and manufacturer details on AluProfileBiz.',
      keywords: COMMON_KEYWORDS,
    },
  },
  search: {
    de: {
      title: 'Erweiterte Aluminium Profile Suche & CAD Portal - AluProfileBiz',
      description: 'Erweiterte parametrische Profilsuche für Aluprofile und Aluminium Profile: Berechnen Sie Trägheitsmomente, Nut-Systeme und laden Sie CAD STEP/DXF-Dateien herunter.',
      keywords: COMMON_KEYWORDS,
    },
    en: {
      title: 'Advance Aluminium Profile Search & 3D CAD Portal - AluProfileBiz',
      description: 'Parametric search engine for aluminium profiles and aluminum extrusions: filter by moments of inertia, slot sizes, and download instant CAD files on AluProfileBiz.',
      keywords: COMMON_KEYWORDS,
    },
  },
  customer: {
    de: {
      title: 'Hersteller- & Kundenportal für Aluminium Profile - AluProfileBiz',
      description: 'Verwalten und listen Sie Ihre Aluminiumprofile und Aluprofile auf dem AluProfileBiz B2B-Marktplatz für Maschinenbau und Industrie.',
      keywords: COMMON_KEYWORDS,
    },
    en: {
      title: 'Manufacturer & Customer Portal for Aluminium Profiles - AluProfileBiz',
      description: 'Manage, publish, and distribute your custom aluminium profile catalog to structural engineers worldwide on AluProfileBiz.',
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
