const fs = require('fs');

let customerCode = fs.readFileSync('src/CustomerPage.tsx', 'utf8');
customerCode = customerCode.replace(/window\.history\.replaceState\(null\);/g, "window.history.replaceState(null, '', window.location.pathname);");
fs.writeFileSync('src/CustomerPage.tsx', customerCode);
console.log('Fixed replaceState');
