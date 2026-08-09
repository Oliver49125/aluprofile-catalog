const fs = require('fs');
let code = fs.readFileSync('src/AdminPage.tsx', 'utf8');

code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1 } from 'lucide-react';\nimport toast from 'react-hot-toast';");

// Replace showMessage implementation
code = code.replace(/function showMessage[\s\S]*?setTimeout\(\(\) => setSectionMessage\(null\), 5000\);\n  }/, 
`function showMessage(section: 'global' | 'profile' | 'application' | 'cross-section' | 'supplier' | 'user' | 'currency', text: string, type: 'success' | 'error') {
    if (type === 'success') toast.success(text);
    else toast.error(text);
  }`);

// Remove sectionMessage state
code = code.replace(/const \[sectionMessage, setSectionMessage\] = useState<[^>]+>\| null>\(null\);\n/, '');

// Remove UI rendering of sectionMessage
// It usually looks like:
// {sectionMessage && sectionMessage.section === '...' && (
//   <div className={`app-feedback ${sectionMessage.type === 'error' ? 'app-feedback-error' : 'app-feedback-success'}`}>
//     {sectionMessage.text}
//   </div>
// )}
code = code.replace(/\{sectionMessage && sectionMessage\.section === '[^']+' && \([\s\S]*?<\/div>\s*\)\}\n/g, '');

// Also search for window.alert(...) and replace with toast(...)
// e.g. alert(t.uploadError || 'Upload failed');
code = code.replace(/window\.alert\(([^)]+)\)/g, 'toast($1)');
code = code.replace(/alert\(([^)]+)\)/g, 'toast($1)');

fs.writeFileSync('src/AdminPage.tsx', code);
console.log('Fixed AdminPage.tsx');
