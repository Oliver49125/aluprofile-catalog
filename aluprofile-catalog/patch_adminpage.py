import re

with open("apps/frontend/src/AdminPage.tsx", "r") as f:
    content = f.read()

# 1. Update AppPermission
content = content.replace(
    "  | 'PROFILES_MANAGE'\n  | 'CATEGORIES_MANAGE'",
    "  | 'PROFILES_MANAGE'\n  | 'SUPPLIERS_MANAGE'\n  | 'CATEGORIES_MANAGE'"
)

# 2. Add SupplierOption type
supplier_type = """type SupplierOption = {
  id: number;
  name: string;
  nameDe?: string;
  address?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  _count?: { profiles: number };
};
type Profile = {"""
content = content.replace("type Profile = {", supplier_type)

# 3. Add supplier to Profile type
content = content.replace(
    "status: string;\n\n  applications: RefOption[];",
    "status: string;\n  supplier?: SupplierOption;\n  applications: RefOption[];"
)

# 4. Translations EN
content = content.replace(
    "categories: 'Categories',",
    "categories: 'Categories',\n    suppliers: 'Suppliers',"
)
content = content.replace(
    "categoryControls: 'Category Controls',",
    "categoryControls: 'Category Controls',\n    supplierControls: 'Supplier Controls',\n    addSupplier: 'Add Supplier',\n    saveSupplier: 'Save Supplier',\n    address: 'Address',\n    contactPerson: 'Contact Person',\n    email: 'Email',\n    phone: 'Phone',\n    website: 'Website',\n    filterSuppliers: 'Filter suppliers',\n    supplier: 'Supplier',\n    selectSupplier: 'Select Supplier...',"
)

# 5. Translations DE
content = content.replace(
    "categories: 'Kategorien',",
    "categories: 'Kategorien',\n    suppliers: 'Lieferanten',"
)
content = content.replace(
    "categoryControls: 'Kategorienverwaltung',",
    "categoryControls: 'Kategorienverwaltung',\n    supplierControls: 'Lieferantenverwaltung',\n    addSupplier: 'Lieferant hinzufügen',\n    saveSupplier: 'Lieferant speichern',\n    address: 'Adresse',\n    contactPerson: 'Ansprechpartner',\n    email: 'E-Mail',\n    phone: 'Telefon',\n    website: 'Webseite',\n    filterSuppliers: 'Lieferanten filtern',\n    supplier: 'Lieferant',\n    selectSupplier: 'Lieferant auswählen...',"
)

# 6. activeSection state
content = content.replace(
    "useState<'overview' | 'profiles' | 'categories' | 'users' | 'roles'>('overview')",
    "useState<'overview' | 'profiles' | 'categories' | 'suppliers' | 'users' | 'roles'>('overview')"
)

# 7. adminRef state
content = content.replace(
    "applications: RefOption[];\n    crossSections: RefOption[];",
    "suppliers: SupplierOption[];\n    applications: RefOption[];\n    crossSections: RefOption[];"
)

# 8. States for suppliers
states = """  const [supplierFilter, setSupplierFilter] = useState('');
  const [supplierSort, setSupplierSort] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [supplierPage, setSupplierPage] = useState(1);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '', nameDe: '', address: '', contactPerson: '', email: '', phone: '', website: ''
  });
  const t = TXT[lang];"""
content = content.replace("  const t = TXT[lang];", states)

# 9. profileForm state
content = content.replace(
    "status: 'AVAILABLE',\n    applicationIds: []",
    "status: 'AVAILABLE',\n    supplierId: '' as string | number,\n    applicationIds: []"
)

# 10. permissions
perms = """  const canManageProfiles = permissions.includes('PROFILES_MANAGE');
  const canManageSuppliers = permissions.includes('SUPPLIERS_MANAGE');
  const canManageCategories = permissions.includes('CATEGORIES_MANAGE');

  useEffect(() => {
    const nextSection =
      canManageProfiles ? 'profiles' : canManageSuppliers ? 'suppliers' : canManageCategories ? 'categories' : canManageUsers ? 'users' : 'overview';

    if (activeSection === 'overview') return;
    if (activeSection === 'profiles' && canManageProfiles) return;
    if (activeSection === 'suppliers' && canManageSuppliers) return;
    if (activeSection === 'categories' && canManageCategories) return;
    if ((activeSection === 'users' || activeSection === 'roles') && canManageUsers) return;

    setActiveSection(nextSection);
  }, [activeSection, canManageCategories, canManageProfiles, canManageUsers, canManageSuppliers]);"""

content = re.sub(r"const canManageProfiles = .*?\]\);", perms, content, flags=re.DOTALL)

