const fs = require('fs');

let admin = fs.readFileSync('src/AdminPage.tsx', 'utf8');
admin = admin.replace(/deleteItem\(url: string, section: 'application' \| 'profile' \| 'supplier' \| 'cross-section'\)/g, "deleteItem(url: string, section: 'application' | 'profile' | 'supplier' | 'cross-section' | 'currency')");
fs.writeFileSync('src/AdminPage.tsx', admin, 'utf8');

let clerk = fs.readFileSync('src/ClerkUsersPanel.tsx', 'utf8');
clerk = clerk.replace(/const token = await getToken\(\);/g, "const { token } = useAuth();");
clerk = clerk.replace(/const { getToken } = useAuth\(\);/g, "const { token } = useAuth();");
clerk = clerk.replace(/await getToken\(\)/g, "token");
fs.writeFileSync('src/ClerkUsersPanel.tsx', clerk, 'utf8');

console.log('Fixed');
