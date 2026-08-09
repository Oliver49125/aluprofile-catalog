import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, CheckSquare, Globe, Scale, HelpCircle, FileText, AlertTriangle } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { NavigationHeader } from './components/NavigationHeader';

type Lang = 'en' | 'de';

export default function TermsPage() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('aluprofile_lang');
    if (saved === 'en' || saved === 'de') setLang(saved);
  }, []);

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('aluprofile_lang', newLang);
  };

  const t = {
    en: {
      back: 'Back to Catalog',
      title: 'Terms & Conditions',
      subtitle: 'Standard Commercial Terms of Service for B2B Industrial Catalog usage.',
      lastUpdated: 'Last Updated: July 25, 2026',
      section1Title: '1. Platform Scope & User Eligibility',
      section1Content: 'AluProfile operates strictly as a B2B platform connecting mechanical designers, structural engineers, and procurement agents with certified profile manufacturers. By accessing this catalog, you warrant that you are acting as an active business entity or representative.',
      section2Title: '2. Accuracy of CAD Models & Structural Calculations',
      section2Content: 'Moment of Inertia (Ix, Iy) and Section Modulus (Wx, Wy) calculations displayed on the datasheets are provided for reference purposes under DIN EN 12020-2 standards.',
      warningNote: 'Important Warning: Calculations must be verified independently by a licensed structural engineer before integrating profiles into load-bearing assemblies, frames, or moving gantries.',
      section3Title: '3. Intellectual Property & File Usage License',
      section3Content: 'All 3D STEP models, 2D DXF outlines, and manufacturer logos rendered on AluProfile remain the exclusive intellectual property of the respective extrusion partners. Users are granted a non-exclusive, non-transferable, revocable license to import models into CAD workspaces for assembly designs.',
      section4Title: '4. Inquiry & Request for Quote (RFQ) System',
      section4Content: 'Inquiries sent through our portal represent non-binding technical requests. Quotations returned by manufacturing partners do not constitute a legal supply contract until a separate purchase agreement is formally signed.',
      section5Title: '5. Limitation of Liability',
      section5Content: 'AluProfile is not liable for structural failures, delay costs, or supply-chain interruptions caused by dimensions mismatches or catalog discrepancies. The platform is provided "as is" without warranty of continuous uptime.',
      section6Title: '6. Place of Jurisdiction',
      section6Content: 'All disputes arising from or in connection with the usage of this platform shall be governed exclusively by the laws of Munich, Germany.',
    },
    de: {
      back: 'Zurück zum Katalog',
      title: 'Allgemeine Geschäftsbedingungen (AGB)',
      subtitle: 'Nutzungsbedingungen für die B2B-Plattform zur Profilsuche und CAD-Download.',
      lastUpdated: 'Letzte Aktualisierung: 25. Juli 2026',
      section1Title: '1. Plattform-Geltungsbereich & Berechtigung',
      section1Content: 'AluProfile fungiert ausschließlich als B2B-Plattform zur Vernetzung von Maschinenbauern, Konstrukteuren und Einkäufern mit verifizierten Profilherstellern.',
      section2Title: '2. Genauigkeit der CAD-Modelle & Statik-Berechnungen',
      section2Content: 'Die auf den Datenblättern angezeigten Trägheitsmomente (Ix, Iy) und Widerstandsmomente (Wx, Wy) dienen als Referenzwerte.',
      warningNote: 'Wichtiger Warnhinweis: Alle Berechnungen müssen vor der Integration in tragende Baugruppen überprüft werden.',
      section3Title: '3. Geistiges Eigentum & CAD-Nutzungsrechte',
      section3Content: 'Alle 3D-STEP-Modelle, 2D-DXF-Zeichnungen und Logos bleiben geistiges Eigentum der Partner.',
      section4Title: '4. Anfragesystem & Angebot (RFQ)',
      section4Content: 'Über das Portal gesendete Anfragen sind unverbindlich.',
      section5Title: '5. Haftungsbeschränkung',
      section5Content: 'AluProfile haftet nicht für Konstruktionsfehler oder Lieferausfälle.',
      section6Title: '6. Gerichtsstand',
      section6Content: 'Gerichtsstand ist München, Deutschland.',
    }
  }[lang];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 md:px-10 md:py-8 flex-1">
        
        <NavigationHeader
          lang={lang}
          onLangChange={(l) => handleLangChange(l)}
        />

        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-extrabold text-blue-700 mb-3">
            <FileText className="h-3.5 w-3.5" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-xl">
            {t.subtitle}
          </p>
        </div>

        <Card className="border-slate-200/90 shadow-xl rounded-3xl bg-white overflow-hidden">
          <CardContent className="p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-slate-600">
            
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base">{t.section1Title}</h3>
              <p>{t.section1Content}</p>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base">{t.section2Title}</h3>
              <p>{t.section2Content}</p>
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-medium text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{t.warningNote}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base">{t.section3Title}</h3>
              <p>{t.section3Content}</p>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base">{t.section4Title}</h3>
              <p>{t.section4Content}</p>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base">{t.section5Title}</h3>
              <p>{t.section5Content}</p>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base">{t.section6Title}</h3>
              <p>{t.section6Content}</p>
            </div>

          </CardContent>
        </Card>

      </div>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>&copy; 2026 AluProfile Platform. All Rights Reserved. General Terms & Conditions applicable.</p>
      </footer>
    </div>
  );
}
