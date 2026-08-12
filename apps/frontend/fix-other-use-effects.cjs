const fs = require('fs');

let code = fs.readFileSync('src/AdminPage.tsx', 'utf8');

// Fix lang useEffect
code = code.replace(/useEffect\(\(\) => \{\n\s*const saved = window\.localStorage\.getItem\('aluprofile_lang'\);\n\s*if \(saved === 'en' \|\| saved === 'de'\) setLang\(saved\);\n\s*\}\);/g, `useEffect(() => {
    const saved = window.localStorage.getItem('aluprofile_lang');
    if (saved === 'en' || saved === 'de') setLang(saved);
  }, []);`);

// Delete empty useEffect
code = code.replace(/useEffect\(\(\) => \{\n\s*\}\);/g, '');

fs.writeFileSync('src/AdminPage.tsx', code);
console.log('Fixed other useEffects in AdminPage.tsx');
