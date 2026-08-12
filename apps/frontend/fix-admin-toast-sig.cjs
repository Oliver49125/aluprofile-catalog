const fs = require('fs');
let code = fs.readFileSync('src/AdminPage.tsx', 'utf8');

code = code.replace(/function showMessage\(section: 'global' \| 'profile' \| 'application' \| 'cross-section' \| 'supplier' \| 'user' \| 'currency', text: string, type: 'success' \| 'error'\) \{/g,
"function showMessage(text: string, type: 'success' | 'error' = 'error', section?: string) {");

fs.writeFileSync('src/AdminPage.tsx', code);
console.log('Fixed signature in AdminPage.tsx');
