const fs = require('fs');
let code = fs.readFileSync('src/AdminPage.tsx', 'utf8');

// Remove the useState line
code = code.replace(/.*const \[sectionMessage, setSectionMessage\].*\n/g, '');

// Remove all rendering lines like `{sectionMessage?.section === ...}`
code = code.replace(/.*\{sectionMessage\?\.section ===.*\n/g, '');

fs.writeFileSync('src/AdminPage.tsx', code);
console.log('Fixed AdminPage.tsx again');
