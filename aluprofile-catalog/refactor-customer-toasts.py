import re

with open('apps/frontend/src/CustomerPage.tsx', 'r') as f:
    content = f.read()

# 1. Add toast states
state_addition = """
  const [supplierToast, setSupplierToast] = useState<{text: string, kind: 'success' | 'error'} | null>(null);
  const [profileToast, setProfileToast] = useState<{text: string, kind: 'success' | 'error'} | null>(null);

  function showSupplierToast(text: string, kind: 'error' | 'success' = 'error') {
    setSupplierToast({ text, kind });
    setTimeout(() => setSupplierToast(null), 4500);
  }

  function showProfileToast(text: string, kind: 'error' | 'success' = 'error') {
    setProfileToast({ text, kind });
    setTimeout(() => setProfileToast(null), 4500);
  }
"""
content = content.replace("function showMessage(text: string, kind: 'error' | 'success' = 'error') {", state_addition + "\n  function showMessage(text: string, kind: 'error' | 'success' = 'error') {")

# 2. Replace showMessage in saveSupplier
save_supplier_match = re.search(r'async function saveSupplier\(\) \{.*?\n\s*\}\s*async function saveProfile', content, re.DOTALL)
if save_supplier_match:
    save_supplier_code = save_supplier_match.group(0).replace("showMessage", "showSupplierToast")
    content = content.replace(save_supplier_match.group(0), save_supplier_code)

# 3. Replace showMessage in saveProfile and deleteProfile
save_profile_match = re.search(r'async function saveProfile\(\) \{.*?\}\s*const pagedProfiles', content, re.DOTALL)
if save_profile_match:
    save_profile_code = save_profile_match.group(0).replace("showMessage", "showProfileToast")
    content = content.replace(save_profile_match.group(0), save_profile_code)

# 4. Insert toasts into JSX
supplier_jsx_injection = """<CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/70">
              <CardTitle className="text-xl font-semibold tracking-[-0.02em] text-slate-950">{t.companyProfile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {supplierToast && <div className={`app-feedback ${supplierToast.kind === 'error' ? 'app-feedback-error' : 'app-feedback-success'}`}>{supplierToast.text}</div>}"""
content = content.replace("""<CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/70">
              <CardTitle className="text-xl font-semibold tracking-[-0.02em] text-slate-950">{t.companyProfile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">""", supplier_jsx_injection)


profile_jsx_injection = """<CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/70">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold tracking-[-0.02em] text-slate-950">{t.technicalProfiles}</CardTitle>
                <Button variant="outline" size="sm" onClick={resetProfileForm}>{t.addProfile}</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {profileToast && <div className={`app-feedback ${profileToast.kind === 'error' ? 'app-feedback-error' : 'app-feedback-success'}`}>{profileToast.text}</div>}"""
content = content.replace("""<CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/70">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold tracking-[-0.02em] text-slate-950">{t.technicalProfiles}</CardTitle>
                <Button variant="outline" size="sm" onClick={resetProfileForm}>{t.addProfile}</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">""", profile_jsx_injection)


with open('apps/frontend/src/CustomerPage.tsx', 'w') as f:
    f.write(content)
print("Patched CustomerPage.tsx")
