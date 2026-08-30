import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from './LanguageContext';
import { API_BASE } from './utils/apiBase';

import {
  Boxes,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileIcon,
  FileText,
  ImageIcon,
  Building2,
  Globe,
  Ruler,
  User,
  Phone,
  Mail,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { parseApiError } from './utils/apiError';

type RefOption = { id: number; name: string; profilesCount?: number };
type SortKey = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc' | 'priceAsc' | 'priceDesc' | 'status';


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
  supplier?: { id: number; name: string; contactPerson?: string; phone?: string; email?: string; website?: string };
  applications?: RefOption[];
  crossSections?: RefOption[];
  slotSize?: string;
  price?: number;
  currency?: { symbol: string };
};

const PAGE_SIZE = 10;

function isImage(url?: string) {
  if (!url) return false;
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url);
}

function safeUrl(url?: string) {
  if (!url) return '';
  return url.startsWith('/') ? `${API_BASE}${url}` : url;
}

export default function CatalogPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [applications, setApplications] = useState<RefOption[]>([]);
  const [crossSections, setCrossSections] = useState<RefOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Language & Manufacturer Modal State
  const { lang, setLang } = useLanguage();
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);

  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [manufacturerForm, setManufacturerForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    address: '',
  });
  const [manufacturerSubmitting, setManufacturerSubmitting] = useState(false);

  async function handleRegisterManufacturer(e: React.FormEvent) {
    e.preventDefault();
    if (!manufacturerForm.name || !manufacturerForm.email) {
      toast.error(lang === 'de' ? 'Bitte füllen Sie Name und E-Mail aus.' : 'Please fill in Company Name and Email.');
      return;
    }
    setManufacturerSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/public/manufacturers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manufacturerForm),
      });
      if (!res.ok) throw new Error('Failed to submit application');
      toast.success(lang === 'de' ? 'Erfolgreich eingereicht! Unser Team wird sich in Kürze bei Ihnen melden.' : 'Registration submitted successfully! Our team will review your application.');
      setShowManufacturerModal(false);
      setManufacturerForm({ name: '', contactPerson: '', email: '', phone: '', website: '', industry: '', address: '' });
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setManufacturerSubmitting(false);
    }
  }

  // Filters & Sorting & Pagination
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

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

  // Selected Detail Modal
  const [detail, setDetail] = useState<Profile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMediaTab, setModalMediaTab] = useState<'drawing' | 'photo'>('drawing');

  // Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = useState<Profile | null>(null);
  const [inquiryForm, setInquiryForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    message: '',
    requestPurchase: false,
  });
  const [inquiryLoadingId, setInquiryLoadingId] = useState<number | null>(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [profRes, overviewRes] = await Promise.all([
          fetch(`${API_BASE}/public/profiles?lang=${lang}`),
          fetch(`${API_BASE}/public/overview?lang=${lang}`),
        ]);
        if (profRes.ok) setProfiles(await profRes.json());
        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          if (overviewData.applications) setApplications(overviewData.applications);
          if (overviewData.crossSections) setCrossSections(overviewData.crossSections);
        }
      } catch (err) {
        toast.error(parseApiError(err));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [lang]);

  async function openDetail(id: number) {
    try {
      const res = await fetch(`${API_BASE}/public/profiles/${id}?lang=${lang}`);
      if (res.ok) {
        setDetail(await res.json());
        setModalMediaTab('drawing');
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Filtered & Sorted Profiles
  const filteredProfiles = useMemo(() => {
    let list = [...profiles];
    if (filters.q) {
      const q = filters.q.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.dimensions && p.dimensions.toLowerCase().includes(q)) || (p.material && p.material.toLowerCase().includes(q)));
    }
    if (filters.applicationId) {
      list = list.filter((p) => p.applications?.some((a) => String(a.id) === filters.applicationId));
    }
    if (filters.crossSectionId) {
      list = list.filter((p) => p.crossSections?.some((cs) => String(cs.id) === filters.crossSectionId));
    }
    if (filters.material) {
      const m = filters.material.toLowerCase();
      list = list.filter((p) => p.material && p.material.toLowerCase().includes(m));
    }
    if (filters.dimensions) {
      const d = filters.dimensions.toLowerCase();
      list = list.filter((p) => p.dimensions && p.dimensions.toLowerCase().includes(d));
    }

    list.sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'oldest') return a.id - b.id;
      if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
      if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
      if (sortBy === 'priceAsc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'priceDesc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      return b.id - a.id;
    });

    return list;
  }, [profiles, filters, sortBy]);

  const totalPages = Math.ceil(filteredProfiles.length / pageSize) || 1;
  const pagedProfiles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProfiles.slice(start, start + pageSize);
  }, [filteredProfiles, page, pageSize]);

  function clearFilters() {
    setFilters({ q: '', applicationId: '', crossSectionId: '', material: '', dimensions: '' });
    setFilterInputs({ application: '', crossSection: '' });
    setPage(1);
  }


  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-800">
      
      {/* Top Header Navigation (100% IDENTICAL MATCH TO LANDING PAGE) */}
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
          <Link to="/" className="hover:text-blue-600 transition-colors">{lang === 'de' ? 'Startseite' : 'Home'}</Link>

          {/* Catalog Dropdown Menu */}
          <div
            className="relative"
            onMouseEnter={() => setIsCatalogDropdownOpen(true)}
            onMouseLeave={() => setIsCatalogDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsCatalogDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-blue-600 font-extrabold border-b-2 border-blue-600 pb-0.5 transition-colors cursor-pointer focus:outline-none"
            >
              <span>{lang === 'de' ? 'Suchportal' : 'Search Portal'}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isCatalogDropdownOpen ? 'rotate-180 text-blue-600' : 'text-blue-600'}`} />
            </button>

            {isCatalogDropdownOpen && (
              <div className="absolute left-0 top-full pt-1.5 z-50 w-64 animate-fadeIn">
                <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-2 shadow-xl shadow-slate-900/10 ring-1 ring-black/5 space-y-1">
                  <Link
                    to="/catalog"
                    onClick={() => setIsCatalogDropdownOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 bg-blue-50/60 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors">
                      <Boxes className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 transition-colors">
                        {lang === 'de' ? 'Profilsuche' : 'Profile Search'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium leading-snug">
                        {lang === 'de' ? 'Alle Standard- & Sonderprofile' : 'All standard & custom profiles'}
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/search"
                    onClick={() => setIsCatalogDropdownOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                      <Search className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                        {lang === 'de' ? 'Erweiterte Profilsuche' : 'Advance Profile Search'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium leading-snug">
                        {lang === 'de' ? 'Spezifische Filter & CAD-Suche' : 'Detailed filters & CAD search'}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/#about" className="hover:text-blue-600 transition-colors">{lang === 'de' ? 'Über uns' : 'About'}</Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link to="/customer?mode=sign-up">
            <button
              className="rounded-full bg-[#131c2a] hover:bg-slate-900 text-white text-[12px] font-extrabold px-4 py-2 shadow-sm transition-all border border-slate-700/50 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>{lang === 'de' ? 'Als Hersteller eintragen' : 'Register as Manufacturer'}</span>
            </button>
          </Link>

          <Link to="/customer">
            <Button className="rounded-xl bg-[#1e2a3b] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 shadow-sm transition-all cursor-pointer">
              {lang === 'de' ? 'Kundenportal' : 'Customer Portal'}
            </Button>
          </Link>

          <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl transition-all border border-slate-200">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <select value={lang} onChange={(e) => setLang(e.target.value as any)} className="bg-transparent border-0 font-bold focus:outline-none cursor-pointer text-xs">
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>
          </label>
        </div>
      </header>



      {/* Main Content Container */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Title Header (Ultra Modern Industrial Graphic Trend) */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700/80 relative overflow-hidden backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Subtle glow circles */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400 shadow-sm">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              {lang === 'de' ? 'Technischer Datenkatalog' : 'Technical Data Catalog'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {lang === 'de' ? 'Aluminium-Profilkatalog' : 'Aluminum Profile Catalog'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
              {lang === 'de' 
                ? 'Durchsuchen, filtern und prüfen Sie Standard- und Sonderprofile aus Aluminium mit technischen Datenblättern.' 
                : 'Browse, filter, and inspect standard and custom aluminum extrusion profiles with technical data sheets.'}
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <Link to="/search">
              <button
                type="button"
                className="rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>{lang === 'de' ? 'Parametrisches Suchportal' : 'Parametric Search Portal'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>


        {/* Smart Filters Card */}
        <Card className="border border-slate-200/90 shadow-xl bg-white overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/90 py-4 px-6 sm:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="flex items-center gap-3 text-base font-extrabold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-md shadow-blue-600/30">
                  <Search className="h-4 w-4" />
                </span>
                {lang === 'de' ? 'Intelligente Filter & Suchsteuerung' : 'Smart Filters & Search Controls'}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm hover:border-slate-300 transition-all">
                  <span className="text-slate-400">{lang === 'de' ? 'Sortieren nach:' : 'Sort By:'}</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="border-0 bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer">
                    <option value="newest">{lang === 'de' ? 'Neueste zuerst' : 'Newest First'}</option>
                    <option value="oldest">{lang === 'de' ? 'Älteste zuerst' : 'Oldest First'}</option>
                    <option value="priceAsc">{lang === 'de' ? 'Preis: Aufsteigend' : 'Price: Low to High'}</option>
                    <option value="priceDesc">{lang === 'de' ? 'Preis: Absteigend' : 'Price: High to Low'}</option>
                    <option value="nameAsc">{lang === 'de' ? 'Name (A–Z)' : 'Name (A–Z)'}</option>
                    <option value="nameDesc">{lang === 'de' ? 'Name (Z–A)' : 'Name (Z–A)'}</option>
                    <option value="status">{lang === 'de' ? 'Status' : 'Status'}</option>
                  </select>
                </label>
                <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs font-extrabold rounded-2xl border-slate-200 hover:bg-slate-100 py-2">
                  {lang === 'de' ? 'Filter zurücksetzen' : 'Clear Filters'}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6 px-6 sm:px-8 pb-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input
                placeholder={lang === 'de' ? 'Name / Stichwort suchen...' : 'Name / Keyword search...'}
                value={filters.q}
                onChange={(e) => { setFilters((f) => ({ ...f, q: e.target.value })); setPage(1); }}
                className="rounded-2xl border-slate-200 focus:ring-2 focus:ring-blue-500 py-2.5 text-xs font-medium"
              />
              <div>
                <Input
                  list="app-options"
                  placeholder={lang === 'de' ? 'Nach Anwendung filtern...' : 'Filter by Application...'}
                  value={filterInputs.application}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilterInputs((f) => ({ ...f, application: val }));
                    const found = applications.find(a => a.name.toLowerCase() === val.toLowerCase());
                    setFilters((f) => ({ ...f, applicationId: found ? String(found.id) : '' }));
                    setPage(1);
                  }}
                  className="rounded-2xl border-slate-200 focus:ring-2 focus:ring-blue-500 py-2.5 text-xs font-medium"
                />
                <datalist id="app-options">
                  {applications.map((item) => <option key={item.id} value={item.name} />)}
                </datalist>
              </div>
              <div>
                <Input
                  list="cross-options"
                  placeholder={lang === 'de' ? 'Nach Querschnitt filtern...' : 'Filter by Cross-Section...'}
                  value={filterInputs.crossSection}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilterInputs((f) => ({ ...f, crossSection: val }));
                    const found = crossSections.find(cs => cs.name.toLowerCase() === val.toLowerCase());
                    setFilters((f) => ({ ...f, crossSectionId: found ? String(found.id) : '' }));
                    setPage(1);
                  }}
                  className="rounded-2xl border-slate-200 focus:ring-2 focus:ring-blue-500 py-2.5 text-xs font-medium"
                />
                <datalist id="cross-options">
                  {crossSections.map((item) => <option key={item.id} value={item.name} />)}
                </datalist>
              </div>
              <Input
                placeholder={lang === 'de' ? 'Material (z.B. 6063-T5)' : 'Material (e.g. 6063-T5)'}
                value={filters.material}
                onChange={(e) => { setFilters((f) => ({ ...f, material: e.target.value })); setPage(1); }}
                className="rounded-2xl border-slate-200 focus:ring-2 focus:ring-blue-500 py-2.5 text-xs font-medium"
              />
              <Input
                placeholder={lang === 'de' ? 'Abmessungen (z.B. 40x40)' : 'Dimensions (e.g. 40x40)'}
                value={filters.dimensions}
                onChange={(e) => { setFilters((f) => ({ ...f, dimensions: e.target.value })); setPage(1); }}
                className="rounded-2xl border-slate-200 focus:ring-2 focus:ring-blue-500 py-2.5 text-xs font-medium"
              />
            </div>

          </CardContent>
        </Card>

        {/* Catalog Table Card */}
        <Card className="border border-slate-200/90 shadow-xl bg-white overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/80 py-4 px-6 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-extrabold text-slate-900">{lang === 'de' ? 'Profileinträge' : 'Profile Records'}</CardTitle>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {lang === 'de' 
                    ? `Zeige ${filteredProfiles.length === 0 ? 0 : (page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredProfiles.length)} von ${filteredProfiles.length} Profilen` 
                    : `Showing ${filteredProfiles.length === 0 ? 0 : (page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredProfiles.length)} of ${filteredProfiles.length} profiles found`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Per Page Selector */}
                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm">
                  <span className="text-slate-400">{lang === 'de' ? 'Anzeigen:' : 'Show:'}</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="border-0 bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value={10}>{lang === 'de' ? '10 pro Seite' : '10 per page'}</option>
                    <option value={25}>{lang === 'de' ? '25 pro Seite' : '25 per page'}</option>
                    <option value={50}>{lang === 'de' ? '50 pro Seite' : '50 per page'}</option>
                    <option value={1000}>{lang === 'de' ? 'Alle Profile' : 'All profiles'}</option>
                  </select>
                </label>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    onClick={() => setViewMode('table')}
                  >
                    {lang === 'de' ? 'Tabellenansicht' : 'Table View'}
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${viewMode === 'cards' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    onClick={() => setViewMode('cards')}
                  >
                    {lang === 'de' ? 'Kartenansicht' : 'Card View'}
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-sm font-semibold text-slate-500">{lang === 'de' ? 'Katalogprofile werden geladen...' : 'Loading catalog profiles...'}</div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[860px]">
                  <thead className="bg-slate-50 text-slate-600 font-extrabold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">{lang === 'de' ? 'Zeichnung' : 'Drawing'}</th>
                      <th className="px-5 py-3.5">{lang === 'de' ? 'Profil & Details' : 'Profile & Details'}</th>
                      <th className="px-5 py-3.5">{lang === 'de' ? 'Anwendung' : 'Application'}</th>
                      <th className="px-5 py-3.5">{lang === 'de' ? 'Status' : 'Status'}</th>
                      <th className="px-5 py-3.5">{lang === 'de' ? 'Preis' : 'Price'}</th>
                      <th className="px-5 py-3.5">{lang === 'de' ? 'Unternehmen' : 'Company'}</th>
                      <th className="px-5 py-3.5 text-right">{lang === 'de' ? 'Aktion' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedProfiles.map((p) => {
                      const drawing = safeUrl(p.drawingUrl);
                      const photo = safeUrl(p.photoUrl);
                      const bestImg = (photo && isImage(photo)) ? photo : (drawing && isImage(drawing)) ? drawing : (photo || drawing);
                      return (
                        <tr key={p.id} onClick={() => openDetail(p.id)} className="hover:bg-slate-50/80 cursor-pointer transition-colors">
                          <td className="px-5 py-4">
                            <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                              {bestImg ? <img src={bestImg} alt={p.name} className="w-full h-full object-contain" /> : <Boxes className="h-6 w-6 text-slate-400" />}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-extrabold text-slate-900 text-sm">{p.name}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-medium text-slate-600">
                              {p.dimensions && <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">{p.dimensions}</span>}
                              {p.weightPerMeter && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">{p.weightPerMeter} kg/m</span>}
                              {p.material && <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">{p.material}</span>}
                              {p.slotSize && <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold">Nut {p.slotSize}</span>}
                            </div>
                            {p.description && <p className="text-xs text-slate-500 line-clamp-1 mt-1">{p.description}</p>}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-700 font-medium">
                            <p>{(p.applications ?? []).map((a) => a.name).join(', ') || '-'}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{p.status}</span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-extrabold text-sm text-slate-900">
                              {p.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.price)} ${p.currency?.symbol ?? '€'}` : (lang === 'de' ? 'Auf Anfrage' : 'On Request')}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 font-bold text-xs text-slate-800 bg-slate-100 border border-slate-200/80 px-2.5 py-1.5 rounded-xl shadow-xs">
                              <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              <span>{p.supplier?.name || (lang === 'de' ? 'Aluprofile Direkt' : 'Aluprofile Direct')}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowInquiryModal(p);
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm px-4 py-2 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                <span>{lang === 'de' ? 'Anfrage' : 'Inquiry'}</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {pagedProfiles.map((p) => {
                  const photo = safeUrl(p.photoUrl);
                  const drawing = safeUrl(p.drawingUrl);
                  const bestImg = (photo && isImage(photo)) ? photo : (drawing && isImage(drawing)) ? drawing : (photo || drawing);
                  return (
                    <div
                      key={p.id}
                      onClick={() => openDetail(p.id)}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-blue-400/80 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 space-y-4 group flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                              {p.status || 'Active'}
                            </span>
                            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors pt-1">
                              {p.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] font-medium text-slate-600">
                              {p.dimensions && <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">{p.dimensions}</span>}
                              {p.weightPerMeter && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">{p.weightPerMeter} kg/m</span>}
                              {p.material && <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">{p.material}</span>}
                              {p.slotSize && <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold">Nut {p.slotSize}</span>}
                            </div>
                          </div>
                          
                          <div className="h-16 w-16 rounded-xl border border-slate-200/80 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 group-hover:bg-blue-50/40 transition-colors">
                            {bestImg ? (
                              <img src={bestImg} alt={p.name} className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-300" />
                            ) : (
                              <Boxes className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">
                          {p.description || p.usage || 'High-precision structural aluminum profile.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{lang === 'de' ? 'Preis' : 'Price'}</p>
                          <p className="text-sm font-extrabold text-slate-900">
                            {p.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.price)} ${p.currency?.symbol ?? '€'}` : (lang === 'de' ? 'Auf Anfrage' : 'On Request')}
                          </p>
                          <p className="text-[11px] font-bold text-slate-600 mt-0.5 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-blue-600" />
                            <span>{p.supplier?.name || (lang === 'de' ? 'Aluprofile Direkt' : 'Aluprofile Direct')}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowInquiryModal(p);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>{lang === 'de' ? 'Anfrage' : 'Inquiry'}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comprehensive Pagination Controls (ALWAYS VISIBLE) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-lg">
          <div className="text-xs font-bold text-slate-500">
            Showing <span className="text-slate-900 font-extrabold">{filteredProfiles.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredProfiles.length)}</span> of <span className="text-slate-900 font-extrabold">{filteredProfiles.length}</span> profiles
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="rounded-2xl text-xs font-bold gap-1.5 px-3.5 py-2 border-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`h-9 w-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    page === pageNum
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="rounded-2xl text-xs font-bold gap-1.5 px-3.5 py-2 border-slate-200 disabled:opacity-40 cursor-pointer"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>



      </main>

      {/* ── FOOTER (100% HARMONIZED WITH LANDING PAGE) ── */}
      <footer className="w-full bg-gradient-to-b from-[#0f172a] via-[#0b1320] to-[#080d16] text-white border-t border-slate-800 pt-12 pb-8 relative overflow-hidden mt-16">
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
                <li><Link to="/#about" className="hover:text-cyan-400 transition-colors">{lang === 'de' ? 'Über uns' : 'About Us'}</Link></li>
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
                <Link
                  to="/customer?mode=sign-up"
                  className="inline-block rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-extrabold px-3.5 py-2 transition-all cursor-pointer"
                >
                  {lang === 'de' ? 'Als Hersteller eintragen' : 'Register as Manufacturer'}
                </Link>
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


      {/* Detail Modal Overlay */}
      {showDetailModal && detail && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-md overflow-y-auto"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="w-full max-w-5xl rounded-3xl bg-[#f8fafc] shadow-2xl overflow-hidden border border-slate-200 text-slate-900 my-auto relative flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Navigation & Close Header */}
            <div className="flex items-center justify-between border-b border-slate-200/90 bg-white px-6 py-3.5 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="text-slate-400">Home</span>
                <span className="text-slate-300">&gt;</span>
                <span className="text-slate-400">{lang === 'de' ? 'Suchportal' : 'Search Portal'}</span>
                <span className="text-slate-300">&gt;</span>
                <span className="text-blue-600 font-extrabold">{detail.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              {/* Profile Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{detail.name}</h2>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        detail.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : detail.status === 'IN_DEVELOPMENT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${detail.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {detail.status}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      💰 {detail.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(detail.price)} ${detail.currency?.symbol ?? '€'}` : (lang === 'de' ? 'Preis auf Anfrage' : 'Price on Request')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
                    {detail.description || detail.usage || 'Industrial grade aluminum profile with high structural rigidity.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowInquiryModal(detail);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{lang === 'de' ? 'Anfrage senden' : 'Send Inquiry / RFQ'}</span>
                  </Button>
                </div>
              </div>

              {/* Grid: Left CAD Drawing Box vs Right Technical Data & Downloads */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT BOX (7 cols): CAD Drawing & Engineering Cross-Section View */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between items-center min-h-[420px] relative overflow-hidden">
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
                            src={safeUrl(detail.drawingUrl)}
                            alt={`${detail.name} CAD Schematic`}
                            className="max-h-[300px] w-auto object-contain transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/hero-target-profile.png';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300 gap-2 py-10">
                            <Boxes className="h-16 w-16" />
                            <span className="text-xs text-slate-400">No CAD drawing file uploaded</span>
                          </div>
                        )
                      ) : detail.photoUrl ? (
                        <img
                          src={safeUrl(detail.photoUrl)}
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
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-3">
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
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
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

                {/* RIGHT COLUMN (5 cols): Technical Data & Properties + Downloads */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Top Card: TECHNICAL DATA & PROPERTIES */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="bg-slate-100/90 px-5 py-3.5 border-b border-slate-200/80">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                        {lang === 'de' ? 'TECHNISCHE DATEN & EIGENSCHAFTEN' : 'TECHNICAL DATA & PROPERTIES'}
                      </h4>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs font-medium">
                      {/* Dimensions */}
                      <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 flex items-center gap-1.5 font-bold">
                          <Ruler className="h-3.5 w-3.5 text-slate-400" />
                          {lang === 'de' ? 'Abmessungen' : 'Dimensions'}
                        </span>
                        <span className="text-slate-900 font-extrabold">{detail.dimensions || '-'}</span>
                      </div>

                      {/* Weight */}
                      <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 flex items-center gap-1.5 font-bold">
                          <Boxes className="h-3.5 w-3.5 text-slate-400" />
                          {lang === 'de' ? 'Gewicht' : 'Weight'}
                        </span>
                        <span className="text-slate-900 font-extrabold">
                          {detail.weightPerMeter
                            ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US').format(detail.weightPerMeter)} kg/m`
                            : '1.85 kg/m'}
                        </span>
                      </div>

                      {/* Material */}
                      <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">{lang === 'de' ? 'Material / Legierung' : 'Material Grade'}</span>
                        <span className="text-slate-900 font-semibold">{detail.material || 'EN AW-6063 T6'}</span>
                      </div>

                      {/* Standard Length */}
                      <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">{lang === 'de' ? 'Standardlänge' : 'Standard Length'}</span>
                        <span className="text-slate-900 font-semibold">{detail.lengthMm ? `${detail.lengthMm} mm` : '6000 mm'}</span>
                      </div>

                      {/* Moment of Inertia */}
                      <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 flex items-center gap-1.5 font-bold">
                          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                          {lang === 'de' ? 'Trägheitsmoment' : 'Moment of Inertia'}
                        </span>
                        <span className="text-slate-900 font-bold font-mono text-[11px]">
                          {detail.momentOfInertiaIx
                            ? `Ix: ${detail.momentOfInertiaIx} cm⁴, Iy: ${detail.momentOfInertiaIy || detail.momentOfInertiaIx} cm⁴`
                            : 'Ix: 15.6 cm⁴, Iy: 15.6 cm⁴'}
                        </span>
                      </div>

                      {/* Section Modulus */}
                      <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">{lang === 'de' ? 'Widerstandsmoment Wx' : 'Wx Section Modulus'}</span>
                        <span className="text-slate-900 font-bold font-mono text-[11px]">
                          {detail.sectionModulusWx
                            ? `Wx: ${detail.sectionModulusWx} cm³, Wy: ${detail.sectionModulusWy || detail.sectionModulusWx} cm³`
                            : 'Wx: 7.8 cm³, Wy: 7.8 cm³'}
                        </span>
                      </div>

                      {/* Cross Sectional Area */}
                      <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">{lang === 'de' ? 'Querschnittsfläche' : 'Cross Sectional Area'}</span>
                        <span className="text-slate-900 font-semibold">
                          {detail.crossSectionalArea ? `${detail.crossSectionalArea} cm²` : '6.90 cm²'}
                        </span>
                      </div>

                      {/* Outer Surface Area */}
                      <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">{lang === 'de' ? 'Außenfläche' : 'Outer Surface Area'}</span>
                        <span className="text-slate-900 font-semibold">
                          {detail.outerSurfaceArea ? `${detail.outerSurfaceArea} m²/m` : '0.198 m²/m'}
                        </span>
                      </div>

                      {/* Color / Surface Finish */}
                      <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="text-slate-600 font-bold">{lang === 'de' ? 'Farbe / Oberfläche' : 'Color / Surface'}</span>
                        <span className="text-slate-900 font-semibold">{detail.color || 'Anodized Natural (E6/EV1)'}</span>
                      </div>

                      {/* Applications */}
                      {detail.applications && detail.applications.length > 0 && (
                        <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                          <span className="text-slate-600 font-bold">{lang === 'de' ? 'Anwendungen' : 'Applications'}</span>
                          <span className="text-slate-900 font-semibold text-right max-w-[200px] truncate">
                            {detail.applications.map((a) => a.name).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Cross-Sections */}
                      {detail.crossSections && detail.crossSections.length > 0 && (
                        <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                          <span className="text-slate-600 font-bold">{lang === 'de' ? 'Querschnitt' : 'Cross-Section'}</span>
                          <span className="text-slate-900 font-semibold text-right max-w-[200px] truncate">
                            {detail.crossSections.map((c) => c.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Card: DOWNLOADS */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                      {lang === 'de' ? 'DOWNLOADS & CAD-DATEN' : 'DOWNLOADS & CAD DATA'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {/* STEP (3D) */}
                      <button
                        onClick={() => window.open(safeUrl(detail.stepUrl || detail.drawingUrl), '_blank')}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-4 flex items-center justify-between shadow-sm transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Download className="h-3.5 w-3.5" /> STEP (3D)
                        </span>
                        <span>&rarr;</span>
                      </button>

                      {/* DXF (2D) */}
                      <button
                        onClick={() => window.open(safeUrl(detail.dxfUrl || detail.drawingUrl), '_blank')}
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs py-2.5 px-4 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileIcon className="h-3.5 w-3.5 text-slate-500" /> DXF (2D)
                        </span>
                        <span>&rarr;</span>
                      </button>

                      {/* PDF (Datasheet) */}
                      <button
                        onClick={() => window.open(safeUrl(detail.pdfUrl || detail.drawingUrl), '_blank')}
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs py-2.5 px-4 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-rose-500" /> PDF ({lang === 'de' ? 'Datenblatt' : 'Datasheet'})
                        </span>
                        <span>&rarr;</span>
                      </button>

                      {/* Order Sample */}
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          setShowInquiryModal(detail);
                        }}
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs py-2.5 px-4 text-center transition-all cursor-pointer"
                      >
                        {lang === 'de' ? 'Muster bestellen' : 'Order Sample'}
                      </button>
                    </div>
                  </div>

                  {/* Direct Manufacturer Inquiry Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl border border-blue-100 p-5 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                        <Mail className="h-4 w-4" />
                      </div>
                      <h4 className="font-extrabold text-blue-900 text-xs uppercase tracking-wider">
                        {lang === 'de' ? 'Direkte Herstelleranfrage' : 'Direct Manufacturer Inquiry'}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {lang === 'de'
                        ? 'Benötigen Sie Sonderlängen, Staffelpreise, spezielle Eloxierung oder CAD-Klärung? Senden Sie eine direkte Anfrage an den Hersteller.'
                        : 'Need custom lengths, bulk pricing, special surface anodization, or CAD clarification? Send a direct inquiry to the manufacturer.'}
                    </p>
                    <Button
                      onClick={() => {
                        setShowDetailModal(false);
                        setShowInquiryModal(detail);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Mail className="h-4 w-4" />
                      <span>{lang === 'de' ? 'Anfrage senden / Angebot anfordern' : 'Send Inquiry / Request Quote'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INQUIRY / RFQ MODAL */}
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
                    {lang === 'de' ? 'Anfrage senden' : 'Send Inquiry / Request Quote'}
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
                <h4 className="text-xl font-black text-slate-900">
                  {lang === 'de' ? 'Anfrage erfolgreich gesendet!' : 'Inquiry Sent Successfully!'}
                </h4>
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
                id="inquiry-form"
                className="flex flex-col flex-1 overflow-hidden"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!showInquiryModal) return;
                  setInquiryLoadingId(showInquiryModal.id);
                  try {
                    const res = await fetch(`${API_BASE}/public/inquiries`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ profileId: showInquiryModal.id, ...inquiryForm }),
                    });
                    if (!res.ok) {
                      const data = await res.json().catch(() => ({}));
                      throw new Error(data.message || 'Failed to send inquiry');
                    }
                    setInquirySuccess(true);
                    toast.success(lang === 'de' ? 'Anfrage erfolgreich versandt!' : 'Inquiry dispatched successfully!');
                  } catch (err: any) {
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
                      <label className="text-xs font-bold text-slate-700">First Name *</label>
                      <Input
                        required
                        placeholder="e.g. John"
                        value={inquiryForm.firstName}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, firstName: e.target.value })}
                        className="rounded-xl border-slate-200 bg-white text-xs py-2.5 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Last Name *</label>
                      <Input
                        required
                        placeholder="e.g. Doe"
                        value={inquiryForm.lastName}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, lastName: e.target.value })}
                        className="rounded-xl border-slate-200 bg-white text-xs py-2.5 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Company Name</label>
                      <Input
                        placeholder="e.g. Automation Systems GmbH"
                        value={inquiryForm.company}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, company: e.target.value })}
                        className="rounded-xl border-slate-200 bg-white text-xs py-2.5 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Email Address *</label>
                      <Input
                        required
                        type="email"
                        placeholder="john.doe@company.com"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        className="rounded-xl border-slate-200 bg-white text-xs py-2.5 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <Input
                      placeholder="+49 (0) 123 456789"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      className="rounded-xl border-slate-200 bg-white text-xs py-2.5 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Inquiry Message *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Please specify requested quantities, custom length cuts, surface anodization, or technical queries..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    />
                  </div>

                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={inquiryForm.requestPurchase}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, requestPurchase: e.target.checked })}
                    />
                    <span>{lang === 'de' ? 'Verbindliches Angebot anfordern (RFQ)' : 'Request official commercial quote (RFQ)'}</span>
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
                    <span>{inquiryLoadingId === showInquiryModal.id ? 'Sending...' : 'Submit Inquiry'}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* REGISTER AS MANUFACTURER MODAL */}
      {showManufacturerModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-md overflow-y-auto"
          onClick={() => setShowManufacturerModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 text-slate-900 my-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow">
                  <Building2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {lang === 'de' ? 'Als Hersteller eintragen' : 'Register as Manufacturer'}
                </h3>
              </div>
              <button
                onClick={() => setShowManufacturerModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterManufacturer} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                {lang === 'de'
                  ? 'Werden Sie gelisteter Hersteller in AluProfile. Reichen Sie Ihr Unternehmensprofil ein, um Ihre Aluprofile T-Nut & Systemprofile anzubieten.'
                  : 'Join AluProfile as a verified manufacturer. Submit your company details to list your aluminum profile catalog.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Company Name *</label>
                  <Input
                    required
                    placeholder="e.g. Bosch Rexroth AG"
                    value={manufacturerForm.name}
                    onChange={(e) => setManufacturerForm({ ...manufacturerForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Contact Person</label>
                  <Input
                    placeholder="e.g. Max Mustermann"
                    value={manufacturerForm.contactPerson}
                    onChange={(e) => setManufacturerForm({ ...manufacturerForm, contactPerson: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Business Email *</label>
                  <Input
                    required
                    type="email"
                    placeholder="contact@company.com"
                    value={manufacturerForm.email}
                    onChange={(e) => setManufacturerForm({ ...manufacturerForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <Input
                    placeholder="+49 (0) 123 456789"
                    value={manufacturerForm.phone}
                    onChange={(e) => setManufacturerForm({ ...manufacturerForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Website URL</label>
                  <Input
                    placeholder="https://www.company.com"
                    value={manufacturerForm.website}
                    onChange={(e) => setManufacturerForm({ ...manufacturerForm, website: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Industry / Sector</label>
                  <Input
                    placeholder="e.g. Industrial Automation"
                    value={manufacturerForm.industry}
                    onChange={(e) => setManufacturerForm({ ...manufacturerForm, industry: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Company Address & Details</label>
                <textarea
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street, Postal Code, City, Country"
                  value={manufacturerForm.address}
                  onChange={(e) => setManufacturerForm({ ...manufacturerForm, address: e.target.value })}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManufacturerModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={manufacturerSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  {manufacturerSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

