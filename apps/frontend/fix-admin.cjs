const fs = require('fs');

let content = fs.readFileSync('src/AdminPage.tsx', 'utf8');

// fix isSignedIn
content = content.replace(/isSignedIn/g, '!!token');

// fix getToken
content = content.replace(/await getToken\(\)/g, 'token');

// fix roleFilter and roleSort usage in lines 969 to 1032
// wait, we can just declare the missing state variables
const stateVars = `
  const [applicationFilter, setApplicationFilter] = useState('');
  const [applicationSort, setApplicationSort] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [crossSectionFilter, setCrossSectionFilter] = useState('');
  const [crossSectionSort, setCrossSectionSort] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [profileFilter, setProfileFilter] = useState('');
  const [profileSort, setProfileSort] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [roleFilter, setRoleFilter] = useState('');
  const [roleSort, setRoleSort] = useState<'user-asc' | 'role-asc'>('user-asc');
`;

content = content.replace(/const t = TXT\[lang\];/g, stateVars + '\n  const t = TXT[lang];');

// fix `currencyRows` missing
const currencyRowsCalc = `
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

content = content.replace(/const applicationRows = useMemo/g, currencyRowsCalc + '\n  const applicationRows = useMemo');

// remove roleRows since we removed roles panel!
// Actually wait, some roleRows stuff might still be used? I'll remove any roleRows uses if I can, but defining it is safer.
const roleRowsCalc = `
  const roleRows = { items: [], total: 0, page: 1, totalPages: 1, start: 0, end: 0 };
`;
content = content.replace(/const roleRows = useMemo[^{]*{[^}]*}[^)]*\);/g, ''); 
content = content.replace(/const pagedRoles = useMemo[^{]*{[^}]*}[^)]*\);/g, ''); 

// save file
fs.writeFileSync('src/AdminPage.tsx', content, 'utf8');
console.log('Fixed AdminPage.tsx');
