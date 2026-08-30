import { useEffect } from 'react';
import { ArrowLeft, Shield, CheckCircle, Globe, Mail, FileText, Lock } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { NavigationHeader } from './components/NavigationHeader';
import { useLanguage } from './LanguageContext';
import { updatePageSeo } from './utils/seo';

export default function PrivacyPage() {
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    updatePageSeo('privacy', lang);
  }, [lang]);

  const handleLangChange = (newLang: 'en' | 'de') => {
    setLang(newLang);
  };

  const t = {
    en: {
      back: 'Back to Catalog',
      title: 'Data Privacy Policy',
      subtitle: 'Compliant with EU General Data Protection Regulation (GDPR / DSGVO).',
      lastUpdated: 'Last Updated: August 30, 2026',
      intro: 'AluProfileBiz is committed to protecting your personal data. This policy explains how we collect, process, and secure information when you search our aluminum profile catalog or submit inquiries.',
      section1Title: '1. Controller & Contact Information',
      section1Content: 'The controller responsible for processing data on this website under EU data protection laws is:',
      companyName: 'AluProfileBiz GmbH',
      companyAddress: 'Industrial Park 4, 80331 Munich, Germany',
      companyEmail: 'privacy@aluprofile.biz',
      section2Title: '2. Data We Collect & How We Collect It',
      section2Content: 'We collect data in two ways: automatically when you visit our website, and when you voluntarily submit forms.',
      subSection2a: 'A. Voluntary Inquiries & RFQs',
      subSection2aContent: 'When you submit a contact inquiry for an aluminum profile, we collect your Name, Company Name, Email Address, Phone Number, and your inquiry message. This data is used exclusively to facilitate connection with the profile manufacturer.',
      subSection2b: 'B. Technical Calculations & Logs',
      subSection2bContent: 'For engineering accuracy, searches filtered by Height, Width, and Moment of Inertia calculations are logged anonymously. No personal IP identifiers are linked to search queries.',
      section3Title: '3. Legal Basis for Processing',
      section3Content: 'We process your data strictly under the following legal frameworks:',
      legal1: 'Consent (Art. 6(1)(a) GDPR) - for analytics and marketing cookies.',
      legal2: 'Contractual Performance (Art. 6(1)(b) GDPR) - for processing inquiries and RFQs.',
      legal3: 'Legitimate Interests (Art. 6(1)(f) GDPR) - to optimize catalog performance and stability.',
      section4Title: '4. Third-Party Services & Google Analytics',
      section4Content: 'If you provide explicit consent through our Cookie Banner, we load Google Analytics 4 (GA4) and Google Tag Manager (GTM). GA4 helps us understand which profiles are downloaded most frequently. Your IP address is anonymized before processing.',
      section5Title: '5. Your Rights as a Data Subject',
      section5Content: 'Under the GDPR, you have the following rights regarding your personal data:',
      right1: 'Right of access (Art. 15 GDPR)',
      right2: 'Right to rectification (Art. 16 GDPR) or erasure (Art. 17 GDPR)',
      right3: 'Right to restrict processing (Art. 18 GDPR)',
      right4: 'Right to data portability (Art. 20 GDPR)',
      right5: 'Right to object to processing (Art. 21 GDPR)',
      contactPrivacy: 'To exercise any of these rights, contact us at privacy@aluprofile.biz.',
      policyDisclaimer: 'This policy may change to adapt to new legal mandates or platform upgrades. Please check back regularly.',
    },
    de: {
      back: 'Zurück zum Katalog',
      title: 'Datenschutzerklärung',
      subtitle: 'Konform mit der EU-Datenschutz-Grundverordnung (DSGVO).',
      lastUpdated: 'Letzte Aktualisierung: 30. August 2026',
      intro: 'AluProfileBiz verpflichtet sich zum Schutz Ihrer persönlichen Daten. Diese Richtlinie erklärt, wie wir Informationen erfassen, verarbeiten und sichern, wenn Sie unseren Aluminiumprofil-Katalog durchsuchen oder Anfragen senden.',
      section1Title: '1. Verantwortlicher & Kontaktinformationen',
      section1Content: 'Der für die Datenverarbeitung auf dieser Website verantwortliche Controller im Sinne der EU-Datenschutzgesetze ist:',
      companyName: 'AluProfileBiz GmbH',
      companyAddress: 'Industriepark 4, 80331 München, Deutschland',
      companyEmail: 'privacy@aluprofile.biz',
      section2Title: '2. Welche Daten wir erfassen & wie wir sie erfassen',
      section2Content: 'Wir erfassen Daten auf zwei Arten: automatisch beim Besuch unserer Website und bei freiwilliger Formularübermittlung.',
      subSection2a: 'A. Freiwillige Anfragen & Ausschreibungen',
      subSection2aContent: 'Wenn Sie eine Kontaktanfrage für ein Aluminiumprofil senden, erfassen wir Ihren Namen, Firmennamen, Ihre E-Mail-Adresse, Telefonnummer und Ihre Anfragenachricht.',
      subSection2b: 'B. Technische Berechnungen & Protokolle',
      subSection2bContent: 'Für ingenieurtechnische Genauigkeit werden Suchanfragen anonym protokolliert.',
      section3Title: '3. Rechtsgrundlage der Verarbeitung',
      section3Content: 'Wir verarbeiten Ihre Daten streng nach folgenden Rechtsgrundlagen:',
      legal1: 'Einwilligung (Art. 6(1)(a) DSGVO)',
      legal2: 'Vertragserfüllung (Art. 6(1)(b) DSGVO)',
      legal3: 'Berechtigte Interessen (Art. 6(1)(f) DSGVO)',
      section4Title: '4. Drittanbieter-Dienste',
      section4Content: 'Anonymisierte Analyse-Daten helfen uns bei der Katalogoptimierung.',
      section5Title: '5. Ihre Rechte als betroffene Person',
      section5Content: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung.',
      right1: 'Auskunftsrecht (Art. 15 DSGVO)',
      right2: 'Berichtigung (Art. 16 DSGVO) & Löschung (Art. 17 DSGVO)',
      right3: 'Einschränkung der Verarbeitung (Art. 18 DSGVO)',
      right4: 'Datenübertragbarkeit (Art. 20 DSGVO)',
      right5: 'Widerspruchsrecht (Art. 21 DSGVO)',
      contactPrivacy: 'Um diese Rechte auszuüben, kontaktieren Sie uns unter privacy@aluprofile.biz.',
      policyDisclaimer: 'Diese Richtlinie kann angepasst werden, um gesetzlichen Anforderungen oder Systemupgrades zu entsprechen.',
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

        {/* Title Block */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-extrabold text-blue-700 mb-3">
            <Lock className="h-3.5 w-3.5" />
            <span>GDPR / DSGVO Compliance Implemented</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-xl">
            {t.subtitle}
          </p>
          <p className="mt-3 text-xs text-slate-400 font-semibold">
            {t.lastUpdated}
          </p>
        </div>

        {/* Policy Content */}
        <Card className="border-slate-200/90 shadow-xl rounded-3xl bg-white overflow-hidden">
          <CardContent className="p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-slate-600">
            
            <p className="text-base text-slate-700 font-medium border-l-4 border-blue-500 pl-4 bg-blue-50/50 py-3 rounded-r-xl">
              {t.intro}
            </p>

            {/* Section 1 */}
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {t.section1Title}
              </h2>
              <p>{t.section1Content}</p>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1 text-slate-800 font-medium">
                <p className="font-bold text-slate-900">{t.companyName}</p>
                <p>{t.companyAddress}</p>
                <p className="text-xs text-slate-500 mt-2">Email: <a href={`mailto:${t.companyEmail}`} className="text-blue-600 hover:underline">{t.companyEmail}</a></p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {t.section2Title}
              </h2>
              <p>{t.section2Content}</p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 text-blue-700">{t.subSection2a}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.subSection2aContent}</p>
                </div>
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 text-blue-700">{t.subSection2b}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.subSection2bContent}</p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {t.section3Title}
              </h2>
              <p>{t.section3Content}</p>
              <ul className="space-y-2">
                {[t.legal1, t.legal2, t.legal3].map((legal, i) => (
                  <li key={i} className="flex gap-2.5 items-start text-xs text-slate-600 font-medium">
                    <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-600 mt-0.5" />
                    <span>{legal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {t.section4Title}
              </h2>
              <p>{t.section4Content}</p>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {t.section5Title}
              </h2>
              <p>{t.section5Content}</p>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {[t.right1, t.right2, t.right3, t.right4, t.right5].map((right, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-blue-50 font-bold text-xs text-blue-600 flex items-center justify-center shrink-0">{idx + 1}</span>
                    <span className="text-xs font-semibold text-slate-800">{right}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 font-semibold pt-2">
                {t.contactPrivacy}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400 italic">
              {t.policyDisclaimer}
            </div>

          </CardContent>
        </Card>

      </div>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>&copy; 2026 AluProfileBiz Platform. All Rights Reserved. DSGVO Compliance Certified.</p>
      </footer>
    </div>
  );
}
