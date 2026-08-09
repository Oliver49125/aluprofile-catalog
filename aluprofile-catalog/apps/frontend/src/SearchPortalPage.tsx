import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Boxes,
  Search,
  SlidersHorizontal,
  LayoutDashboard,
  FolderKanban,
  Settings,
  Bell,
  User,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { parseApiError } from './utils/apiError';

type RefOption = { id: number; name: string };

type Profile = {
  id: number;
  name: string;
  code?: string;
  description?: string;
  drawingUrl?: string;
  photoUrl?: string;
  dimensions?: string;
  heightMm?: number;
  widthMm?: number;
  slotSizeMm?: number;
  weightPerMeter?: number;
  material?: string;
  status: string;
  applications?: RefOption[];
  crossSections?: RefOption[];
  price?: number;
  currency?: { symbol: string };
};

const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api').replace(/\/+$/, '');

export default function SearchPortalPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'dashboard' | 'projects' | 'settings'>('search');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Parametric Filter States
  const [heightMm, setHeightMm] = useState('');
  const [widthMm, setWidthMm] = useState('');
  const [slotSizeMm, setSlotSizeMm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState('');
  const [selectedCrossSection, setSelectedCrossSection] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isDimensionsOpen, setIsDimensionsOpen] = useState(true);
  const [isProfileTypesOpen, setIsProfileTypesOpen] = useState(true);

  // Reference options for dropdowns
  const [applications, setApplications] = useState<RefOption[]>([]);
  const [crossSections, setCrossSections] = useState<RefOption[]>([]);

  // Selected Profile & Header Popovers
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showInquirySuccess, setShowInquirySuccess] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);

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

  // Sorting & Pagination state
  const [sortBy, setSortBy] = useState<'newest' | 'nameAsc' | 'nameDesc' | 'weightAsc' | 'weightDesc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter & Sort profiles based on inputs
  const filteredProfiles = useMemo(() => {
    let result = profiles.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = !q || p.name.toLowerCase().includes(q) || (p.dimensions && p.dimensions.toLowerCase().includes(q));
      const heightMatch = !heightMm || (p.heightMm && String(p.heightMm) === heightMm);
      const widthMatch = !widthMm || (p.widthMm && String(p.widthMm) === widthMm);
      const slotMatch = !slotSizeMm || (p.slotSizeMm && String(p.slotSizeMm) === slotSizeMm);
      const appMatch = !selectedApplication || p.applications?.some(a => String(a.id) === selectedApplication);
      const csMatch = !selectedCrossSection || p.crossSections?.some(c => String(c.id) === selectedCrossSection);

      // Profile Types Filter
      let typeMatch = true;
      if (selectedType === 'Standard') {
        typeMatch = !p.weightPerMeter || p.weightPerMeter <= 1.5 || p.name.toLowerCase().includes('standard');
      } else if (selectedType === 'Heavy Duty') {
        typeMatch = (!!p.weightPerMeter && p.weightPerMeter > 1.5) || p.name.toLowerCase().includes('heavy');
      } else if (selectedType === 'Slot 8') {
        typeMatch = p.slotSizeMm === 8 || p.name.toLowerCase().includes('slot 8');
      } else if (selectedType === 'Slot 10') {
        typeMatch = p.slotSizeMm === 10 || p.name.toLowerCase().includes('slot 10');
      } else if (selectedType && selectedType !== 'All Types') {
        typeMatch = p.crossSections?.some(c => c.name.toLowerCase() === selectedType.toLowerCase()) || p.name.toLowerCase().includes(selectedType.toLowerCase());
      }

      return nameMatch && heightMatch && widthMatch && slotMatch && appMatch && csMatch && typeMatch;
    });

    // Apply Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
      if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
      if (sortBy === 'weightAsc') return (a.weightPerMeter || 0) - (b.weightPerMeter || 0);
      if (sortBy === 'weightDesc') return (b.weightPerMeter || 0) - (a.weightPerMeter || 0);
      return b.id - a.id;
    });
  }, [profiles, searchQuery, heightMm, widthMm, slotSizeMm, selectedApplication, selectedCrossSection, selectedType, sortBy]);

  // Paginated Profiles
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage) || 1;
  const pagedProfiles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProfiles.slice(start, start + itemsPerPage);
  }, [filteredProfiles, currentPage]);

  function clearFilters() {
    setSearchQuery('');
    setHeightMm('');
    setWidthMm('');
    setSlotSizeMm('');
    setSelectedApplication('');
    setSelectedCrossSection('');
    setSelectedType('');
    setCurrentPage(1);
  }

  return (
    <div className="min-h-screen bg-[#f3f5f8] font-sans antialiased text-slate-800 flex justify-center p-2 sm:p-4 lg:p-6">
      <div className="w-full max-w-[1600px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col lg:flex-row min-h-[90vh]">
        
        {/* LEFT DARK SIDEBAR - EXACT MATCH TO ATTACHED IMAGE */}
        <aside className="w-full lg:w-72 bg-[#181e28] text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
          {/* Logo Brand Header */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-600/30">
              <Boxes className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cyan-400 border-2 border-slate-900 animate-pulse" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Alu<span className="bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent font-black">Profile</span>
            </span>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-[#2a3447] text-white shadow-sm border border-slate-700/60'
                  : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
              }`}
            >
              <Search className="h-4 w-4 text-blue-400" />
              <span>Search & Filter</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              <span>My Projects</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Account Settings</span>
            </button>
          </div>

          {/* PARAMETRIC FILTERS ACCORDION */}
          <div className="p-4 flex-1 space-y-6 overflow-y-auto">
            {/* Dimensions Section */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsDimensionsOpen(!isDimensionsOpen)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
              >
                <span>Dimensions</span>
                {isDimensionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {isDimensionsOpen && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Height (mm)</label>
                    <input
                      type="number"
                      placeholder=""
                      value={heightMm}
                      onChange={(e) => setHeightMm(e.target.value)}
                      className="w-full rounded-xl bg-[#222b3a] border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Width (mm)</label>
                    <input
                      type="number"
                      placeholder=""
                      value={widthMm}
                      onChange={(e) => setWidthMm(e.target.value)}
                      className="w-full rounded-xl bg-[#222b3a] border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Slot size (mm)</label>
                    <input
                      type="number"
                      placeholder=""
                      value={slotSizeMm}
                      onChange={(e) => setSlotSizeMm(e.target.value)}
                      className="w-full rounded-xl bg-[#222b3a] border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Profile Types Section - Dynamically populated from Database CrossSections + Presets */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsProfileTypesOpen(!isProfileTypesOpen)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
              >
                <span>Profile Types</span>
                {isProfileTypesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {isProfileTypesOpen && (
                <div className="space-y-1">
                  {(() => {
                    const dbTypes = (crossSections || []).map((cs) => cs.name);
                    const defaultTypes = ['Standard', 'Heavy Duty', 'Slot 8', 'Slot 10'];
                    const combined = ['All Types', ...Array.from(new Set([...defaultTypes, ...dbTypes]))];
                    return combined.map((type) => {
                      const isSelected = type === 'All Types' ? !selectedType : selectedType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type === 'All Types' ? '' : type)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-600/30 border border-blue-400'
                              : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            {/* Application & Cross-Section Dropdowns */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Application</label>
                <select
                  value={selectedApplication}
                  onChange={(e) => setSelectedApplication(e.target.value)}
                  className="w-full rounded-xl bg-[#222b3a] border border-slate-700/80 px-3 py-2.5 text-xs text-white focus:border-blue-400 focus:outline-none font-extrabold cursor-pointer transition-all"
                >
                  <option value="" className="bg-slate-900">-- All Applications --</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id} className="bg-slate-900">
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Cross-Section</label>
                <select
                  value={selectedCrossSection}
                  onChange={(e) => setSelectedCrossSection(e.target.value)}
                  className="w-full rounded-xl bg-[#222b3a] border border-slate-700/80 px-3 py-2.5 text-xs text-white focus:border-blue-400 focus:outline-none font-extrabold cursor-pointer transition-all"
                >
                  <option value="" className="bg-slate-900">-- All Cross-Sections --</option>
                  {crossSections.map((cs) => (
                    <option key={cs.id} value={cs.id} className="bg-slate-900">
                      {cs.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Clear Filters Button */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={clearFilters}
              className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          {/* TOP HEADER BAR - STRICTLY STICKY FIXED AT TOP 0 */}
          <header className="sticky top-0 z-40 p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/95 backdrop-blur-md shadow-sm">
            {/* Search Box Input */}
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-blue-500/80 bg-white pl-9 pr-9 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Right Controls: Sort & Back to Home */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent border-0 text-xs font-extrabold focus:outline-none cursor-pointer text-blue-600"
                >
                  <option value="newest">Newest First</option>
                  <option value="nameAsc">Name (A-Z)</option>
                  <option value="nameDesc">Name (Z-A)</option>
                  <option value="weightAsc">Weight (Low to High)</option>
                  <option value="weightDesc">Weight (High to Low)</option>
                </select>
              </label>

              <a href="/">
                <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm">
                  Back to Home
                </Button>
              </a>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <div className="p-6 flex-1 overflow-y-auto bg-[#fafbfc] flex flex-col justify-between">
            {activeTab === 'search' && (
              <div className="space-y-6">
                {/* Results Count Summary */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>
                    Showing {pagedProfiles.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredProfiles.length)} of {filteredProfiles.length} Extrusion Profiles
                  </span>
                  {filteredProfiles.length > 0 && (
                    <span className="text-[11px] font-semibold text-slate-400">Page {currentPage} of {totalPages}</span>
                  )}
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : pagedProfiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {pagedProfiles.map((profile) => {
                      const title = profile.name || profile.dimensions || 'Extrusion Profile';
                      const weight = profile.weightPerMeter ? `${profile.weightPerMeter} kg/m` : '1.2 kg/m';
                      const alloy = profile.material || 'Alloy 6063-T5';
                      const visual = profile.photoUrl || profile.drawingUrl || '/hero-3d-profile.png';
                      const priceVal = profile.price ? `${profile.price.toFixed(2)} ${profile.currency?.symbol || '€'}` : null;

                      return (
                        <div
                          key={profile.id}
                          onClick={() => setSelectedProfile(profile)}
                          className="group bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                        >
                          {/* Price Tag Pill if available */}
                          {priceVal && (
                            <span className="absolute top-3 right-3 z-10 rounded-full bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white shadow-sm">
                              {priceVal}
                            </span>
                          )}

                          {/* Top 3D Extrusion Render Thumbnail */}
                          <div className="h-40 w-full rounded-xl bg-[#f8fafc] border border-slate-100 flex items-center justify-center p-3 group-hover:scale-105 transition-transform duration-300">
                            <img
                              src={visual}
                              alt={title}
                              className="max-h-full max-w-full object-contain filter drop-shadow-md"
                            />
                          </div>

                          {/* Bottom Card Title & Spec Info */}
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">{title}</h4>
                              <span className="text-[11px] font-extrabold text-slate-600 shrink-0">{weight}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-600">{alloy}</span>
                              <span className="rounded-md bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 font-extrabold">
                                Slot {profile.slotSizeMm || 8}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
                    <p className="text-sm font-bold text-slate-600">No aluminum profiles match your current search criteria.</p>
                    <button onClick={clearFilters} className="text-xs font-extrabold text-blue-600 hover:underline">
                      Reset All Filters
                    </button>
                  </div>
                )}

                {/* DYNAMIC PAGINATION BAR */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200/80">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="rounded-xl text-xs font-bold px-3 py-1.5"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 text-xs font-extrabold px-2">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-8 w-8 rounded-xl font-extrabold text-xs transition-all ${
                              currentPage === pageNum
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="rounded-xl text-xs font-bold px-3 py-1.5"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-900">User Engineering Workspace</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
                      <span className="text-xs font-bold text-blue-600 uppercase">Saved Extrusions</span>
                      <p className="text-2xl font-black text-slate-900">12 Profiles</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 space-y-1">
                      <span className="text-xs font-bold text-teal-600 uppercase">Project Assemblies</span>
                      <p className="text-2xl font-black text-slate-900">3 Framing Units</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
                      <span className="text-xs font-bold text-purple-600 uppercase">Supplier Quotes</span>
                      <p className="text-2xl font-black text-slate-900">2 Requests Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-900">My Engineering Assemblies</h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">Modular Machine Enclosure 40x40 (Slot 8)</p>
                        <p className="text-slate-500 mt-0.5">8 Profiles • Total Length: 14.2m • Alloy 6063-T5</p>
                      </div>
                      <Button size="sm" className="rounded-xl bg-blue-600 text-white font-bold text-xs">Download BOM</Button>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">Solar Panel Array Support Frame (80x80)</p>
                        <p className="text-slate-500 mt-0.5">14 Profiles • Total Length: 32.0m • Anodized Silver</p>
                      </div>
                      <Button size="sm" className="rounded-xl bg-blue-600 text-white font-bold text-xs">Download BOM</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm max-w-xl space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900">Account Preferences</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company Name</label>
                    <Input defaultValue="Aluprofile Engineering GmbH" className="text-xs" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Preferred CAD STEP Export Format</label>
                    <Input defaultValue="STEP AP214 / AP242" className="text-xs" />
                  </div>
                  <Button className="rounded-xl bg-blue-600 text-white font-bold text-xs">Save Settings</Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SELECTED PROFILE TECHNICAL DATASHEET MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}>
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedProfile.name}</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedProfile.material || 'Aluminum Alloy 6063-T5'}</p>
              </div>
              <button onClick={() => setSelectedProfile(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p><span className="font-bold text-slate-800">Dimensions:</span> {selectedProfile.dimensions || '40 x 40 mm'}</p>
              <p><span className="font-bold text-slate-800">Weight:</span> {selectedProfile.weightPerMeter || 1.2} kg/m</p>
              <p><span className="font-bold text-slate-800">Slot Size:</span> Slot {selectedProfile.slotSizeMm || 8}</p>
              <p><span className="font-bold text-slate-800">Standard:</span> DIN EN 12020-2</p>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                onClick={() => {
                  const title = selectedProfile.name || selectedProfile.dimensions || 'Aluminum_Profile';
                  const content = `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('AluCatalog 3D STEP CAD Model'),'2;1');\nFILE_NAME('${title}.stp','2026-07-25T00:00:00',('AluCatalog'),('AluCatalogCAD'),'Processor','AluCatalog System','');\nFILE_SCHEMA(('CONFIG_CONTROL_DESIGN'));\nENDSEC;\nDATA;\n#10=MECHANICAL_CONTEXT('3D',#11,'mechanical');\n#11=APPLICATION_CONTEXT('extrusions');\n#12=PRODUCT('${title}','${title}','Extruded Aluminum Profile',(#10));\nENDSEC;\nEND-ISO-10303-21;`;
                  const blob = new Blob([content], { type: 'application/octet-stream' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${title.replace(/\s+/g, '_')}_STEP.stp`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  setShowInquirySuccess(true);
                }}
              >
                <Download className="h-4 w-4 mr-2" /> Download CAD STEP
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl text-xs font-bold cursor-pointer" onClick={() => setSelectedProfile(null)}>
                Close
              </Button>
            </div>

            {showInquirySuccess && (
              <p className="text-xs text-center font-bold text-emerald-600">✓ STEP 3D CAD File Downloaded!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
