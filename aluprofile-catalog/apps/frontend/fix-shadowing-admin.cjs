const fs = require('fs');

let code = fs.readFileSync('src/AdminPage.tsx', 'utf8');

// The shadowed function is lines 548 to 559 in AdminPage.tsx. Let's just find "function parseApiError(error: unknown) {" and remove it until its closing brace.
const regex = /function parseApiError\(error: unknown\) \{[\s\S]*?return 'Authentication failed';\n  \}/;
code = code.replace(regex, '');

fs.writeFileSync('src/AdminPage.tsx', code);
console.log('Fixed shadowing completely in AdminPage.tsx');
