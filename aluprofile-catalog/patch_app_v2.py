import re

with open("apps/frontend/src/App.tsx", "r") as f:
    content = f.read()

# 1. Imports
content = content.replace("  ExternalLink,\n", "  ExternalLink,\n  Phone,\n  Mail,\n  Globe,\n  User,\n")

# 2. SupplierOption type
content = content.replace(
    "status: string;\n\n  applications: RefOption[];",
    "status: string;\n  supplier?: {\n    id: number;\n    name: string;\n    nameDe?: string;\n    contactPerson?: string;\n    email?: string;\n    phone?: string;\n    website?: string;\n  };\n  applications: RefOption[];"
)

# 3. Translations
content = content.replace(
    "contactSeller: 'Contact Seller',",
    "supplierAndFiles: 'Supplier & Files',\n    contactPerson: 'Contact Person',\n    website: 'Website',\n    contactSeller: 'Contact Seller',"
)
content = content.replace(
    "contactSeller: 'Verkäufer kontaktieren',",
    "supplierAndFiles: 'Lieferant & Dateien',\n    contactPerson: 'Ansprechpartner',\n    website: 'Webseite',\n    contactSeller: 'Verkäufer kontaktieren',"
)
content = content.replace(
    "openDrawing: 'Zeichnung offnen',",
    "openDrawing: 'Zeichnung öffnen',"
)
content = content.replace(
    "openPhoto: 'Foto offnen',",
    "openPhoto: 'Foto öffnen',"
)

# 4. State
content = content.replace(
    "const [showInquiryModal, setShowInquiryModal] = useState<Profile | null>(null);",
    "const [showInquiryModal, setShowInquiryModal] = useState<Profile | null>(null);\n  const [selectedImage, setSelectedImage] = useState<string | null>(null);"
)

# 5. Image lightbox handler helper
helper = """  function handleImageClick(url?: string) {
    if (!url || !safeUrl(url)) return;
    if (url.toLowerCase().endsWith('.pdf')) {
      window.open(url, '_blank');
    } else {
      setSelectedImage(url);
    }
  }
"""
content = content.replace("  useEffect(() => {\n    if (detailId)", helper + "\n  useEffect(() => {\n    if (detailId)")

# 6. Make thumbnails clickable
content = content.replace(
    '<img src={item.drawingUrl} alt={`${item.name} drawing`} className="public-media-fit" />',
    '<img src={item.drawingUrl} alt={`${item.name} drawing`} className="public-media-fit cursor-pointer transition-transform hover:scale-105" onClick={(e) => { e.stopPropagation(); handleImageClick(item.drawingUrl); }} />'
)
content = content.replace(
    '<img src={detail.drawingUrl} alt={`${detail.name} drawing`} className="public-media-fit" />',
    '<img src={detail.drawingUrl} alt={`${detail.name} drawing`} className="public-media-fit cursor-pointer transition-transform hover:scale-105" onClick={() => handleImageClick(detail.drawingUrl)} />'
)

# 7. Update bottom buttons directly
old_buttons = """                        {safeUrl(detail.drawingUrl) && (
                          <a href={detail.drawingUrl} target="_blank" rel="noreferrer">
                            <Button className="w-full justify-between" variant="outline">{t.openDrawing} <ExternalLink className="h-4 w-4" /></Button>
                          </a>
                        )}
                        {safeUrl(detail.photoUrl) && (
                          <a href={detail.photoUrl} target="_blank" rel="noreferrer">
                            <Button className="w-full justify-between" variant="outline">{t.openPhoto} <ExternalLink className="h-4 w-4" /></Button>
                          </a>
                        )}"""

new_buttons = """                        {safeUrl(detail.drawingUrl) && (
                          <Button className="w-full justify-between" variant="outline" onClick={() => handleImageClick(detail.drawingUrl)}>{t.openDrawing} <ExternalLink className="h-4 w-4" /></Button>
                        )}
                        {safeUrl(detail.photoUrl) && (
                          <Button className="w-full justify-between" variant="outline" onClick={() => handleImageClick(detail.photoUrl)}>{t.openPhoto} <ExternalLink className="h-4 w-4" /></Button>
                        )}"""

content = content.replace(old_buttons, new_buttons)

# 8. Add Lieferant & Dateien section before Linked Categories
supplier_section = """
                  <div className="public-detail-sheet overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">{t.supplierAndFiles}</div>
                    <div className="space-y-4 p-5 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {detail.supplier && (
                          <div className="rounded-2xl border border-primary/10 bg-primary/[0.04] p-4 text-slate-700 sm:col-span-2 space-y-2">
                            <p className="text-base font-medium text-slate-900">{detail.supplier.name}</p>
                            {detail.supplier.contactPerson && <p className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400" /> {detail.supplier.contactPerson}</p>}
                            {detail.supplier.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {detail.supplier.phone}</p>}
                            {detail.supplier.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> <a href={`mailto:${detail.supplier.email}`} className="text-primary hover:underline">{detail.supplier.email}</a></p>}
                            {detail.supplier.website && <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-400" /> <a href={detail.supplier.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{detail.supplier.website}</a></p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
"""

content = content.replace('<div className="public-detail-sheet overflow-hidden">\n                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">{t.linkedCategories}</div>', supplier_section + '\n                  <div className="public-detail-sheet overflow-hidden">\n                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">{t.linkedCategories}</div>')

# 9. Render Image Lightbox Modal at the bottom
lightbox_modal = """
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-md" onClick={() => setSelectedImage(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors" onClick={() => setSelectedImage(null)}>
            <X className="h-6 w-6" />
          </button>
          <img src={selectedImage} alt="Fullscreen view" className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
"""
content = content.replace("    </div>\n  );\n}\n\nexport default App;", lightbox_modal + "\n    </div>\n  );\n}\n\nexport default App;")

with open("apps/frontend/src/App.tsx", "w") as f:
    f.write(content)
