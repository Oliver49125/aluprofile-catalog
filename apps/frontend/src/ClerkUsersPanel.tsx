import { parseApiError } from './utils/apiError';
import { API_BASE } from './utils/apiBase';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { Mail, Search, ShieldCheck, Users, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';

type User = {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  createdAt: string;
};

type Lang = 'en' | 'de';

type Props = {
  canManageUsers: boolean;
  lang: Lang;
};


const PAGE_SIZE = 5;

const TXT = {
  en: {
    title: 'User Management',
    search: 'Filter users',
    searchBtn: 'Refresh Users',
    newForm: 'New User Form',
    email: 'Email',
    password: 'Password (required for new user)',
    username: 'Username',
    firstName: 'First name',
    lastName: 'Last name',
    update: 'Update User',
    create: 'Create User',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this user? This action cannot be undone.',
    saved: 'User saved.',
    deleted: 'User deleted.',
    directory: 'User Directory',
    sortBy: 'Sort by',
    nameAsc: 'Name A-Z',
    emailAsc: 'Email A-Z',
    usernameAsc: 'Username A-Z',
    exportExcel: 'Export Excel',
    exportPdf: 'Export PDF',
    previous: 'Previous',
    next: 'Next',
    pageLabel: 'Page',
    ofLabel: 'of',
    showing: 'Showing',
    records: 'records',
    actions: 'Actions',
    userId: 'User ID',
  },
  de: {
    title: 'Benutzerverwaltung',
    search: 'Benutzer filtern',
    searchBtn: 'Benutzer aktualisieren',
    newForm: 'Neues Benutzerformular',
    email: 'E-Mail',
    password: 'Passwort (fur neuen Benutzer erforderlich)',
    username: 'Benutzername',
    firstName: 'Vorname',
    lastName: 'Nachname',
    update: 'Benutzer aktualisieren',
    create: 'Benutzer erstellen',
    edit: 'Bearbeiten',
    delete: 'Loschen',
    confirmDelete: 'Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    saved: 'Benutzer gespeichert.',
    deleted: 'Benutzer geloscht.',
    directory: 'Benutzerverzeichnis',
    sortBy: 'Sortieren nach',
    nameAsc: 'Name A-Z',
    emailAsc: 'E-Mail A-Z',
    usernameAsc: 'Benutzername A-Z',
    exportExcel: 'Excel exportieren',
    exportPdf: 'PDF exportieren',
    previous: 'Zuruck',
    next: 'Weiter',
    pageLabel: 'Seite',
    ofLabel: 'von',
    showing: 'Zeige',
    records: 'Eintrage',
    actions: 'Aktionen',
    userId: 'Benutzer-ID',
  },
} as const;


function compareText(a: unknown, b: unknown) {
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { sensitivity: 'base' });
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportTablePdf(title: string, headers: string[], rows: Array<Array<string | number>>) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const headerHtml = headers.map((header) => `<th>${escapeHtml(String(header))}</th>`).join('');
  const rowHtml = rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => `<td>${escapeHtml(String(cell ?? ''))}</td>`)
          .join('')}</tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: A4 landscape; margin: 14mm; }
      body { font-family: Segoe UI, Arial, sans-serif; margin: 0; color: #0f172a; }
      .sheet { padding: 12px; }
      h1 { margin: 0 0 16px; font-size: 24px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
      th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; vertical-align: top; word-break: break-word; }
      th { background: #e2e8f0; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <h1>${escapeHtml(title)}</h1>
      <table>
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${rowHtml}</tbody>
      </table>
    </div>
    <script>
      window.addEventListener('load', function () {
        setTimeout(function () {
          window.focus();
          window.print();
        }, 300);
      });
      window.addEventListener('afterprint', function () {
        window.close();
      });
    </script>
  </body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    URL.revokeObjectURL(url);
    return;
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
}

function paginateItems<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  return {
    items: items.slice(startIndex, startIndex + pageSize),
    totalPages,
    page: safePage,
    start: items.length === 0 ? 0 : startIndex + 1,
    end: Math.min(startIndex + pageSize, items.length),
    total: items.length,
  };
}

