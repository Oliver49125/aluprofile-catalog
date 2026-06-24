import { parseApiError } from './utils/apiError';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
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
  price?: number;
  currency?: { id: number; code: string; symbol: string };
};

const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api').replace(/\/+$/, '');
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
  const [lang, setLang] = useState<'en' | 'de'>('en');
  const [overview, setOverview] = useState<{
    applications: RefOption[];
    crossSections: RefOption[];
    newestProfiles: Profile[];
    totals: { profiles: number };
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

  useEffect(() => {
    api('/public/visits', { method: 'POST' })
      .then(data => {
        if (data && typeof data.value === 'number') {
        }
      })
      .catch(err => console.error('Failed to increment visits', err));
  }, []);

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [showInquiryModal, setShowInquiryModal] = useState<Profile | null>(null);
  const [inquiryForm, setInquiryForm] = useState({ firstName: '', lastName: '', company: '', email: '', phone: '', message: '', requestPurchase: false });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const t = useMemo(() => TXT[lang], [lang]);

  useEffect(() => {
    const saved = window.localStorage.getItem('aluprofile_lang');
    if (saved === 'en' || saved === 'de') setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('aluprofile_lang', lang);
  }, [lang]);

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
    try {
      setDetail(await api(`/public/profiles/${id}?lang=${lang}`));
    } finally {
      setIsDetailLoading(false);
    }
  }

  useEffect(() => {
    loadPublic().catch((err) => {
      setIsLoading(false);
      toast.error(parseApiError(err));
    });
  }, []);

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

  const isStandaloneTechnical = new URLSearchParams(window.location.search).get('view') === 'technical';

  if (isStandaloneTechnical) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          {/* We need to render the technical sheet card here. Since it's big, we'll extract it by capturing it and injecting it here. */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/70">
              <CardTitle className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">{t.technicalSheet}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isDetailLoading ? (
                <div className="space-y-4">
                  <div className="public-skeleton-card">
                    <div className="public-skeleton-block h-64" />
                    <div className="public-skeleton-line mt-4 w-2/3" />
                    <div className="public-skeleton-line mt-2 w-full" />
                    <div className="public-skeleton-line mt-2 w-5/6" />
                  </div>
                </div>
              ) : null}
              {!isDetailLoading && !detail && <p className="text-sm text-slate-500">{t.selectProfile}</p>}
              {!isDetailLoading && detail && (
                <div className="grid gap-6 lg:grid-cols-[1fr_350px] items-start">
                  <div className="space-y-5">
                  <div className="public-detail-sheet overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">{t.technicalView}</div>
                    <div className="grid gap-5 p-5 lg:grid-cols-[220px_1fr]">
                      <div className="h-[220px] overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50 relative">
                        {safeUrl(detail.drawingUrl) ? (
                          isImage(detail.drawingUrl!) ? (
                                    <a
                                      href={detail.drawingUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white"
                                    >
                                      <img src={detail.drawingUrl} alt="Drawing" className="public-media-fit h-full w-full" loading="lazy" />
                                    </a>
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => window.open(detail.drawingUrl!, '_blank')}>
                              <MediaThumbnail url={detail.drawingUrl!} alt={`${detail.name} drawing`} />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Download className="h-8 w-8 text-primary mb-2" />
                                <span className="text-sm font-semibold text-primary">{t.openDrawing}</span>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <ImageIcon className="h-8 w-8 opacity-50" />
                          </div>
                        )}
                      </div>
                      <table className="public-detail-table w-full text-sm">
                        <tbody>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.designation}</td><td className="py-3 text-slate-900">{detail.name}</td></tr>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.masse}</td><td className="py-3 text-slate-900">{detail.dimensions || '-'}</td></tr>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.weightPerMeter}</td><td className="py-3 text-slate-900">{detail.weightPerMeter ? new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US').format(detail.weightPerMeter) : '-'}</td></tr>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.material}</td><td className="py-3 text-slate-900">{detail.material || '-'}</td></tr>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.length}</td><td className="py-3 text-slate-900">{detail.lengthMm ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US').format(detail.lengthMm)} mm` : '-'}</td></tr>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.price}</td><td className="py-3 text-slate-900">{detail.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US').format(detail.price)} ${detail.currency ? detail.currency.symbol : ''}` : '-'}</td></tr>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.usage}</td><td className="py-3 text-slate-900">{detail.usage || '-'}</td></tr>
                          <tr><td className="py-3 font-semibold text-slate-600">{t.status}</td><td className="py-3"><span className={statusStyle(detail.status)}>{statusLabel(detail.status, t)}</span></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  
                  <div className="public-detail-sheet overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">{t.supplierAndFiles}</div>
                    <div className="space-y-4 p-5 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {detail.supplier && (
                          <div className="rounded-2xl border border-primary/10 bg-primary/[0.04] p-4 text-slate-700 sm:col-span-2 space-y-2">
                            <p className="text-base font-medium text-slate-900">{detail.supplier.name}</p>
                            {detail.supplier.contactPerson && <p className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400" /> {detail.supplier.contactPerson}</p>}
                            {detail.supplier.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {detail.supplier.phone}</p>}
                            {detail.supplier.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> <a href={`mailto:${detail.supplier.email}`} className="text-primary hover:underline">{detail.supplier.email}</a></p>}
                            {detail.supplier.website && <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-400" /> <a href={detail.supplier.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{detail.supplier.website}</a></p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="public-detail-sheet overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">{t.linkedCategories}</div>
                    <div className="space-y-4 p-5 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">

                        <div className="rounded-2xl border border-primary/10 bg-primary/[0.04] p-4 text-slate-700 sm:col-span-2">
                          <p className="text-sm leading-6">{t.application}: {(detail.applications ?? []).map((item) => item.name).join(', ') || '-'}</p>
                          <p className="text-sm leading-6">{t.crossSection}: {(detail.crossSections ?? []).map((item) => item.name).join(', ') || '-'}</p>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        {safeUrl(detail.drawingUrl) && (
                          <Button className="w-full justify-between" variant="outline" onClick={() => {
                            window.open(detail.drawingUrl!, '_blank');
                          }}>{t.openDrawing} <ExternalLink className="h-4 w-4" /></Button>
                        )}
                        {safeUrl(detail.photoUrl) && (
                          <Button className="w-full justify-between" variant="outline" onClick={() => {
                            window.open(detail.photoUrl!, '_blank');
                          }}>{t.openPhoto} <ExternalLink className="h-4 w-4" /></Button>
                        )}

                      </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-white shadow-sm overflow-hidden sticky top-6">
                    <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                      <h3 className="text-base font-semibold text-slate-900">{t.contactSeller}</h3>
                    </div>
                    <div className="p-5">
                      {inquirySuccess ? (
                        <div className="text-center py-6">
                          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <h4 className="text-sm font-medium text-slate-900">{t.inquirySent}</h4>
                        </div>
                      ) : (
                        <form className="space-y-4" onSubmit={async (e) => {
                          e.preventDefault();
                          setInquiryLoading(true);
                          try {
                            await api('/public/inquiries', {
                              method: 'POST',
                              body: JSON.stringify({ profileId: detail.id, ...inquiryForm })
                            });
                            setInquirySuccess(true);
                          } catch (err) {
                            toast.error(parseApiError(err));
                          } finally {
                            setInquiryLoading(false);
                          }
                        }}>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="block text-[13px] font-medium text-slate-700">
                              {t.firstName} *
                              <Input required className="mt-1.5 h-9 text-sm" value={inquiryForm.firstName} onChange={e => setInquiryForm(f => ({ ...f, firstName: e.target.value }))} />
                            </label>
                            <label className="block text-[13px] font-medium text-slate-700">
                              {t.lastName} *
                              <Input required className="mt-1.5 h-9 text-sm" value={inquiryForm.lastName} onChange={e => setInquiryForm(f => ({ ...f, lastName: e.target.value }))} />
                            </label>
                          </div>
                          <label className="block text-[13px] font-medium text-slate-700">
                            {t.company}
                            <Input className="mt-1.5 h-9 text-sm" value={inquiryForm.company} onChange={e => setInquiryForm(f => ({ ...f, company: e.target.value }))} />
                          </label>
                          <label className="block text-[13px] font-medium text-slate-700">
                            {t.email} *
                            <Input required type="email" className="mt-1.5 h-9 text-sm" value={inquiryForm.email} onChange={e => setInquiryForm(f => ({ ...f, email: e.target.value }))} />
                          </label>
                          <label className="block text-[13px] font-medium text-slate-700">
                            {t.phone}
                            <Input className="mt-1.5 h-9 text-sm" type="tel" value={inquiryForm.phone} onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))} />
                          </label>
                          <label className="block text-[13px] font-medium text-slate-700">
                            {t.message} *
                            <textarea required className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" rows={3} value={inquiryForm.message} onChange={e => setInquiryForm(f => ({ ...f, message: e.target.value }))} />
                          </label>
                          <label className="flex items-center gap-2.5 text-[13px] text-slate-700">
                            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" checked={inquiryForm.requestPurchase} onChange={e => setInquiryForm(f => ({ ...f, requestPurchase: e.target.checked }))} />
                            {t.receiveOffer}
                          </label>
                          <div className="pt-2">
                            <Button type="submit" className="w-full" disabled={inquiryLoading}>
                              {inquiryLoading ? t.sending : t.contactSeller}
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="material-shell">
        <header className="material-hero public-hero mb-6 p-6 md:p-8">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {t.catalogLabel}
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.045em] text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">{t.subtitle}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  {t.heroNote}
                </span>
              </div>
            </div>

            <div className="public-hero-side">
              <div className="public-action-cluster">
                <a href="/customer">
                  <Button className="h-12 rounded-full px-6" variant="secondary">{t.customerLogin}</Button>
                </a>
                {!!token && (
                  <a href="/admin">
                    <Button className="h-12 rounded-full px-6" variant="secondary">{t.adminPanel}</Button>
                  </a>
                )}
                <label className="public-language-pill">
                  <span>{t.language}</span>
                  <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="public-language-select">
                    <option value="en">EN</option>
                    <option value="de">DE</option>
                  </select>
                </label>
                {!!token && (
                  <div className="rounded-full border border-white/70 bg-white/90 p-1.5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.4)]">
                    <button onClick={() => logout()} title="Logout" className="flex items-center justify-center p-2 text-slate-600 hover:text-slate-900"><LogOut className="h-5 w-5" /></button>
                  </div>
                )}
              </div>

              <div className="public-hero-panel mt-6">
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="material-stat public-stat-card">
                    <p className="public-stat-label text-[0.62rem] tracking-[0.12em]">{t.totalProfiles}</p>
                    <p className="public-stat-value">
                      <span className="public-stat-icon"><Boxes className="h-5 w-5" /></span>
                      {overview?.totals?.profiles ?? 0}
                    </p>
                  </div>
                  <div className="material-stat public-stat-card">
                    <p className="public-stat-label text-[0.62rem] tracking-[0.12em]">{t.applications}</p>
                    <p className="public-stat-value">
                      <span className="public-stat-icon"><LayoutGrid className="h-5 w-5" /></span>
                      {overview?.applications.length ?? 0}
                    </p>
                  </div>
                  <div className="material-stat public-stat-card">
                    <p className="public-stat-label text-[0.62rem] tracking-[0.12em]">{t.crossSections}</p>
                    <p className="public-stat-value">
                      <span className="public-stat-icon"><Ruler className="h-5 w-5" /></span>
                      {overview?.crossSections.length ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>


        <Card className="material-panel mb-6 overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold tracking-[-0.02em] text-slate-950">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Search className="h-5 w-5" />
                </span>
                {t.smartFilters}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  <span>{t.sortBy}</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="min-h-0 w-auto border-0 bg-transparent p-0 pr-7 shadow-none focus-visible:ring-0">
                    <option value="newest">{t.newest}</option>
                    <option value="nameAsc">{t.nameAsc}</option>
                    <option value="nameDesc">{t.nameDesc}</option>

                    <option value="status">{t.statusSort}</option>
                  </select>
                </label>
                <Button variant="outline" onClick={clearFilters}>{t.clearFilters}</Button>
              </div>
            </div>
            <p className="text-sm text-slate-500">{t.searchHint}</p>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Input placeholder={t.nameKeyword} value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
              <div className="space-y-2">
                <Input list="application-options" className="public-combobox-input" placeholder={t.applicationSearch} value={filterInputs.application} onChange={(e) => updateSearchFilter('application', 'applicationId', e.target.value, applicationOptions)} />
                <datalist id="application-options">
                  {applicationOptions.map((item) => (
                    <option key={item.id} value={item.name} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Input list="cross-section-options" className="public-combobox-input" placeholder={t.crossSectionSearch} value={filterInputs.crossSection} onChange={(e) => updateSearchFilter('crossSection', 'crossSectionId', e.target.value, crossSectionOptions)} />
                <datalist id="cross-section-options">
                  {crossSectionOptions.map((item) => (
                    <option key={item.id} value={item.name} />
                  ))}
                </datalist>
              </div>

              <Input placeholder={t.material} value={filters.material} onChange={(e) => setFilters((f) => ({ ...f, material: e.target.value }))} />
              <Input placeholder={t.dimensions} value={filters.dimensions} onChange={(e) => setFilters((f) => ({ ...f, dimensions: e.target.value }))} />
            </div>

            {activeFilterEntries.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t.activeFilters}</p>
                <div className="flex flex-wrap gap-2">
                  {activeFilterEntries.map((entry) => (
                    <button key={entry.key} type="button" onClick={() => removeFilter(entry.key)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                      <span>{entry.label}</span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/70">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">{t.profileCatalog}</CardTitle>
                  <div className="text-sm text-slate-500">
                    {t.showing} {pagedProfiles.start}-{pagedProfiles.end} / {pagedProfiles.total} {t.records}
                  </div>
                </div>
                <div className="public-results-toolbar">
                  <div className="public-view-toggle" role="tablist" aria-label={t.profileCatalog}>
                    <button type="button" className={viewMode === 'table' ? 'is-active' : ''} onClick={() => setViewMode('table')}>{t.tableView}</button>
                    <button type="button" className={viewMode === 'cards' ? 'is-active' : ''} onClick={() => setViewMode('cards')}>{t.cardView}</button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="public-skeleton-card">
                      <div className="public-skeleton-block h-40" />
                      <div className="public-skeleton-line mt-4 w-2/3" />
                      <div className="public-skeleton-line mt-2 w-full" />
                      <div className="public-skeleton-line mt-2 w-5/6" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
              <div className="grid gap-4 p-5 md:hidden">
                {pagedProfiles.items.map((p, index) => {
                  const drawing = safeUrl(p.drawingUrl);
                  const photo = safeUrl(p.photoUrl);
                  const active = detail?.id === p.id;
                  const bestVisual = (drawing && isImage(drawing)) ? drawing : (photo && isImage(photo)) ? photo : (drawing || photo);
                  return (
                    <div key={p.id} role="button" tabIndex={0} onClick={() => loadDetail(p.id)} className={`public-mobile-card cursor-pointer text-left ${active ? 'ring-2 ring-primary/30' : ''}`} style={{ animationDelay: `${index * 70}ms` }}>
                      <div className="flex items-start gap-4">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50">
                          {bestVisual ? <MediaThumbnail url={bestVisual} alt={p.name + ' visual'} className="public-media-fit" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-5 w-5" /></div>}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-base font-semibold tracking-[-0.02em] text-slate-950">{p.name}</p>
                              <p className="text-xs text-slate-500">{p.dimensions || '-'}</p>
                            </div>
                            <span className={statusStyle(p.status)}>{statusLabel(p.status, t)}</span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-6 text-slate-600">{p.description || '-'}</p>
                          <div className="flex flex-wrap gap-2">
                            {p.material && <span className="material-chip bg-slate-100 text-slate-700">{p.material}</span>}

                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <div className="h-10 w-10 overflow-hidden rounded-[0.9rem] border border-slate-200 bg-slate-50">
                              {photo ? <MediaThumbnail url={photo} alt={p.name + ' photo'} className="public-media-fit" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-4 w-4" /></div>}
                            </div>
                            <span className="line-clamp-1">{(p.applications ?? []).map((a) => a.name).join(', ') || '-'}</span>
                          </div>
                        
                                                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                                                    <div className="text-left">
                                                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{t.price}</p>
                                                      <p className="font-semibold text-slate-900">
                                                        {p.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.price)} ${p.currency ? p.currency.symbol : ''}` : t.onRequest}
                                                      </p>
                                                    </div>

                                                    <Button size="sm" onClick={(e) => { e.stopPropagation(); setShowInquiryModal(p); }}>

                                                      {t.inquiry}

                                                    </Button>

                                                  </div>

                                                </div>

                                              </div>

                                            </div>

                        

                  );
                })}
                {pagedProfiles.items.length === 0 && <div className="rounded-[1.25rem] border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500">{t.noProfiles}</div>}
              </div>

              {viewMode === 'table' ? (
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className="bg-slate-50/90 text-left text-slate-600">
                      <tr>
                        <th className="px-5 py-4 font-semibold">{t.drawing}</th>
                        <th className="px-5 py-4 font-semibold">{t.description}</th>
                        <th className="px-5 py-4 font-semibold">{t.applicationCol}</th>
                        <th className="px-5 py-4 font-semibold">{t.visual}</th>
                        <th className="px-5 py-4 font-semibold">{t.contact}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedProfiles.items.map((p, index) => {
                        const drawing = safeUrl(p.drawingUrl);
                        const photo = safeUrl(p.photoUrl);
                        const active = detail?.id === p.id;
                        const bestVisual = (drawing && isImage(drawing)) ? drawing : (photo && isImage(photo)) ? photo : (drawing || photo);
                        return (
                          <tr key={p.id} onClick={() => loadDetail(p.id)} className={`material-table-row cursor-pointer ${active ? 'bg-primary/[0.06]' : ''}`} style={{ animationDelay: `${index * 40}ms` }}>
                            <td className="px-5 py-4">
                              <div className="relative aspect-square w-28 overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                                {bestVisual ? <MediaThumbnail url={bestVisual} alt={p.name + ' visual'} className="public-media-fit" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-5 w-5" /></div>}
                              </div>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <div className="space-y-2">
                                <div>
                                  <p className="text-base font-semibold tracking-[-0.02em] text-slate-950">{p.name}</p>
                                  <p className="text-xs text-slate-500">{p.dimensions || '-'}</p>
                                </div>
                                <p className="line-clamp-2 text-sm leading-6 text-slate-600">{p.description || '-'}</p>
                                <div className="flex flex-wrap gap-2">
                                  <span className={statusStyle(p.status)}>{statusLabel(p.status, t)}</span>
                                  {p.material && <span className="material-chip bg-slate-100 text-slate-700">{p.material}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <p className="text-sm leading-6 text-slate-700">{p.usage || '-'}</p>
                              <p className="mt-2 text-xs leading-5 text-slate-500">{(p.applications ?? []).map((a) => a.name).join(', ') || '-'}</p>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <div className="flex items-start gap-3">
                                <div className="h-14 w-14 overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50">
                                  {photo ? <MediaThumbnail url={photo} alt={p.name + ' photo'} className="public-media-fit" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-4 w-4" /></div>}
                                </div>
                                <div className="h-14 w-14 overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50">
                                  {p.logoUrl ? <img src={p.logoUrl} alt="logo" className="public-media-fit" loading="lazy" /> : <div className="flex h-full items-center justify-center text-slate-400"><Building2 className="h-4 w-4" /></div>}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 align-top">
                              
                              <div className="space-y-2">
                                <div className="mb-2">
                                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{t.price}</p>
                                  <p className="font-semibold text-slate-900">
                                    {p.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.price)} ${p.currency ? p.currency.symbol : ''}` : t.onRequest}
                                  </p>
                                </div>
                                <Button size="sm" onClick={(e) => { e.stopPropagation(); setShowInquiryModal(p); }} className="w-full">
                                  {t.inquiry}
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); window.open(`/?profile=${p.id}&view=technical`, '_blank'); }}
                                  className="w-full"
                                >
                                  {t.details}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {pagedProfiles.items.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">{t.noProfiles}</td>
                        </tr>
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
                      <div key={p.id} role="button" tabIndex={0} onClick={() => loadDetail(p.id)} className={`public-result-card cursor-pointer text-left ${active ? 'ring-2 ring-primary/30' : ''}`} style={{ animationDelay: `${index * 70}ms` }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <p className="text-lg font-semibold tracking-[-0.025em] text-slate-950">{p.name}</p>
                            <p className="text-sm text-slate-500">{p.dimensions || '-'}</p>
                          </div>
                          <span className={statusStyle(p.status)}>{statusLabel(p.status, t)}</span>
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
                          <div className="aspect-[4/3] overflow-hidden rounded-[1.1rem] border border-slate-200 bg-slate-50">
                            {bestVisual ? <MediaThumbnail url={bestVisual} alt={p.name + ' visual'} className="public-media-fit" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-6 w-6" /></div>}
                          </div>
                          <div className="space-y-3">
                            <p className="line-clamp-3 text-sm leading-6 text-slate-600">{p.description || '-'}</p>
                            <p className="text-sm leading-6 text-slate-700">{p.usage || '-'}</p>
                            <div className="flex flex-wrap gap-2">
                              {p.material && <span className="material-chip bg-slate-100 text-slate-700">{p.material}</span>}
                              {(p.crossSections ?? []).slice(0, 2).map((item) => <span key={item.id} className="material-chip bg-primary/[0.08] text-primary">{item.name}</span>)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-col gap-3 rounded-[1rem] bg-slate-50 px-4 py-3 border border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-left">
                              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{t.price}</p>
                              <p className="text-sm font-bold text-slate-900">
                                {p.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.price)} ${p.currency ? p.currency.symbol : ''}` : t.onRequest}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button variant="secondary" size="sm" onClick={() => window.open(`/?profile=${p.id}&view=technical`, '_blank')}>{t.details}</Button>
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); setShowInquiryModal(p); }}>
                              {t.inquiry}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {pagedProfiles.items.length === 0 && <div className="lg:col-span-2 rounded-[1.25rem] border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500">{t.noProfiles}</div>}
                </div>
              )}

              {pagedProfiles.items.length === 0 ? (
                <div className="border-t border-slate-200 px-6 py-12 text-center">
                  <p className="text-lg font-semibold text-slate-900">{t.noResultsTitle}</p>
                  <p className="mt-2 text-sm text-slate-500">{t.noResultsNote}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-slate-500">{t.page} {pagedProfiles.page} {t.of} {pagedProfiles.totalPages}</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" disabled={pagedProfiles.page <= 1} onClick={() => setPage((current) => current - 1)}>
                      <ChevronLeft className="mr-1 h-4 w-4" /> {t.previous}
                    </Button>
                    <Button size="sm" variant="outline" disabled={pagedProfiles.page >= pagedProfiles.totalPages} onClick={() => setPage((current) => current + 1)}>
                      {t.next} <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </div>


              {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => { setShowInquiryModal(null); setInquirySuccess(false); setInquiryForm({ firstName: '', lastName: '', company: '', email: '', phone: '', message: '', requestPurchase: false }); }}>
          <div className="w-full max-w-lg rounded-[1.5rem] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">{t.contactSeller}</h3>
              <button className="text-slate-400 hover:text-slate-600" onClick={() => { setShowInquiryModal(null); setInquirySuccess(false); setInquiryForm({ firstName: '', lastName: '', company: '', email: '', phone: '', message: '', requestPurchase: false }); }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {inquirySuccess ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-900">{t.inquirySent}</h4>
                  <Button className="mt-6" onClick={() => { setShowInquiryModal(null); setInquirySuccess(false); setInquiryForm({ firstName: '', lastName: '', company: '', email: '', phone: '', message: '', requestPurchase: false }); }}>OK</Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  setInquiryLoading(true);
                  try {
                    await api('/public/inquiries', {
                      method: 'POST',
                      body: JSON.stringify({ profileId: showInquiryModal.id, ...inquiryForm })
                    });
                    setInquirySuccess(true);
                  } catch (err) {
                    toast.error(parseApiError(err));
                  } finally {
                    setInquiryLoading(false);
                  }
                }}>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block text-sm font-medium text-slate-700">
                      {t.firstName} *
                      <Input required className="mt-1" value={inquiryForm.firstName} onChange={e => setInquiryForm(f => ({ ...f, firstName: e.target.value }))} />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      {t.lastName} *
                      <Input required className="mt-1" value={inquiryForm.lastName} onChange={e => setInquiryForm(f => ({ ...f, lastName: e.target.value }))} />
                    </label>
                  </div>
                  <label className="block text-sm font-medium text-slate-700">
                    {t.company}
                    <Input className="mt-1" value={inquiryForm.company} onChange={e => setInquiryForm(f => ({ ...f, company: e.target.value }))} />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    {t.email} *
                    <Input required type="email" className="mt-1" value={inquiryForm.email} onChange={e => setInquiryForm(f => ({ ...f, email: e.target.value }))} />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    {t.phone}
                    <Input className="mt-1" type="tel" value={inquiryForm.phone} onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))} />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    {t.message} *
                    <textarea required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" rows={4} value={inquiryForm.message} onChange={e => setInquiryForm(f => ({ ...f, message: e.target.value }))} />
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" checked={inquiryForm.requestPurchase} onChange={e => setInquiryForm(f => ({ ...f, requestPurchase: e.target.checked }))} />
                    {t.receiveOffer}
                  </label>
                  <div className="pt-2">
                    <Button type="submit" className="w-full" disabled={inquiryLoading}>
                      {inquiryLoading ? t.sending : t.sendInquiry}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;





