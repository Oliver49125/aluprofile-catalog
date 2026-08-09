import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Globe, Mail, Scale, Phone } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { NavigationHeader } from './components/NavigationHeader';

type Lang = 'en' | 'de';

export default function ImprintPage() {
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
      title: 'Legal Imprint',
      subtitle: 'Information pursuant to Section 5 of the German Telemedia Act (TMG).',
      section1Title: 'Information about the Company',
      companyName: 'AluProfile GmbH',
      companyAddress: 'Industrial Park 4, 80331 Munich, Germany',
      representativesTitle: 'Authorized Representatives',
      representatives: 'Dr. Markus Weber (Chief Executive Officer)\nElena Rostova (Chief Technology Officer)',
      contactTitle: 'Contact Information',
      phone: 'Phone: +49 (0) 89 1234 5678',
      email: 'Email: support@aluprofile.biz',
      registryTitle: 'Register Entries',
      registryText: 'Commercial Register: District Court of Munich\nRegistration Number: HRB 123456',
      vatTitle: 'VAT Identification Number',
      vatText: 'VAT ID pursuant to Section 27a of the German Value Added Tax Act: DE 987654321',
      disclaimerTitle: 'Disclaimer & Liability for Links',
      disclaimerText: 'Our platform contains links to external websites of manufacturers and suppliers. We have no influence on the contents of these third-party links and cannot assume any liability for them. The respective provider or operator of the linked pages is always responsible for their content.',
    },
    de: {
      back: 'Zurück zum Katalog',
      title: 'Impressum',
      subtitle: 'Angaben gemäß § 5 TMG (Telemediengesetz) für die Online-Plattform.',
      section1Title: 'Angaben über das Unternehmen',
      companyName: 'AluProfile GmbH',
      companyAddress: 'Industriepark 4, 80331 München, Deutschland',
      representativesTitle: 'Vertreten durch die Geschäftsführer',
      representatives: 'Dr. Markus Weber (Geschäftsführer)\nElena Rostova (Technische Leiterin)',
      contactTitle: 'Kontakt',
      phone: 'Telefon: +49 (0) 89 1234 5678',
      email: 'E-Mail: support@aluprofile.biz',
      registryTitle: 'Registereintrag',
      registryText: 'Handelsregister: Amtsgericht München\nRegisternummer: HRB 123456',
      vatTitle: 'Umsatzsteuer-Identifikationsnummer',
      vatText: 'Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE 987654321',
      disclaimerTitle: 'Haftung für Links',
      disclaimerText: 'Unser Angebot enthält Links zu externen Webseiten von Profilherstellern. Auf die Inhalte dieser externen Links haben wir keinen Einfluss.',
    }
  }[lang];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 md:px-10 md:py-8 flex-1">
        
        {/* Navigation Header */}
        <NavigationHeader
          lang={lang}
          onLangChange={(l) => handleLangChange(l)}
        />

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
              
              {/* Company Info */}
              <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600">{t.section1Title}</h3>
                <p className="font-bold text-slate-800 text-sm">{t.companyName}</p>
                <p className="text-xs">{t.companyAddress}</p>
              </div>

              {/* Representatives */}
              <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600">{t.representativesTitle}</h3>
                <p className="text-xs whitespace-pre-line font-medium text-slate-700">{t.representatives}</p>
              </div>

              {/* Contact */}
              <div className="space-y-3 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600">{t.contactTitle}</h3>
                <div className="space-y-1.5 text-xs">
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {t.phone}</p>
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> <a href={`mailto:support@aluprofile.biz`} className="text-blue-600 hover:underline">{t.email}</a></p>
                </div>
              </div>

              {/* Register entries */}
              <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600">{t.registryTitle}</h3>
                <p className="text-xs whitespace-pre-line font-medium text-slate-700">{t.registryText}</p>
              </div>

            </div>

            {/* VAT ID */}
            <div className="border-t border-slate-100 pt-6 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600">{t.vatTitle}</h3>
              <p className="font-semibold text-slate-800">{t.vatText}</p>
            </div>

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
        <p>&copy; 2026 AluProfile Platform. Imprint disclosures compliant with EU digital services legislation.</p>
      </footer>
    </div>
  );
}
