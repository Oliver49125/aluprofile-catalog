import React, { useState } from 'react';
import { Boxes, Search, Globe, LogOut, Menu, X } from 'lucide-react';
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
    setTimeout(() => {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSolutionsClick = (e: React.MouseEvent) => {
    if (window.location.pathname !== '/') {
      window.location.href = '/#solutions-section';
      return;
    }
    e.preventDefault();
    if (onTabChange) onTabChange('home');
    setTimeout(() => {
      const el = document.getElementById('solutions-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenAbout) {
      onOpenAbout();
    } else {
      window.location.href = '/?modal=about';
    }
  };

  return (
    <nav className="sticky top-0 z-50 mb-6 rounded-b-2xl border-b border-slate-200/80 bg-white/95 px-4 py-3 sm:px-6 sm:py-4 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between">
        {/* Brand & Nav Items */}
        <div className="flex items-center gap-4 sm:gap-10">
          <a href="/" onClick={handleHomeClick} className="group flex items-center gap-2.5 text-xl sm:text-2xl font-black text-slate-900 tracking-tighter">
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
            <button
              onClick={handleCatalogClick}
              className={`rounded-xl px-4 py-2 transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {lang === 'de' ? 'Suchportal' : 'Search Portal'}
            </button>
            <button
              onClick={handleSolutionsClick}
              className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              {lang === 'de' ? 'Lösungen' : 'Solutions'}
            </button>
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
          <a href="/search">
            <Button className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer">
              <Search className="h-3.5 w-3.5" />
              <span>{lang === 'de' ? 'Suchportal' : 'Search Portal'}</span>
            </Button>
          </a>
          <a href="/customer">
            <Button className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
              {lang === 'de' ? 'Kundenportal' : 'Customer Portal'}
            </Button>
          </a>
          <a href="/admin">
            <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-medium text-xs shadow-md hover:scale-105 transition-all cursor-pointer">
              {lang === 'de' ? 'Admin-Panel' : 'Admin Panel'}
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
        <div className="mt-4 pt-4 border-t border-slate-200 md:hidden flex flex-col gap-3 animate-fadeIn">
          <button
            onClick={(e) => { setIsMobileMenuOpen(false); handleHomeClick(e); }}
            className="text-left py-2 px-3 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100"
          >
            {lang === 'de' ? 'Startseite' : 'Home'}
          </button>
          <button
            onClick={(e) => { setIsMobileMenuOpen(false); handleCatalogClick(e); }}
            className="text-left py-2 px-3 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100"
          >
            {lang === 'de' ? 'Suchportal' : 'Search Portal'}
          </button>
          <button
            onClick={(e) => { setIsMobileMenuOpen(false); handleSolutionsClick(e); }}
            className="text-left py-2 px-3 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100"
          >
            {lang === 'de' ? 'Lösungen' : 'Solutions'}
          </button>
          <button
            onClick={(e) => { setIsMobileMenuOpen(false); handleAboutClick(e); }}
            className="text-left py-2 px-3 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100"
          >
            {lang === 'de' ? 'Über uns' : 'About'}
          </button>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <a href="/search" className="w-full">
              <Button className="w-full h-10 rounded-xl bg-blue-600 text-white font-bold text-xs">
                {lang === 'de' ? 'Suchportal' : 'Search Portal'}
              </Button>
            </a>
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
    </nav>
  );
};
