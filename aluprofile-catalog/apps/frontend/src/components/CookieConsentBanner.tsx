import React, { useState, useEffect } from 'react';
import ReactGA from 'react-ga4';
import { getCookieConsentValue } from 'react-cookie-consent';

const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

export const initGA = () => {
  const isConsentGiven = getCookieConsentValue("CookieConsent") === "true";
  if (isConsentGiven) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }
};

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('alu_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('alu_cookie_consent', JSON.stringify({ essential: true, analytics: true, marketing: true }));
    setIsVisible(false);
    initGA();
  };

  const handleRejectAll = () => {
    localStorage.setItem('alu_cookie_consent', JSON.stringify({ essential: true, analytics: false, marketing: false }));
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem('alu_cookie_consent', JSON.stringify({ essential: true, analytics, marketing }));
    setIsVisible(false);
    if (analytics) initGA();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/30">
            A
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">AluCatalog</span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">AluCatalog - Datenschutz-Einstellungen</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Ihre Privatsphäre ist uns wichtig. Wir verwenden Cookies, um die Website-Funktionen zu optimieren, Inhalte zu personalisieren und die Nutzung zu analysieren. Bitte passen Sie Ihre Präferenzen an. / Your privacy is important to us. We use cookies to optimize website features, personalize content and analyze usage. Please customize your preferences.
          </p>
        </div>

        {/* Toggles List */}
        <div className="space-y-3 pt-2">
          {/* Option 1: Essential */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Notwendig / Essential <span className="text-[10px] text-slate-400 font-semibold">(Immer aktiv)</span>
              </span>
              <p className="text-xs text-slate-500">Sichern Grundfunktionen der Website. / Basic website functions.</p>
            </div>
            <div className="relative inline-flex items-center">
              <input type="checkbox" checked disabled className="sr-only peer" />
              <div className="w-11 h-6 bg-blue-500 rounded-full opacity-60 cursor-not-allowed">
                <div className="absolute top-[2px] right-[2px] bg-white w-5 h-5 rounded-full shadow" />
              </div>
            </div>
          </div>

          {/* Option 2: Analytics */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs sm:text-sm font-bold text-slate-900">Analytik / Analytics</span>
              <p className="text-xs text-slate-500">Analysieren die Website-Nutzung anonym. / Anonymously analyze website usage.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={analytics} 
                onChange={(e) => setAnalytics(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {/* Option 3: Marketing */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs sm:text-sm font-bold text-slate-900">Marketing / Marketing</span>
              <p className="text-xs text-slate-500">Ermöglichen personalisierte Angebote und Werbung. / Enable personalized offers and ads.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={marketing} 
                onChange={(e) => setMarketing(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        </div>

        {/* Buttons Action Cluster */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleSaveCustom}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors order-3 sm:order-1"
          >
            Einstellungen Anpassen / Customize Settings ↗
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={handleRejectAll}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors"
            >
              Alle Ablehnen / Reject All
            </button>
            <button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/30 transition-all"
            >
              Annehmen & Speichern / Accept & Save
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CookieConsentBanner;
