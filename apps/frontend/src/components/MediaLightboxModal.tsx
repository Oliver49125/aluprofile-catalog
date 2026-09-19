import { useState, useEffect } from 'react';
import {
  X,
  Boxes,
  ImageIcon,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ExternalLink,
  FileText,
} from 'lucide-react';

export function isPdf(url?: string | null): boolean {
  if (!url) return false;
  return /\.(pdf)(\?.*)?$/i.test(url) || url.toLowerCase().includes('.pdf');
}

export function isImage(url?: string | null): boolean {
  if (!url) return false;
  return /\.(png|jpe?g|webp|gif|svg|bmp|avif)(\?.*)?$/i.test(url);
}

export function safeUrl(url?: string | null, apiBase: string = ''): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
}

export interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dimensions?: string;
  drawingUrl?: string | null;
  photoUrl?: string | null;
  initialTab?: 'drawing' | 'photo';
  lang?: 'en' | 'de';
}

export default function MediaLightboxModal({
  isOpen,
  onClose,
  title,
  dimensions,
  drawingUrl,
  photoUrl,
  initialTab = 'drawing',
  lang = 'en',
}: MediaLightboxModalProps) {
  // Determine available media
  const hasDrawing = Boolean(drawingUrl);
  const hasPhoto = Boolean(photoUrl);

  // Active tab: fallback to available one if initialTab isn't present
  const [activeTab, setActiveTab] = useState<'drawing' | 'photo'>(() => {
    if (initialTab === 'drawing' && hasDrawing) return 'drawing';
    if (initialTab === 'photo' && hasPhoto) return 'photo';
    if (hasDrawing) return 'drawing';
    if (hasPhoto) return 'photo';
    return 'drawing';
  });

  // Reset active tab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      if (initialTab === 'drawing' && hasDrawing) setActiveTab('drawing');
      else if (initialTab === 'photo' && hasPhoto) setActiveTab('photo');
      else if (hasDrawing) setActiveTab('drawing');
      else if (hasPhoto) setActiveTab('photo');
      setZoom(1);
    }
  }, [isOpen, initialTab, hasDrawing, hasPhoto]);

  // Image zoom state
  const [zoom, setZoom] = useState(1);

  // Keyboard navigation (Esc to close, Arrow keys to toggle)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        if (hasDrawing && hasPhoto) {
          setActiveTab((prev) => (prev === 'drawing' ? 'photo' : 'drawing'));
          setZoom(1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasDrawing, hasPhoto, onClose]);

  if (!isOpen) return null;

  const currentUrl = activeTab === 'drawing' ? drawingUrl : photoUrl;
  const currentIsPdf = isPdf(currentUrl);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  const t = {
    cadDrawing: lang === 'de' ? 'CAD Querschnitt (Bild 1)' : 'CAD Cross-Section (Pic 1)',
    productPhoto: lang === 'de' ? 'Produktfoto (Bild 2)' : 'Product Photo (Pic 2)',
    bothPics: lang === 'de' ? 'Beide Bilder' : 'Both Pictures',
    openNewTab: lang === 'de' ? 'In neuem Tab öffnen' : 'Open in New Tab',
    download: lang === 'de' ? 'Herunterladen' : 'Download',
    close: lang === 'de' ? 'Schließen (Esc)' : 'Close (Esc)',
    zoomIn: lang === 'de' ? 'Vergrößern' : 'Zoom In',
    zoomOut: lang === 'de' ? 'Verkleinern' : 'Zoom Out',
    resetZoom: lang === 'de' ? 'Zurücksetzen' : 'Reset Zoom',
    pdfNotice:
      lang === 'de'
        ? 'Interaktive PDF-Vorschau. Sie können zoomen, durchblättern oder das Dokument herunterladen.'
        : 'Interactive PDF preview. You can zoom, scroll pages, or download the original file.',
    noMedia: lang === 'de' ? 'Keine Datei angehängt' : 'No file uploaded for this view',
  };

  return (
    <div
      className="fixed inset-0 z-[999999] flex flex-col bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800 text-white shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Title & Dimensions */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Maximize2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">{title}</h2>
              {dimensions && (
                <span className="text-[11px] font-black bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-700">
                  {dimensions}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {activeTab === 'drawing' ? t.cadDrawing : t.productPhoto}
              {currentIsPdf ? ' • PDF Document' : ' • High-Resolution Image'}
            </p>
          </div>
        </div>

        {/* Center: Dual Picture Selector (Both Pics) */}
        {(hasDrawing || hasPhoto) && (
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            {hasDrawing && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('drawing');
                  setZoom(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'drawing'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Boxes className="h-3.5 w-3.5" />
                <span>{t.cadDrawing}</span>
                {isPdf(drawingUrl) && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                    PDF
                  </span>
                )}
              </button>
            )}

            {hasPhoto && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('photo');
                  setZoom(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'photo'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>{t.productPhoto}</span>
                {isPdf(photoUrl) && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                    PDF
                  </span>
                )}
              </button>
            )}
          </div>
        )}

        {/* Right Controls: Zoom & Close */}
        <div className="flex items-center gap-2">
          {/* Zoom controls for non-PDF images */}
          {!currentIsPdf && currentUrl && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700">
              <button
                type="button"
                onClick={handleZoomIn}
                title={t.zoomIn}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                title={t.zoomOut}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                title={t.resetZoom}
                className="px-2 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                title={t.resetZoom}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {currentUrl && (
            <>
              <a
                href={currentUrl}
                download
                target="_blank"
                rel="noreferrer"
                title={t.download}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{t.download}</span>
              </a>
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                title={t.openNewTab}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            title={t.close}
            className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer ml-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 relative"
        onClick={(e) => {
          // If clicking empty canvas area, close modal
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {currentUrl ? (
          currentIsPdf ? (
            <div
              className="w-full max-w-5xl h-[75vh] rounded-2xl bg-white overflow-hidden shadow-2xl border border-slate-700 relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-rose-600" />
                  <span>{t.pdfNotice}</span>
                </span>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <span>{t.openNewTab}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <iframe
                src={`${currentUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                title={`${title} ${activeTab}`}
                className="w-full flex-1 border-0"
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center max-w-full max-h-full transition-transform duration-200"
              onClick={(e) => e.stopPropagation()}
              style={{ transform: `scale(${zoom})` }}
            >
              <img
                src={currentUrl}
                alt={`${title} - ${activeTab === 'drawing' ? 'CAD Drawing' : 'Product Photo'}`}
                className="max-w-[90vw] max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-slate-800 bg-slate-900/40 select-none"
              />
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 gap-3 py-16">
            <Boxes className="h-16 w-16" />
            <p className="text-sm font-semibold">{t.noMedia}</p>
          </div>
        )}
      </div>

      {/* Bottom Picture Strip (Both Pics Quick Switcher) */}
      {(hasDrawing || hasPhoto) && (
        <div
          className="bg-slate-900/90 border-t border-slate-800 px-6 py-3 flex items-center justify-center gap-4 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-bold text-slate-400 hidden sm:inline mr-2">
            {t.bothPics}:
          </span>

          {/* Pic 1 Thumbnail */}
          {hasDrawing && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('drawing');
                setZoom(1);
              }}
              className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border transition-all cursor-pointer ${
                activeTab === 'drawing'
                  ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0 border border-slate-700">
                {isPdf(drawingUrl) ? (
                  <FileText className="h-5 w-5 text-rose-400" />
                ) : (
                  <img src={drawingUrl!} alt="Pic 1" className="h-full w-full object-contain" />
                )}
              </div>
              <div className="text-left">
                <p
                  className={`text-xs font-extrabold ${activeTab === 'drawing' ? 'text-blue-400' : 'text-slate-300'}`}
                >
                  {lang === 'de' ? 'Bild 1: CAD Zeichnung' : 'Pic 1: CAD Drawing'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {isPdf(drawingUrl) ? 'PDF Document' : 'Schematic Image'}
                </p>
              </div>
            </button>
          )}

          {/* Pic 2 Thumbnail */}
          {hasPhoto && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('photo');
                setZoom(1);
              }}
              className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border transition-all cursor-pointer ${
                activeTab === 'photo'
                  ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0 border border-slate-700">
                {isPdf(photoUrl) ? (
                  <FileText className="h-5 w-5 text-rose-400" />
                ) : (
                  <img src={photoUrl!} alt="Pic 2" className="h-full w-full object-contain" />
                )}
              </div>
              <div className="text-left">
                <p
                  className={`text-xs font-extrabold ${activeTab === 'photo' ? 'text-blue-400' : 'text-slate-300'}`}
                >
                  {lang === 'de' ? 'Bild 2: Produktfoto' : 'Pic 2: Product Photo'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {isPdf(photoUrl) ? 'PDF Document' : 'Photo Render'}
                </p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
