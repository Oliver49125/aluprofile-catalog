import re

with open('apps/frontend/src/AdminPage.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import React, { useEffect, useState, useMemo } from 'react';", "import React, { useEffect, useState, useMemo } from 'react';\nimport { parseApiError } from './utils/apiError';")

# Replace String(error) with parseApiError(error)
content = content.replace("showMessage(String(error), 'error');", "showMessage(parseApiError(error), 'error');")

# Add validation messages
content = content.replace("if (!supplierForm.name) return;", "if (!supplierForm.name) { showMessage('Supplier name is required', 'error'); return; }")
content = content.replace("if (!applicationName) return;", "if (!applicationName) { showMessage('Application name is required', 'error'); return; }")
content = content.replace("if (!crossSectionName) return;", "if (!crossSectionName) { showMessage('Cross-section name is required', 'error'); return; }")
content = content.replace("if (!userAccessForm.clerkUserId.trim()) return;", "if (!userAccessForm.clerkUserId.trim()) { showMessage('Clerk User ID is required', 'error'); return; }")

# Add validation to saveProfile
save_profile_match = re.search(r'async function saveProfile\(\) {\n\s*try \{', content)
if save_profile_match:
    replacement = "async function saveProfile() {\n    if (!profileForm.name) { showMessage('Profile name is required', 'error'); return; }\n    try {"
    content = content.replace(save_profile_match.group(0), replacement)

with open('apps/frontend/src/AdminPage.tsx', 'w') as f:
    f.write(content)
print("Patched AdminPage.tsx")
