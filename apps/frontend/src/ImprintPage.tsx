import { useEffect, useState } from 'react';
import { Mail, Scale, Phone, Building2, UserCheck, MapPin } from 'lucide-react';
import { Card, CardContent } from './components/ui/card';
import { NavigationHeader } from './components/NavigationHeader';
import { useLanguage } from './LanguageContext';
import { updatePageSeo } from './utils/seo';
import { API_BASE } from './utils/apiBase';

export default function ImprintPage() {
  const { lang, setLang } = useLanguage();
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    updatePageSeo('imprint', lang);
  }, [lang]);

  useEffect(() => {
    fetch(`${API_BASE}/public/site-settings`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (data && typeof data === 'object') {
          setSiteSettings(data as Record<string, string>);
        }
      })
      .catch(() => {});
  }, []);

  const handleLangChange = (newLang: 'en' | 'de') => {
    setLang(newLang);
  };

  const ownerName = siteSettings.imprintOwner || 'Oliver Kascha';
  const companyName = siteSettings.imprintCompanyName || 'Aluprofile.biz';
  const address = siteSettings.imprintAddress || 'Vorgartenstrasse 120a/Top28\nA-1020 Wien';
  const email = siteSettings.imprintEmail || 'support@aluprofile.biz';
  const phone = siteSettings.imprintPhone || '';
  const vatId = siteSettings.imprintVatId || '';
  const register = siteSettings.imprintRegister || '';

  const t = {
    en: {
      title: 'Legal Imprint',
      subtitle: 'Information pursuant to § 5 Austrian E-Commerce Act (ECG) and Media Act.',
      section1Title: 'Platform Operator & Media Owner',
      representativesTitle: 'Owner / Authorized Representative',
      contactTitle: 'Contact Information',
      emailLabel: 'Email:',
      phoneLabel: 'Phone:',
      registryTitle: 'Registry Entry',
      vatTitle: 'VAT Identification Number (UID)',
      disclaimerTitle: 'Disclaimer & Liability for Links',
      disclaimerText: 'Our platform contains links to external websites of manufacturers and suppliers. We have no influence on the contents of these third-party links and cannot assume any liability for them. The respective provider or operator of the linked pages is always responsible for their content.',
    },
    de: {
      title: 'Impressum',
      subtitle: 'Angaben gemäß § 5 ECG (E-Commerce-Gesetz) und Mediengesetz für Österreich & EU.',
      section1Title: 'Diensteanbieter & Medieninhaber',
      representativesTitle: 'Inhaber / Vertretungsberechtigt',
      contactTitle: 'Kontakt',
      emailLabel: 'E-Mail:',
      phoneLabel: 'Telefon:',
      registryTitle: 'Registereintrag',
      vatTitle: 'Umsatzsteuer-Identifikationsnummer (UID)',
      disclaimerTitle: 'Haftung für Links',
      disclaimerText: 'Unser Angebot enthält Links zu externen Webseiten von Profilherstellern und Partnern. Auf die Inhalte dieser externen Links haben wir keinen Einfluss. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.',
    },
  }[lang];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 md:px-10 md:py-8 flex-1">
        {/* Navigation Header */}
        <NavigationHeader lang={lang} onLangChange={(l) => handleLangChange(l)} />

        {/* Title */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-extrabold text-blue-700 mb-3">
            <Scale className="h-3.5 w-3.5" />
            <span>Corporate Disclosure</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-xl">
            {t.subtitle}
          </p>
        </div>

        {/* Content Box */}
        <Card className="border-slate-200/90 shadow-xl rounded-3xl bg-white overflow-hidden">
          <CardContent className="p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-slate-600">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Operator & Owner */}
              <div className="space-y-2 border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" /> {t.representativesTitle}
                </h3>
                <p className="font-bold text-slate-900 text-base">{ownerName}</p>
                <p className="text-xs text-slate-500 font-medium">{companyName}</p>
              </div>

              {/* Address */}
              <div className="space-y-2 border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Anschrift / Address
                </h3>
                <p className="text-xs whitespace-pre-line font-semibold text-slate-700 leading-relaxed">
                  {address}
                </p>
              </div>

              {/* Contact */}
              <div className="space-y-3 border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> {t.contactTitle}
                </h3>
                <div className="space-y-2 text-xs">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-600">{t.emailLabel}</span>
                    <a href={`mailto:${email}`} className="text-blue-600 font-bold hover:underline">
                      {email}
                    </a>
                  </p>
                  {phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-600">{t.phoneLabel}</span>
                      <a href={`tel:${phone}`} className="text-slate-800 font-bold hover:underline">
                        {phone}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Platform Details */}
              <div className="space-y-2 border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> {t.section1Title}
                </h3>
                <p className="font-bold text-slate-800 text-sm">{companyName}</p>
                <p className="text-xs text-slate-500">
                  Online-Katalog & B2B-Plattform für Aluminiumprofile und Konstruktionssysteme.
                </p>
                {register && (
                  <div className="pt-2 border-t border-slate-200/60 mt-2">
                    <p className="text-[11px] text-slate-600 font-medium whitespace-pre-line">{register}</p>
                  </div>
                )}
              </div>
            </div>

            {/* VAT ID - Only shown if provided (Skipped by default as requested by client) */}
            {vatId && (
              <div className="border-t border-slate-100 pt-6 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600">{t.vatTitle}</h3>
                <p className="font-semibold text-slate-800 text-xs">{vatId}</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="border-t border-slate-100 pt-6 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600">{t.disclaimerTitle}</h3>
              <p className="text-xs leading-relaxed text-slate-500 italic">{t.disclaimerText}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>&copy; 2026 AluProfile.biz Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
