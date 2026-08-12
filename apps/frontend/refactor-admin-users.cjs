const fs = require('fs');

let code = fs.readFileSync('src/AdminPage.tsx', 'utf8');

// 1. Change type UserAccess to UserAdmin
code = code.replace(/type UserAccess = \{[\s\S]*?\};\n/g, `type UserAdmin = {
  id: number;
  email: string;
  role: AppRole;
  permissions: AppPermission[];
};\n`);

// 2. Change userAccessList to userList
code = code.replace(/const \[userAccessList, setUserAccessList\] = useState<UserAccess\[\]>\(\[\]\);/g, `const [userList, setUserList] = useState<UserAdmin[]>([]);`);

// 3. Change userAccessForm
code = code.replace(/const \[userAccessForm, setUserAccessForm\] = useState<\{[\s\S]*?\}\>\(\{[\s\S]*?\}\);/g, `const [userForm, setUserForm] = useState<{
    id?: number;
    email: string;
    password?: string;
    role: AppRole;
    permissions: AppPermission[];
  }>({
    email: '',
    password: '',
    role: 'USER',
    permissions: ['VIEW_ADMIN'],
  });`);

// 4. Change resetRoleForm
code = code.replace(/function resetRoleForm\(\) \{[\s\S]*?setShowRoleForm\(false\);\n  \}/g, `function resetRoleForm() {
    setUserForm({
      email: '',
      password: '',
      role: 'USER',
      permissions: ['VIEW_ADMIN'],
    });
    setShowRoleForm(false);
  }`);

// 5. Change loadUserAccess to loadUsers
code = code.replace(/async function loadUserAccess\(\) \{[\s\S]*?\}\n/g, `async function loadUsers() {
    if (!canManageUsers) return;
    const list = await api('/admin/users', undefined, true);
    setUserList(list);
  }\n`);

// 6. Update useEffect calls for loadUsers
code = code.replace(/loadUserAccess\(\)/g, 'loadUsers()');

// 7. Change saveUserAccess
code = code.replace(/async function saveUserAccess\(\) \{[\s\S]*?\}\n\n/g, `async function saveUser() {
    if (!userForm.email.trim()) { showMessage('Email is required', 'error'); return; }
    try {
      const isEditing = !!userForm.id;
      await api('/admin/users' + (isEditing ? '/' + userForm.id : ''), {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify({
          email: userForm.email.trim(),
          ...(userForm.password ? { password: userForm.password } : {}),
          role: userForm.role,
          permissions: userForm.permissions,
        }),
      }, true);
      resetRoleForm();
      setRolePage(1);
      await loadUsers();
      showMessage('User saved successfully', 'success');
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    }
  }\n\n`);

// 8. Change deleteUserAccess
code = code.replace(/async function deleteUserAccess\(clerkUserId: string\) \{[\s\S]*?\}\n\n/g, `async function deleteUser(id: number) {
    setConfirmAction({
      message: t.confirmDelete,
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await api('/admin/users/' + id, { method: 'DELETE' }, true);
          await loadUsers();
          showMessage('User deleted successfully', 'success');
        } catch (err) {
          showMessage(parseApiError(err), 'error');
        }
      }
    });
  }\n\n`);

fs.writeFileSync('src/AdminPage.tsx', code);
console.log('Refactored state and logic in AdminPage.tsx');