export default function ClerkUsersPanel({ canManageUsers, lang }: Props) {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'email-asc' | 'username-asc'>('name-asc');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);
    const [form, setForm] = useState({
    userId: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'USER',
  });

  const t = TXT[lang];

  function showToast(message: string, type: 'success' | 'error') {
    if (type === 'success') toast.success(message);
    else toast.error(message);
  }

  async function api(path: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
      ...options,
    });

    if (!res.ok) {
      const raw = await res.text();
      try {
        const parsed = JSON.parse(raw) as { message?: string | string[] };
        const message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message || raw;
        throw new Error(message);
      } catch {
        throw new Error(raw);
      }
    }

    return res.json();
  }

  async function loadUsers() {
    if (!canManageUsers) return;
    const data = await api('/admin/users');
    setUsers(data);
  }

  useEffect(() => {
    loadUsers().catch((err) => showToast(parseApiError(err), 'error'));
  }, [canManageUsers]);

  useEffect(() => {
    setPage(1);
  }, [query, sortBy, users.length]);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return [...users]
      .filter((item) => {
        if (!search) return true;
        return [
          String(item.id),
          item.firstName,
          item.lastName,
          item.email,
        ].some((value) => String(value ?? '').toLowerCase().includes(search));
      })
      .sort((a, b) => {
        if (sortBy === 'email-asc') {
          return compareText(a.email, b.email);
        }
        return compareText([a.firstName, a.lastName].filter(Boolean).join(' ') || String(a.id), [b.firstName, b.lastName].filter(Boolean).join(' ') || String(b.id));
      });
  }, [query, sortBy, users]);

  const pagedUsers = paginateItems(filteredUsers, page);

  async function saveUser() {
    if (!canManageUsers) return;
    
    if (!form.email.trim() && !form.userId) {
      showToast(lang === 'de' ? 'E-Mail ist erforderlich' : 'Email is required', 'error');
      return;
    }

    try {
      if (form.userId) {
        await api(`/admin/users/${encodeURIComponent(form.userId)}`, {
          method: 'PUT',
          body: JSON.stringify({
            firstName: form.firstName.trim() || undefined,
            lastName: form.lastName.trim() || undefined,
            password: form.password.trim() || undefined,
          }),
        });
      } else {
        await api('/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password.trim(),
            firstName: form.firstName.trim() || undefined,
            lastName: form.lastName.trim() || undefined,
          }),
        });
      }

      setForm({ userId: '', email: '', password: '', firstName: '', lastName: '', role: 'USER' });
      showToast(t.saved, 'success');
      await loadUsers();
    } catch (err) {
      showToast(parseApiError(err), 'error');
    }
  }

  async function deleteUser(userId: string | number) {
    if (!canManageUsers) return;
    setConfirmAction({
      message: t.confirmDelete,
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await api(`/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
          showToast(t.deleted, 'success');
          await loadUsers();
        } catch (err) {
          showToast(parseApiError(err), 'error');
        }
      }
    });
  }

  function editUser(item: User) {
    setForm({
      userId: String(item.id),
      email: item.email,
      password: '',
      firstName: item.firstName ?? '',
      lastName: item.lastName ?? '',
      role: item.role ?? 'USER',
    });
  }

  function exportUsers(kind: 'excel' | 'pdf') {
    const headers = [t.userId, t.nameAsc.replace(' A-Z', ''), t.email];
    const rows = filteredUsers.map((item) => [
      item.id,
      [item.firstName, item.lastName].filter(Boolean).join(' ') || '-',
      item.email,
    ]);
    if (kind === 'excel') {
      downloadCsv('user-management.csv', headers, rows);
      return;
    }
    exportTablePdf(t.title, headers, rows);
  }


  if (!canManageUsers) return null;

  return (
    <Card id="admin-users" className="material-panel bg-white shadow-sm border border-slate-200">
      <CardHeader className="border-b border-slate-200/80 bg-slate-50/50">
        <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-900">
          <Users className="h-5 w-5 text-rose-600" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        
        {confirmAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md" onClick={() => setConfirmAction(null)}>
            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-black text-slate-900">{t.delete}</h3>
              <p className="mb-6 text-xs text-slate-500">{confirmAction.message}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setConfirmAction(null)} className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">{lang === 'de' ? 'Abbrechen' : 'Cancel'}</Button>
                <Button variant="destructive" onClick={confirmAction.onConfirm} className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-sm">{t.delete}</Button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
            <Search className="h-4 w-4 text-[#0284c7]" /> {t.directory}
          </h4>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto_auto]">
            <Input
              placeholder={t.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-rose-500/20"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name-asc' | 'email-asc')}
              className="rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-xs px-3 py-2 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            >
              <option value="name-asc">{t.nameAsc}</option>
              <option value="email-asc">{t.emailAsc}</option>
            </select>
            <Button variant="outline" onClick={() => exportUsers('excel')} className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">{t.exportExcel}</Button>
            <Button variant="outline" onClick={() => exportUsers('pdf')} className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">{t.exportPdf}</Button>
            <Button variant="secondary" onClick={() => { setForm({ userId: '', email: '', password: '', firstName: '', lastName: '', role: 'USER' }); loadUsers().catch((err) => showToast(parseApiError(err), 'error')); }} className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-xl">{t.searchBtn}</Button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm mt-4">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-5 py-3.5">{t.nameAsc.replace(' A-Z', '')}</th>
                  <th className="px-5 py-3.5">{t.email}</th>
                  <th className="px-5 py-3.5">{t.userId}</th>
                  <th className="px-5 py-3.5 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedUsers.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-extrabold text-slate-900">{[item.firstName, item.lastName].filter(Boolean).join(' ') || '-'}</td>
                    <td className="px-5 py-4 font-medium text-slate-600"><span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-rose-500" /> {item.email}</span></td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">{item.id}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => editUser(item)} className="text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl">{t.edit}</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteUser(item.id)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl">{t.delete}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-600 mt-4">
            <span>{t.showing} {pagedUsers.start}-{pagedUsers.end} / {pagedUsers.total} {t.records}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={pagedUsers.page <= 1} onClick={() => setPage((p) => p - 1)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl">{t.previous}</Button>
              <span className="font-bold text-slate-900 px-2">{t.pageLabel} {pagedUsers.page} {t.ofLabel} {pagedUsers.totalPages}</span>
              <Button size="sm" variant="outline" disabled={pagedUsers.page >= pagedUsers.totalPages} onClick={() => setPage((p) => p + 1)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl">{t.next}</Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4 shadow-sm">
          <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0284c7]" />
            {form.userId ? t.update : t.newForm}
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.email} *</label>
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@aluprofile.com" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-rose-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.password}</label>
              <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-rose-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.firstName}</label>
              <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-rose-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lastName}</label>
              <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-rose-500/20" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            {form.userId && (
              <Button variant="outline" onClick={() => setForm({ userId: '', email: '', password: '', firstName: '', lastName: '', role: 'USER' })} className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">
                Cancel Edit
              </Button>
            )}
            <Button onClick={saveUser} className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm">
              {form.userId ? t.update : t.create}
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}


