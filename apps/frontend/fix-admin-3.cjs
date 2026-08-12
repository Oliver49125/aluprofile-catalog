const fs = require('fs');

let admin = fs.readFileSync('src/AdminPage.tsx', 'utf8');

// Insert currencyRows and filteredCurrencies after getCurrencies
const currencyRowsCode = `
  const filteredCurrencies = useMemo(() => {
    if (!adminRef) return [];
    return adminRef.currencies
      .filter((c) => !currencyFilter || [c.code, c.symbol].some(v => String(v).toLowerCase().includes(currencyFilter.toLowerCase())))
      .sort((a, b) => currencySort === 'code-asc' ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code));
  }, [adminRef, currencyFilter, currencySort]);

  const currencyRows = useMemo(() => {
    const items = filteredCurrencies.slice((currencyPage - 1) * itemsPerPage, currencyPage * itemsPerPage);
    return {
      items,
      total: filteredCurrencies.length,
      page: currencyPage,
      totalPages: Math.ceil(filteredCurrencies.length / itemsPerPage) || 1,
      start: (currencyPage - 1) * itemsPerPage + (items.length > 0 ? 1 : 0),
      end: (currencyPage - 1) * itemsPerPage + items.length,
    };
  }, [filteredCurrencies, currencyPage, itemsPerPage]);
`;

if (!admin.includes('currencyRows =')) {
  admin = admin.replace(/const profileRows = useMemo/g, currencyRowsCode + '\n  const profileRows = useMemo');
}

fs.writeFileSync('src/AdminPage.tsx', admin, 'utf8');

let clerk = fs.readFileSync('src/ClerkUsersPanel.tsx', 'utf8');
clerk = clerk.replace(/type ToastState = {[^}]+}/g, "type ToastState = { message: string; type: 'success' | 'error' }");
// change clerk to useAuth from AuthContext instead of @clerk/clerk-react
clerk = clerk.replace(/import { useAuth } from '@clerk\/clerk-react';/g, "import { useAuth } from './AuthContext';");
fs.writeFileSync('src/ClerkUsersPanel.tsx', clerk, 'utf8');

console.log('Fixed scripts');
