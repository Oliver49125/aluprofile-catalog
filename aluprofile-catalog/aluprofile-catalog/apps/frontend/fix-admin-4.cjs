const fs = require('fs');
let admin = fs.readFileSync('src/AdminPage.tsx', 'utf8');

admin = admin.replace(/const profileRows = paginateItems\(filteredProfiles, profilePage\);/g, "const profileRows = paginateItems(filteredProfiles, profilePage);\n  const currencyRows = paginateItems(filteredCurrencies, currencyPage);");

fs.writeFileSync('src/AdminPage.tsx', admin, 'utf8');
console.log('Added currencyRows');