# 11. supplier functions
funcs = """  function resetSupplierForm() {
    setSupplierForm({ name: '', nameDe: '', address: '', contactPerson: '', email: '', phone: '', website: '' });
    setEditType('');
    setEditId(null);
    setShowSupplierForm(false);
  }

  function startEditSupplier(supplier: SupplierOption) {
    setEditType('supplier');
    setEditId(supplier.id);
    setSupplierForm({
      name: supplier.name,
      nameDe: supplier.nameDe ?? '',
      address: supplier.address ?? '',
      contactPerson: supplier.contactPerson ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      website: supplier.website ?? '',
    });
    setShowSupplierForm(true);
  }

  async function saveSupplier() {
    if (!supplierForm.name) return;
    try {
      const method = editType === 'supplier' && editId ? 'PUT' : 'POST';
      const path = method === 'PUT' ? '/admin/suppliers/' + editId : '/admin/suppliers';
      await api(path, { method, body: JSON.stringify(supplierForm) }, true);
      resetSupplierForm();
      setSupplierPage(1);
      await adminLoad();
      showMessage('Supplier saved successfully', 'success');
    } catch (error) {
      showMessage(String(error), 'error');
    }
  }

  function resetApplicationForm"""
content = content.replace("  function resetApplicationForm", funcs)

# profile form startEditProfile
content = content.replace(
    "status: profile.status ?? 'AVAILABLE',\n      applicationIds:",
    "status: profile.status ?? 'AVAILABLE',\n      supplierId: profile.supplier?.id || '',\n      applicationIds:"
)

# 12. Tabs navigation
tabs_old = """                {canManageCategories && (
                  <button
                    onClick={() => setActiveSection('categories')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      activeSection === 'categories' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="h-4 w-4" />
                    {t.categories}
                  </button>
                )}"""
tabs_new = tabs_old + """
                {canManageSuppliers && (
                  <button
                    onClick={() => setActiveSection('suppliers')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      activeSection === 'suppliers' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Boxes className="h-4 w-4" />
                    {t.suppliers}
                  </button>
                )}"""
content = content.replace(tabs_old, tabs_new)

# 13. Render suppliers section
suppliers_section = """            {activeSection === 'suppliers' && canManageSuppliers && (
              <div className="space-y-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-xl font-bold text-slate-900">{t.supplierControls}</h2>
                  <Button onClick={() => { resetSupplierForm(); setShowSupplierForm(true); }} className="gap-2">
                    <span className="text-lg leading-none">+</span> {t.addSupplier}
                  </Button>
                </div>

                <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <Input
                        placeholder={t.filterSuppliers}
                        value={supplierFilter}
                        onChange={(e) => { setSupplierFilter(e.target.value); setSupplierPage(1); }}
                        className="max-w-xs"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="p-4 font-semibold">{t.name}</th>
                            <th className="p-4 font-semibold">{t.contactPerson}</th>
                            <th className="p-4 font-semibold">{t.email}</th>
                            <th className="p-4 font-semibold text-right">{t.actions}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(adminRef?.suppliers || []).filter(s => normalizeForSearch(s.name).includes(normalizeForSearch(supplierFilter))).slice((supplierPage - 1) * PAGE_SIZE, supplierPage * PAGE_SIZE).map((item) => (
                            <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
                              <td className="p-4 font-medium text-slate-900">{item.name}</td>
                              <td className="p-4 text-slate-600">{item.contactPerson || '-'}</td>
                              <td className="p-4 text-slate-600">{item.email || '-'}</td>
                              <td className="p-4 text-right">
                                <Button variant="ghost" size="sm" onClick={() => startEditSupplier(item)} className="text-primary hover:bg-primary/10 hover:text-primary">
                                  {t.edit}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteItem('/admin/suppliers/' + item.id)} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                  {t.delete}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {showSupplierForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h3 className="text-lg font-semibold text-slate-900">{editType === 'supplier' ? t.edit : t.addSupplier}</h3>
                        <button onClick={resetSupplierForm} className="text-slate-400 hover:text-slate-600">×</button>
                      </div>
                      <div className="space-y-4 p-6">
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.name} *</label><Input value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.name} (DE)</label><Input value={supplierForm.nameDe} onChange={e => setSupplierForm(f => ({ ...f, nameDe: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.contactPerson}</label><Input value={supplierForm.contactPerson} onChange={e => setSupplierForm(f => ({ ...f, contactPerson: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.email}</label><Input value={supplierForm.email} onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.phone}</label><Input value={supplierForm.phone} onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.website}</label><Input value={supplierForm.website} onChange={e => setSupplierForm(f => ({ ...f, website: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.address}</label><Input value={supplierForm.address} onChange={e => setSupplierForm(f => ({ ...f, address: e.target.value }))} /></div>
                        <Button onClick={saveSupplier} className="w-full" disabled={!supplierForm.name}>{t.saveSupplier}</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}"""
content = content.replace("            {activeSection === 'categories'", suppliers_section + "\n            {activeSection === 'categories'")

# 14. profileForm dropdown for supplier
profile_supplier_select = """
                            <div>
                              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.supplier}</label>
                              <select
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={profileForm.supplierId}
                                onChange={(e) => setProfileForm({ ...profileForm, supplierId: e.target.value ? Number(e.target.value) : '' })}
                              >
                                <option value="">{t.selectSupplier}</option>
                                {(adminRef?.suppliers || []).map((s) => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                            </div>"""

content = content.replace("<div>\n                              <label className=\"mb-1.5 block text-sm font-medium text-slate-700\">{t.status}</label>", profile_supplier_select + "\n                            <div>\n                              <label className=\"mb-1.5 block text-sm font-medium text-slate-700\">{t.status}</label>")

with open("apps/frontend/src/AdminPage.tsx", "w") as f:
    f.write(content)
