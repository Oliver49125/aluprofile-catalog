import { useState } from 'react';
import {
  Boxes,
  ImageIcon,
  Maximize2,
  FileText,
  ExternalLink,
} from 'lucide-react';
import MediaLightboxModal, { isPdf, safeUrl } from './MediaLightboxModal';

export interface ProfileMediaViewerProps {
  name: string;
  dimensions?: string;
  drawingUrl?: string | null;
  photoUrl?: string | null;
  lang?: 'en' | 'de';
  className?: string;
}

export default function ProfileMediaViewer({
  name,
  dimensions,
  drawingUrl,
  photoUrl,
  lang = 'en',
  className = '',
}: ProfileMediaViewerProps) {
  const normalizedDrawing = safeUrl(drawingUrl);
  const normalizedPhoto = safeUrl(photoUrl);

  const hasDrawing = Boolean(normalizedDrawing);
  const hasPhoto = Boolean(normalizedPhoto);

  // Active tab inside the inline viewer
  const [activeTab, setActiveTab] = useState<'drawing' | 'photo'>(() => {
    if (hasDrawing) return 'drawing';
    if (hasPhoto) return 'photo';
    return 'drawing';
  });

  // Lightbox pop-up state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxInitialTab, setLightboxInitialTab] = useState<'drawing' | 'photo'>('drawing');

  const openLightbox = (tab: 'drawing' | 'photo') => {
    setLightboxInitialTab(tab);
    setIsLightboxOpen(true);
  };

  const activeUrl = activeTab === 'drawing' ? normalizedDrawing : normalizedPhoto;
  const activeIsPdf = isPdf(activeUrl);

  const t = {
    cadDrawing: lang === 'de' ? 'CAD Querschnitt' : 'CAD Cross-Section',
    productPhoto: lang === 'de' ? 'Produktfoto' : 'Product Photo',
    bothPics: lang === 'de' ? 'Beide Bilder' : 'Both Pictures',
    popUpFullscreen: lang === 'de' ? 'Vollbild / Pop-Up' : 'Pop Up Fullscreen',
    clickToEnlarge: lang === 'de' ? 'Klicken zum Vergrößern' : 'Click to Pop Up / Enlarge',
    crossSectionUnit: lang === 'de' ? 'QUERSCHNITTSANSICHT (EINHEIT: MM)' : 'CROSS-SECTION VIEW (UNIT: MM)',
    scale: lang === 'de' ? 'Maßstab 1:1' : 'Scale 1:1',
    noDrawing: lang === 'de' ? 'Keine CAD-Zeichnung vorhanden' : 'No CAD drawing file uploaded',
    noPhoto: lang === 'de' ? 'Kein Produktfoto vorhanden' : 'No product photo uploaded',
    pdfDoc: lang === 'de' ? 'PDF Dokument' : 'PDF Document',
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main CAD / Photo Preview Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col justify-between min-h-[440px] relative overflow-hidden group">
        {/* Top Header: Tabs & Dimensions */}
        <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-2 shrink-0">
          <div className="flex items-center gap-2">
            {hasDrawing && (
              <button
                type="button"
                onClick={() => setActiveTab('drawing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'drawing'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-black shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Boxes className="h-3.5 w-3.5" />
                <span>{t.cadDrawing}</span>
                {isPdf(normalizedDrawing) && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                    PDF
                  </span>
                )}
              </button>
            )}

            {hasPhoto && (
              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'photo'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-black shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>{t.productPhoto}</span>
                {isPdf(normalizedPhoto) && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                    PDF
                  </span>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {dimensions && (
              <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                {dimensions}
              </span>
            )}
            <button
              type="button"
              onClick={() => openLightbox(activeTab)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-700 hover:text-white text-[11px] font-extrabold transition-all cursor-pointer border border-blue-200/60 shadow-xs"
              title={t.popUpFullscreen}
            >
              <Maximize2 className="h-3 w-3" />
              <span>{t.popUpFullscreen}</span>
            </button>
          </div>
        </div>

        {/* Media Preview Canvas */}
        <div
          className="w-full flex-1 flex items-center justify-center py-4 px-2 relative cursor-pointer min-h-[290px]"
          onClick={() => openLightbox(activeTab)}
        >
          {activeUrl ? (
            activeIsPdf ? (
              <div className="w-full h-[290px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group/pdf">
                <iframe
                  src={`${activeUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  title={`${name} Preview`}
                  className="w-full h-full border-0 pointer-events-none"
                />
                {/* Overlay hover prompt */}
                <div className="absolute inset-0 bg-slate-900/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/95 text-slate-900 font-extrabold text-xs shadow-lg backdrop-blur-xs">
                    <Maximize2 className="h-4 w-4 text-blue-600" />
                    <span>{t.clickToEnlarge}</span>
                  </span>
                </div>
                {/* PDF Badge Top Left */}
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white/90 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-extrabold text-rose-600 shadow-xs">
                  <FileText className="h-3 w-3" />
                  <span>{t.pdfDoc}</span>
                </div>
              </div>
            ) : (
              <div className="relative group/img flex items-center justify-center w-full h-full">
                <img
                  src={activeUrl}
                  alt={`${name} ${activeTab === 'drawing' ? 'CAD' : 'Photo'}`}
                  className="max-h-[290px] w-auto object-contain transition-transform duration-300 group-hover/img:scale-105 rounded-xl select-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/hero-target-profile.png';
                  }}
                />
                {/* Hover zoom overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/80 text-white font-extrabold text-xs shadow-lg backdrop-blur-xs">
                    <Maximize2 className="h-4 w-4 text-blue-400" />
                    <span>{t.clickToEnlarge}</span>
                  </span>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300 gap-2 py-10">
              <Boxes className="h-16 w-16" />
              <span className="text-xs text-slate-400">
                {activeTab === 'drawing' ? t.noDrawing : t.noPhoto}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Subtitle / Scale Notice */}
        <div className="pt-3 text-center border-t border-slate-100 w-full flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
          <span>{activeTab === 'drawing' ? t.crossSectionUnit : 'HIGH-RESOLUTION PRODUCT PHOTO'}</span>
          <span>{activeTab === 'drawing' ? t.scale : 'HQ RENDER'}</span>
        </div>
      </div>

      {/* "Both Pics" Quick Switcher Cards */}
      {(hasDrawing || hasPhoto) && (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              {t.bothPics} ({[hasDrawing, hasPhoto].filter(Boolean).length})
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {lang === 'de' ? 'Klicken zum Wechseln oder Öffnen' : 'Click to preview or pop up'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Card 1: CAD Drawing */}
            {hasDrawing ? (
              <div
                onClick={() => {
                  setActiveTab('drawing');
                  openLightbox('drawing');
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeTab === 'drawing'
                    ? 'bg-white border-blue-400 shadow-sm ring-1 ring-blue-400/30'
                    : 'bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-11 w-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    {isPdf(normalizedDrawing) ? (
                      <FileText className="h-5 w-5 text-rose-500" />
                    ) : (
                      <img
                        src={normalizedDrawing}
                        alt="Drawing Thumbnail"
                        className="h-full w-full object-contain p-0.5"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {lang === 'de' ? 'Bild 1: CAD Querschnitt' : 'Pic 1: CAD Drawing'}
                      </p>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          isPdf(normalizedDrawing)
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}
                      >
                        {isPdf(normalizedDrawing) ? 'PDF' : 'IMAGE'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {lang === 'de' ? 'Technische Zeichnung' : 'Engineering Blueprint'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox('drawing');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                  title={t.popUpFullscreen}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                <Boxes className="h-4 w-4 text-slate-300" />
                <span>{t.noDrawing}</span>
              </div>
            )}

            {/* Card 2: Product Photo */}
            {hasPhoto ? (
              <div
                onClick={() => {
                  setActiveTab('photo');
                  openLightbox('photo');
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeTab === 'photo'
                    ? 'bg-white border-blue-400 shadow-sm ring-1 ring-blue-400/30'
                    : 'bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-11 w-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    {isPdf(normalizedPhoto) ? (
                      <FileText className="h-5 w-5 text-rose-500" />
                    ) : (
                      <img
                        src={normalizedPhoto}
                        alt="Photo Thumbnail"
                        className="h-full w-full object-contain p-0.5"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {lang === 'de' ? 'Bild 2: Produktfoto' : 'Pic 2: Product Photo'}
                      </p>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          isPdf(normalizedPhoto)
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}
                      >
                        {isPdf(normalizedPhoto) ? 'PDF' : 'IMAGE'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {lang === 'de' ? 'Reales Anwendungsbild' : 'Real Extrusion Render'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox('photo');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                  title={t.popUpFullscreen}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                <ImageIcon className="h-4 w-4 text-slate-300" />
                <span>{t.noPhoto}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Pop-Up Modal */}
      <MediaLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title={name}
        dimensions={dimensions}
        drawingUrl={normalizedDrawing}
        photoUrl={normalizedPhoto}
        initialTab={lightboxInitialTab}
        lang={lang}
      />
    </div>
  );
}
