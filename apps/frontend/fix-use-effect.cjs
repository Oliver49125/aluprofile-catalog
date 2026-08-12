const fs = require('fs');

let code = fs.readFileSync('src/AdminPage.tsx', 'utf8');

// Fix adminLoad useEffect
code = code.replace(/useEffect\(\(\) => \{\n\s*adminLoad\(\)\.catch\(\(err\) => canViewAdmin && showMessage\(String\(err\), 'error'\)\);\n\s*\}\);/g, `useEffect(() => {
    adminLoad().catch((err) => canViewAdmin && showMessage(String(err), 'error'));
  }, [canViewAdmin]);`);

// Fix loadUsers useEffect
code = code.replace(/useEffect\(\(\) => \{\n\s*loadUsers\(\)\.catch\(\(err\) => canManageUsers && showMessage\(String\(err\), 'error'\)\);\n\s*\}\);/g, `useEffect(() => {
    loadUsers().catch((err) => canManageUsers && showMessage(String(err), 'error'));
  }, [canManageUsers]);`);

fs.writeFileSync('src/AdminPage.tsx', code);
console.log('Fixed useEffect infinite loop in AdminPage.tsx');
