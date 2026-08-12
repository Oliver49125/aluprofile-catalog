import { useState, useEffect } from 'react';
import { ArrowLeft, Ban, Globe, Construction } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { NavigationHeader } from './components/NavigationHeader';

type Lang = 'en' | 'de';

export default function NotFoundPage() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('aluprofile_lang');
    if (saved === 'en' || saved === 'de') setLang(saved);
  }, []);

  const t = {
    en: {
      back: 'Back to Home Catalog',
      title: '404 - Extrusion Die Not Found',
      desc: 'The page or catalog section you are trying to access does not exist, has been archived, or moved under a new technical specification.',
      helpText: 'Use the link below to return to the catalog home search page.',
    },
    de: {
      back: 'Zurück zur Startseite',
      title: '404 - Extrusionsmatrize nicht gefunden',
      desc: 'Die Seite oder der Katalogbereich, auf den Sie zugreifen möchten, existiert nicht, wurde archiviert oder unter einer neuen technischen Spezifikation verschoben.',
      helpText: 'Verwenden Sie den folgenden Link, um zur Hauptsuche des Katalogs zurückzukehren.',
    }
  }[lang];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white">
      <NavigationHeader
        lang={lang}
        onLangChange={(l) => {
          setLang(l);
          localStorage.setItem('aluprofile_lang', l);
        }}
      />
      <div className="mx-auto w-full max-w-[600px] px-4 py-16 flex-grow flex flex-col items-center justify-center">
        
        {/* Not Found Warning Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl animate-pulse-glow" />
          <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shadow-lg">
            <Ban className="h-10 w-10 animate-float" />
          </div>
        </div>

        {/* Card wrapper */}
        <Card className="w-full border-slate-200 bg-white shadow-2xl rounded-3xl overflow-hidden p-6 sm:p-8 text-center space-y-6">
          <CardContent className="p-0 space-y-4">
            
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
              <Construction className="h-4 w-4" />
              <span>Broken Link Detected</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              {t.title}
            </h1>
            
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {t.desc}
            </p>

            <p className="text-xs text-slate-400 font-semibold italic">
              {t.helpText}
            </p>

            <div className="pt-6 flex justify-center">
              <a href="/">
                <Button className="rounded-xl px-8 py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t.back}
                </Button>
              </a>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>&copy; 2026 AluProfile. System Error Imprint.</p>

      </footer>
    </div>
  );
}
