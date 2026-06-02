with open('apps/frontend/src/App.tsx', 'r') as f: content = f.read()
if "import { parseApiError }" not in content:
    content = "import { parseApiError } from './utils/apiError';\n" + content
    with open('apps/frontend/src/App.tsx', 'w') as f: f.write(content)

with open('apps/frontend/src/ClerkUsersPanel.tsx', 'r') as f: content = f.read()
if "import { parseApiError }" not in content:
    content = "import { parseApiError } from './utils/apiError';\n" + content
    with open('apps/frontend/src/ClerkUsersPanel.tsx', 'w') as f: f.write(content)
