const fs = require('fs');

function fix(filename) {
  let code = fs.readFileSync(filename, 'utf8');
  
  // The local function now looks like:
  // function parseApiError(error: unknown) {
  //   if (typeof error === 'string') return error;
  //   if (error && typeof error === 'object') {
  //     const authError = error as { errors?: Array<{ longMessage?: string; message?: string }>; message?: string };
  //     if (Array.isArray(authError.errors) && authError.errors.length > 0) {
  //       return authError.errors[0].longMessage || authError.errors[0].message || 'Authentication failed';
  //     }
  //     if (authError.message) return authError.message;
  //   }
  //   return String(error);
  // }
  
  const regex = /function parseApiError\(error: unknown\) \{[\s\S]*?return String\(error\);\n  \}/;
  code = code.replace(regex, '');
  
  fs.writeFileSync(filename, code);
  console.log('Fixed shadowing in', filename);
}

fix('src/AdminPage.tsx');
fix('src/CustomerPage.tsx');
