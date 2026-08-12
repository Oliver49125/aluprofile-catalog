const fs = require('fs');

let adminCode = fs.readFileSync('src/AdminPage.tsx', 'utf8');

// Replace showMessage(parseAuthError(error)) with showMessage(parseApiError(error))
adminCode = adminCode.replace(/parseAuthError/g, 'parseApiError');

// Remove parseAuthError function if it exists
adminCode = adminCode.replace(/function parseAuthError\([\s\S]*?return String\(error\);\n  \}/, '');

fs.writeFileSync('src/AdminPage.tsx', adminCode);

let customerCode = fs.readFileSync('src/CustomerPage.tsx', 'utf8');
customerCode = customerCode.replace(/parseAuthError/g, 'parseApiError');
customerCode = customerCode.replace(/function parseAuthError\([\s\S]*?return String\(error\);\n  \}/, '');
fs.writeFileSync('src/CustomerPage.tsx', customerCode);

console.log('Fixed parseAuthError in pages');
