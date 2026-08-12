const fs = require('fs');

function addToast(filename) {
  let code = fs.readFileSync(filename, 'utf8');
  if (!code.includes("import toast from 'react-hot-toast';")) {
    code = "import toast from 'react-hot-toast';\n" + code;
    // Also fix the unused 'section' variable
    code = code.replace(/function showMessage\(text: string, type: 'success' \| 'error' = 'error', section\?: string\) \{/,
      "function showMessage(text: string, type: 'success' | 'error' = 'error') {");
    code = code.replace(/function showMessage\(text: string, type: 'error' \| 'success' = 'error', section: 'global' \| 'profile' \| 'supplier' = 'global'\) \{/,
      "function showMessage(text: string, type: 'error' | 'success' = 'error') {");
    fs.writeFileSync(filename, code);
    console.log('Fixed', filename);
  }
}

addToast('src/AdminPage.tsx');
addToast('src/CustomerPage.tsx');
