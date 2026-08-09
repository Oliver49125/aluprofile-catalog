const fs = require('fs');

let adminCode = fs.readFileSync('src/AdminPage.tsx', 'utf8');
adminCode = adminCode.replace(/async function deleteItem\(id: number, type: string, section\?: string\) \{/g, 'async function deleteItem(id: number, type: string) {');
adminCode = adminCode.replace(/async function deleteItem\(id: number, type: string, section: string\) \{/g, 'async function deleteItem(id: number, type: string) {');
fs.writeFileSync('src/AdminPage.tsx', adminCode);

let customerCode = fs.readFileSync('src/CustomerPage.tsx', 'utf8');
// Find showMessage('Passwords do not match')
customerCode = customerCode.replace(/showMessage\('Passwords do not match'\)/g, "showMessage('Passwords do not match', 'error')");
fs.writeFileSync('src/CustomerPage.tsx', customerCode);
