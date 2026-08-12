import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  Boxes,
  Search,
  SlidersHorizontal,
  X,
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
  price?: number;
  currency?: { symbol: string };
};

const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api').replace(/\/+$/, '');
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
  const [lang, setLang] = useState<'en' | 'de'>('en');

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

  useEffect(() => {
    const saved = window.localStorage.getItem('aluprofile_lang');
    if (saved === 'en' || saved === 'de') setLang(saved);
  }, []);

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

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [profRes, overviewRes] = await Promise.all([
          fetch(`${API_BASE}/public/profiles`),
          fetch(`${API_BASE}/public/overview`),
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
  }, []);

  async function openDetail(id: number) {
    try {
      const res = await fetch(`${API_BASE}/public/profiles/${id}`);
      if (res.ok) {
        setDetail(await res.json());
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
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/catalog" className="text-blue-600 font-extrabold border-b-2 border-blue-600 pb-0.5">Catalog</Link>
          <Link to="/search" className="hover:text-blue-600 transition-colors">Search Portal</Link>
          <Link to="/#solutions" className="hover:text-blue-600 transition-colors">Solutions</Link>
          <Link to="/#about" className="hover:text-blue-600 transition-colors">About</Link>
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
              Customer Portal
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
              Technical Data Catalog
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Aluminum Profile Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
              Browse, filter, and inspect standard and custom aluminum extrusion profiles with technical data sheets.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <Link to="/search">
              <button
                type="button"
                className="rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Parametric Search Portal</span>
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
                Smart Filters & Search Controls
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm hover:border-slate-300 transition-all">
                  <span className="text-slate-400">Sort By:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="border-0 bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="nameAsc">Name (A–Z)</option>
                    <option value="nameDesc">Name (Z–A)</option>
                    <option value="status">Status</option>
                  </select>

                </label>
                <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs font-extrabold rounded-2xl border-slate-200 hover:bg-slate-100 py-2">
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6 px-6 sm:px-8 pb-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input
                placeholder="Name / Keyword search..."
                value={filters.q}
                onChange={(e) => { setFilters((f) => ({ ...f, q: e.target.value })); setPage(1); }}
                className="rounded-2xl border-slate-200 focus:ring-2 focus:ring-blue-500 py-2.5 text-xs font-medium"
              />
              <div>
                <Input
                  list="app-options"
                  placeholder="Filter by Application..."
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
                  placeholder="Filter by Cross-Section..."
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
                placeholder="Material (e.g. 6063-T5)"
                value={filters.material}
                onChange={(e) => { setFilters((f) => ({ ...f, material: e.target.value })); setPage(1); }}
                className="rounded-2xl border-slate-200 focus:ring-2 focus:ring-blue-500 py-2.5 text-xs font-medium"
              />
              <Input
                placeholder="Dimensions (e.g. 40x40)"
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
                <CardTitle className="text-base font-extrabold text-slate-900">Profile Records</CardTitle>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Showing {filteredProfiles.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredProfiles.length)} of {filteredProfiles.length} profiles found
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Per Page Selector */}
                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm">
                  <span className="text-slate-400">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="border-0 bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={1000}>All profiles</option>
                  </select>
                </label>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    onClick={() => setViewMode('table')}
                  >
                    Table View
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${viewMode === 'cards' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    onClick={() => setViewMode('cards')}
                  >
                    Card View
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading catalog profiles...</div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-extrabold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Drawing</th>
                      <th className="px-6 py-3.5">Description</th>
                      <th className="px-6 py-3.5">Application</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedProfiles.map((p) => {
                      const drawing = safeUrl(p.drawingUrl);
                      const photo = safeUrl(p.photoUrl);
                      const bestImg = (photo && isImage(photo)) ? photo : (drawing && isImage(drawing)) ? drawing : (photo || drawing);
                      return (
                        <tr key={p.id} onClick={() => openDetail(p.id)} className="hover:bg-slate-50/80 cursor-pointer transition-colors">
                          <td className="px-6 py-4">
                            <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                              {bestImg ? <img src={bestImg} alt={p.name} className="w-full h-full object-contain" /> : <Boxes className="h-6 w-6 text-slate-400" />}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-extrabold text-slate-900 text-sm">{p.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{p.dimensions || '-'}</p>
                            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{p.description || '-'}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-700 font-medium">
                            <p>{(p.applications ?? []).map((a) => a.name).join(', ') || '-'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{p.status}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); openDetail(p.id); }} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl">
                              View Technical Data &rarr;
                            </Button>
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
                            <p className="text-xs text-slate-500 font-bold">{p.dimensions || '-'}</p>
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
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Price</p>
                          <p className="text-sm font-extrabold text-slate-900">
                            {p.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.price)} ${p.currency?.symbol ?? '€'}` : 'On Request'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); openDetail(p.id); }}
                          className="bg-[#131c2a] group-hover:bg-blue-600 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Technical Data</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
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
                The leading industrial aluminum profile search engine & 3D CAD catalog system for mechanical engineers and manufacturers worldwide.
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
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Products</h4>
              <ul className="space-y-2.5 text-slate-300 font-medium">
                <li><Link to="/catalog" className="hover:text-cyan-400 transition-colors">Profile Catalog</Link></li>
                <li><Link to="/catalog" className="hover:text-cyan-400 transition-colors">Technical Data</Link></li>
                <li><Link to="/search" className="hover:text-cyan-400 transition-colors">CAD Downloads (STEP/DXF)</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Company</h4>
              <ul className="space-y-2.5 text-slate-300 font-medium">
                <li><Link to="/#about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
                <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/imprint" className="hover:text-cyan-400 transition-colors">Imprint</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Contact & Support</h4>
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
                  Register as Manufacturer
                </button>
              </div>
            </div>

          </div>

          {/* Bottom copyright bar */}
          <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <p>© 2026 AluProfile, Inc. All rights reserved.</p>
            <div className="flex flex-wrap gap-5">
              <Link to="/imprint" className="hover:text-slate-200 transition-colors">Imprint</Link>
              <Link to="/privacy" className="hover:text-slate-200 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-slate-200 transition-colors">Terms</Link>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('open_cookie_settings'))}
                className="hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cookie Settings
              </button>
            </div>
          </div>

        </div>
      </footer>


      {/* Detail Modal Overlay */}
      {showDetailModal && detail && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-md overflow-y-auto" onClick={() => setShowDetailModal(false)}>
          <div className="w-full max-w-5xl rounded-3xl bg-[#f4f7fb] shadow-2xl overflow-hidden border border-slate-200 text-slate-900 my-auto relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>Home</span> &gt; <span>Products</span> &gt; <span className="text-slate-900">{detail.name}</span>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="text-2xl font-black text-slate-900">{detail.name}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-2xl border p-6 flex flex-col items-center justify-center min-h-[350px]">
                  {detail.drawingUrl ? <img src={safeUrl(detail.drawingUrl)} alt="CAD" className="max-h-[300px] object-contain" /> : <Boxes className="h-16 w-16 text-slate-300" />}
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mt-4">CROSS-SECTION VIEW (Unit: mm)</p>
                </div>
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white rounded-2xl border overflow-hidden p-4 space-y-2 text-xs font-medium">
                    <h4 className="font-black text-slate-700 uppercase tracking-wider border-b pb-2">TECHNICAL DATA & PROPERTIES</h4>
                    <p className="flex justify-between"><span>Weight:</span><span className="font-bold">{detail.weightPerMeter || 1.85} kg/m</span></p>
                    <p className="flex justify-between"><span>Material:</span><span className="font-bold">{detail.material || '6063-T5'}</span></p>
                    <p className="flex justify-between"><span>Status:</span><span className="font-bold text-emerald-600">{detail.status}</span></p>
                  </div>
                  <div className="bg-white rounded-2xl border p-4 space-y-2">
                    <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">DOWNLOADS</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => window.open(safeUrl(detail.stepUrl || detail.drawingUrl), '_blank')} size="sm" className="bg-blue-600 text-xs font-bold">STEP (3D) &rarr;</Button>
                      <Button onClick={() => window.open(safeUrl(detail.dxfUrl || detail.drawingUrl), '_blank')} variant="outline" size="sm" className="text-xs font-bold">DXF (2D) &rarr;</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

