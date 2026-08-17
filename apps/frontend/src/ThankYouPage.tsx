import { ArrowLeft, CheckCircle, Clock, Mail, Sparkles, ShieldAlert, ArrowRight, FileCheck } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { NavigationHeader } from './components/NavigationHeader';
import { useLanguage } from './LanguageContext';

export default function ThankYouPage() {
  const { lang, setLang } = useLanguage();

  const t = {
    en: {
      back: 'Back to Catalog',
      title: 'Inquiry Successfully Received!',
      subtitle: 'Your request for a technical quote has been routed to our manufacture partners.',
      bulletTitle: 'What happens next?',
      step1Title: '1. Technical Validation',
      step1Desc: 'Extrusion engineers verify the profile specifications, alloy requirements (e.g. 6063-T5), and load tolerances.',
      step2Title: '2. Supplier Verification',
      step2Desc: 'We coordinate with regional European extruders to check material inventory and custom die lead times.',
      step3Title: '3. Offer Delivery',
      step3Desc: 'A formalized non-binding PDF purchase quote is emailed to you, typically within 4 business hours.',
      note: 'A confirmation summary of your inquiry details has been sent to your email address.',
      cta: 'Explore Catalog',
    },
    de: {
      back: 'Zurück zum Katalog',
      title: 'Anfrage erfolgreich empfangen!',
      subtitle: 'Ihre Anfrage für ein technisches Angebot wurde an unsere Fertigungspartner weitergeleitet.',
      bulletTitle: 'Wie geht es weiter?',
      step1Title: '1. Technische Prüfung',
      step1Desc: 'Berechnungsingenieure überprüfen die Profilabmessungen, Legierungsvorgaben (z.B. 6063-T5) und Belastungen.',
      step2Title: '2. Lieferanten-Abstimmung',
      step2Desc: 'Wir prüfen die Lagerbestände bei unseren europäischen Partnern sowie Lieferzeiten für eventuelle Matrizen.',
      step3Title: '3. Angebotserstellung',
      step3Desc: 'Sie erhalten ein formelles, unverbindliches Kaufangebot als PDF per E-Mail (üblicherweise innerhalb von 4 Stunden).',
      note: 'Eine Bestätigung Ihrer Anfragedaten wurde soeben an Ihre E-Mail-Adresse versendet.',
      cta: 'Katalog durchsuchen',
    }
  }[lang];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <NavigationHeader
        lang={lang}
        onLangChange={(l) => {
          setLang(l);
          localStorage.setItem('aluprofile_lang', l);
        }}
      />
      <div className="mx-auto w-full max-w-[800px] px-4 py-12 sm:px-6 md:px-10 flex-grow flex flex-col items-center justify-center">
        
        {/* Success Icon Animation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl animate-pulse-glow" />
          <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle className="h-10 w-10 animate-float" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center max-w-xl mb-10 space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {t.title}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Next Steps Container */}
        <Card className="w-full border-slate-200 bg-white shadow-xl rounded-3xl overflow-hidden p-6 sm:p-8">
          <CardContent className="p-0 space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
              {t.bulletTitle}
            </h3>

            <div className="grid gap-6 sm:grid-cols-3">
              
              <div className="space-y-2 text-center sm:text-left">
                <div className="mx-auto sm:mx-0 h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  <FileCheck className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{t.step1Title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{t.step1Desc}</p>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="mx-auto sm:mx-0 h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  <Clock className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{t.step2Title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{t.step2Desc}</p>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="mx-auto sm:mx-0 h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  <Mail className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{t.step3Title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{t.step3Desc}</p>
              </div>

            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs font-semibold text-blue-800 text-center leading-relaxed">
              {t.note}
            </div>

            {/* Back Button */}
            <div className="pt-4 flex justify-center">
              <a href="/">
                <Button className="rounded-xl px-8 py-3.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t.cta}
                </Button>
              </a>
            </div>

          </CardContent>
        </Card>

      </div>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>&copy; 2026 AluProfile Platform. Thank you for your interest in our products.</p>
      </footer>
    </div>
  );
}
