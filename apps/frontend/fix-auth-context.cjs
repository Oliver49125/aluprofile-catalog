const fs = require('fs');

let code = fs.readFileSync('src/AdminPage.tsx', 'utf8');

// Remove authContext state
code = code.replace(/const \[authContext, setAuthContext\] = useState<AuthContext \| null>\(null\);\n/g, '');

// Remove loadAuthContext function
code = code.replace(/async function loadAuthContext\(\) \{[\s\S]*?\}\n\n/g, '');

// Remove loadAuthContext call from useEffect
code = code.replace(/loadAuthContext\(\)\.catch\(\(err\) => showMessage\(String\(err\), 'error'\)\);\n/g, '');

fs.writeFileSync('src/AdminPage.tsx', code);
console.log('Fixed authContext in AdminPage.tsx');
