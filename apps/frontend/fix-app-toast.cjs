const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1 } from 'lucide-react';\nimport toast from 'react-hot-toast';");

// Remove message state hooks
code = code.replace(/const \[message, setMessage\] = useState<string>\(''\);\n/g, '');

// Find instances of setMessage(...) and replace with toast(...)
// Sometimes it's setMessage(parseApiError(err));
// We replace with toast.error(parseApiError(err))
code = code.replace(/setMessage\(([^)]+)\)/g, "toast.error($1)");

// Find cases where we explicitly show success message, wait App.tsx only has error setMessage mostly.
// Let's check window.alert and alert
code = code.replace(/window\.alert\(([^)]+)\)/g, 'toast($1)');
code = code.replace(/alert\(([^)]+)\)/g, 'toast($1)');

// Remove UI rendering of message
code = code.replace(/.*\{message && <div className="app-feedback app-feedback-error">\{message\}<\/div>\}.*\n/g, '');

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed App.tsx');
