const fs = require('fs');

function fix(filename) {
  let code = fs.readFileSync(filename, 'utf8');
  code = code.replace(/showMessage\(([^,]+), ([^,]+), [^)]+\)/g, "showMessage($1, $2)");
  fs.writeFileSync(filename, code);
  console.log('Fixed args', filename);
}

fix('src/AdminPage.tsx');
fix('src/CustomerPage.tsx');
