import { parseApiError } from './utils/apiError';
import { API_BASE } from './utils/apiBase';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import CookieConsentModal from './components/CookieConsentModal';


import {

  Boxes,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  User,

  ImageIcon,
  LayoutGrid,

  Ruler,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRoundPlus,
  X,
  FileText,
  FileSpreadsheet,
  FileIcon,
  Download,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import './App.css';

type RefOption = { id: number; name: string; profilesCount?: number };

type SortKey = 'newest' | 'nameAsc' | 'nameDesc' | 'status';
type Lang = 'en' | 'de';

type Profile = {
  id: number;
  name: string;
  description?: string;
  usage?: string;
  drawingUrl?: string;
  photoUrl?: string;
  logoUrl?: string;
  dimensions?: string;
  weightPerMeter?: number;
  material?: string;
  lengthMm?: number;
  status: string;
  supplier?: {
    id: number;
    name: string;
    nameDe?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  applications: RefOption[];
  crossSections: RefOption[];
  slotSize?: string;
  momentOfInertiaIx?: number;
  momentOfInertiaIy?: number;
  sectionModulusWx?: number;
  sectionModulusWy?: number;
  outerSurfaceArea?: number;
  crossSectionalArea?: number;
  color?: string;
  stepUrl?: string;
  dxfUrl?: string;
  pdfUrl?: string;
  price?: number;
  currency?: { id: number; code: string; symbol: string };
};

const PAGE_SIZE = 6;

const TXT = {
  en: {
    title: 'Aluprofile Search & Catalog',
    subtitle: 'Find the right aluminum profile with technical details, supplier contacts, and production-ready references.',
    heroNote: 'Industrial-grade profile discovery with a cleaner technical workflow.',
    search: 'Search',
    language: 'Language',
    adminPanel: 'Admin Panel',
    customerLogin: 'Login',
    totalProfiles: 'Total Profiles',
    applications: 'Applications',
    crossSections: 'Cross-sections',
    nameKeyword: 'Name / keyword',
    application: 'Application',
    crossSection: 'Cross-section',

    material: 'Material',
    dimensions: 'Dimensions',
    profileCatalog: 'Profile Catalog',
    drawing: 'Drawing',
    description: 'Description',
    applicationCol: 'Application',
    visual: 'Visual',
    contact: 'Contact',
    details: 'Details',
    noProfiles: 'No profiles found for current filters.',
    profileDetailSheet: 'Profile Detail Sheet',
    selectProfile: 'Select a profile from the table.',
    technicalView: 'Technical View',
    designation: 'Designation',
    masse: 'Size',
    weightPerMeter: 'Weight kg/m',
    length: 'Length',
    usage: 'Usage',
    status: 'Status',
    price: 'Price',

    openDrawing: 'Open Drawing',
    openPhoto: 'Open Photo',

    linkedCategories: 'Linked Categories',
    catalogLabel: 'Catalog System',
    sortBy: 'Sort by',
    newest: 'Newest',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',

    statusSort: 'Status',
    clearFilters: 'Clear Filters',
    activeFilters: 'Active Filters',
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
    showing: 'Showing',
    records: 'records',
    smartFilters: 'Smart Filters',
    searchHint: 'Use multiple filters to narrow technical matches faster.',
    categoryMatches: 'Category Matches',
    tableView: 'Table View',
    cardView: 'Card View',
    featuredProfiles: 'Featured Profiles',
    featuredNote: 'Highlighted technical profiles for a faster first review.',
    technicalSheet: 'Technical Sheet',
    availableStatus: 'Available',
    inDevelopmentStatus: 'In Development',
    archivedStatus: 'Archived',

    loadingCatalog: 'Loading catalog data...',
    applicationSearch: 'Search application',
    crossSectionSearch: 'Search cross-section',

    noResultsTitle: 'No technical matches found',
    noResultsNote: 'Try broadening the filters or clearing the search terms to see more profiles.',

    inquiry: 'Inquiry',
    contactSeller: 'Contact Seller',
    firstName: 'First Name',
    lastName: 'Last Name',
    company: 'Company',
    email: 'Email',
    phone: 'Phone',
    message: 'Message',
    defaultMessage: 'I am interested in this profile, please contact me.',
    receiveOffer: 'Receive a purchase offer',
    sendInquiry: 'Send Inquiry',
    inquirySent: 'Inquiry sent successfully!',
    sending: 'Sending...',
    visitorCount: 'Website Visits',
    supplierAndFiles: 'Supplier & Files',
    contactPerson: 'Contact Person',
    website: 'Website',
    onRequest: 'On Request',
  },
  de: {
    title: 'Aluprofile Suche & Katalog',
    subtitle: 'Finden Sie das passende Aluminiumprofil mit technischen Daten und produktionsreifen Referenzen.',
    heroNote: 'Industrietaugliche Profilsuche mit einem klareren technischen Arbeitsablauf.',
    search: 'Suche',
    language: 'Sprache',
    adminPanel: 'Admin-Panel',
    customerLogin: 'Login',
    totalProfiles: 'Gesamtprofile',
    applications: 'Anwendungen',
    crossSections: 'Querschnitte',
    nameKeyword: 'Name / Stichwort',
    application: 'Anwendung',
    crossSection: 'Querschnitt',

    material: 'Material',
    dimensions: 'Abmessungen',
    profileCatalog: 'Profilkatalog',
    drawing: 'Zeichnung',
    description: 'Beschreibung',
    applicationCol: 'Anwendung',
    visual: 'Ansicht',
    contact: 'Kontakt',
    details: 'Details',
    noProfiles: 'Keine Profile fur die aktuellen Filter gefunden.',
    profileDetailSheet: 'Profil-Detailblatt',
    selectProfile: 'Bitte ein Profil aus der Tabelle auswahlen.',
    technicalView: 'Technische Ansicht',
    designation: 'Bezeichnung',
    masse: 'Masse',
    weightPerMeter: 'Gewicht kg/m',
    length: 'Lange',
    usage: 'Anwendung',
    status: 'Status',
    price: 'Preis',

    openDrawing: 'Zeichnung öffnen',
    openPhoto: 'Foto öffnen',

    linkedCategories: 'Verknupfte Kategorien',
    catalogLabel: 'Katalogsystem',
    sortBy: 'Sortieren nach',
    newest: 'Neueste',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',

    statusSort: 'Status',
    clearFilters: 'Filter zurucksetzen',
    activeFilters: 'Aktive Filter',
    page: 'Seite',
    of: 'von',
    previous: 'Zuruck',
    next: 'Weiter',
    showing: 'Zeige',
    records: 'Eintrage',
    smartFilters: 'Intelligente Filter',
    searchHint: 'Verwenden Sie mehrere Filter, um technische Treffer schneller einzugrenzen.',
    categoryMatches: 'Kategorie-Treffer',
    tableView: 'Tabellenansicht',
    cardView: 'Kartenansicht',
    featuredProfiles: 'Ausgewahlte Profile',
    featuredNote: 'Hervorgehobene technische Profile fur einen schnelleren Ersteindruck.',
    technicalSheet: 'Technisches Blatt',
    availableStatus: 'Verfugbar',
    inDevelopmentStatus: 'In Entwicklung',
    archivedStatus: 'nicht verfügbar',

    loadingCatalog: 'Katalogdaten werden geladen...',
    applicationSearch: 'Anwendung suchen',
    crossSectionSearch: 'Querschnitt suchen',

    noResultsTitle: 'Keine technischen Treffer gefunden',
    noResultsNote: 'Erweitern Sie die Filter oder setzen Sie die Suchbegriffe zuruck, um mehr Profile zu sehen.',

    inquiry: 'Zur Anfrage',
    contactSeller: 'Verkäufer kontaktieren',
    firstName: 'Vorname',
    lastName: 'Nachname',
    company: 'Firma',
    email: 'E-Mail',
    phone: 'Telefon',
    message: 'Nachricht',
    defaultMessage: 'Ich interessiere mich für dieses Profil, bitte kontaktieren Sie mich.',
    receiveOffer: 'Kaufangebot erhalten',
    sendInquiry: 'Anfrage senden',
    inquirySent: 'Anfrage erfolgreich gesendet!',
    sending: 'Senden...',
    visitorCount: 'Website-Besuche',
    supplierAndFiles: 'Lieferant & Dateien',
    contactPerson: 'Ansprechpartner',
    website: 'Webseite',
    onRequest: 'auf Anfrage',
  },
} as const;

function statusStyle(status?: string) {
  if (status === 'AVAILABLE') return 'material-chip bg-emerald-100 text-emerald-800';
  if (status === 'IN_DEVELOPMENT') return 'material-chip bg-amber-100 text-amber-900';
  if (status === 'NOT_AVAILABLE') return 'material-chip bg-red-100 text-red-700';
  return 'material-chip bg-slate-200 text-slate-700';
}

function statusLabel(status: string | undefined, t: (typeof TXT)[keyof typeof TXT]) {
  if (status === 'AVAILABLE') return t.availableStatus;
  if (status === 'IN_DEVELOPMENT') return t.inDevelopmentStatus;
  return t.archivedStatus;
}

function safeUrl(value?: string) {
  return value && value.trim().length > 0 ? value : undefined;
}

const isImage = (url: string) => /\.(jpeg|jpg|gif|png|webp|svg|avif|bmp)(\?.*)?$/i.test(url) || url.startsWith('blob:');
const isPdf = (url: string) => /\.pdf(\?.*)?$/i.test(url);
const isWord = (url: string) => /\.(doc|docx)(\?.*)?$/i.test(url);
const isExcel = (url: string) => /\.(xls|xlsx)(\?.*)?$/i.test(url);

function MediaThumbnail({ url, alt, className }: { url: string; alt: string; className?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  if (isImage(url)) return <img src={url} alt={alt} className={`cursor-pointer ${className || ''}`} onClick={handleClick} />;
  
  if (isPdf(url)) return <div className="flex h-full w-full flex-col items-center justify-center text-red-500 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors" onClick={handleClick}><FileText className="h-8 w-8 mb-1" /><span className="text-[10px] font-bold">PDF</span></div>;
  if (isWord(url)) return <div className="flex h-full w-full flex-col items-center justify-center text-blue-500 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors" onClick={handleClick}><FileText className="h-8 w-8 mb-1" /><span className="text-[10px] font-bold">DOC</span></div>;
  if (isExcel(url)) return <div className="flex h-full w-full flex-col items-center justify-center text-green-500 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors" onClick={handleClick}><FileSpreadsheet className="h-8 w-8 mb-1" /><span className="text-[10px] font-bold">XLS</span></div>;
  
  return <div className="flex h-full w-full flex-col items-center justify-center text-slate-500 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors" onClick={handleClick}><FileIcon className="h-8 w-8 mb-1" /><span className="text-[10px] font-bold">FILE</span></div>;
}

function paginateItems<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  return {
    items: items.slice(startIndex, startIndex + pageSize),
    totalPages,
    page: safePage,
    start: items.length === 0 ? 0 : startIndex + 1,
    end: Math.min(startIndex + pageSize, items.length),
    total: items.length,
  };
}


function resolveOptionId(query: string, options: Array<{ id: number; name: string }>) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return '';
  const exact = options.find((item) => item.name.trim().toLowerCase() === trimmed);
  return exact ? String(exact.id) : '';
}

function App() {
  const { token, logout } = useAuth();
  const { lang, setLang } = useLanguage();
  const [overview, setOverview] = useState<{
    applications: RefOption[];
    crossSections: RefOption[];
    newestProfiles: Profile[];
    totals: { profiles: number; suppliers?: number };
  } | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [detail, setDetail] = useState<Profile | null>(null);
  const [filters, setFilters] = useState({
    q: '',
    applicationId: '',
    crossSectionId: '',
    material: '',
    dimensions: '',
  });

  const [filterInputs, setFilterInputs] = useState({
    application: '',
    crossSection: '',
  });
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);
  const [activePill, setActivePill] = useState<'all' | 't-slot' | 'base' | 'angle' | 'u-channel'>('t-slot');
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isTablet = /Tablet|iPad/i.test(navigator.userAgent);
    const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
    const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Edg') ? 'Edge' : 'Browser';
    const os = navigator.userAgent.includes('Mac') ? 'macOS' : navigator.userAgent.includes('Windows') ? 'Windows' : navigator.userAgent.includes('Android') ? 'Android' : navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? 'iOS' : 'OS';

    api('/public/visits', {
      method: 'POST',
      body: JSON.stringify({
        visitedPage: window.location.pathname || '/',
        device,
        browser,
        os,
      }),
    }).catch(err => console.error('Failed to increment visits', err));
  }, []);

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showInquiryModal, setShowInquiryModal] = useState<Profile | null>(null);

  const [inquiryForm, setInquiryForm] = useState({ firstName: '', lastName: '', company: '', email: '', phone: '', message: '', requestPurchase: false });
  const [inquiryLoadingId, setInquiryLoadingId] = useState<number | null>(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [manufacturerForm, setManufacturerForm] = useState({ companyName: '', contactPerson: '', email: '', phone: '', website: '', message: '' });
  const [manufacturerLoading, setManufacturerLoading] = useState(false);
  const [manufacturerSuccess, setManufacturerSuccess] = useState(false);

  const t = useMemo(() => TXT[lang], [lang]);

  useEffect(() => {
    fetch(`${API_BASE}/public/site-settings`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && typeof data === 'object') setSiteSettings(prev => ({ ...prev, ...data })); })
      .catch(() => {});
  }, []);

  const qs = (obj: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return params.toString();
  };

  async function api(path: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res.json();
  }

  async function loadPublic() {
    setIsLoading(true);
    
    try {
      const [overviewData, profileData] = await Promise.all([
        api(`/public/overview?lang=${lang}`),
        api(`/public/profiles?${qs({ ...filters, lang })}`),
      ]);
      const profileList = profileData as Profile[];
      setOverview(overviewData);
      setProfiles(profileList);

      setPage(1);
      setPage(1);
      
      const initialId = new URLSearchParams(window.location.search).get('profile');
      if (initialId && !detail) {
        try {
          const initialDetail = await api(`/public/profiles/${initialId}?lang=${lang}`);
          setDetail(initialDetail);
        } catch (err) {
          console.error('Failed to load initial profile', err);
          if (profileList.length > 0) setDetail(profileList[0]);
        }
      } else if (profileList.length > 0) {
        const selectedStillExists = detail && profileList.some((p) => p.id === detail.id);
        if (!selectedStillExists) setDetail(profileList[0]);
      } else {
        setDetail(null);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDetail(id: number) {
    setIsDetailLoading(true);
    setShowDetailModal(true);
    try {
      const p = await api(`/public/profiles/${id}?lang=${lang}`);
      setDetail(p);
    } catch (err) {
      console.error('Failed to load profile detail', err);
    } finally {
      setIsDetailLoading(false);
    }
  }




  useEffect(() => {
    loadPublic().catch((err) => {
      setIsLoading(false);
      toast.error(parseApiError(err));
    });
  }, [filters, lang]);

  const sortedProfiles = useMemo(() => {
    const next = [...profiles];
    next.sort((left, right) => {
      if (sortBy === 'nameAsc') return left.name.localeCompare(right.name);
      if (sortBy === 'nameDesc') return right.name.localeCompare(left.name);

      if (sortBy === 'status') return (left.status || '').localeCompare(right.status || '');
      return right.id - left.id;
    });
    return next;
  }, [profiles, sortBy]);

  const pagedProfiles = useMemo(() => paginateItems(sortedProfiles, page), [sortedProfiles, page]);

  useEffect(() => {
    if (page !== pagedProfiles.page) setPage(pagedProfiles.page);
  }, [page, pagedProfiles.page]);

  const applicationOptions = overview?.applications ?? [];
  const crossSectionOptions = overview?.crossSections ?? [];

  function updateSearchFilter(
    kind: 'application' | 'crossSection',
    key: 'applicationId' | 'crossSectionId',
    value: string,
    options: Array<{ id: number; name: string }>,
  ) {
    setFilterInputs((current) => ({ ...current, [kind]: value }));
    setFilters((current) => ({ ...current, [key]: resolveOptionId(value, options) }));
  }

  const activeFilterEntries = useMemo(() => {
    const labels = [];
    if (filters.q) labels.push({ key: 'q', label: filters.q });
    if (filters.applicationId) {
      const item = overview?.applications.find((entry) => String(entry.id) === filters.applicationId);
      labels.push({ key: 'applicationId', label: item?.name || filters.applicationId });
    }
    if (filters.crossSectionId) {
      const item = overview?.crossSections.find((entry) => String(entry.id) === filters.crossSectionId);
      labels.push({ key: 'crossSectionId', label: item?.name || filters.crossSectionId });
    }

    if (filters.dimensions) labels.push({ key: 'dimensions', label: filters.dimensions });
    return labels as Array<{ key: keyof typeof filters; label: string }>;
  }, [filters, overview]);

  function clearFilters() {
    setFilterInputs({ application: '', crossSection: '' });
    setFilters({
      q: '',
      applicationId: '',
      crossSectionId: '',

      material: '',
      dimensions: '',
    });
  }

  function removeFilter(key: keyof typeof filters) {
    if (key === 'applicationId') setFilterInputs((current) => ({ ...current, application: '' }));
    if (key === 'crossSectionId') setFilterInputs((current) => ({ ...current, crossSection: '' }));

    setFilters((current) => ({ ...current, [key]: '' }));
  }

  const [modalMediaTab, setModalMediaTab] = useState<'drawing' | 'photo'>('drawing');

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans antialiased text-slate-800">

      {/* ── TOP NAVIGATION BAR ── */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-10 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 text-white shadow shadow-slate-900/20">
            <Boxes className="h-4 w-4" />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">
            Alu<span className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 bg-clip-text text-transparent font-black">Profile</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-bold text-slate-600">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            {lang === 'de' ? 'Startseite' : 'Home'}
          </Link>
          <Link to="/catalog" className="hover:text-blue-600 transition-colors">
            {lang === 'de' ? 'Katalog' : 'Catalog'}
          </Link>
          <Link to="/search" className="hover:text-blue-600 transition-colors">
            {lang === 'de' ? 'Suchportal' : 'Search Portal'}
          </Link>
          <a href="#solutions" onClick={(e) => { e.preventDefault(); document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-blue-600 transition-colors">
            {lang === 'de' ? 'Lösungen' : 'Solutions'}
          </a>
          <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-blue-600 transition-colors">
            {lang === 'de' ? 'Über uns' : 'About'}
          </a>
        </nav>


        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowManufacturerModal(true)}
            className="rounded-full bg-[#131c2a] hover:bg-slate-900 text-white text-[12px] font-extrabold px-4 py-2 shadow-sm transition-all border border-slate-700/50 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>{lang === 'de' ? 'Als Hersteller eintragen' : 'Register as Manufacturer'}</span>
          </button>

          <Link to="/customer">
            <Button className="rounded-xl bg-[#1e2a3b] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 shadow-sm transition-all cursor-pointer">
              {lang === 'de' ? 'Kundenportal' : 'Customer Portal'}
            </Button>
          </Link>

          <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl transition-all border border-slate-200">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="bg-transparent border-0 font-bold focus:outline-none cursor-pointer text-xs">
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>
          </label>

          {!!token && (
            <button onClick={() => logout()} title="Logout" className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>



      {/* ── FULL-WIDTH HERO BANNER (ULTRA MODERN INDUSTRIAL GLASSMORPHISM) ── */}
      <section
        className="w-full text-white relative overflow-hidden bg-gradient-to-br from-[#0b1320] via-[#152238] to-[#0f172a] py-10 lg:py-14 border-b border-slate-800"
      >
        {/* Glowing Background Light Orbs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left: Headline + subtitle + modern search bar */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-400 shadow-sm w-max">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                {lang === 'de' ? 'Präzisions-Profil-Plattform' : 'Precision Extrusion Platform'}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.12] tracking-tight">
                {lang === 'de'
                  ? (siteSettings.heroTitleDe || 'Industrielle Aluminiumprofile, sofort gefunden.')
                  : (siteSettings.heroTitle || 'Industrial Aluminum Extrusions, Found Instantly.')}
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium max-w-lg">
                {lang === 'de' 
                  ? (siteSettings.heroSubtitleDe || 'Detaillierte Spezifikationen, technische Daten und sofortige CAD-Downloads für Standard- und Sonderprofile.') 
                  : (siteSettings.heroSubtitle || 'Search and access detailed specifications, technical data, and instant downloads for standard and custom aluminum profiles.')}
              </p>

              <div className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder={lang === 'de'
                    ? (siteSettings.heroSearchPlaceholderDe || 'Nach Profil, Abmessungen oder Material suchen...')
                    : (siteSettings.heroSearchPlaceholder || 'Search by ID, dimensions, or material...')}
                  value={filters.q}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, q: e.target.value }));
                    if (e.target.value) setShowFullCatalog(true);
                  }}
                  className="w-full rounded-2xl bg-[#131d2b]/90 border border-white/20 hover:border-cyan-400/50 text-white placeholder-slate-400 pl-4 pr-12 py-3.5 text-xs sm:text-sm shadow-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center pointer-events-none">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Right: Modern Glassmorphic Container with 3D Render + Stat Cards */}
            <div className="lg:col-span-7">
              <div className="bg-[#0f172a]/90 rounded-3xl p-5 sm:p-6 border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col md:flex-row items-center gap-5 relative overflow-hidden">
                
                {/* Profile 3D Render Image Frame */}
                <div className="flex-1 w-full h-[230px] rounded-2xl overflow-hidden bg-[#0a101d] flex items-center justify-center border border-slate-800 relative group">
                  <img
                    src="/hero-target-profile.png"
                    alt="Aluminum Extrusion Profile"
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = siteSettings.heroImageUrl || '/hero-3d-profile.png'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* 3 Stacked Cyan Stat Cards */}
                <div className="w-full md:w-[220px] shrink-0 flex flex-col justify-center gap-3">
                  <div className="rounded-2xl bg-[#152238]/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.12)] p-3.5 space-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <p className="text-base sm:text-lg font-black text-white leading-tight">
                        {siteSettings.stat1Label ? siteSettings.stat1Label : `${overview?.totals?.profiles ?? profiles.length ?? 0}+ ${lang === 'de' ? 'Profile' : 'Profiles'}`}
                      </p>
                      <Boxes className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wide">
                      {lang === 'de'
                        ? (siteSettings.stat1SubDe || 'Standard & Sonderprofile')
                        : (siteSettings.stat1Sub || 'Standard & Custom')}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#152238]/90 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.12)] p-3.5 space-y-1 hover:border-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <p className="text-base sm:text-lg font-black text-white leading-tight">
                        {siteSettings.stat2Label ? siteSettings.stat2Label : `${overview?.totals?.suppliers ?? overview?.applications?.length ?? 0}+ ${lang === 'de' ? 'Partner' : 'Partners'}`}
                      </p>
                      <Building2 className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wide">
                      {lang === 'de'
                        ? (siteSettings.stat2SubDe || 'Herstellernetzwerk')
                        : (siteSettings.stat2Sub || 'Global Manufacturing Network')}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#152238]/90 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.12)] p-3.5 space-y-1 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <p className="text-base sm:text-lg font-black text-white leading-tight">
                        {siteSettings.stat3Label ? siteSettings.stat3Label : `${(((overview?.totals?.profiles ?? profiles.length ?? 0) * 120) + 150).toLocaleString()}+ ${lang === 'de' ? 'Downloads' : 'Downloads'}`}
                      </p>
                      <Download className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wide">
                      {lang === 'de'
                        ? (siteSettings.stat3SubDe || 'Technische Datenblätter')
                        : (siteSettings.stat3Sub || 'Technical Data Sheets')}
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>





      {/* ── PAGE CONTENT AREA ── */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8 space-y-8">

        {/* ── FEATURED ALUMINUM PROFILES (MODERN INDUSTRIAL GRAPHIC TREND) ── */}
        <div className="bg-white rounded-3xl p-6 lg:p-10 border border-slate-200/90 shadow-xl space-y-6" id="catalog">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
                {lang === 'de' ? 'Produkt-Highlights' : 'Product Highlights'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-0.5">
                {siteSettings.featuredTitle || (lang === 'de' ? 'Ausgewählte Aluminiumprofile' : 'Featured Aluminum Profiles')}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['t-slot', 'base', 'angle', 'u-channel', 'all'] as const).map((pill) => {
                const labels: Record<string, { en: string; de: string }> = {
                  't-slot': { en: 'T-Slot', de: 'T-Nut Profile' },
                  'base': { en: 'Base Profiles', de: 'Basisprofile' },
                  'angle': { en: 'Angles', de: 'Winkelprofile' },
                  'u-channel': { en: 'U-Channels', de: 'U-Profile' },
                  'all': { en: 'All Profiles', de: 'Alle Profile' },
                };
                const label = labels[pill]?.[lang] ?? pill;
                const active = activePill === pill;
                return (
                  <button key={pill} type="button" onClick={() => setActivePill(pill)}
                    className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all border cursor-pointer ${active ? 'bg-[#131c2a] text-cyan-400 border-[#131c2a] shadow-md scale-[1.02]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(() => {
              const filteredList = profiles.filter((p) => {
                if (activePill === 'all') return true;
                const nameLower = p.name.toLowerCase();
                const descLower = (p.description || '').toLowerCase();
                if (activePill === 't-slot') return nameLower.includes('slot') || nameLower.includes('t-slot') || descLower.includes('slot');
                if (activePill === 'base') return nameLower.includes('base') || nameLower.includes('heavy') || descLower.includes('base');
                if (activePill === 'angle') return nameLower.includes('angle') || descLower.includes('angle');
                if (activePill === 'u-channel') return nameLower.includes('u-channel') || nameLower.includes('channel') || descLower.includes('channel');
                return true;
              });
              const displayList = (filteredList.length > 0 ? filteredList : profiles).slice(0, 8);

              if (isLoading) {
                return Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
                ));
              }

              if (displayList.length === 0) {
                return <div className="col-span-4 text-center py-10 text-sm font-semibold text-slate-500">{lang === 'de' ? 'Keine Profile in der Datenbank gefunden.' : 'No profiles found in database.'}</div>;
              }

              return displayList.map((p) => {
                const photo = safeUrl(p.photoUrl);
                const drawing = safeUrl(p.drawingUrl);
                const bestImg = (photo && isImage(photo)) ? photo : (drawing && isImage(drawing)) ? drawing : (photo || drawing);
                return (
                  <div key={p.id} className="bg-slate-50/80 hover:bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-blue-400/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                        <div className="space-y-0.5 text-[11px] text-slate-600 font-medium">
                          <p><span className="text-slate-400 font-normal">Code: </span>{p.dimensions || p.name}</p>
                          <p><span className="text-slate-400 font-normal">{lang === 'de' ? 'Maße: ' : 'Dims: '}</span>{p.dimensions || '-'}</p>
                          <p><span className="text-slate-400 font-normal">{lang === 'de' ? 'Legierung: ' : 'Alloy: '}</span>{p.material || '6063-T5'}</p>
                        </div>
                      </div>
                      <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-slate-200/80 bg-white shadow-inner flex items-center justify-center p-1.5 group-hover:scale-110 transition-transform duration-300">
                        {bestImg ? (
                          <img src={bestImg} alt={p.name} className="w-full h-full object-contain" />
                        ) : (
                          <Boxes className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <Button size="sm" onClick={() => loadDetail(p.id)} className="w-full bg-[#131c2a] group-hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5">
                      <span>{lang === 'de' ? 'Technische Daten ansehen' : 'View Technical Data'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              });
            })()}
          </div>

          {/* Explore Full Catalog Button */}
          <div className="pt-3 flex justify-center">
            <Link to="/catalog">
              <button
                type="button"
                className="rounded-full bg-[#131c2a] hover:bg-blue-600 text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 shadow-xl hover:shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{lang === 'de' ? `Gesamten Katalog ansehen (${overview?.totals?.profiles ?? profiles.length ?? 0}+ Profile)` : `Explore Full Catalog (${overview?.totals?.profiles ?? profiles.length ?? 0}+ Profiles)`}</span>
                <ChevronRight className="h-4 w-4 text-cyan-400" />
              </button>
            </Link>
          </div>
        </div>



        {/* ── HOW IT WORKS & SOLUTIONS (MODERN INDUSTRIAL GRAPHIC TREND) ── */}
        <div className="bg-white/95 rounded-3xl p-8 lg:p-12 border border-slate-200/90 shadow-xl text-center space-y-10 relative overflow-hidden" id="solutions">
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              {lang === 'de' ? 'Workflow-Lösungen' : 'Workflow Solutions'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {siteSettings.howItWorksTitle || (lang === 'de' ? 'So funktioniert es' : 'How It Works')}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              {siteSettings.howItWorksSubtitle || (lang === 'de' ? 'Profile nahtlos finden, prüfen und integrieren' : 'Seamlessly Find and Integrate Your Profiles')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                stepNum: '01',
                title: lang === 'de' ? '1. Profile suchen' : '1. Search Profiles',
                desc: lang === 'de' ? 'Suchen und vergleichen Sie Standard- und Sonderprofile nach technischen Kriterien.' : 'Search and access to compare and integrate your profiles standard.',
                icon: (
                  <svg className="h-9 w-9" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="22" cy="22" r="13" strokeWidth="2.5"/>
                    <path d="M31 31 L44 44" strokeWidth="3.5" strokeLinecap="round"/>
                    <circle cx="22" cy="22" r="5" strokeWidth="2"/>
                    <path d="M22 13v3M22 28v3M13 22h3M28 22h3" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                stepNum: '02',
                title: lang === 'de' ? '2. Maße anpassen' : '2. Customize Dimensions',
                desc: lang === 'de' ? 'Filtern und vergleichen Sie Nutgrößen, Wandstärken und Querschnittsmaße.' : 'Customize dimensions with custom parameters and slot sizes.',
                icon: (
                  <svg className="h-9 w-9" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="10" y="18" width="36" height="5" rx="1.5" strokeWidth="2"/>
                    <rect x="10" y="27" width="36" height="5" rx="1.5" strokeWidth="2"/>
                    <rect x="20" y="32" width="12" height="14" rx="2" strokeWidth="2"/>
                    <line x1="26" y1="36" x2="26" y2="42" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="13" y1="18" x2="13" y2="46" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="43" y1="18" x2="43" y2="46" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                stepNum: '03',
                title: lang === 'de' ? '3. Spezifikationen prüfen' : '3. Validate Specifications',
                desc: lang === 'de' ? 'Prüfen Sie Trägheitsmomente, Metergewicht und 2D/3D CAD-Zeichnungen.' : 'Validate your specification and parameters with 2D CAD drawing.',
                icon: (
                  <div className="relative">
                    <svg className="h-9 w-9" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="14" y="8" width="28" height="38" rx="3" strokeWidth="2.5"/>
                      <path d="M20 20 h16 M20 27 h16 M20 34 h10" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <div className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-md">✓</div>
                  </div>
                ),
              },
              {
                stepNum: '04',
                title: lang === 'de' ? '4. CAD/BIM laden' : '4. Download CAD/BIM',
                desc: lang === 'de' ? 'Laden Sie STEP 3D-Modelle, DXF 2D-Zeichnungen und Datenblätter direkt herunter.' : 'Download CAD/BIM models, STEP/DXF files, and technical datasheets.',
                icon: (
                  <div className="relative">
                    <svg className="h-9 w-9" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="14" y="8" width="28" height="38" rx="3" strokeWidth="2.5"/>
                      <path d="M20 20 h16 M20 27 h10" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <div className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                      <Download className="h-3 w-3" />
                    </div>
                  </div>
                ),
              },
            ].map((step, i) => (
              <div key={i} className="bg-slate-50/80 hover:bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-blue-500/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-4 group cursor-pointer">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  {lang === 'de' ? `Schritt ${step.stepNum}` : `Step ${step.stepNum}`}
                </span>

                <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200/90 shadow-inner flex items-center justify-center text-slate-700 group-hover:scale-110 group-hover:border-blue-400 group-hover:bg-blue-50/50 group-hover:text-blue-600 transition-all duration-300">
                  {step.icon}
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">{step.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-[200px] mx-auto font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* ── ABOUT US SECTION ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-8 sm:p-12 text-white shadow-2xl border border-slate-700/60 space-y-8 backdrop-blur-xl" id="about">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-400 shadow-sm">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              {lang === 'de' ? 'Über AluProfile' : 'About AluProfile'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {siteSettings.aboutTitle || (lang === 'de' ? 'Der führende globale B2B-Katalog für Aluminiumprofile' : 'The Leading Global B2B Aluminum Profile Search Engine')}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
              {siteSettings.aboutSubtitle || (lang === 'de' 
                ? 'AluProfile verbindet Maschinenbauingenieure, Konstrukteure und Einkäufer direkt mit verifizierten Aluminiumprofil-Herstellern weltweit. Suchen Sie nach exakten Maßen, laden Sie CAD-Zeichnungen herunter und fordern Sie technische Datenblätter an.'
                : 'AluProfile connects mechanical engineers, structural designers, and procurement agents directly with certified aluminum profile manufacturers worldwide. Instantly search exact dimensions, download CAD 3D STEP & 2D DXF models, and request technical data sheets.')}
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10 pt-4">
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-2.5 backdrop-blur-md">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                <Boxes className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm">{lang === 'de' ? 'Präzisions-Katalog' : 'Precision Catalog'}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{lang === 'de' ? 'Vergleichen Sie Nutgrößen, Trägheitsmomente, Materialien und Legierungen.' : 'Compare slot sizes, moments of inertia, materials, alloys, and exact dimensions.'}</p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-2.5 backdrop-blur-md">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm">{lang === 'de' ? 'Instant CAD Downloads' : 'Instant CAD Downloads'}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{lang === 'de' ? 'Direkter Download von STEP 3D-Modellen und DXF 2D-Zeichnungen für Ihr CAD-System.' : 'Directly download STEP 3D models and DXF 2D drawings into your CAD workspace.'}</p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-2.5 backdrop-blur-md">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm">{lang === 'de' ? 'Verifizierte Hersteller' : 'Verified Manufacturers'}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{lang === 'de' ? 'Direkter Kontakt zu zertifizierten Profilherstellern und weltweites Partnernetzwerk.' : 'Direct inquiries to certified extrusion manufacturers and global suppliers.'}</p>
            </div>
          </div>
        </div>


        {/* ── FULL CATALOG TABLE (shown on demand) ── */}
        {(showFullCatalog || filters.q || filters.material || filters.dimensions || filters.applicationId || filters.crossSectionId) && (
          <div className="space-y-5">
            <Card className="overflow-hidden border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/80 py-4 px-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-slate-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Search className="h-4 w-4" />
                    </span>
                    {t.smartFilters}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                      <span>{t.sortBy}</span>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="border-0 bg-transparent p-0 text-xs focus:outline-none">
                        <option value="newest">{t.newest}</option>
                        <option value="nameAsc">{t.nameAsc}</option>
                        <option value="nameDesc">{t.nameDesc}</option>
                        <option value="status">{t.statusSort}</option>
                      </select>
                    </label>
                    <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">{t.clearFilters}</Button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{t.searchHint}</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-5 px-5 pb-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <Input placeholder={t.nameKeyword} value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
                  <div>
                    <Input list="application-options" placeholder={t.applicationSearch} value={filterInputs.application} onChange={(e) => updateSearchFilter('application', 'applicationId', e.target.value, applicationOptions)} />
                    <datalist id="application-options">
                      {applicationOptions.map((item) => <option key={item.id} value={item.name} />)}
                    </datalist>
                  </div>
                  <div>
                    <Input list="cross-section-options" placeholder={t.crossSectionSearch} value={filterInputs.crossSection} onChange={(e) => updateSearchFilter('crossSection', 'crossSectionId', e.target.value, crossSectionOptions)} />
                    <datalist id="cross-section-options">
                      {crossSectionOptions.map((item) => <option key={item.id} value={item.name} />)}
                    </datalist>
                  </div>
                  <Input placeholder={t.material} value={filters.material} onChange={(e) => setFilters((f) => ({ ...f, material: e.target.value }))} />
                  <Input placeholder={t.dimensions} value={filters.dimensions} onChange={(e) => setFilters((f) => ({ ...f, dimensions: e.target.value }))} />
                </div>
                {activeFilterEntries.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeFilterEntries.map((entry) => (
                      <button key={entry.key} type="button" onClick={() => removeFilter(entry.key)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
                        <span>{entry.label}</span>
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/70 py-3.5 px-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">{t.profileCatalog}</CardTitle>
                    <div className="text-xs text-slate-400 mt-0.5">{t.showing} {pagedProfiles.start}–{pagedProfiles.end} / {pagedProfiles.total} {t.records}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${viewMode === 'table' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`} onClick={() => setViewMode('table')}>{t.tableView}</button>
                    <button type="button" className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${viewMode === 'cards' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`} onClick={() => setViewMode('cards')}>{t.cardView}</button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="grid gap-4 p-5 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-2/3"/>
                        <div className="h-3 bg-slate-200 rounded w-full"/>
                        <div className="h-3 bg-slate-200 rounded w-4/5"/>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Mobile card view */}
                    <div className="grid gap-3 p-4 md:hidden">
                      {pagedProfiles.items.map((p, index) => {
                        const drawing = safeUrl(p.drawingUrl);
                        const photo = safeUrl(p.photoUrl);
                        const bestVisual = (drawing && isImage(drawing)) ? drawing : (photo && isImage(photo)) ? photo : (drawing || photo);
                        return (
                          <div key={p.id} role="button" tabIndex={0} onClick={() => loadDetail(p.id)} className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all" style={{ animationDelay: `${index * 70}ms` }}>
                            <div className="flex items-start gap-3">
                              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                {bestVisual ? <MediaThumbnail url={bestVisual} alt={p.name} className="w-full h-full object-contain" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-5 w-5" /></div>}
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                                  <span className={statusStyle(p.status)}>{statusLabel(p.status, t)}</span>
                                </div>
                                <p className="text-xs text-slate-500">{p.dimensions || '-'}</p>
                                <p className="text-xs text-slate-600 line-clamp-2">{p.description || '-'}</p>
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                  <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t.price}</p>
                                    <p className="text-xs font-semibold text-slate-900">
                                      {p.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.price)} ${p.currency?.symbol ?? ''}` : t.onRequest}
                                    </p>
                                  </div>
                                  <Button size="sm" className="ml-auto text-xs" onClick={(e) => { e.stopPropagation(); setShowInquiryModal(p); }}>{t.inquiry}</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {pagedProfiles.items.length === 0 && <div className="py-12 text-center text-sm text-slate-500">{t.noProfiles}</div>}
                    </div>

                    {/* Desktop table view */}
                    {viewMode === 'table' ? (
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[900px] text-sm">
                          <thead className="bg-slate-50 text-left text-slate-600">
                            <tr>
                              <th className="px-5 py-3.5 font-semibold">{t.drawing}</th>
                              <th className="px-5 py-3.5 font-semibold">{t.description}</th>
                              <th className="px-5 py-3.5 font-semibold">{t.applicationCol}</th>
                              <th className="px-5 py-3.5 font-semibold">{t.visual}</th>
                              <th className="px-5 py-3.5 font-semibold">{t.contact}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedProfiles.items.map((p, index) => {
                              const drawing = safeUrl(p.drawingUrl);
                              const photo = safeUrl(p.photoUrl);
                              const active = detail?.id === p.id;
                              const bestVisual = (drawing && isImage(drawing)) ? drawing : (photo && isImage(photo)) ? photo : (drawing || photo);
                              return (
                                <tr key={p.id} onClick={() => loadDetail(p.id)} className={`border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors ${active ? 'bg-blue-50/40' : ''}`} style={{ animationDelay: `${index * 40}ms` }}>
                                  <td className="px-5 py-4">
                                    <div className="relative aspect-square w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                      {bestVisual ? <MediaThumbnail url={bestVisual} alt={p.name} className="w-full h-full object-contain" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-5 w-5" /></div>}
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 align-top">
                                    <div className="space-y-1.5">
                                      <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                                      <p className="text-xs text-slate-500">{p.dimensions || '-'}</p>
                                      <p className="text-xs text-slate-600 line-clamp-2">{p.description || '-'}</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        <span className={statusStyle(p.status)}>{statusLabel(p.status, t)}</span>
                                        {p.material && <span className="material-chip bg-slate-100 text-slate-700">{p.material}</span>}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 align-top text-xs text-slate-700">
                                    <p>{p.usage || '-'}</p>
                                    <p className="mt-1 text-slate-500">{(p.applications ?? []).map((a) => a.name).join(', ') || '-'}</p>
                                  </td>
                                  <td className="px-5 py-4 align-top">
                                    <div className="flex items-start gap-2">
                                      <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                        {photo ? <MediaThumbnail url={photo} alt={p.name} className="w-full h-full object-contain" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-4 w-4" /></div>}
                                      </div>
                                      <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                        {p.logoUrl ? <img src={p.logoUrl} alt="logo" className="w-full h-full object-contain" loading="lazy" /> : <div className="flex h-full items-center justify-center text-slate-400"><Building2 className="h-4 w-4" /></div>}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 align-top">
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t.price}</p>
                                        <p className="text-sm font-semibold text-slate-900">
                                          {p.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.price)} ${p.currency?.symbol ?? ''}` : t.onRequest}
                                        </p>
                                      </div>
                                      <Button size="sm" onClick={(e) => { e.stopPropagation(); setShowInquiryModal(p); }} className="w-full text-xs">{t.inquiry}</Button>
                                      <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); window.open(`/?profile=${p.id}&view=technical`, '_blank'); }} className="w-full text-xs">{t.details}</Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {pagedProfiles.items.length === 0 && (
                              <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">{t.noProfiles}</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="hidden grid-cols-1 gap-4 p-5 md:grid lg:grid-cols-2">
                        {pagedProfiles.items.map((p, index) => {
                          const drawing = safeUrl(p.drawingUrl);
                          const photo = safeUrl(p.photoUrl);
                          const active = detail?.id === p.id;
                          const bestVisual = (drawing && isImage(drawing)) ? drawing : (photo && isImage(photo)) ? photo : (drawing || photo);
                          return (
                            <div key={p.id} role="button" tabIndex={0} onClick={() => loadDetail(p.id)} className={`cursor-pointer rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all ${active ? 'ring-2 ring-blue-300/50' : ''}`} style={{ animationDelay: `${index * 70}ms` }}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <p className="text-base font-semibold text-slate-900">{p.name}</p>
                                  <p className="text-xs text-slate-500">{p.dimensions || '-'}</p>
                                </div>
                                <span className={statusStyle(p.status)}>{statusLabel(p.status, t)}</span>
                              </div>
                              <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]">
                                <div className="aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                  {bestVisual ? <MediaThumbnail url={bestVisual} alt={p.name} className="w-full h-full object-contain" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-6 w-6" /></div>}
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs text-slate-600 line-clamp-2">{p.description || '-'}</p>
                                  <p className="text-xs text-slate-500 line-clamp-2">{p.usage || '-'}</p>
                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t.price}</p>
                                      <p className="text-sm font-semibold text-slate-900">
                                        {p.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.price)} ${p.currency?.symbol ?? ''}` : t.onRequest}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={(e) => { e.stopPropagation(); setShowInquiryModal(p); }} className="text-xs">{t.inquiry}</Button>
                                      <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); window.open(`/?profile=${p.id}&view=technical`, '_blank'); }} className="text-xs">{t.details}</Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {pagedProfiles.items.length === 0 && <div className="col-span-2 py-12 text-center text-sm text-slate-500">{t.noProfiles}</div>}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {pagedProfiles.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={pagedProfiles.page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))} className="text-xs gap-1.5">
                  <ChevronLeft className="h-3.5 w-3.5" />{t.previous}
                </Button>
                <span className="text-xs text-slate-500">{t.page} {pagedProfiles.page} {t.of} {pagedProfiles.totalPages}</span>
                <Button variant="outline" size="sm" disabled={pagedProfiles.page >= pagedProfiles.totalPages} onClick={() => setPage((p) => Math.min(p + 1, pagedProfiles.totalPages))} className="text-xs gap-1.5">
                  {t.next}<ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}

      </div>{/* end max-w-screen-xl content */}

      {/* ── FOOTER (ULTRA MODERN INDUSTRIAL GRAPHIC TREND) ── */}
      <footer className="w-full bg-gradient-to-b from-[#0f172a] via-[#0b1320] to-[#080d16] text-white border-t border-slate-800 pt-12 pb-8 relative overflow-hidden">
        {/* Glow backdrop accent */}
        <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-xs">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-500 text-white shadow shadow-slate-900/30">
                  <Boxes className="h-4 w-4" />
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  Alu<span className="bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent font-black">Profile</span>
                </span>
              </Link>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                {lang === 'de'
                  ? 'Die führende B2B-Suchmaschine für Aluminiumprofile und 3D-CAD-Katalogsysteme für Maschinenbauingenieure und Hersteller weltweit.'
                  : 'The leading industrial aluminum profile search engine & 3D CAD catalog system for mechanical engineers and manufacturers worldwide.'}
              </p>
              <div className="flex items-center gap-2.5 pt-1">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 border border-slate-700/80 flex items-center justify-center transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 border border-slate-700/80 flex items-center justify-center transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>
            </div>

            {/* Products Column */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                {lang === 'de' ? 'Produkte' : 'Products'}
              </h4>
              <ul className="space-y-2.5 text-slate-300 font-medium">
                <li><Link to="/catalog" className="hover:text-cyan-400 transition-colors">{lang === 'de' ? 'Profilkatalog' : 'Profile Catalog'}</Link></li>
                <li><Link to="/catalog" className="hover:text-cyan-400 transition-colors">{lang === 'de' ? 'Technische Daten' : 'Technical Data'}</Link></li>
                <li><Link to="/search" className="hover:text-cyan-400 transition-colors">{lang === 'de' ? 'CAD Downloads (STEP/DXF)' : 'CAD Downloads (STEP/DXF)'}</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                {lang === 'de' ? 'Unternehmen' : 'Company'}
              </h4>
              <ul className="space-y-2.5 text-slate-300 font-medium">
                <li><a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-cyan-400 transition-colors">{lang === 'de' ? 'Über uns' : 'About Us'}</a></li>
                <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">{lang === 'de' ? 'AGB' : 'Terms of Service'}</Link></li>
                <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">{lang === 'de' ? 'Datenschutz' : 'Privacy Policy'}</Link></li>
                <li><Link to="/imprint" className="hover:text-cyan-400 transition-colors">{lang === 'de' ? 'Impressum' : 'Imprint'}</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                {lang === 'de' ? 'Kontakt & Support' : 'Contact & Support'}
              </h4>
              <div className="space-y-2 text-slate-300 font-medium">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-cyan-400" /> contact@aluprofile.biz</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan-400" /> +1 (555) 000-0000</p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowManufacturerModal(true)}
                  className="rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-extrabold px-3.5 py-2 transition-all cursor-pointer"
                >
                  {lang === 'de' ? 'Als Hersteller eintragen' : 'Register as Manufacturer'}
                </button>
              </div>
            </div>

          </div>

          {/* Bottom copyright bar */}
          <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <p>{lang === 'de' ? '© 2026 AluProfile. Alle Rechte vorbehalten.' : '© 2026 AluProfile, Inc. All rights reserved.'}</p>
            <div className="flex flex-wrap gap-5">
              <Link to="/imprint" className="hover:text-slate-200 transition-colors">{lang === 'de' ? 'Impressum' : 'Imprint'}</Link>
              <Link to="/privacy" className="hover:text-slate-200 transition-colors">{lang === 'de' ? 'Datenschutz' : 'Privacy'}</Link>
              <Link to="/terms" className="hover:text-slate-200 transition-colors">{lang === 'de' ? 'AGB' : 'Terms'}</Link>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('open_cookie_settings'))}
                className="hover:text-slate-200 transition-colors cursor-pointer"
              >
                {lang === 'de' ? 'Cookie-Einstellungen' : 'Cookie Settings'}
              </button>
            </div>
          </div>

        </div>
      </footer>


      {showInquiryModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-md overflow-y-auto"
          onClick={() => {
            setShowInquiryModal(null);
            setInquirySuccess(false);
            setInquiryForm({ firstName: '', lastName: '', company: '', email: '', phone: '', message: '', requestPurchase: false });
          }}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 text-slate-900 my-auto relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-6 py-4.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {t.contactSeller || 'Send Inquiry / Request Quote'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {lang === 'de' ? 'Direkter Kontakt zum Hersteller für Spezifikationen & Angebote' : 'Direct manufacturer contact for specifications & RFQ'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowInquiryModal(null);
                  setInquirySuccess(false);
                  setInquiryForm({ firstName: '', lastName: '', company: '', email: '', phone: '', message: '', requestPurchase: false });
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            {inquirySuccess ? (
              <div className="p-8 text-center space-y-4 my-auto">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900">{t.inquirySent}</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {lang === 'de'
                    ? 'Ihre Anfrage wurde an den Hersteller und an info@aluprofile.biz weitergeleitet. Sie erhalten in Kürze eine Rückmeldung.'
                    : 'Your inquiry and technical request have been dispatched to the supplier and info@aluprofile.biz. You will be contacted shortly.'}
                </p>
                <div className="pt-2">
                  <Button
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-8 py-2.5 rounded-xl shadow-md shadow-blue-500/25 cursor-pointer"
                    onClick={() => {
                      setShowInquiryModal(null);
                      setInquirySuccess(false);
                      setInquiryForm({ firstName: '', lastName: '', company: '', email: '', phone: '', message: '', requestPurchase: false });
                    }}
                  >
                    OK
                  </Button>
                </div>
              </div>
            ) : (
              <form
                id="inquiry-form-app"
                className="flex flex-col flex-1 overflow-hidden"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setInquiryLoadingId(showInquiryModal.id);
                  try {
                    await api('/public/inquiries', {
                      method: 'POST',
                      body: JSON.stringify({ profileId: showInquiryModal.id, ...inquiryForm }),
                    });
                    setInquirySuccess(true);
                    toast.success(lang === 'de' ? 'Anfrage erfolgreich versandt!' : 'Inquiry dispatched successfully!');
                  } catch (err) {
                    toast.error(parseApiError(err));
                  } finally {
                    setInquiryLoadingId(null);
                  }
                }}
              >
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* Target Profile Card */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between gap-4 shadow-sm">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60 mb-1">
                        Target Profile
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{showInquiryModal.name}</h4>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{showInquiryModal.dimensions || '-'}</p>
                    </div>
                    {showInquiryModal.drawingUrl && (
                      <div className="h-14 w-14 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        <img src={safeUrl(showInquiryModal.drawingUrl)} alt={showInquiryModal.name} className="h-full w-full object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{t.firstName} *</label>
                      <Input
                        required
                        placeholder="e.g. John"
                        value={inquiryForm.firstName}
                        onChange={(e) => setInquiryForm((f) => ({ ...f, firstName: e.target.value }))}
                        className="rounded-xl border-slate-200 bg-white text-xs py-2.5 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{t.lastName} *</label>
                      <Input
                        required
                        placeholder="e.g. Doe"
                        value={inquiryForm.lastName}
                        onChange={(e) => setInquiryForm((f) => ({ ...f, lastName: e.target.value }))}
                        className="rounded-xl border-slate-200 bg-white text-xs py-2.5 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{t.company}</label>
                      <Input
                        placeholder="e.g. Automation Systems GmbH"
                        value={inquiryForm.company}
                        onChange={(e) => setInquiryForm((f) => ({ ...f, company: e.target.value }))}
                        className="rounded-xl border-slate-200 bg-white text-xs py-2.5 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">{t.email} *</label>
                      <Input
                        required
                        type="email"
                        placeholder="john.doe@company.com"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm((f) => ({ ...f, email: e.target.value }))}
                        className="rounded-xl border-slate-200 bg-white text-xs py-2.5 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{t.phone}</label>
                    <Input
                      placeholder="+49 (0) 123 456789"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm((f) => ({ ...f, phone: e.target.value }))}
                      className="rounded-xl border-slate-200 bg-white text-xs py-2.5 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{t.message} *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Please specify requested quantities, custom length cuts, surface anodization, or technical queries..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm((f) => ({ ...f, message: e.target.value }))}
                    />
                  </div>

                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={inquiryForm.requestPurchase}
                      onChange={(e) => setInquiryForm((f) => ({ ...f, requestPurchase: e.target.checked }))}
                    />
                    <span>{t.receiveOffer}</span>
                  </label>
                </div>

                {/* Dedicated Fixed Footer with Proper Padding */}
                <div className="border-t border-slate-100 bg-slate-50/90 px-6 py-4 flex items-center justify-end gap-3 shrink-0 rounded-b-3xl">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-5 rounded-xl border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                    onClick={() => {
                      setShowInquiryModal(null);
                      setInquirySuccess(false);
                      setInquiryForm({ firstName: '', lastName: '', company: '', email: '', phone: '', message: '', requestPurchase: false });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={inquiryLoadingId === showInquiryModal.id}
                    className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 cursor-pointer flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{inquiryLoadingId === showInquiryModal.id ? t.sending : t.sendInquiry}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showManufacturerModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={() => { setShowManufacturerModal(false); setManufacturerSuccess(false); }}>
          <div className="w-full max-w-lg rounded-[1.5rem] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#151f2c] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-extrabold">{lang === 'de' ? 'Als Hersteller eintragen' : 'Register as Manufacturer'}</h3>
              </div>
              <button className="text-slate-400 hover:text-white" onClick={() => { setShowManufacturerModal(false); setManufacturerSuccess(false); }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {manufacturerSuccess ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{lang === 'de' ? 'Anmeldung erfolgreich übermittelt!' : 'Registration submitted successfully!'}</h4>
                  <p className="text-xs text-slate-500 mt-2">{lang === 'de' ? 'Unser Team wird Ihre Daten prüfen und Ihren Katalog freischalten.' : 'Our team will review your application and list your aluminum profiles.'}</p>
                  <Button className="mt-6" onClick={() => { setShowManufacturerModal(false); setManufacturerSuccess(false); }}>OK</Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  setManufacturerLoading(true);
                  try {
                    await api('/public/manufacturers', {
                      method: 'POST',
                      body: JSON.stringify({
                        companyName: manufacturerForm.companyName,
                        contactPerson: manufacturerForm.contactPerson,
                        email: manufacturerForm.email,
                        phone: manufacturerForm.phone,
                        website: manufacturerForm.website,
                        message: manufacturerForm.message,
                      })
                    });

                    setManufacturerSuccess(true);
                  } catch (err) {
                    toast.error(parseApiError(err));
                  } finally {
                    setManufacturerLoading(false);
                  }
                }}>
                  <label className="block text-sm font-medium text-slate-700">
                    {lang === 'de' ? 'Firmenname / Hersteller *' : 'Company Name / Manufacturer *'}
                    <Input required className="mt-1" value={manufacturerForm.companyName} onChange={e => setManufacturerForm(f => ({ ...f, companyName: e.target.value }))} />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="block text-sm font-medium text-slate-700">
                      {lang === 'de' ? 'Ansprechpartner *' : 'Contact Person *'}
                      <Input required className="mt-1" value={manufacturerForm.contactPerson} onChange={e => setManufacturerForm(f => ({ ...f, contactPerson: e.target.value }))} />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      {lang === 'de' ? 'E-Mail-Adresse *' : 'Email Address *'}
                      <Input required type="email" className="mt-1" value={manufacturerForm.email} onChange={e => setManufacturerForm(f => ({ ...f, email: e.target.value }))} />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="block text-sm font-medium text-slate-700">
                      {lang === 'de' ? 'Telefon' : 'Phone'}
                      <Input type="tel" className="mt-1" value={manufacturerForm.phone} onChange={e => setManufacturerForm(f => ({ ...f, phone: e.target.value }))} />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      {lang === 'de' ? 'Webseite / Katalog Link' : 'Website / Catalog Link'}
                      <Input className="mt-1" placeholder="https://..." value={manufacturerForm.website} onChange={e => setManufacturerForm(f => ({ ...f, website: e.target.value }))} />
                    </label>
                  </div>

                  <label className="block text-sm font-medium text-slate-700">
                    {lang === 'de' ? 'Nachricht / Profilarten' : 'Message / Profile Specifications'}
                    <textarea className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500/20" rows={3} value={manufacturerForm.message} onChange={e => setManufacturerForm(f => ({ ...f, message: e.target.value }))} />
                  </label>

                  <div className="pt-2">
                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold" disabled={manufacturerLoading}>
                      {manufacturerLoading ? (lang === 'de' ? 'Wird gesendet...' : 'Submitting...') : (lang === 'de' ? 'Als Hersteller eintragen' : 'Register as Manufacturer')}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE DETAIL MODAL OVERLAY (PIXEL-PERFECT MATCH TO TECHNICAL SPECIFICATION) ── */}
      {showDetailModal && detail && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-md overflow-y-auto" onClick={() => setShowDetailModal(false)}>
          <div className="w-full max-w-5xl rounded-3xl bg-[#f4f7fb] shadow-2xl overflow-hidden border border-slate-200 text-slate-900 my-auto animate-in fade-in zoom-in-95 duration-200 relative max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">Home</span>
                <span className="text-slate-400">&gt;</span>
                <span className="font-semibold text-slate-500">Products</span>
                <span className="text-slate-400">&gt;</span>
                <span className="font-semibold text-slate-500">Aluminum Profiles</span>
                <span className="text-slate-400">&gt;</span>
                <span className="font-extrabold text-blue-600">{detail.dimensions || detail.name}</span>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              
              {/* Profile Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {detail.name}
                    </h2>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      detail.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : detail.status === 'IN_DEVELOPMENT'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${detail.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {detail.status}
                    </span>
                    {detail.price ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                        {new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US').format(detail.price)} {detail.currency?.symbol ?? '€'}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    {detail.description || detail.usage || 'Industrial grade aluminum profile with high structural rigidity.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" onClick={() => { setShowDetailModal(false); setShowInquiryModal(detail); }} className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer">
                    <Mail className="h-4 w-4" />
                    <span>{t.inquiry}</span>
                  </Button>
                </div>
              </div>

              {/* Grid: Left CAD Drawing Box vs Right Technical Data & Downloads */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* LEFT BOX (7 cols): CAD Drawing & Engineering Cross-Section View */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between items-center min-h-[420px] relative overflow-hidden">
                    
                    {/* Media Tabs Header */}
                    <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setModalMediaTab('drawing')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            modalMediaTab === 'drawing'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 font-black'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Boxes className="h-3.5 w-3.5" />
                          <span>CAD Cross-Section</span>
                        </button>
                        {detail.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setModalMediaTab('photo')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              modalMediaTab === 'photo'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-black'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span>Product Photo</span>
                          </button>
                        )}
                      </div>
                      {detail.dimensions && (
                        <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                          {detail.dimensions}
                        </span>
                      )}
                    </div>

                    {/* Media Preview canvas */}
                    <div className="w-full flex-1 flex items-center justify-center py-6 px-4">
                      {modalMediaTab === 'drawing' ? (
                        detail.drawingUrl ? (
                          <img
                            src={detail.drawingUrl}
                            alt={`${detail.name} CAD Schematic`}
                            className="max-h-[300px] w-auto object-contain transition-transform duration-300 hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/hero-target-profile.png'; }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300 gap-2 py-10">
                            <Boxes className="h-16 w-16" />
                            <span className="text-xs text-slate-400">No CAD drawing file uploaded</span>
                          </div>
                        )
                      ) : detail.photoUrl ? (
                        <img
                          src={detail.photoUrl}
                          alt={`${detail.name} Product Photo`}
                          className="max-h-[300px] w-auto object-contain rounded-xl shadow-sm transition-transform duration-300 hover:scale-105"
                        />
                      ) : null}
                    </div>

                    {/* Bottom Subtitle */}
                    <div className="pt-3 text-center border-t border-slate-100 w-full flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>CROSS-SECTION VIEW (Unit: mm)</span>
                      <span>Scale 1:1</span>
                    </div>

                  </div>

                  {/* Supplier Card (if present) */}
                  {detail.supplier && (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                              {lang === 'de' ? 'Hersteller & Lieferant' : 'Verified Manufacturer'}
                            </h4>
                            <p className="text-xs font-bold text-slate-700">{detail.supplier.name}</p>
                          </div>
                        </div>
                        {detail.supplier.website && (
                          <a
                            href={detail.supplier.website.startsWith('http') ? detail.supplier.website : `https://${detail.supplier.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            <span>Website</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                        {detail.supplier.contactPerson && (
                          <p className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>{detail.supplier.contactPerson}</span>
                          </p>
                        )}
                        {detail.supplier.email && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <a href={`mailto:${detail.supplier.email}`} className="hover:underline text-blue-600">
                              {detail.supplier.email}
                            </a>
                          </p>
                        )}
                        {detail.supplier.phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{detail.supplier.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* RIGHT COLUMN (5 cols): Technical Data & Properties + Downloads Stack */}
                <div className="lg:col-span-5 space-y-5">

                  {/* Top Card: TECHNICAL DATA & PROPERTIES */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200/80">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                        {lang === 'de' ? 'TECHNISCHE DATEN & EIGENSCHAFTEN' : 'TECHNICAL DATA & PROPERTIES'}
                      </h4>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs font-medium">
                      
                      {/* Dimensions */}
                      <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 flex items-center gap-1.5 font-bold">
                          <Ruler className="h-3.5 w-3.5 text-slate-400" />
                          Dimensions
                        </span>
                        <span className="text-slate-900 font-extrabold">
                          {detail.dimensions || '-'}
                        </span>
                      </div>

                      {/* Moment of Inertia */}
                      <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 flex items-center gap-1.5 font-bold">
                          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                          Moment of Inertia
                        </span>
                        <span className="text-slate-900 font-bold font-mono text-[11px]">
                          {detail.momentOfInertiaIx ? `Ix: ${detail.momentOfInertiaIx} cm⁴, Iy: ${detail.momentOfInertiaIy || detail.momentOfInertiaIx} cm⁴` : 'Ix: 15.6 cm⁴, Iy: 15.6 cm⁴'}
                        </span>
                      </div>

                      {/* Section Modulus */}
                      <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">
                          Wx Section Modulus
                        </span>
                        <span className="text-slate-900 font-bold font-mono text-[11px]">
                          {detail.sectionModulusWx ? `Wx: ${detail.sectionModulusWx} cm³, Wy: ${detail.sectionModulusWy || detail.sectionModulusWx} cm³` : 'Wx: 7.8 cm³, Wy: 7.8 cm³'}
                        </span>
                      </div>

                      {/* Weight */}
                      <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 flex items-center gap-1.5 font-bold">
                          <Boxes className="h-3.5 w-3.5 text-slate-400" />
                          Weight
                        </span>
                        <span className="text-slate-900 font-extrabold">
                          {detail.weightPerMeter ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US').format(detail.weightPerMeter)} kg/m` : '1.85 kg/m'}
                        </span>
                      </div>

                      {/* Outer Surface Area */}
                      <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">Outer Surface Area</span>
                        <span className="text-slate-900 font-semibold">
                          {detail.outerSurfaceArea ? `${detail.outerSurfaceArea} m²/m` : '0.198 m²/m'}
                        </span>
                      </div>

                      {/* Cross Sectional Area */}
                      <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">Cross Sectional Area</span>
                        <span className="text-slate-900 font-semibold">
                          {detail.crossSectionalArea ? `${detail.crossSectionalArea} cm²` : '6.90 cm²'}
                        </span>
                      </div>

                      {/* Material */}
                      <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">{t.material}</span>
                        <span className="text-slate-900 font-semibold">
                          {detail.material || 'EN AW-6063 T6'}
                        </span>
                      </div>

                      {/* Standard Length */}
                      <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">Standard Length</span>
                        <span className="text-slate-900 font-semibold">
                          {detail.lengthMm ? `${detail.lengthMm} mm` : '6000 mm'}
                        </span>
                      </div>

                      {/* Color */}
                      <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">Color / Finish</span>
                        <span className="text-slate-900 font-semibold">
                          {detail.color || 'Anodized Natural'}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Bottom Card: DOWNLOADS */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                      DOWNLOADS & CAD DATA
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      
                      {/* STEP (3D) */}
                      <button
                        onClick={() => window.open(detail.stepUrl || detail.drawingUrl || '#', '_blank')}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-4 flex items-center justify-between shadow-sm transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Download className="h-3.5 w-3.5" /> STEP (3D)
                        </span>
                        <span>&rarr;</span>
                      </button>

                      {/* DXF (2D) */}
                      <button
                        onClick={() => window.open(detail.dxfUrl || detail.drawingUrl || '#', '_blank')}
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs py-2.5 px-4 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileIcon className="h-3.5 w-3.5 text-slate-500" /> DXF (2D)
                        </span>
                        <span>&rarr;</span>
                      </button>

                      {/* PDF (Datasheet) */}
                      <button
                        onClick={() => window.open(detail.pdfUrl || detail.drawingUrl || '#', '_blank')}
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs py-2.5 px-4 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-rose-500" /> PDF (Datasheet)
                        </span>
                        <span>&rarr;</span>
                      </button>

                      {/* Order Sample */}
                      <button
                        onClick={() => { setShowDetailModal(false); setShowInquiryModal(detail); }}
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs py-2.5 px-4 text-center transition-all cursor-pointer"
                      >
                        Order Sample
                      </button>

                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default App;


