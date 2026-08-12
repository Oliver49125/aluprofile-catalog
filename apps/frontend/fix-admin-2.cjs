const fs = require('fs');

let admin = fs.readFileSync('src/AdminPage.tsx', 'utf8');

// fix setSupplierForm missing uid
admin = admin.replace(/setSupplierForm\(\{ name: '', nameDe: '', address: '', contactPerson: '', email: '', phone: '', website: '' \}\)/g, "setSupplierForm({ name: '', nameDe: '', address: '', contactPerson: '', email: '', phone: '', website: '', uid: '' })");

// fix Sort types
admin = admin.replace(/const \[applicationSort, setApplicationSort\] = useState<'name-asc' \| 'name-desc'>/g, "const [applicationSort, setApplicationSort] = useState<string>");
admin = admin.replace(/const \[crossSectionSort, setCrossSectionSort\] = useState<'name-asc' \| 'name-desc'>/g, "const [crossSectionSort, setCrossSectionSort] = useState<string>");
admin = admin.replace(/const \[profileSort, setProfileSort\] = useState<'name-asc' \| 'name-desc'>/g, "const [profileSort, setProfileSort] = useState<string>");

// fix deleteItem signature
admin = admin.replace(/deleteItem\(url: string, section: 'application' \| 'profile' \| 'supplier' \| 'cross-section'\)/g, "deleteItem(url: string, section: 'application' | 'profile' | 'supplier' | 'cross-section' | 'currency')");

fs.writeFileSync('src/AdminPage.tsx', admin, 'utf8');
console.log('Fixed AdminPage');

let clerk = fs.readFileSync('src/ClerkUsersPanel.tsx', 'utf8');
clerk = clerk.replace(/msg/g, 'message');
clerk = clerk.replace(/message: parseApiError\(err\)/g, 'message: parseApiError(err)');
fs.writeFileSync('src/ClerkUsersPanel.tsx', clerk, 'utf8');
console.log('Fixed ClerkUsersPanel');
