import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = "G-5FEVSRGPSV";

export const initGA = () => {
  try {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  } catch (e) {
    console.log('GA init:', e);
  }
};

interface CookieConsentProps {
  onSave?: (preferences: { essential: boolean; analytics: boolean; marketing: boolean }) => void;
}

export default function CookieConsentModal({ onSave }: CookieConsentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('alu_cookie_preferences');
    if (!saved) {
      setIsOpen(true);
    } else {
      try {
        const parsed = JSON.parse(saved);
        setAnalytics(parsed.analytics ?? true);
        setMarketing(parsed.marketing ?? true);
        if (parsed.analytics) {
          initGA();
        }
      } catch (e) {
        setIsOpen(true);
      }
    }

    const handleReopen = () => setIsOpen(true);
    window.addEventListener('open_cookie_settings', handleReopen);
    return () => window.removeEventListener('open_cookie_settings', handleReopen);
  }, []);

  const handleAcceptAll = () => {
    const prefs = { essential: true, analytics: true, marketing: true };
    localStorage.setItem('alu_cookie_preferences', JSON.stringify(prefs));
    setAnalytics(true);
    setMarketing(true);
    setIsOpen(false);
    initGA();
    if (onSave) onSave(prefs);
  };

  const handleRejectAll = () => {
    const prefs = { essential: true, analytics: false, marketing: false };
    localStorage.setItem('alu_cookie_preferences', JSON.stringify(prefs));
    setAnalytics(false);
    setMarketing(false);
    setIsOpen(false);
    if (onSave) onSave(prefs);
  };

  const handleSaveCustom = () => {
    const prefs = { essential: true, analytics, marketing };
    localStorage.setItem('alu_cookie_preferences', JSON.stringify(prefs));
    setIsOpen(false);
    if (analytics) initGA();
    if (onSave) onSave(prefs);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-5 sm:p-7 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] text-slate-800 transition-all duration-300">

      
      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm shadow-sm">
          A
        </div>
        <span className="text-xl font-black text-slate-900 tracking-tight">
          Alu<span className="text-blue-600">ProfileBiz</span>
        </span>
      </div>

      {/* Main Title & Notice */}
      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
        AluProfileBiz - Datenschutz-Einstellungen
      </h3>

      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal mt-1 max-w-3xl">
        Ihre Privatsphäre ist uns wichtig. Wir verwenden Cookies, um die Website-Funktionen zu optimieren, Inhalte zu personalisieren und die Nutzung zu analysieren. Bitte passen Sie Ihre Präferenzen an. / Your privacy is important to us. We use cookies to optimize website features, personalize content and analyze usage. Please customize your preferences.
      </p>

      {/* Toggles & Buttons Grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-t border-slate-100 pt-4">
        
        {/* Left Column: Toggles (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Category 1: Essential */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-slate-300 transition-colors">
                <span className="translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm" />
              </div>
              <span className="font-extrabold text-slate-800">Notwendig / Essential <span className="font-medium text-slate-500 text-[10px]">(Immer aktiv)</span></span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium text-right line-clamp-1">
              Sichern Grundfunktionen der Website. / Basic website functions.
            </span>
          </div>

          {/* Category 2: Analytics */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setAnalytics(!analytics)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  analytics ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                  analytics ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
              <span className="font-extrabold text-slate-800">Analytik / Analytics</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium text-right line-clamp-1">
              Analysieren die Website-Nutzung anonym. / Anonymously analyze website usage.
            </span>
          </div>

          {/* Category 3: Marketing */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setMarketing(!marketing)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  marketing ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                  marketing ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
              <span className="font-extrabold text-slate-800">Marketing / Marketing</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium text-right line-clamp-1">
              Ermöglichen personalisierte Angebote und Werbung. / Enable personalized offers and ads.
            </span>
          </div>
        </div>

        {/* Right Column: Action Buttons (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="w-full rounded-full bg-[#0c66e4] hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-6 shadow-md transition-all text-center"
          >
            Annehmen & Speichern / Accept & Save
          </button>

          <button
            type="button"
            onClick={handleRejectAll}
            className="w-full rounded-full border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2.5 px-6 transition-all text-center"
          >
            Alle Ablehnen / Reject All
          </button>

          <button
            type="button"
            onClick={handleSaveCustom}
            className="w-full text-center text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-center gap-1 pt-1"
          >
            <span>Einstellungen Anpassen / Customize Settings</span>
            <ExternalLink className="h-3 w-3 text-slate-500" />
          </button>
        </div>

      </div>
    </div>
  </div>
  );
}

