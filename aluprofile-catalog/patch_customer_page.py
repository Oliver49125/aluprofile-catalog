import re

with open("apps/frontend/src/CustomerPage.tsx", "r") as f:
    content = f.read()

# 1. Add translations
content = content.replace("    actions: 'Actions',", "    actions: 'Actions',\n    companyProfile: 'Company Profile',\n    companyAddress: 'Company Address',\n    contactPerson: 'Contact Person',\n    phone: 'Phone',\n    website: 'Website',")
content = content.replace("    actions: 'Aktionen',", "    actions: 'Aktionen',\n    companyProfile: 'Firmenprofil',\n    companyAddress: 'Firmenadresse',\n    contactPerson: 'Ansprechpartner',\n    phone: 'Telefon',\n    website: 'Webseite',")

# 2. Add Supplier type and state
state_code = """
  const [supplierForm, setSupplierForm] = useState({
    name: '', nameDe: '', address: '', contactPerson: '', email: '', phone: '', website: ''
  });
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);

  const [profiles, setProfiles] = useState<Profile[]>([]);
"""
content = content.replace("  const [profiles, setProfiles] = useState<Profile[]>([]);", state_code)

# 3. Add fetching logic inside fetchProfiles
fetch_logic = """
  const fetchProfiles = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE}/customer/profiles`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setProfiles(Array.isArray(data) ? data : []);

      const supRes = await fetch(`${API_BASE}/customer/supplier`, { headers: { Authorization: `Bearer ${token}` } });
      if (supRes.ok) {
        const supData = await supRes.json();
        if (supData) {
          setSupplierForm({
            name: supData.name || '',
            nameDe: supData.nameDe || '',
            address: supData.address || '',
            contactPerson: supData.contactPerson || '',
            email: supData.email || '',
            phone: supData.phone || '',
            website: supData.website || '',
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
"""
content = re.sub(r'  const fetchProfiles = async \(\) => \{[\s\S]*?\}\n    \} catch \(e\) \{\n      console.error\(e\);\n    \}\n  \};', fetch_logic.strip('\n'), content)

# 4. Add saveSupplier logic
save_supplier_code = """
  const saveSupplier = async () => {
    try {
      setIsSavingSupplier(true);
      const token = await getToken();
      await fetch(`${API_BASE}/customer/supplier`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(supplierForm),
      });
      alert('Saved!');
    } catch (e) {
      console.error(e);
      alert('Failed to save supplier profile');
    } finally {
      setIsSavingSupplier(false);
    }
  };

  const saveProfile = async () => {
"""
content = content.replace("  const saveProfile = async () => {", save_supplier_code.strip('\n'))

# 5. Add UI section above profiles Card
ui_code = """
            <Card className="material-panel">
              <CardHeader className="border-b border-slate-200/80">
                <CardTitle className="flex items-center gap-3"><UserRoundPlus className="h-5 w-5 text-teal-700" /> {t.companyProfile}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="admin-editor-grid">
                  <Input placeholder={t.name + ' (EN)'} value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
                  <Input placeholder={t.name + ' (DE)'} value={supplierForm.nameDe} onChange={(e) => setSupplierForm({ ...supplierForm, nameDe: e.target.value })} />
                  <Input placeholder={t.companyAddress} value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} />
                  <Input placeholder={t.contactPerson} value={supplierForm.contactPerson} onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })} />
                  <Input placeholder={t.emailAddress} value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} />
                  <Input placeholder={t.phone} value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
                  <Input placeholder={t.website} value={supplierForm.website} onChange={(e) => setSupplierForm({ ...supplierForm, website: e.target.value })} />
                  <div className="md:col-span-2 flex justify-end">
                    <Button onClick={saveSupplier} disabled={isSavingSupplier}>{isSavingSupplier ? '...' : t.saveProfile.replace('Profile', '')}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="material-panel">
              <CardHeader className="border-b border-slate-200/80">
"""
content = content.replace("""            <Card className="material-panel">
              <CardHeader className="border-b border-slate-200/80">""", ui_code.strip('\n'))

with open("apps/frontend/src/CustomerPage.tsx", "w") as f:
    f.write(content)
