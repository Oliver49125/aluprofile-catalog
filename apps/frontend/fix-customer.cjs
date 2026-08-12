const fs = require('fs');
let content = fs.readFileSync('src/CustomerPage.tsx', 'utf8');

content = content.replace(/isSignInLoaded/g, '!isLoading');
content = content.replace(/isSignUpLoaded/g, '!isLoading');

fs.writeFileSync('src/CustomerPage.tsx', content, 'utf8');
console.log('Fixed CustomerPage.tsx');
