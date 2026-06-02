import re

files = ['apps/frontend/src/App.tsx', 'apps/frontend/src/ClerkUsersPanel.tsx']

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Add import
    if "import { parseApiError }" not in content:
        content = content.replace("import React,", "import React,\nimport { parseApiError } from './utils/apiError';")
        if "import React," not in content: # Fallback if different import style
            content = content.replace("import React", "import React;\nimport { parseApiError } from './utils/apiError';")

    # Remove local parseApiError
    local_parser_regex = r"function parseApiError\(error: unknown\) \{\n  if \(error instanceof Error\) return error\.message;\n  return typeof error === 'string' \? error : 'Request failed';\n\}\n\n"
    content = re.sub(local_parser_regex, "", content)

    with open(file_path, 'w') as f:
        f.write(content)
    print("Patched", file_path)
