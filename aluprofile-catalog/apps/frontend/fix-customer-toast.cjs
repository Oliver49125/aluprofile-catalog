const fs = require('fs');
let code = fs.readFileSync('src/CustomerPage.tsx', 'utf8');

code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1 } from 'lucide-react';\nimport toast from 'react-hot-toast';");

// Replace showMessage implementation
code = code.replace(/function showMessage[\s\S]*?setTimeout\(\(\) => setSectionMessage\(null\), 5000\);\n  }/, 
`function showMessage(text: string, type: 'error' | 'success' = 'error', section: 'global' | 'profile' | 'supplier' = 'global') {
    if (type === 'success') toast.success(text);
    else toast.error(text);
  }`);

// Remove message state hooks
code = code.replace(/const \[message, setMessage\] = useState<string>\(''\);\n/g, '');
code = code.replace(/const \[messageKind, setMessageKind\] = useState<'error' \| 'success'>\('error'\);\n/g, '');
code = code.replace(/.*const \[sectionMessage, setSectionMessage\].*\n/g, '');

// Remove all UI rendering of sectionMessage and message
code = code.replace(/.*\{sectionMessage\?\.section ===.*\n/g, '');
code = code.replace(/.*\{message && <div className="app-feedback app-feedback-error">\{message\}<\/div>\}.*\n/g, '');
code = code.replace(/.*\{message && <div className=\{`app-feedback \$\{messageKind === 'error' \? 'app-feedback-error' : 'app-feedback-success'\}`\}>\{message\}<\/div>\}.*\n/g, '');

// Replace window.alert
code = code.replace(/window\.alert\(([^)]+)\)/g, 'toast($1)');
code = code.replace(/alert\(([^)]+)\)/g, 'toast($1)');

fs.writeFileSync('src/CustomerPage.tsx', code);
console.log('Fixed CustomerPage.tsx');
