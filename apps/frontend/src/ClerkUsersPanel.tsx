import { parseApiError } from './utils/apiError';
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


const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api').replace(/\/+$/, '');
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
    <Card id="admin-users" className="material-panel">
      <CardHeader className="border-b border-slate-800/80">
        <CardTitle className="flex items-center gap-3 text-xl font-extrabold text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><Users className="h-5 w-5" /></span>
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        
        {confirmAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md" onClick={() => setConfirmAction(null)}>
            <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-[#131c2a] p-6 text-center text-white shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{t.delete}</h3>
              <p className="mb-6 text-xs text-slate-300">{confirmAction.message}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setConfirmAction(null)} className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">{lang === 'de' ? 'Abbrechen' : 'Cancel'}</Button>
                <Button variant="destructive" onClick={confirmAction.onConfirm} className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs">{t.delete}</Button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-700/80 bg-[#131c2a]/90 p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-400">
            <Search className="h-4 w-4 text-cyan-400" /> {t.directory}
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto_auto]">
            <Input placeholder={t.search} value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white placeholder:text-slate-400 text-xs" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name-asc' | 'email-asc')} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs px-3 py-2">
              <option value="name-asc" className="bg-slate-900 text-white">{t.nameAsc}</option>
              <option value="email-asc" className="bg-slate-900 text-white">{t.emailAsc}</option>
            </select>
            <Button variant="outline" onClick={() => exportUsers('excel')} className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs">{t.exportExcel}</Button>
            <Button variant="outline" onClick={() => exportUsers('pdf')} className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs">{t.exportPdf}</Button>
            <Button variant="secondary" onClick={() => { setForm({ userId: '', email: '', password: '', firstName: '', lastName: '', role: 'USER' }); loadUsers().catch((err) => showToast(parseApiError(err), 'error')); }} className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs">{t.searchBtn}</Button>
          </div>
          <div className="mt-4 admin-table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1e293b] text-left text-xs font-bold uppercase tracking-[0.18em] text-cyan-400 border-b border-slate-700">
                  <th className="px-4 py-3.5">{t.nameAsc.replace(' A-Z', '')}</th>
                  <th className="px-4 py-3.5">{t.email}</th>
                  <th className="px-4 py-3.5">{t.userId}</th>
                  <th className="px-4 py-3.5 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.items.map((item) => (
                  <tr key={item.id} className="material-table-row">
                    <td className="px-4 py-3.5 font-bold text-white">{[item.firstName, item.lastName].filter(Boolean).join(' ') || '-'}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-300"><span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-cyan-400" /> {item.email}</span></td>
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-400">{item.id}</td>
                    <td className="px-4 py-3.5"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => editUser(item)} className="text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 font-bold">{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteUser(item.id)} className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 font-bold">{t.delete}</Button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 admin-pagination text-slate-300">
            <span>{t.showing} {pagedUsers.start}-{pagedUsers.end} / {pagedUsers.total} {t.records}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={pagedUsers.page <= 1} onClick={() => setPage((p) => p - 1)} className="border-slate-700 text-slate-200 hover:bg-slate-800">{t.previous}</Button>
              <span>{t.pageLabel} {pagedUsers.page} {t.ofLabel} {pagedUsers.totalPages}</span>
              <Button size="sm" variant="outline" disabled={pagedUsers.page >= pagedUsers.totalPages} onClick={() => setPage((p) => p + 1)} className="border-slate-700 text-slate-200 hover:bg-slate-800">{t.next}</Button>
            </div>
          </div>
        </div>

        <Card className="border border-slate-700/80 bg-[#131c2a]/95 text-white">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              {form.userId ? t.update : t.newForm}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{t.email}</label>
                <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@aluprofile.com" className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{t.password}</label>
                <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{t.firstName}</label>
                <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{t.lastName}</label>
                <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={saveUser} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs">
                {form.userId ? t.update : t.create}
              </Button>
              {form.userId && (
                <Button variant="outline" onClick={() => setForm({ userId: '', email: '', password: '', firstName: '', lastName: '', role: 'USER' })} className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
                  Cancel Edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
}


