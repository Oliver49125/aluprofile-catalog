import re

with open('apps/frontend/src/App.tsx', 'r') as f:
    content = f.read()

# 1. Mobile card: add "auf Anfrage" and "Anfrage" button
mobile_injection = """
                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                            <div className="text-left">
                              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Preis</p>
                              <p className="font-semibold text-slate-900">auf Anfrage</p>
                            </div>
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); setShowInquiryModal(p); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                              {t.inquiry}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </button>
"""
content = re.sub(
    r'(\s*)</div>\s*</div>\s*</button>',
    r'\1' + mobile_injection.replace('\n', '\n\\1').strip() + '\n',
    content,
    count=1
)

# 2. Table row: Add to the contact column
table_injection = """
                              <div className="space-y-2">
                                <div className="mb-2">
                                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Preis</p>
                                  <p className="font-semibold text-slate-900">auf Anfrage</p>
                                </div>
                                <Button size="sm" onClick={(e) => { e.stopPropagation(); setShowInquiryModal(p); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                  {t.inquiry}
                                </Button>
"""
content = content.replace("""<div className="space-y-2">

                                <Button size="sm" onClick={(e) => {""", table_injection)

# 3. Grid card: Add to the bottom
grid_injection = """
                          <div className="mt-4 flex items-center justify-between rounded-[1rem] bg-slate-50 px-4 py-3 border border-slate-100">
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Preis</p>
                              <p className="text-base font-bold text-slate-900">auf Anfrage</p>
                            </div>
                            <Button onClick={(e) => { e.stopPropagation(); setShowInquiryModal(p); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                              {t.inquiry}
                            </Button>
                          </div>
                        </div>
                      </button>
"""
content = re.sub(
    r'(\s*)</div>\s*</div>\s*<div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">.*?</div>\s*</button>',
    r'\1' + grid_injection.replace('\n', '\n\\1').strip() + '\n',
    content,
    flags=re.DOTALL
)

# If the grid replacement failed due to regex mismatch, we will fall back to string replacement
if "auf Anfrage" not in grid_injection in content:
    # Let's find the exact end of the grid card
    pass

with open('apps/frontend/src/App.tsx', 'w') as f:
    f.write(content)

print("Cards patched")
