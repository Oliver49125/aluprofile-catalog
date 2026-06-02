import re

with open('apps/frontend/src/CustomerPage.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import React, { useEffect, useState, useMemo } from 'react';", "import React, { useEffect, useState, useMemo } from 'react';\nimport { parseApiError } from './utils/apiError';")

# Remove local parseApiError
local_parser_regex = r"function parseApiError\(error: unknown\) \{\n  if \(error instanceof Error\) return error\.message;\n  return typeof error === 'string' \? error : 'Request failed';\n\}\n\n"
content = re.sub(local_parser_regex, "", content)

# Add validation to saveSupplier
save_supplier_match = re.search(r'async function saveSupplier\(\) {\n\s*try \{', content)
if save_supplier_match:
    replacement = "async function saveSupplier() {\n    if (!supplierForm.name) { alert('Supplier name is required'); return; }\n    try {"
    content = content.replace(save_supplier_match.group(0), replacement)

# Add validation to saveProfile
save_profile_match = re.search(r'async function saveProfile\(\) {\n\s*setIsSaving', content)
if save_profile_match:
    replacement = "async function saveProfile() {\n    if (!profileForm.name) { showMessage('Profile name is required', 'error'); return; }\n    setIsSaving"
    content = content.replace(save_profile_match.group(0), replacement)

with open('apps/frontend/src/CustomerPage.tsx', 'w') as f:
    f.write(content)
print("Patched CustomerPage.tsx")
