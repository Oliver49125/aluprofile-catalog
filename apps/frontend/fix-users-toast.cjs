const fs = require('fs');
let code = fs.readFileSync('src/ClerkUsersPanel.tsx', 'utf8');

code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1 } from 'lucide-react';\nimport toast from 'react-hot-toast';");

// Remove ToastState type definition
code = code.replace(/type ToastState = \{ message: string; type: 'success' \| 'error' \};\n/, '');

// Remove toast state hook
code = code.replace(/const \[toast, setToast\] = useState<ToastState \| null>\(null\);\n/, '');

// Replace showToast function
code = code.replace(/function showToast\(message: string, type: 'success' \| 'error'\) \{[\s\S]*?setTimeout\(\(\) => setToast\(null\), 4500\);\n  }/,
`function showToast(message: string, type: 'success' | 'error') {
    if (type === 'success') toast.success(message);
    else toast.error(message);
  }`);

// Remove UI rendering of toast
// {toast && (
//   <div className={`app-feedback ${toast.type === 'error' ? 'app-feedback-error' : 'app-feedback-success'}`}>
//     {toast.message}
//   </div>
// )}
code = code.replace(/\{toast && \([\s\S]*?<\/div>\s*\)\}\n/g, '');

// Also replace alerts
code = code.replace(/window\.alert\(([^)]+)\)/g, 'toast($1)');
code = code.replace(/alert\(([^)]+)\)/g, 'toast($1)');

fs.writeFileSync('src/ClerkUsersPanel.tsx', code);
console.log('Fixed ClerkUsersPanel.tsx');
