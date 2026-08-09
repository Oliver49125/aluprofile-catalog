const fs = require('fs');

let code = fs.readFileSync('src/AdminPage.tsx', 'utf8');

// Replace all UserAccess with UserAdmin
code = code.replace(/UserAccess/g, 'UserAdmin');
// Replace all userAccessList with userList
code = code.replace(/userAccessList/g, 'userList');
// Replace all userAccessForm with userForm
code = code.replace(/userAccessForm/g, 'userForm');
// Replace all setUserAccessForm with setUserForm
code = code.replace(/setUserAccessForm/g, 'setUserForm');

// Replace clerkUserId in the table and filtering
code = code.replace(/item\.clerkUserId/g, 'item.email');
code = code.replace(/a\.clerkUserId, b\.clerkUserId/g, 'a.email, b.email');

// Fix startEditRole
code = code.replace(/function startEditRole\(item: UserAdmin\) \{[\s\S]*?setShowRoleForm\(true\);\n  \}/g, `function startEditRole(item: UserAdmin) {
    setUserForm({
      id: item.id,
      email: item.email,
      password: '',
      role: item.role,
      permissions: item.permissions,
    });
    setShowRoleForm(true);
  }`);

// Fix the UI table columns
code = code.replace(/>{t.clerkUserId}<\/th>/g, `>Email</th>`);

// Fix the UI form
const formRegex = /<Input\s+value=\{userForm\.clerkUserId\}\s+onChange=\{\(e\) => setUserForm\(\(f\) => \(\{ \.\.\.f, clerkUserId: e\.target\.value \}\)\)\}\s+placeholder=\{t\.clerkUserId\}\s+\/>/g;
code = code.replace(formRegex, `<Input value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" />
<Input type="password" value={userForm.password} onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))} placeholder="Password (leave empty to keep current)" />`);

// Fix the delete button call
code = code.replace(/deleteUserAccess\(item\.email\)/g, 'deleteUser(item.id)');

fs.writeFileSync('src/AdminPage.tsx', code);
console.log('Fixed User UI in AdminPage.tsx');
