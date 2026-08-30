import React, { useState } from 'react';
import { Boxes, Search, Globe, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationHeaderProps {
  lang: 'en' | 'de';
  onLangChange: (newLang: 'en' | 'de') => void;
  activeTab?: string;
  onTabChange?: (tab: 'home' | 'catalog') => void;
  token?: string | null;
  onLogout?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onOpenAbout?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  lang,
  onLangChange,
  activeTab = 'home',
  onTabChange,
  token,
  onLogout,
  searchValue = '',
  onSearchChange,
  onOpenAbout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);

  const handleHomeClick = (e: React.MouseEvent) => {
    if (window.location.pathname !== '/') {
      return; // Navigate naturally via href="/"
    }
    e.preventDefault();
    if (onTabChange) onTabChange('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCatalogClick = (e: React.MouseEvent) => {
    if (window.location.pathname !== '/') {
      window.location.href = '/catalog';
      return;
    }
    e.preventDefault();
    if (onTabChange) onTabChange('catalog');
    const catalogSection = document.getElementById('catalog');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenAbout) {
      onOpenAbout();
    } else {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        
        {/* Left Side: Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-6 lg:gap-10">
          <a
            href="/"
            onClick={handleHomeClick}
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
            aria-label="AluProfile Home"
          >
            <span className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 group-hover:shadow-blue-500/50 transition-all duration-300">
              <Boxes className="h-5 w-5 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cyan-400 border-2 border-white animate-pulse" />
            </span>
            <span className="flex items-center text-slate-900 font-extrabold tracking-tight text-xl sm:text-2xl">
              Alu<span className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 bg-clip-text text-transparent font-black">Profile</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-2 text-sm font-semibold">
            <button
              onClick={handleHomeClick}
              className={`rounded-xl px-4 py-2 transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {lang === 'de' ? 'Startseite' : 'Home'}
            </button>

            {/* Catalog Dropdown Menu */}
            <div
              className="relative"
              onMouseEnter={() => setIsCatalogDropdownOpen(true)}
              onMouseLeave={() => setIsCatalogDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsCatalogDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{lang === 'de' ? 'Katalog' : 'Catalog'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isCatalogDropdownOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
              </button>

              {isCatalogDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 z-50 w-64 animate-fadeIn">
                  <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-2 shadow-xl shadow-slate-900/10 ring-1 ring-black/5 space-y-1">
                    <a
                      href="/catalog"
                      onClick={(e) => { setIsCatalogDropdownOpen(false); handleCatalogClick(e); }}
                      className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Boxes className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {lang === 'de' ? 'Profilkatalog' : 'Profile Catalog'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium leading-snug">
                          {lang === 'de' ? 'Alle Standard- & Sonderprofile' : 'All standard & custom profiles'}
                        </p>
                      </div>
                    </a>

                    <a
                      href="/search"
                      onClick={() => setIsCatalogDropdownOpen(false)}
                      className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                        <Search className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                          {lang === 'de' ? 'Erweiterte Suche' : 'Advance Search'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium leading-snug">
                          {lang === 'de' ? 'Spezifische Filter & CAD-Suche' : 'Detailed filters & CAD search'}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleAboutClick}
              className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              {lang === 'de' ? 'Über uns' : 'About'}
            </button>
          </div>
        </div>

        {/* Right Side Desktop Actions */}
        <div className="hidden md:flex items-center gap-3.5">
          <a href="/customer?mode=sign-up">
            <button
              className="rounded-full bg-[#131c2a] hover:bg-slate-900 text-white text-[12px] font-extrabold px-4 py-2 shadow-sm transition-all border border-slate-700/50 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>{lang === 'de' ? 'Als Hersteller eintragen' : 'Register as Manufacturer'}</span>
            </button>
          </a>
          <a href="/customer">
            <Button className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
              {lang === 'de' ? 'Kundenportal' : 'Customer Portal'}
            </Button>
          </a>
          <label className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-all">
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={lang}
              onChange={(e) => onLangChange(e.target.value as 'en' | 'de')}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer font-bold"
            >
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>
          </label>
          {!!token && onLogout && (
            <button
              onClick={onLogout}
              title="Logout"
              className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div className="mt-4 pt-4 border-t border-slate-200 md:hidden flex flex-col gap-3 animate-fadeIn px-4 pb-4">
          <button
            onClick={(e) => { setIsMobileMenuOpen(false); handleHomeClick(e); }}
            className="text-left py-2 px-3 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100"
          >
            {lang === 'de' ? 'Startseite' : 'Home'}
          </button>
          <a
            href="/catalog"
            onClick={(e) => { setIsMobileMenuOpen(false); handleCatalogClick(e); }}
            className="text-left py-2 px-3 rounded-lg font-bold text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
          >
            <Boxes className="h-4 w-4" />
            <span>{lang === 'de' ? 'Profilkatalog' : 'Profile Catalog'}</span>
          </a>
          <a
            href="/search"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-left py-2 px-3 rounded-lg font-bold text-sm text-cyan-600 hover:bg-cyan-50 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>{lang === 'de' ? 'Erweiterte Suche' : 'Advance Search'}</span>
          </a>
          <button
            onClick={(e) => { setIsMobileMenuOpen(false); handleAboutClick(e); }}
            className="text-left py-2 px-3 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100"
          >
            {lang === 'de' ? 'Über uns' : 'About'}
          </button>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <a href="/customer" className="w-full">
              <Button className="w-full h-10 rounded-xl bg-slate-900 text-white font-medium text-xs">
                {lang === 'de' ? 'Kundenportal' : 'Customer Portal'}
              </Button>
            </a>
            {!!token && (
              <a href="/admin" className="w-full">
                <Button className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white font-medium text-xs">
                  {lang === 'de' ? 'Admin-Panel' : 'Admin Panel'}
                </Button>
              </a>
            )}
          </div>
        </div>
      )}

      {/* MOBILE SEARCH BAR */}
      {onSearchChange && (
        <div className="mt-4 pt-3 border-t border-slate-100 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search profiles..."
              className="w-full rounded-xl border border-slate-300 bg-slate-100/80 pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none shadow-inner"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      )}
    </header>
  );
};
