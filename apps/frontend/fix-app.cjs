const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace the clerk import with useAuth
content = content.replace(/import { SignedIn, UserButton } from '@clerk\/clerk-react';\n/g, "import { useAuth } from './AuthContext';\nimport { LogOut } from 'lucide-react';\n");

// Inside App component, we need to call useAuth.
content = content.replace(/function App\(\) {/g, "function App() {\n  const { token, logout } = useAuth();");

// Replace <SignedIn> ... </SignedIn> blocks with {!!token && ( ... )}
// the first block is:
//                 <SignedIn>
//                   <a href="/admin">
//                     <Button className="h-12 rounded-full px-6" variant="secondary">{t.adminPanel}</Button>
//                   </a>
//                 </SignedIn>
content = content.replace(/<SignedIn>([\s\S]*?)<\/SignedIn>/g, "{!!token && ($1)}");

// Replace <UserButton /> with a custom logout button
content = content.replace(/<UserButton \/>/g, '<button onClick={() => logout()} title="Logout" className="flex items-center justify-center p-2 text-slate-600 hover:text-slate-900"><LogOut className="h-5 w-5" /></button>');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed App.tsx');
