const fs = require('fs');

let adminCode = fs.readFileSync('src/AdminPage.tsx', 'utf8');
adminCode = adminCode.replace(/const deleteItem = async \(path: string, section: 'profile' \| 'application' \| 'cross-section' \| 'supplier' \| 'currency'\) => \{/g, 'const deleteItem = async (path: string) => {');
adminCode = adminCode.replace(/deleteItem\(([^,]+), '[^']+'\)/g, 'deleteItem($1)');
fs.writeFileSync('src/AdminPage.tsx', adminCode);

console.log('Fixed AdminPage');
