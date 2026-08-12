import toast from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { parseApiError } from './utils/apiError';
import { useAuth } from './AuthContext';
import {
  BadgeCheck,
  Boxes,
  Building2,
  ChevronRight,
  Eye,

  EyeOff,
  KeyRound,
  Layers,
  Shield,
  ShieldAlert,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import ClerkUsersPanel from './ClerkUsersPanel';

type CurrencyOption = { id: number; code: string; symbol: string; _count?: { profiles: number } };
type RefOption = { id: number; name: string; nameDe?: string; profilesCount?: number };
type SupplierOption = {
  id: number;
  name: string;
  nameDe?: string;
  address?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  uid?: string;
  _count?: { profiles: number };
};
type Profile = {
  id: number;
  name: string;
  nameDe?: string;
  description?: string;
  descriptionDe?: string;
  usage?: string;
  usageDe?: string;
  drawingUrl?: string;
  photoUrl?: string;
  logoUrl?: string;
  dimensions?: string;
  weightPerMeter?: number;
  material?: string;
  materialDe?: string;
  lengthMm?: number;
  status: string;
  supplier?: SupplierOption;
  applications: RefOption[];
  crossSections: RefOption[];
  price?: number;
  currencyId?: number;
  currency?: { id: number; code: string; symbol: string };
  slotSize?: string;
  momentOfInertiaIx?: number;
  momentOfInertiaIy?: number;
  sectionModulusWx?: number;
  sectionModulusWy?: number;
  outerSurfaceArea?: number;
  crossSectionalArea?: number;
  color?: string;
  stepUrl?: string;
  dxfUrl?: string;
  pdfUrl?: string;
};
type AppRole = 'ADMIN' | 'MANAGER' | 'USER';
type AppPermission =
  | 'VIEW_ADMIN'
  | 'PROFILES_MANAGE'
  | 'SUPPLIERS_MANAGE'
  | 'CATEGORIES_MANAGE'
  | 'USERS_MANAGE';
type AuthContext = {
  clerkUserId: string;
  appRole: AppRole;
  appPermissions: AppPermission[];
  source: 'database' | 'bootstrap';
};
type UserAdmin = {
  id: number;
  email: string;
  username?: string;
  role: AppRole;
  permissions: AppPermission[];
};

const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api').replace(/\/+$/, '');
const PAGE_SIZE = 5;

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

type Lang = 'en' | 'de';
const TXT = {
  en: {
    adminPanel: 'Admin Panel',
    adminSubtitle: 'Manage users, permissions, and catalog master data',
    backToCatalog: 'Back to Catalog',
    language: 'Language',
    profiles: 'Profiles',
    categories: 'Categories',
    currencies: 'Currencies',
    suppliers: 'Suppliers',
    clerkUsers: 'Users',
    managedUsers: 'Managed Users',
    signedInAs: 'Signed in as',
    unknownUser: 'unknown user',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this item? This action cannot be undone.',
    name: 'Name',
    saveApplication: 'Save Application',
    application: 'Application',
    appName: 'Application name',
    crossSection: 'Cross-section',
    crossSectionName: 'Cross-section name',
    saveCrossSection: 'Save Cross-section',
    currencyCode: 'Currency Code (e.g., EUR)',
    currencySymbol: 'Currency Symbol (e.g., €)',
    saveCurrency: 'Save Currency',
    addCurrency: 'Add Currency',
    filterCurrencies: 'Filter currencies',
    saveProfile: 'Save Profile',
    price: 'Price',
    currency: 'Currency',
    drawingFile: 'Drawing file',
    photoFile: 'Photo file',
    clerkUserId: 'User ID (user_xxx)',
    saveUserAdmin: 'Save User Access',
    backendEnforced: 'Admin role plus permissions are enforced by backend for all /admin endpoints.',
    login: 'Catalog System Login',
    accessDenied: 'Access denied',
    accessDeniedText: 'you do not have VIEW_ADMIN permission for this page.',
    quickActions: 'Quick Actions',
    seedDemoData: 'Seed Demo Data',
    categoryControls: 'Category Controls',
    supplierControls: 'Supplier Controls',
    addSupplier: 'Add Supplier',
    saveSupplier: 'Save Supplier',
    address: 'Address',
    contactPerson: 'Contact Person',
    email: 'Email',
    phone: 'Phone',
    website: 'Website',
    uid: 'UID#',
    filterSuppliers: 'Filter suppliers',
    supplier: 'Supplier',
    selectSupplier: 'Select Supplier...',
    profileControls: 'Profile Controls',
    appRolePermissions: 'App Role & Permission Management',
    usernameOrEmail: 'Username or email',
    password: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    forgotPassword: 'Forgot password?',
    backToLogin: 'Back to login',
    sendResetCode: 'Send reset code',
    sendingResetCode: 'Sending code...',
    resetCode: 'Reset code',
    newPassword: 'New password',
    setNewPassword: 'Set new password',
    resettingPassword: 'Updating password...',
    resetPasswordHelp: 'Use your account email or username to request a password reset code.',
    resetPasswordSent: 'Reset code sent. Check your email and enter the code below.',
    showPassword: 'Show',
    hidePassword: 'Hide',
    role: 'Role',
    permissions: 'Permissions',
    addNew: 'Add New',
    cancel: 'Cancel',
    actions: 'Actions',
    status: 'Status',
    dimensions: 'Dimensions',
    previous: 'Previous',
    next: 'Next',
    pageLabel: 'Page',
    ofLabel: 'of',
    showing: 'Showing',
    records: 'records',
    sectionTools: 'Section Tools',
    addApplication: 'Add Application',
    addCrossSection: 'Add Cross-section',
    addProfile: 'Add Profile',
    addAccessRule: 'Add Access Rule',
    closeEditor: 'Close Editor',
    profileCount: 'Profiles',
    contact: 'Contact',
    details: 'Details',
    filter: 'Filter',
    sortBy: 'Sort by',
    exportExcel: 'Export Excel',
    exportPdf: 'Export PDF',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',
    statusAsc: 'Status A-Z',
    roleAsc: 'Role A-Z',
    countDesc: 'Most profiles',
    filterApplications: 'Filter applications',
    filterCrossSections: 'Filter cross-sections',
    filterProfiles: 'Filter profiles',
    filterRoles: 'Filter roles & permissions',
  },
  de: {
    adminPanel: 'Admin-Panel',
    adminSubtitle: 'Benutzer, Berechtigungen und Katalog-Stammdaten verwalten',
    backToCatalog: 'Zuruck zum Katalog',
    language: 'Sprache',
    profiles: 'Profile',
    categories: 'Kategorien',
    currencies: 'Währungen',
    suppliers: 'Lieferanten',
    clerkUsers: 'Benutzer',
    managedUsers: 'Verwaltete Benutzer',
    signedInAs: 'Angemeldet als',
    unknownUser: 'unbekannter Benutzer',
    save: 'Speichern',
    edit: 'Bearbeiten',
    delete: 'Loschen',
    confirmDelete: 'Sind Sie sicher, dass Sie dieses Element löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    name: 'Name',
    saveApplication: 'Anwendung speichern',
    application: 'Anwendung',
    appName: 'Anwendungsname',
    crossSection: 'Querschnitt',
    crossSectionName: 'Querschnittsname',
    saveCrossSection: 'Querschnitt speichern',
    currencyCode: 'Währungscode (z.B., EUR)',
    currencySymbol: 'Währungssymbol (z.B., €)',
    saveCurrency: 'Währung speichern',
    addCurrency: 'Währung hinzufügen',
    filterCurrencies: 'Währungen filtern',
    saveProfile: 'Profil speichern',
    price: 'Preis',
    currency: 'Währung',
    drawingFile: 'Zeichnungsdatei',
    photoFile: 'Fotodatei',
    clerkUserId: 'Benutzer-ID (user_xxx)',
    saveUserAdmin: 'Benutzerzugriff speichern',
    backendEnforced: 'Admin-Rolle und Berechtigungen werden fur alle /admin-Endpunkte im Backend erzwungen.',
    login: 'Katalogsystem-Anmeldung',
    accessDenied: 'Zugriff verweigert',
    accessDeniedText: 'Sie haben keine VIEW_ADMIN-Berechtigung fur diese Seite.',
    quickActions: 'Schnellaktionen',
    seedDemoData: 'Demo-Daten laden',
    categoryControls: 'Kategorienverwaltung',
    supplierControls: 'Lieferantenverwaltung',
    addSupplier: 'Lieferant hinzufügen',
    saveSupplier: 'Lieferant speichern',
    address: 'Adresse',
    contactPerson: 'Ansprechpartner',
    email: 'E-Mail',
    phone: 'Telefon',
    website: 'Webseite',
    uid: 'UID-Nr.',
    filterSuppliers: 'Lieferanten filtern',
    supplier: 'Lieferant',
    selectSupplier: 'Lieferant auswählen...',
    profileControls: 'Profilverwaltung',
    appRolePermissions: 'App-Rollen- und Berechtigungsverwaltung',
    usernameOrEmail: 'Benutzername oder E-Mail',
    password: 'Passwort',
    signIn: 'Anmelden',
    signingIn: 'Anmeldung...',
    forgotPassword: 'Passwort vergessen?',
    backToLogin: 'Zuruck zur Anmeldung',
    sendResetCode: 'Code senden',
    sendingResetCode: 'Code wird gesendet...',
    resetCode: 'Zurucksetzungscode',
    newPassword: 'Neues Passwort',
    setNewPassword: 'Neues Passwort setzen',
    resettingPassword: 'Passwort wird aktualisiert...',
    resetPasswordHelp: 'Verwenden Sie Ihre Konto-E-Mail oder Ihren Benutzernamen, um einen Zurucksetzungscode anzufordern.',
    resetPasswordSent: 'Der Zurucksetzungscode wurde gesendet. Prufen Sie Ihre E-Mail und geben Sie den Code unten ein.',
    showPassword: 'Anzeigen',
    hidePassword: 'Ausblenden',
    role: 'Rolle',
    permissions: 'Berechtigungen',
    addNew: 'Neu hinzufugen',
    cancel: 'Abbrechen',
    actions: 'Aktionen',
    status: 'Status',
    dimensions: 'Abmessungen',
    previous: 'Zuruck',
    next: 'Weiter',
    pageLabel: 'Seite',
    ofLabel: 'von',
    showing: 'Zeige',
    records: 'Eintrage',
    sectionTools: 'Bereichswerkzeuge',

    addApplication: 'Anwendung hinzufugen',
    addCrossSection: 'Querschnitt hinzufugen',
    addProfile: 'Profil hinzufugen',
    addAccessRule: 'Zugriffsregel hinzufugen',
    closeEditor: 'Editor schliessen',
    profileCount: 'Profile',
    contact: 'Kontakt',
    details: 'Details',
    filter: 'Filter',
    sortBy: 'Sortieren nach',
    exportExcel: 'Excel exportieren',
    exportPdf: 'PDF exportieren',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',

    statusAsc: 'Status A-Z',
    roleAsc: 'Rolle A-Z',
    countDesc: 'Meiste Profile',

    filterApplications: 'Anwendungen filtern',
    filterCrossSections: 'Querschnitte filtern',
    filterProfiles: 'Profile filtern',
    filterRoles: 'Rollen und Berechtigungen filtern',
  },
} as const;

function normalizeForSearch(value: unknown) {
  return String(value ?? '').toLowerCase().trim();
}

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

function AdminPage() {
  const { token, user, login, logout, isLoading } = useAuth();
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState<'error' | 'success'>('error');
  const [lang, setLang] = useState<Lang>('en');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'request' | 'verify'>('request');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'landing' | 'profiles' | 'categories' | 'currencies' | 'suppliers' | 'users' | 'roles'>('overview');

  const [siteSettingsForm, setSiteSettingsForm] = useState<Record<string, string>>({
    heroTitle: 'Industrial Aluminum Extrusions, Found Instantly.',
    heroSubtitle: 'Search and access detailed specifications, technical data, and instant downloads for standard and custom aluminum profiles.',
    heroImageUrl: '/hero-3d-profile.png',
    heroSearchPlaceholder: 'Search by ID, dimensions, or material...',
    stat1Label: '150+ Profiles',
    stat1Sub: 'Standard & Custom',
    stat2Label: '12+ Partners',
    stat2Sub: 'Global Manufacturing Network',
    stat3Label: '9,850+ Downloads',
    stat3Sub: 'Technical Data Sheets',
    heroBgColor: '#3c4a5c',
    featuredTitle: 'Featured Aluminum Profiles',
    howItWorksTitle: 'How It Works',
    howItWorksSubtitle: 'Seamlessly Find and Integrate Your Profiles',
    aboutTitle: 'The Leading Global B2B Aluminum Profile Search Engine',
    aboutSubtitle: 'AluProfile connects mechanical engineers, structural designers, and procurement agents directly with certified aluminum profile manufacturers worldwide.',
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);


  const [websiteVisits, setWebsiteVisits] = useState<number | null>(null);
  const [adminRef, setAdminRef] = useState<{
    suppliers: SupplierOption[];
    applications: RefOption[];
    crossSections: RefOption[];
    currencies: CurrencyOption[];
    statusOptions: string[];
    roleOptions: AppRole[];
    permissionOptions: AppPermission[];
  } | null>(null);
  const [adminProfiles, setAdminProfiles] = useState<Profile[]>([]);
    const [userList, setUserList] = useState<UserAdmin[]>([]);
  const [applicationName, setApplicationName] = useState('');
  const [applicationNameDe, setApplicationNameDe] = useState('');
  const [crossSectionName, setCrossSectionName] = useState('');
  const [crossSectionNameDe, setCrossSectionNameDe] = useState('');
  const [editType, setEditType] = useState<'application' | 'cross' | 'currency' | 'profile' | 'supplier' | ''>('');
  const [editId, setEditId] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    nameDe: '',
    description: '',
    descriptionDe: '',
    usage: '',
    usageDe: '',
    drawingUrl: '',
    photoUrl: '',
    logoUrl: '',
    dimensions: '',
    weightPerMeter: '',
    material: '',
    materialDe: '',
    lengthMm: '',
    status: 'AVAILABLE',
    supplierId: '' as string | number,
    applicationIds: [] as number[],
    crossSectionIds: [] as number[],
    price: '',
    currencyId: '' as string | number,
  });
  const [userForm, setUserForm] = useState<{
    id?: number;
    email: string;
    username?: string;
    password?: string;
    role: AppRole;
    permissions: AppPermission[];
  }>({
    email: '',
    username: '',
    password: '',
    role: 'USER',
    permissions: ['VIEW_ADMIN'],
  });
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showCrossSectionForm, setShowCrossSectionForm] = useState(false);
  const [showCurrencyForm, setShowCurrencyForm] = useState(false);
  const [currencyCode, setCurrencyCode] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [currencySort, setCurrencySort] = useState<'code-asc' | 'code-desc'>('code-asc');
  const [currencyPage, setCurrencyPage] = useState(1);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [applicationPage, setApplicationPage] = useState(1);
  const [crossSectionPage, setCrossSectionPage] = useState(1);
  const [profilePage, setProfilePage] = useState(1);
  const [rolePage, setRolePage] = useState(1);

  const [supplierFilter, setSupplierFilter] = useState('');
  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierForm, setSupplierForm] = useState({
    name: '', nameDe: '', address: '', contactPerson: '', email: '', phone: '', website: '', uid: ''
  });
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);
  
  const [applicationFilter, setApplicationFilter] = useState('');
  const [applicationSort, setApplicationSort] = useState<string>('name-asc');
  const [crossSectionFilter, setCrossSectionFilter] = useState('');
  const [crossSectionSort, setCrossSectionSort] = useState<string>('name-asc');
  const [profileFilter, setProfileFilter] = useState('');
  const [profileSort, setProfileSort] = useState<string>('name-asc');
  const [roleFilter, setRoleFilter] = useState('');
  const [roleSort, setRoleSort] = useState<'user-asc' | 'role-asc'>('user-asc');

  const t = TXT[lang];


  function showMessage(text: string, type: 'success' | 'error' = 'error') {
    if (type === 'success') toast.success(text);
    else toast.error(text);
  }

  useEffect(() => {
    const saved = window.localStorage.getItem('aluprofile_lang');
    if (saved === 'en' || saved === 'de') setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('aluprofile_lang', lang);
  }, [lang]);

  const permissions = user?.permissions ?? [];
  const canViewAdmin = permissions.includes('VIEW_ADMIN');
  const canManageUsers = permissions.includes('USERS_MANAGE');
    const canManageProfiles = permissions.includes('PROFILES_MANAGE');
  const canManageSuppliers = permissions.includes('SUPPLIERS_MANAGE');
  const canManageCategories = permissions.includes('CATEGORIES_MANAGE');

  useEffect(() => {
    const nextSection =
      canManageProfiles ? 'profiles' : canManageCategories ? 'categories' : canManageCategories ? 'currencies' : canManageSuppliers ? 'suppliers' : canManageUsers ? 'users' : 'overview';

    if (activeSection === 'overview') return;
    if (activeSection === 'profiles' && canManageProfiles) return;
    if (activeSection === 'suppliers' && canManageSuppliers) return;
    if (activeSection === 'categories' && canManageCategories) return;
    if (activeSection === 'currencies' && canManageCategories) return;
    if (activeSection === 'currencies' && canManageCategories) return;
    if ((activeSection === 'users' || activeSection === 'roles') && canManageUsers) return;

    setActiveSection(nextSection);
  }, [activeSection, canManageCategories, canManageProfiles, canManageUsers, canManageSuppliers]);

  

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim(), password }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      login(data.token, data.user);
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    } finally {
      setLoginLoading(false);
    }
  }

  function openForgotPassword() {
    setMessage('');
    setForgotPasswordMode(true);
    setForgotPasswordStep('request');
    setResetCode('');
    setResetPassword('');
    setShowResetPassword(false);
  }

  function backToLogin() {
    setMessage('');
    setForgotPasswordMode(false);
    setForgotPasswordStep('request');
    setResetCode('');
    setResetPassword('');
    setForgotPasswordLoading(false);
  }

  async function handleForgotPasswordRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    showMessage('Password reset is currently disabled');
  }



  function resetSupplierForm() {
    setSupplierForm({ name: '', nameDe: '', address: '', contactPerson: '', email: '', phone: '', website: '', uid: '' });
    setEditType('');
    setEditId(null);
    setShowSupplierForm(false);
  }

  function startEditSupplier(supplier: SupplierOption) {
    setEditType('supplier');
    setEditId(supplier.id);
    setSupplierForm({
      name: supplier.name,
      nameDe: supplier.nameDe ?? '',
      address: supplier.address ?? '',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      website: supplier.website || '',
      uid: supplier.uid || '',
    });
    setShowSupplierForm(true);
  }

  async function saveSupplier() {
    if (!supplierForm.name) { showMessage('Supplier name is required', 'error'); return; }
    try {
      const method = editType === 'supplier' && editId ? 'PUT' : 'POST';
      const path = method === 'PUT' ? '/admin/suppliers/' + editId : '/admin/suppliers';
      await api(path, { method, body: JSON.stringify(supplierForm) }, true);
      resetSupplierForm();
      setSupplierPage(1);
      await adminLoad();
      showMessage('Supplier saved successfully', 'success');
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    }
  }

  function resetApplicationForm() {
    setApplicationName('');
    setApplicationNameDe('');
    setEditType('');
    setEditId(null);
    setShowApplicationForm(false);
  }

  function resetCrossSectionForm() {
    setShowCrossSectionForm(false);
    setEditType('');
    setEditId(null);
    setCrossSectionName('');
    setCrossSectionNameDe('');
  }

  function resetCurrencyForm() {
    setShowCurrencyForm(false);
    setEditType('');
    setEditId(null);
    setCurrencyCode('');
    setCurrencySymbol('');
  }

  function resetProfileForm() {
    setProfileForm({
      name: '', nameDe: '', description: '', descriptionDe: '', usage: '', usageDe: '',
      drawingUrl: '', photoUrl: '', logoUrl: '', dimensions: '', weightPerMeter: '',
      material: '', materialDe: '', lengthMm: '', status: 'AVAILABLE', supplierId: '',
      applicationIds: [], crossSectionIds: [], price: '', currencyId: '',
    });
    setEditType('');
    setEditId(null);
    setShowProfileForm(false);
  }

  function resetRoleForm() {
    setUserForm({
      email: '',
      username: '',
      password: '',
      role: 'USER',
      permissions: ['VIEW_ADMIN'],
    });
    setShowRoleForm(false);
  }



  function startEditApplication(application: RefOption) {
    setEditType('application');
    setEditId(application.id);
    setApplicationName(application.name);
    setApplicationNameDe(application.nameDe ?? '');
    setShowApplicationForm(true);
  }

  function startEditCrossSection(item: RefOption) {
    resetProfileForm();
    resetApplicationForm();
    resetCurrencyForm();
    setShowCrossSectionForm(true);
    setEditType('cross');
    setEditId(item.id);
    setCrossSectionName(item.name);
    setCrossSectionNameDe(item.nameDe ?? '');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  }

  function startEditCurrency(item: CurrencyOption) {
    resetProfileForm();
    resetApplicationForm();
    resetCrossSectionForm();
    setShowCurrencyForm(true);
    setEditType('currency');
    setEditId(item.id);
    setCurrencyCode(item.code);
    setCurrencySymbol(item.symbol);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  }

  function startEditProfile(profile: Profile) {
    setEditType('profile');
    setEditId(profile.id);
    setProfileForm({
      name: profile.name ?? '',
      nameDe: profile.nameDe ?? '',
      description: profile.description ?? '',
      descriptionDe: profile.descriptionDe ?? '',
      usage: profile.usage ?? '',
      usageDe: profile.usageDe ?? '',
      drawingUrl: profile.drawingUrl ?? '',
      photoUrl: profile.photoUrl ?? '',
      logoUrl: profile.logoUrl ?? '',
      dimensions: profile.dimensions ?? '',
      weightPerMeter: profile.weightPerMeter ? new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profile.weightPerMeter) : '',
      material: profile.material ?? '',
      materialDe: profile.materialDe ?? '',
      lengthMm: profile.lengthMm ? new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profile.lengthMm) : '',
      status: profile.status ?? 'AVAILABLE',
      supplierId: profile.supplier?.id || '',
      applicationIds: profile.applications.map((item) => item.id),
      crossSectionIds: profile.crossSections.map((item) => item.id),
      price: profile.price !== undefined && profile.price !== null ? new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profile.price) : '',
      currencyId: profile.currency?.id || '',
    });
    setShowProfileForm(true);
  }

  function startEditRole(item: UserAdmin) {
    setUserForm({
      id: item.id,
      email: item.email,
      username: item.username || '',
      password: '',
      role: item.role,
      permissions: item.permissions,
    });
    setShowRoleForm(true);
  }

  async function handleForgotPasswordReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  async function api(path: string, options?: RequestInit, requiresAuth = false) {
    const authToken = requiresAuth ? token : null;
    const res = await fetch(API_BASE + path, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: 'Bearer ' + authToken } : {}),
        ...(options?.headers ?? {}),
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res.json();
  }

  async function adminLoad() {

    try {
      const publicOverview = await api('/public/overview?lang=en');
      if (publicOverview?.totals?.visits !== undefined) {
        setWebsiteVisits(publicOverview.totals.visits);
      }
      const settings = await api('/public/site-settings');
      if (settings && typeof settings === 'object' && Object.keys(settings).length > 0) {
        setSiteSettingsForm((prev) => ({ ...prev, ...settings }));
      }
    } catch(err) {
      console.error(err);
    }
    if (!canViewAdmin) return;
    const ref = await api('/admin/reference-data', undefined, true);
    setAdminRef(ref);
    if (canManageProfiles) {
      const adminProfileData = await api('/admin/profiles', undefined, true);
      setAdminProfiles(adminProfileData);
    } else {
      setAdminProfiles([]);
    }
  }

  async function saveSiteSettings() {
    setIsSavingSettings(true);
    try {
      const updated = await api('/admin/site-settings', {
        method: 'PUT',
        body: JSON.stringify(siteSettingsForm),
      }, true);
      if (updated) setSiteSettingsForm(updated);
      toast.success('Landing page settings updated successfully!');
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setIsSavingSettings(false);
    }
  }


    async function loadUsers() {
    if (!canManageUsers) return;
    const list = await api('/admin/users', undefined, true);
    setUserList(list);
  }

  

  useEffect(() => {
    adminLoad().catch((err) => canViewAdmin && showMessage(String(err), 'error'));
  }, [canViewAdmin]);

  useEffect(() => {
    loadUsers().catch((err) => canManageUsers && showMessage(String(err), 'error'));
  }, [canManageUsers]);

  async function uploadFile(file: File) {
    const form = new FormData();
    form.append('file', file);
    const authToken = token;
    const res = await fetch(API_BASE + '/admin/uploads', {
      method: 'POST',
      headers: authToken ? { Authorization: 'Bearer ' + authToken } : {},
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }



  async function saveApplication() {
    if (!applicationName) { showMessage('Application name is required', 'error'); return; }
    try {
      const method = editType === 'application' && editId ? 'PUT' : 'POST';
      const path = method === 'PUT' ? '/admin/applications/' + editId : '/admin/applications';
      await api(path, { method, body: JSON.stringify({ name: applicationName, nameDe: applicationNameDe || undefined }) }, true);
      resetApplicationForm();
      setApplicationPage(1);
      await adminLoad();
      showMessage('Application saved successfully', 'success');
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    }
  }

  async function saveCrossSection() {
    if (!crossSectionName) { showMessage('Cross-section name is required', 'error'); return; }
    try {
      const method = editType === 'cross' && editId ? 'PUT' : 'POST';
      const path = method === 'PUT' ? '/admin/cross-sections/' + editId : '/admin/cross-sections';
      await api(path, { method, body: JSON.stringify({ name: crossSectionName, nameDe: crossSectionNameDe || undefined }) }, true);
      resetCrossSectionForm();
      setCrossSectionPage(1);
      await adminLoad();
      showMessage('Cross-section saved successfully', 'success');
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    }
  }

  async function saveCurrency() {
    if (!currencyCode.trim() || !currencySymbol.trim()) {
      showMessage('Code and Symbol are required', 'error');
      return;
    }
    try {
      if (editType === 'currency' && editId) {
        await api('/admin/currencies/' + editId, {
          method: 'PUT',
          body: JSON.stringify({ code: currencyCode.trim(), symbol: currencySymbol.trim() }),
        }, true);
        showMessage(lang === 'de' ? 'Währung erfolgreich aktualisiert' : 'Currency updated successfully', 'success');
      } else {
        await api('/admin/currencies', {
          method: 'POST',
          body: JSON.stringify({ code: currencyCode.trim(), symbol: currencySymbol.trim() }),
        }, true);
        showMessage(lang === 'de' ? 'Währung erfolgreich erstellt' : 'Currency created successfully', 'success');
      }
      resetCurrencyForm();
      adminLoad();
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    }
  }

  async function saveProfile() {
    if (!profileForm.name) { showMessage('Profile name is required', 'error'); return; }
    try {
      const method = editType === 'profile' && editId ? 'PUT' : 'POST';
      const path = method === 'PUT' ? '/admin/profiles/' + editId : '/admin/profiles';
      await api(path, {
        method,
        body: JSON.stringify({
          ...profileForm,
        }),
      }, true);
      resetProfileForm();
      setProfilePage(1);
      await adminLoad();
      showMessage('Profile saved successfully', 'success');
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    }
  }

  const deleteItem = async (path: string) => {
    setConfirmAction({
      message: t.confirmDelete,
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await api(path, { method: 'DELETE' }, true);
          await adminLoad();
          showMessage('Item deleted successfully', 'success');
        } catch (err) {
          showMessage(parseApiError(err), 'error');
        }
      }
    });
  };

  async function saveUser() {
    if (!userForm.email.trim()) { showMessage('Email is required', 'error'); return; }
    try {
      const isEditing = !!userForm.id;
      await api('/admin/users' + (isEditing ? '/' + userForm.id : ''), {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify({
          email: userForm.email.trim(),
          username: userForm.username?.trim() || undefined,
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
  }

  async function deleteUser(id: number) {
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
  }

  async function seedDemoData() {
    const result = await api('/admin/demo-data/seed', { method: 'POST' }, true);
    setMessage(result.message + '. Profiles: ' + (result.totals?.profiles ?? 0));
    await adminLoad();
  }


  const applications = adminRef?.applications ?? [];
  const crossSections = adminRef?.crossSections ?? [];


  useEffect(() => setApplicationPage(1), [applicationFilter, applicationSort, applications.length]);
  useEffect(() => setCrossSectionPage(1), [crossSectionFilter, crossSectionSort, crossSections.length]);
  useEffect(() => setProfilePage(1), [profileFilter, profileSort, adminProfiles.length]);
  useEffect(() => setRolePage(1), [roleFilter, roleSort, userList.length]);

  const filteredApplications = useMemo(() => {
    const query = normalizeForSearch(applicationFilter);
    return [...applications]
      .filter((item) => !query || [item.name, item.nameDe].some((value) => normalizeForSearch(value).includes(query)))
      .sort((a, b) => {
        if (applicationSort === 'name-desc') return compareText(b.name, a.name);
        if (applicationSort === 'count-desc') return (b.profilesCount ?? 0) - (a.profilesCount ?? 0);
        return compareText(a.name, b.name);
      });
  }, [applicationFilter, applicationSort, applications]);

  const filteredCrossSections = useMemo(() => {
    let result = crossSections;
    if (crossSectionFilter) {
      const q = normalizeForSearch(crossSectionFilter);
      result = result.filter((item) => normalizeForSearch(item.name).includes(q) || (item.nameDe && normalizeForSearch(item.nameDe).includes(q)));
    }
    result.sort((left, right) => {
      if (crossSectionSort === 'name-asc') return left.name.localeCompare(right.name);
      if (crossSectionSort === 'name-desc') return right.name.localeCompare(left.name);
      if (crossSectionSort === 'count-desc') return (right.profilesCount ?? 0) - (left.profilesCount ?? 0);
      return 0;
    });
    return result;
  }, [crossSections, crossSectionFilter, crossSectionSort]);

  const currencies = adminRef?.currencies ?? [];
  const filteredCurrencies = useMemo(() => {
    let result = currencies;
    if (currencyFilter) {
      const q = normalizeForSearch(currencyFilter);
      result = result.filter((item) => normalizeForSearch(item.code).includes(q) || normalizeForSearch(item.symbol).includes(q));
    }
    result.sort((left, right) => {
      if (currencySort === 'code-asc') return left.code.localeCompare(right.code);
      if (currencySort === 'code-desc') return right.code.localeCompare(left.code);
      return 0;
    });
    return result;
  }, [currencies, currencyFilter, currencySort]);

  const filteredProfiles = useMemo(() => {
    const query = normalizeForSearch(profileFilter);
    return [...adminProfiles]
      .filter((item) => !query || [item.name, item.nameDe, item.dimensions, item.material, item.materialDe, item.status].some((value) => normalizeForSearch(value).includes(query)))
      .sort((a, b) => {
        if (profileSort === 'name-desc') return compareText(b.name, a.name);

        if (profileSort === 'status-asc') return compareText(a.status, b.status);
        return compareText(a.name, b.name);
      });
  }, [adminProfiles, profileFilter, profileSort]);

  const filteredRoles = useMemo(() => {
    const query = normalizeForSearch(roleFilter);
    return [...userList]
      .filter((item) => !query || [item.email, item.role, item.permissions.join(', ')].some((value) => normalizeForSearch(value).includes(query)))
      .sort((a, b) => {
        if (roleSort === 'role-asc') return compareText(a.role, b.role) || compareText(a.email, b.email);
        return compareText(a.email, b.email);
      });
  }, [roleFilter, roleSort, userList]);


  const applicationRows = paginateItems(filteredApplications, applicationPage);
  const crossSectionRows = paginateItems(filteredCrossSections, crossSectionPage);
  const profileRows = paginateItems(filteredProfiles, profilePage);
  const currencyRows = paginateItems(filteredCurrencies, currencyPage);
  const roleRows = paginateItems(filteredRoles, rolePage);

  function exportAdminSection(kind: 'excel' | 'pdf', title: string, headers: string[], rows: Array<Array<string | number>>) {
    if (kind === 'excel') {
      downloadCsv(title.toLowerCase().split(' ').join('-') + '.csv', headers, rows);
      return;
    }
    exportTablePdf(title, headers, rows);
  }

  return (
    <div className="min-h-screen">
      <div className="material-shell">
        {!!token && (
          <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] p-6 md:p-8 text-white shadow-2xl border border-slate-700/60 mb-6 backdrop-blur-xl">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
              <div>
                <p className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.25em] text-cyan-400 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  Catalog System
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">{t.adminPanel}</h1>
                <p className="mt-2 text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">{t.adminSubtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/catalog">
                  <button type="button" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-sm cursor-pointer">
                    {t.backToCatalog}
                  </button>
                </Link>

                <label className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-3.5 py-2 text-xs font-bold text-slate-200">
                  <span>{t.language}:</span>
                  <select className="bg-transparent font-bold text-white focus:outline-none cursor-pointer border-0 p-0" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
                    <option value="en" className="bg-slate-900 text-white">EN</option>
                    <option value="de" className="bg-slate-900 text-white">DE</option>
                  </select>
                </label>

                {token && (
                  <button type="button" onClick={logout} className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-extrabold transition-all shadow-sm cursor-pointer">
                    Logout
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-4 relative z-10">
              <div onClick={() => setActiveSection('profiles')} className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur-md transition-all cursor-pointer hover:border-cyan-500/50 group">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-cyan-400 transition-colors">{t.profiles}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-3xl font-black text-white">{adminProfiles.length}</span>
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Boxes className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div onClick={() => setActiveSection('categories')} className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur-md transition-all cursor-pointer hover:border-blue-500/50 group">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors">{t.categories}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-3xl font-black text-white">{(adminRef?.applications.length ?? 0) + (adminRef?.crossSections.length ?? 0)}</span>
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div onClick={() => setActiveSection('suppliers')} className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur-md transition-all cursor-pointer hover:border-emerald-500/50 group">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors">{t.suppliers}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-3xl font-black text-white">{adminRef?.suppliers?.length ?? 0}</span>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div onClick={() => setActiveSection('users')} className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur-md transition-all cursor-pointer hover:border-purple-500/50 group">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-purple-400 transition-colors">{t.managedUsers}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-3xl font-black text-white">{userList.length}</span>
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}



        {confirmAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setConfirmAction(null)}>
            <div className="w-full max-w-sm rounded-[1.5rem] bg-white shadow-2xl p-6 text-center" onClick={e => e.stopPropagation()}>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{t.delete}</h3>
              <p className="mb-6 text-sm text-slate-500">{confirmAction.message}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setConfirmAction(null)}>{lang === 'de' ? 'Abbrechen' : 'Cancel'}</Button>
                <Button variant="destructive" onClick={confirmAction.onConfirm}>{t.delete}</Button>
              </div>
            </div>
          </div>
        )}

        <main className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          {!token && (
            <Card className="border-0 shadow-2xl bg-gradient-to-b from-[#0f172a] via-[#0b1320] to-[#080d16] min-h-[75vh] flex items-center justify-center p-4 sm:p-8 rounded-3xl relative overflow-hidden lg:col-span-3">
              {/* Ambient Background Glows */}
              <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

              <CardContent className="w-full max-w-md p-0 z-10">
                {!forgotPasswordMode ? (
                  <form onSubmit={handleLogin} className="w-full rounded-3xl border border-slate-700/80 bg-[#131c2a]/95 p-8 shadow-2xl backdrop-blur-xl space-y-5">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-400 shadow-sm">
                        <Boxes className="h-3.5 w-3.5" /> AluProfile Admin
                      </div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">{t.login}</h2>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">Manage users, permissions, and aluminum profile master data</p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                          {t.usernameOrEmail}
                        </label>
                        <Input
                          className="rounded-2xl border-slate-700 bg-[#1e293b] text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-xs py-2.5"
                          autoComplete="username"
                          autoFocus
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="admin@aluprofile.com"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                          {t.password}
                        </label>
                        <div className="relative">
                          <Input
                            className="rounded-2xl border-slate-700 bg-[#1e293b] text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-xs py-2.5 pr-16"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.password}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                            onClick={() => setShowPassword((value: boolean) => !value)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 text-cyan-400" /> : <Eye className="h-4 w-4" />}
                            {showPassword ? t.hidePassword : t.showPassword}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs pt-1">
                      <button type="button" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer" onClick={openForgotPassword}>
                        {t.forgotPassword}
                      </button>
                    </div>

                    <Button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs py-3 shadow-lg shadow-cyan-500/20 cursor-pointer" type="submit" disabled={loginLoading}>
                      {loginLoading ? t.signingIn : t.signIn}
                    </Button>

                    <div className="pt-4 border-t border-slate-800 space-y-2.5">
                      <p className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">⚡ 1-Click Fast Auto-Fill Login</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifier('admin@aluprofile.com');
                            setPassword('admin123');
                            toast.success('Admin credentials auto-filled!');
                          }}
                          className="py-2.5 px-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-extrabold text-xs border border-cyan-500/20 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span>🔑 Admin Login</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifier('customer@aluprofile.com');
                            setPassword('customer123');
                            toast.success('Customer credentials auto-filled!');
                          }}
                          className="py-2.5 px-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-extrabold text-xs border border-blue-500/20 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span>👤 Customer Login</span>
                        </button>
                      </div>
                    </div>
                  </form>

                ) : forgotPasswordStep === 'request' ? (
                  <form onSubmit={handleForgotPasswordRequest} className="w-full rounded-3xl border border-slate-700/80 bg-[#131c2a]/95 p-8 shadow-2xl backdrop-blur-xl space-y-5">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-400 shadow-sm">
                        <Boxes className="h-3.5 w-3.5" /> AluProfile Admin
                      </div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">{t.forgotPassword}</h2>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{t.resetPasswordHelp}</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        {t.usernameOrEmail}
                      </label>
                      <Input
                        className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5"
                        autoComplete="username"
                        autoFocus
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="admin@aluprofile.com"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button type="button" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer" onClick={backToLogin}>
                        {t.backToLogin}
                      </button>
                    </div>

                    <Button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-extrabold text-xs py-3 shadow-lg shadow-cyan-500/20 cursor-pointer" type="submit" disabled={forgotPasswordLoading}>
                      {forgotPasswordLoading ? t.sendingResetCode : t.sendResetCode}
                    </Button>
                  </form>
                ) : (

                  <form onSubmit={handleForgotPasswordReset} className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/95 p-7 shadow-[0_30px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm"><div className="mb-6 text-center space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">catalog system</p><h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">{t.forgotPassword}</h2></div>
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700">
                        {t.resetCode}
                        <Input
                          className="mt-1"
                          autoComplete="one-time-code"
                          autoFocus
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          placeholder={t.resetCode}
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        {t.newPassword}
                        <div className="relative mt-1">
                          <Input
                            className="pr-16"
                            type={showResetPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            placeholder={t.newPassword}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-xs font-medium text-slate-500"
                            onClick={() => setShowResetPassword((value: boolean) => !value)}
                          >
                            {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showResetPassword ? t.hidePassword : t.showPassword}
                          </button>
                        </div>
                      </label>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button type="button" className="text-sm font-medium text-teal-700 hover:text-teal-800" onClick={backToLogin}>
                        {t.backToLogin}
                      </button>
                    </div>
                    <Button className="mt-4 w-full" type="submit" disabled={forgotPasswordLoading}>
                      {forgotPasswordLoading ? t.resettingPassword : t.setNewPassword}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {token && !canViewAdmin && (
              <Card className="material-panel lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 text-2xl tracking-[-0.02em]"><Shield className="h-5 w-5" /> {t.accessDenied}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t.signedInAs} {user?.email ?? t.unknownUser}, but {t.accessDeniedText}
                  </p>
                </CardContent>
              </Card>
            )}

          {token && canViewAdmin && (
              <>
                <aside className="admin-sidebar">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">catalog system</p>
                  <p className="mt-3 text-2xl font-black tracking-[-0.03em] text-white">{t.adminPanel} (V2)</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{t.adminSubtitle}</p>
                  <div className="mt-6 space-y-2">
                    <button type="button" className={`admin-nav-link ${activeSection === 'overview' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('overview')}><span>{t.quickActions}</span><ChevronRight className="h-4 w-4" /></button>
                    <button type="button" className={`admin-nav-link ${activeSection === 'landing' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('landing')}><span>Landing Page UI</span><ChevronRight className="h-4 w-4" /></button>
                    {canManageProfiles && <button type="button" className={`admin-nav-link ${activeSection === 'profiles' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('profiles')}><span>{t.profileControls}</span><ChevronRight className="h-4 w-4" /></button>}


                    {canManageCategories && <button type="button" className={`admin-nav-link ${activeSection === 'categories' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('categories')}><span>{t.categoryControls}</span><ChevronRight className="h-4 w-4" /></button>}
                    {canManageCategories && <button type="button" className={`admin-nav-link ${activeSection === 'currencies' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('currencies')}><span>{t.currencies}</span><ChevronRight className="h-4 w-4" /></button>}
                    {canManageUsers && <button type="button" className={`admin-nav-link ${activeSection === 'users' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('users')}><span>{t.clerkUsers}</span><ChevronRight className="h-4 w-4" /></button>}
                    {canManageUsers && <button type="button" className={`admin-nav-link ${activeSection === 'roles' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('roles')}><span>{t.appRolePermissions}</span><ChevronRight className="h-4 w-4" /></button>}
                  </div>
                  <div className="mt-6 rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                    <p className="font-semibold uppercase tracking-[0.24em] text-slate-400">{t.role}</p>
                    <p className="mt-2 text-sm font-medium text-white">{user?.role ?? '-'}</p>
                    <p className="mt-4 font-semibold uppercase tracking-[0.24em] text-slate-400">{t.permissions}</p>
                    <div className="mt-2 flex flex-wrap gap-2">{permissions.map((permission) => <span key={permission} className="rounded-full bg-white/10 px-3 py-1">{permission}</span>)}</div>
                  </div>
                </aside>
                <div className="space-y-6">
                  {activeSection === 'overview' && (
                    <Card id="admin-overview" className="material-panel">
                      <CardHeader className="border-b border-slate-200/80">
                        <CardTitle className="flex items-center gap-3"><Wrench className="h-5 w-5 text-teal-700" /> {t.quickActions}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                          <div className="admin-action-tile cursor-default border-blue-200 bg-blue-50/60 col-span-1 md:col-span-2 xl:col-span-3">
                            <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
                              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Google Analytics & Visitor Metrics</span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> GA4 Active (G-5FEVSRGPSV)
                              </span>
                            </div>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="bg-white rounded-xl p-3.5 border border-blue-100 shadow-sm">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Website Visits</span>
                                <p className="text-2xl font-black text-slate-900 mt-1">{websiteVisits ?? '-'}</p>
                                <span className="text-[10px] text-slate-400 font-medium">Logged DSGVO-Compliant Visits</span>
                              </div>
                              <div className="bg-white rounded-xl p-3.5 border border-blue-100 shadow-sm">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">GA Measurement Tag</span>
                                <p className="text-lg font-extrabold text-blue-600 mt-1 font-mono">G-5FEVSRGPSV</p>
                                <span className="text-[10px] text-slate-400 font-medium">Google Tag Manager Connected</span>
                              </div>
                              <div className="bg-white rounded-xl p-3.5 border border-blue-100 shadow-sm">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">GDPR Consent Status</span>
                                <p className="text-lg font-bold text-emerald-600 mt-1">Opt-In Enforced</p>
                                <span className="text-[10px] text-slate-400 font-medium">Analytics & Marketing Banner Active</span>
                              </div>
                            </div>
                          </div>

                          {canManageProfiles && <button type="button" className="admin-action-tile" onClick={() => setActiveSection('profiles')}><span className="text-xs uppercase tracking-[0.2em] text-primary/70">{t.quickActions}</span><span className="mt-3 text-xl font-bold text-slate-950">{t.profileControls}</span><span className="mt-2 text-sm text-slate-600">{adminProfiles.length} {t.records}</span><span className="mt-3 text-sm text-slate-500">Create, edit, and review technical profile entries.</span></button>}


                          {canManageCategories && <button type="button" className="admin-action-tile" onClick={() => setActiveSection('categories')}><span className="text-xs uppercase tracking-[0.2em] text-primary/70">{t.quickActions}</span><span className="mt-3 text-xl font-bold text-slate-950">{t.categoryControls}</span><span className="mt-2 text-sm text-slate-600">{applications.length + crossSections.length} {t.records}</span><span className="mt-3 text-sm text-slate-500">Organize applications and cross-sections for search.</span></button>}
                          {canManageCategories && <button type="button" className="admin-action-tile" onClick={() => setActiveSection('currencies')}><span className="text-xs uppercase tracking-[0.2em] text-primary/70">{t.quickActions}</span><span className="mt-3 text-xl font-bold text-slate-950">{t.currencies}</span><span className="mt-2 text-sm text-slate-600">{adminRef?.currencies.length || 0} {t.records}</span><span className="mt-3 text-sm text-slate-500">Manage currencies for profile pricing.</span></button>}
                          {canManageUsers && <button type="button" className="admin-action-tile" onClick={() => setActiveSection('users')}><span className="text-xs uppercase tracking-[0.2em] text-primary/70">{t.quickActions}</span><span className="mt-3 text-xl font-bold text-slate-950">{t.clerkUsers}</span><span className="mt-2 text-sm text-slate-600">{userList.length} {t.records}</span><span className="mt-3 text-sm text-slate-500">Invite, update, and remove authenticated users.</span></button>}
                          {canManageUsers && <button type="button" className="admin-action-tile" onClick={() => setActiveSection('roles')}><span className="text-xs uppercase tracking-[0.2em] text-primary/70">{t.quickActions}</span><span className="mt-3 text-xl font-bold text-slate-950">{t.appRolePermissions}</span><span className="mt-2 text-sm text-slate-600">{roleRows.total} {t.records}</span><span className="mt-3 text-sm text-slate-500">Control role assignment and section permissions.</span></button>}
                        </div>
                        <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50/80 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{t.seedDemoData}</p>
                              <p className="text-sm text-slate-600">Use demo content to populate profiles, suppliers, and category records for review.</p>
                            </div>
                            <Button onClick={seedDemoData}>{t.seedDemoData}</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === 'landing' && (
                    <Card id="admin-landing" className="material-panel">
                      <CardHeader className="border-b border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-3 text-slate-950 font-extrabold text-xl"><Boxes className="h-5 w-5 text-blue-600" /> Landing Page Settings & Controls</CardTitle>
                          <Button onClick={saveSiteSettings} disabled={isSavingSettings} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
                            {isSavingSettings ? 'Saving...' : 'Save Settings'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4">
                          <h4 className="font-extrabold text-slate-900 text-sm border-b pb-2">Hero Banner Configuration</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block text-xs font-bold text-slate-700">
                              Hero Title
                              <Input className="mt-1" value={siteSettingsForm.heroTitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, heroTitle: e.target.value }))} />
                            </label>
                            <label className="block text-xs font-bold text-slate-700">
                              Hero Background Color
                              <div className="flex items-center gap-2 mt-1">
                                <input type="color" className="h-9 w-12 rounded border p-1 cursor-pointer" value={siteSettingsForm.heroBgColor || '#3c4a5c'} onChange={e => setSiteSettingsForm(f => ({ ...f, heroBgColor: e.target.value }))} />
                                <Input value={siteSettingsForm.heroBgColor || '#3c4a5c'} onChange={e => setSiteSettingsForm(f => ({ ...f, heroBgColor: e.target.value }))} />
                              </div>
                            </label>
                          </div>

                          <label className="block text-xs font-bold text-slate-700">
                            Hero Subtitle
                            <textarea className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-primary focus:outline-none" rows={2} value={siteSettingsForm.heroSubtitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, heroSubtitle: e.target.value }))} />
                          </label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block text-xs font-bold text-slate-700">
                              Hero Image URL / File Upload
                              <div className="flex items-center gap-2 mt-1">
                                <Input value={siteSettingsForm.heroImageUrl || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, heroImageUrl: e.target.value }))} placeholder="/hero-3d-profile.png" />
                                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-xs font-bold shrink-0 border border-slate-300">
                                  Upload
                                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const res = await uploadFile(file);
                                        setSiteSettingsForm(f => ({ ...f, heroImageUrl: res.url }));
                                        toast.success('Hero image uploaded!');
                                      } catch (err) {
                                        toast.error(parseApiError(err));
                                      }
                                    }
                                  }} />
                                </label>
                              </div>
                            </label>

                            <label className="block text-xs font-bold text-slate-700">
                              Search Box Placeholder Text
                              <Input className="mt-1" value={siteSettingsForm.heroSearchPlaceholder || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, heroSearchPlaceholder: e.target.value }))} />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                          <h4 className="font-extrabold text-slate-900 text-sm border-b pb-2">Stats Cards Settings</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border">
                              <span className="text-xs font-bold text-slate-700">Stat Card 1</span>
                              <Input placeholder="Main label (e.g. 150+ Profiles)" value={siteSettingsForm.stat1Label || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat1Label: e.target.value }))} />
                              <Input placeholder="Subtitle (e.g. Standard & Custom)" value={siteSettingsForm.stat1Sub || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat1Sub: e.target.value }))} />
                            </div>

                            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border">
                              <span className="text-xs font-bold text-slate-700">Stat Card 2</span>
                              <Input placeholder="Main label (e.g. 12+ Partners)" value={siteSettingsForm.stat2Label || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat2Label: e.target.value }))} />
                              <Input placeholder="Subtitle (e.g. Global Network)" value={siteSettingsForm.stat2Sub || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat2Sub: e.target.value }))} />
                            </div>

                            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border">
                              <span className="text-xs font-bold text-slate-700">Stat Card 3</span>
                              <Input placeholder="Main label (e.g. 9,850+ Downloads)" value={siteSettingsForm.stat3Label || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat3Label: e.target.value }))} />
                              <Input placeholder="Subtitle (e.g. Datasheets)" value={siteSettingsForm.stat3Sub || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat3Sub: e.target.value }))} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                          <h4 className="font-extrabold text-slate-900 text-sm border-b pb-2">Section Titles & Content</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block text-xs font-bold text-slate-700">
                              Featured Section Title
                              <Input className="mt-1" value={siteSettingsForm.featuredTitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, featuredTitle: e.target.value }))} />
                            </label>
                            <label className="block text-xs font-bold text-slate-700">
                              How It Works Title
                              <Input className="mt-1" value={siteSettingsForm.howItWorksTitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, howItWorksTitle: e.target.value }))} />
                            </label>
                          </div>
                          <label className="block text-xs font-bold text-slate-700">
                            How It Works Subtitle
                            <Input className="mt-1" value={siteSettingsForm.howItWorksSubtitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, howItWorksSubtitle: e.target.value }))} />
                          </label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <label className="block text-xs font-bold text-slate-700">
                              About Section Title
                              <Input className="mt-1" value={siteSettingsForm.aboutTitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, aboutTitle: e.target.value }))} />
                            </label>
                            <label className="block text-xs font-bold text-slate-700">
                              About Section Subtitle / Description
                              <textarea className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-primary focus:outline-none" rows={2} value={siteSettingsForm.aboutSubtitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, aboutSubtitle: e.target.value }))} />
                            </label>
                          </div>
                        </div>


                        <div className="pt-4 flex justify-end">
                          <Button onClick={saveSiteSettings} disabled={isSavingSettings} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2">
                            {isSavingSettings ? 'Saving Settings...' : 'Save All Settings'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}


                {activeSection === 'users' && <div id="admin-users"><ClerkUsersPanel canManageUsers={canManageUsers} lang={lang} /></div>}

                {activeSection === 'roles' && canManageUsers && (
                  <Card id="admin-roles" className="material-panel">
                    <CardHeader className="border-b border-slate-200/80">
                      <div className="admin-section-toolbar">
                        <CardTitle className="flex items-center gap-3"><UserCog className="h-5 w-5 text-teal-700" /> {t.appRolePermissions}</CardTitle>
                        <Button variant={showRoleForm ? 'secondary' : 'default'} onClick={() => showRoleForm ? resetRoleForm() : setShowRoleForm(true)}>{showRoleForm ? t.closeEditor : t.addAccessRule}</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      {showRoleForm && (
                        <div className="admin-editor-grid">
                          <Input placeholder={t.email} value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))} disabled={!!userForm.id} />
                          <Input placeholder={t.usernameOrEmail.replace(' or email', '').replace(' oder E-Mail', '')} value={userForm.username ?? ''} onChange={(e) => setUserForm((f) => ({ ...f, username: e.target.value }))} />
                          <Input type="password" placeholder={t.password} value={userForm.password ?? ''} onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))} />
                          <select value={userForm.role} onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value as AppRole }))} className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
                            {(adminRef?.roleOptions ?? ['ADMIN', 'MANAGER', 'USER']).map((role) => <option key={role} value={role}>{role}</option>)}
                          </select>
                          <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
                            {(adminRef?.permissionOptions ?? ['VIEW_ADMIN', 'PROFILES_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE', 'SUPPLIERS_MANAGE'] as AppPermission[]).map((permission) => (
                              <label key={permission} className="flex items-center gap-2 rounded-[1rem] border border-slate-200 bg-slate-50/80 p-3">
                                <input type="checkbox" checked={userForm.permissions.includes(permission)} onChange={(e) => setUserForm((f) => ({ ...f, permissions: e.target.checked ? [...new Set([...f.permissions, permission])] : f.permissions.filter((item) => item !== permission) }))} className="rounded border-slate-300 text-teal-600 focus:ring-teal-600" />
                                <KeyRound className="h-4 w-4 text-teal-700" />
                                <span className="text-sm">{permission}</span>
                              </label>
                            ))}
                          </div>
                          <div className="admin-editor-actions md:col-span-2">
                            <Button onClick={saveUser}>{t.save}</Button>
                            <Button variant="outline" onClick={resetRoleForm}>{t.cancel}</Button>
                          </div>
                        </div>
                      )}
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                        <Input placeholder={t.filterRoles} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} />
                        <select value={roleSort} onChange={(e) => setRoleSort(e.target.value as 'user-asc' | 'role-asc')} className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
                          <option value="user-asc">{t.nameAsc || 'Email A-Z'}</option>
                          <option value="role-asc">{t.roleAsc || 'Role A-Z'}</option>
                        </select>
                        <Button variant="outline" onClick={() => exportAdminSection('excel', t.appRolePermissions, [t.email, t.role, t.permissions || 'Permissions'], filteredRoles.map((item) => [item.email, item.role, item.permissions.join(', ')]))}>{t.exportExcel}</Button>
                        <Button variant="outline" onClick={() => exportAdminSection('pdf', t.appRolePermissions, [t.email, t.role, t.permissions || 'Permissions'], filteredRoles.map((item) => [item.email, item.role, item.permissions.join(', ')]))}>{t.exportPdf}</Button>
                      </div>
                      <div className="admin-table-wrap">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><th className="px-4 py-3">{t.email}</th><th className="px-4 py-3">{t.usernameOrEmail.replace(' or email', '').replace(' oder E-Mail', '')}</th><th className="px-4 py-3">{t.role}</th><th className="px-4 py-3">{t.permissions || 'Permissions'}</th><th className="px-4 py-3 text-right">{t.actions}</th></tr></thead>
                          <tbody>
                            {roleRows.items.map((item) => (
                              <tr key={item.id} className="material-table-row">
                                <td className="px-4 py-3 font-medium text-slate-900">{item.email}</td>
                                <td className="px-4 py-3 text-slate-600">{item.username || '-'}</td>
                                <td className="px-4 py-3"><span className="material-chip bg-slate-100 text-slate-700">{item.role}</span></td>
                                <td className="px-4 py-3 text-slate-600">{item.permissions.join(', ')}</td>
                                <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => startEditRole(item)}>{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteUser(item.id)}>{t.delete}</Button></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="admin-pagination"><span>{t.showing} {roleRows.start}-{roleRows.end} / {roleRows.total} {t.records}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={roleRows.page <= 1} onClick={() => setRolePage((page) => page - 1)}>{t.previous}</Button><span>{t.pageLabel} {roleRows.page} {t.ofLabel} {roleRows.totalPages}</span><Button size="sm" variant="outline" disabled={roleRows.page >= roleRows.totalPages} onClick={() => setRolePage((page) => page + 1)}>{t.next}</Button></div></div>
                      <p className="mt-3 flex items-center gap-1 text-xs text-slate-500"><BadgeCheck className="h-3 w-3" /> {t.backendEnforced || 'Backend Enforced'}</p>
                    </CardContent>
                  </Card>
                )}
                
            {activeSection === 'currencies' && canManageCategories && (
              <div id="admin-currencies" className="space-y-6">
                <Card className="material-panel ">
                    <CardHeader className="border-b border-slate-200/80">
                      <div className="admin-section-toolbar">
                        <CardTitle className="flex items-center gap-3"><BadgeCheck className="h-5 w-5 text-teal-700" /> {t.currencies}</CardTitle>
                        <Button variant={showCurrencyForm ? 'secondary' : 'default'} onClick={() => showCurrencyForm ? resetCurrencyForm() : setShowCurrencyForm(true)}>{showCurrencyForm ? t.closeEditor : t.addCurrency}</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      {showCurrencyForm && (
                        <div className="admin-editor-grid">
                          <Input placeholder={t.currencyCode} value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} />
                          <Input placeholder={t.currencySymbol} value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} />
                          <div className="admin-editor-actions md:col-span-2">
                            <Button onClick={saveCurrency}>{t.saveCurrency}</Button>
                            <Button variant="outline" onClick={resetCurrencyForm}>{t.cancel}</Button>
                          </div>
                        </div>
                      )}
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                        <Input placeholder={t.filterCurrencies} value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)} />
                        <select value={currencySort} onChange={(e) => setCurrencySort(e.target.value as 'code-asc' | 'code-desc')}>
                          <option value="code-asc">{t.nameAsc}</option>
                          <option value="code-desc">{t.nameDesc}</option>
                        </select>
                      </div>
                      <div className="admin-table-wrap">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><th className="px-4 py-3">{t.currencyCode}</th><th className="px-4 py-3">{t.currencySymbol}</th><th className="px-4 py-3 text-right">{t.actions}</th></tr></thead>
                          <tbody>
                            {currencyRows.items.map((item) => (
                              <tr key={item.id} className="material-table-row">
                                <td className="px-4 py-3 font-medium text-slate-900">{item.code}</td>
                                <td className="px-4 py-3 text-slate-600">{item.symbol}</td>
                                <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => startEditCurrency(item)}>{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteItem('/admin/currencies/' + item.id)}>{t.delete}</Button></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="admin-pagination"><span>{t.showing} {currencyRows.start}-{currencyRows.end} / {currencyRows.total} {t.records}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={currencyRows.page <= 1} onClick={() => setCurrencyPage((page) => page - 1)}>{t.previous}</Button><span>{t.pageLabel} {currencyRows.page} {t.ofLabel} {currencyRows.totalPages}</span><Button size="sm" variant="outline" disabled={currencyRows.page >= currencyRows.totalPages} onClick={() => setCurrencyPage((page) => page + 1)}>{t.next}</Button></div></div>
                    </CardContent>
                  </Card>
              </div>
            )}

            {activeSection === 'suppliers' && canManageSuppliers && (
              <div className="space-y-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-xl font-bold text-slate-900">{t.supplierControls}</h2>
                  <Button onClick={() => { resetSupplierForm(); setShowSupplierForm(true); }} className="gap-2">
                    <span className="text-lg leading-none">+</span> {t.addSupplier}
                  </Button>
                </div>

                <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <Input
                        placeholder={t.filterSuppliers}
                        value={supplierFilter}
                        onChange={(e) => { setSupplierFilter(e.target.value); setSupplierPage(1); }}
                        className="max-w-xs"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="p-4 font-semibold">{t.name}</th>
                            <th className="p-4 font-semibold">{t.contactPerson}</th>
                            <th className="p-4 font-semibold">{t.email}</th>
                            <th className="p-4 font-semibold text-right">{t.actions}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(adminRef?.suppliers || []).filter(s => normalizeForSearch(s.name).includes(normalizeForSearch(supplierFilter))).slice((supplierPage - 1) * PAGE_SIZE, supplierPage * PAGE_SIZE).map((item) => (
                            <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
                              <td className="p-4 font-medium text-slate-900">{item.name}</td>
                              <td className="p-4 text-slate-600">{item.contactPerson || '-'}</td>
                              <td className="p-4 text-slate-600">{item.email || '-'}</td>
                              <td className="p-4 text-right">
                                <Button variant="ghost" size="sm" onClick={() => startEditSupplier(item)} className="text-primary hover:bg-primary/10 hover:text-primary">
                                  {t.edit}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteItem('/admin/suppliers/' + item.id)} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                  {t.delete}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {showSupplierForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h3 className="text-lg font-semibold text-slate-900">{editType === 'supplier' ? t.edit : t.addSupplier}</h3>
                        <button onClick={resetSupplierForm} className="text-slate-400 hover:text-slate-600">×</button>
                      </div>
                      <div className="space-y-4 p-6">
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.name} *</label><Input value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.name} (DE)</label><Input value={supplierForm.nameDe} onChange={e => setSupplierForm(f => ({ ...f, nameDe: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.contactPerson}</label><Input value={supplierForm.contactPerson} onChange={e => setSupplierForm(f => ({ ...f, contactPerson: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.email}</label><Input value={supplierForm.email} onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.phone}</label><Input value={supplierForm.phone} onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.website}</label><Input value={supplierForm.website} onChange={e => setSupplierForm(f => ({ ...f, website: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.address}</label><Input value={supplierForm.address} onChange={e => setSupplierForm(f => ({ ...f, address: e.target.value }))} /></div>
                        <div><label className="mb-1 block text-sm font-medium text-slate-700">{t.uid}</label><Input value={supplierForm.uid} onChange={e => setSupplierForm(f => ({ ...f, uid: e.target.value }))} /></div>
                        <Button onClick={saveSupplier} className="w-full" disabled={!supplierForm.name}>{t.saveSupplier}</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeSection === 'categories' && canManageCategories && (
                <div id="admin-categories" className="space-y-6">
                  <Card className="material-panel">
                    <CardHeader className="border-b border-slate-200/80">
                      <div className="admin-section-toolbar">
                        <CardTitle className="flex items-center gap-3"><Layers className="h-5 w-5 text-teal-700" /> {t.application}</CardTitle>
                        <Button variant={showApplicationForm ? 'secondary' : 'default'} onClick={() => showApplicationForm ? resetApplicationForm() : setShowApplicationForm(true)}>{showApplicationForm ? t.closeEditor : t.addApplication}</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      {showApplicationForm && (
                        <div className="admin-editor-grid">
                          <Input placeholder={t.appName + ' (EN)'} value={applicationName} onChange={(e) => setApplicationName(e.target.value)} />
                          <Input placeholder={t.appName + ' (DE)'} value={applicationNameDe} onChange={(e) => setApplicationNameDe(e.target.value)} />
                          <div className="admin-editor-actions md:col-span-2">
                            <Button onClick={saveApplication}>{t.saveApplication}</Button>
                            <Button variant="outline" onClick={resetApplicationForm}>{t.cancel}</Button>
                          </div>
                        </div>
                      )}
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                        <Input placeholder={t.filterApplications} value={applicationFilter} onChange={(e) => setApplicationFilter(e.target.value)} />
                        <select value={applicationSort} onChange={(e) => setApplicationSort(e.target.value as 'name-asc' | 'name-desc' | 'count-desc')}>
                          <option value="name-asc">{t.nameAsc}</option>
                          <option value="name-desc">{t.nameDesc}</option>
                          <option value="count-desc">{t.countDesc}</option>
                        </select>
                        <Button variant="outline" onClick={() => exportAdminSection('excel', t.application, [t.name, t.profileCount], filteredApplications.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))}>{t.exportExcel}</Button>
                        <Button variant="outline" onClick={() => exportAdminSection('pdf', t.application, [t.name, t.profileCount], filteredApplications.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))}>{t.exportPdf}</Button>
                      </div>
                      <div className="admin-table-wrap">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><th className="px-4 py-3">{t.name}</th><th className="px-4 py-3">{t.profileCount}</th><th className="px-4 py-3 text-right">{t.actions}</th></tr></thead>
                          <tbody>
                            {applicationRows.items.map((item) => (
                              <tr key={item.id} className="material-table-row">
                                <td className="px-4 py-3 font-medium text-slate-900">{item.name}{item.nameDe ? ' / ' + item.nameDe : ''}</td>
                                <td className="px-4 py-3 text-slate-600">{item.profilesCount ?? 0}</td>
                                <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => startEditApplication(item)}>{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteItem('/admin/applications/' + item.id)}>{t.delete}</Button></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="admin-pagination"><span>{t.showing} {applicationRows.start}-{applicationRows.end} / {applicationRows.total} {t.records}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={applicationRows.page <= 1} onClick={() => setApplicationPage((page) => page - 1)}>{t.previous}</Button><span>{t.pageLabel} {applicationRows.page} {t.ofLabel} {applicationRows.totalPages}</span><Button size="sm" variant="outline" disabled={applicationRows.page >= applicationRows.totalPages} onClick={() => setApplicationPage((page) => page + 1)}>{t.next}</Button></div></div>
                    </CardContent>
                  </Card>

                  <Card className="material-panel">
                    <CardHeader className="border-b border-slate-200/80">
                      <div className="admin-section-toolbar">
                        <CardTitle className="flex items-center gap-3"><Layers className="h-5 w-5 text-teal-700" /> {t.crossSection}</CardTitle>
                        <Button variant={showCrossSectionForm ? 'secondary' : 'default'} onClick={() => showCrossSectionForm ? resetCrossSectionForm() : setShowCrossSectionForm(true)}>{showCrossSectionForm ? t.closeEditor : t.addCrossSection}</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      {showCrossSectionForm && (
                        <div className="admin-editor-grid">
                          <Input placeholder={t.crossSectionName + ' (EN)'} value={crossSectionName} onChange={(e) => setCrossSectionName(e.target.value)} />
                          <Input placeholder={t.crossSectionName + ' (DE)'} value={crossSectionNameDe} onChange={(e) => setCrossSectionNameDe(e.target.value)} />
                          <div className="admin-editor-actions md:col-span-2">
                            <Button onClick={saveCrossSection}>{t.saveCrossSection}</Button>
                            <Button variant="outline" onClick={resetCrossSectionForm}>{t.cancel}</Button>
                          </div>
                        </div>
                      )}
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                        <Input placeholder={t.filterCrossSections} value={crossSectionFilter} onChange={(e) => setCrossSectionFilter(e.target.value)} />
                        <select value={crossSectionSort} onChange={(e) => setCrossSectionSort(e.target.value as 'name-asc' | 'name-desc' | 'count-desc')}>
                          <option value="name-asc">{t.nameAsc}</option>
                          <option value="name-desc">{t.nameDesc}</option>
                          <option value="count-desc">{t.countDesc}</option>
                        </select>
                        <Button variant="outline" onClick={() => exportAdminSection('excel', t.crossSection, [t.name, t.profileCount], filteredCrossSections.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))}>{t.exportExcel}</Button>
                        <Button variant="outline" onClick={() => exportAdminSection('pdf', t.crossSection, [t.name, t.profileCount], filteredCrossSections.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))}>{t.exportPdf}</Button>
                      </div>
                      <div className="admin-table-wrap">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><th className="px-4 py-3">{t.name}</th><th className="px-4 py-3">{t.profileCount}</th><th className="px-4 py-3 text-right">{t.actions}</th></tr></thead>
                          <tbody>
                            {crossSectionRows.items.map((item) => (
                              <tr key={item.id} className="material-table-row">
                                <td className="px-4 py-3 font-medium text-slate-900">{item.name}{item.nameDe ? ' / ' + item.nameDe : ''}</td>
                                <td className="px-4 py-3 text-slate-600">{item.profilesCount ?? 0}</td>
                                <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => startEditCrossSection(item)}>{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteItem('/admin/cross-sections/' + item.id)}>{t.delete}</Button></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="admin-pagination"><span>{t.showing} {crossSectionRows.start}-{crossSectionRows.end} / {crossSectionRows.total} {t.records}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={crossSectionRows.page <= 1} onClick={() => setCrossSectionPage((page) => page - 1)}>{t.previous}</Button><span>{t.pageLabel} {crossSectionRows.page} {t.ofLabel} {crossSectionRows.totalPages}</span><Button size="sm" variant="outline" disabled={crossSectionRows.page >= crossSectionRows.totalPages} onClick={() => setCrossSectionPage((page) => page + 1)}>{t.next}</Button></div></div>
                    </CardContent>
                  </Card>

                  
                </div>
                )}

                {activeSection === 'profiles' && canManageProfiles && (
                <Card id="admin-profiles" className="material-panel">
                  <CardHeader className="border-b border-slate-200/80">
                    <div className="admin-section-toolbar">
                      <CardTitle className="flex items-center gap-3"><Boxes className="h-5 w-5 text-teal-700" /> {t.profileControls}</CardTitle>
                      <Button variant={showProfileForm ? 'secondary' : 'default'} onClick={() => showProfileForm ? resetProfileForm() : setShowProfileForm(true)}>{showProfileForm ? t.closeEditor : t.addProfile}</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    {showProfileForm && (
                      <div className="admin-editor-grid admin-editor-grid-wide">
                        <Input placeholder={t.name + ' (EN)'} value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
                        <Input placeholder={t.name + ' (DE)'} value={profileForm.nameDe} onChange={(e) => setProfileForm((f) => ({ ...f, nameDe: e.target.value }))} />
                        <Input placeholder="Description (EN)" value={profileForm.description} onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))} />
                        <Input placeholder="Description (DE)" value={profileForm.descriptionDe} onChange={(e) => setProfileForm((f) => ({ ...f, descriptionDe: e.target.value }))} />
                        <Input placeholder="Usage (EN)" value={profileForm.usage} onChange={(e) => setProfileForm((f) => ({ ...f, usage: e.target.value }))} />
                        <Input placeholder="Usage (DE)" value={profileForm.usageDe} onChange={(e) => setProfileForm((f) => ({ ...f, usageDe: e.target.value }))} />
                        <Input placeholder={t.dimensions} value={profileForm.dimensions} onChange={(e) => setProfileForm((f) => ({ ...f, dimensions: e.target.value }))} />
                        <Input placeholder="Weight/m" value={profileForm.weightPerMeter} onChange={(e) => setProfileForm((f) => ({ ...f, weightPerMeter: e.target.value }))} />
                        <Input placeholder="Length mm" value={profileForm.lengthMm} onChange={(e) => setProfileForm((f) => ({ ...f, lengthMm: e.target.value }))} />
                        <Input placeholder="Material (EN)" value={profileForm.material} onChange={(e) => setProfileForm((f) => ({ ...f, material: e.target.value }))} />
                        <Input placeholder="Material (DE)" value={profileForm.materialDe} onChange={(e) => setProfileForm((f) => ({ ...f, materialDe: e.target.value }))} />
                        <Input placeholder={t.price} value={profileForm.price} onChange={(e) => setProfileForm((f) => ({ ...f, price: e.target.value }))} />
                        <select value={profileForm.currencyId} onChange={(e) => setProfileForm((f) => ({ ...f, currencyId: e.target.value }))}>
                          <option value="">-- Select {t.currency} --</option>
                          {adminRef?.currencies.map((currency) => <option key={currency.id} value={currency.id}>{currency.code} ({currency.symbol})</option>)}
                        </select>
                        <select value={profileForm.status} onChange={(e) => setProfileForm((f) => ({ ...f, status: e.target.value }))}>
                          {adminRef?.statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <select multiple value={profileForm.applicationIds.map(String)} onChange={(e) => setProfileForm((f) => ({ ...f, applicationIds: Array.from(e.target.selectedOptions).map((option) => Number(option.value)) }))}>
                          {applications.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                        <select multiple value={profileForm.crossSectionIds.map(String)} onChange={(e) => setProfileForm((f) => ({ ...f, crossSectionIds: Array.from(e.target.selectedOptions).map((option) => Number(option.value)) }))}>
                          {crossSections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                      <div className="admin-upload-field">
                        <div className="mb-1 text-sm font-medium text-slate-700">{t.drawingFile} <span className="text-xs text-slate-400 font-normal ml-2">(pdf, jpg, png, bmp)</span></div>
                        {profileForm.drawingUrl ? (
                          <div className="flex flex-col gap-2 rounded-lg border bg-slate-50 p-2 mt-1">
                            <div className="flex items-center justify-between">
                              <a href={profileForm.drawingUrl} target="_blank" rel="noreferrer" className="truncate text-sm text-blue-600 hover:underline font-medium" title={profileForm.drawingUrl.split('/').pop()}>{profileForm.drawingUrl.split('/').pop()}</a>
                              <Button size="sm" variant="destructive" type="button" onClick={() => setProfileForm((f) => ({ ...f, drawingUrl: '' }))}>{t.delete}</Button>
                            </div>
                            <div className="relative h-48 w-full overflow-hidden rounded-md border bg-white flex items-center justify-center">
                              {/\.(jpeg|jpg|gif|png|svg|bmp)(\?.*)?$/i.test(profileForm.drawingUrl) ? (
                                <img src={profileForm.drawingUrl} alt="Preview" className="h-full w-full object-contain" />
                              ) : /\.(pdf)(\?.*)?$/i.test(profileForm.drawingUrl) ? (
                                <iframe src={profileForm.drawingUrl} title="Preview" className="h-full w-full border-0" />
                              ) : (
                                <div className="text-slate-400 text-sm">Preview not available</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <input className="mt-1 block w-full text-sm" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const data = await uploadFile(file); setProfileForm((f) => ({ ...f, drawingUrl: data.url })); }} />
                        )}
                      </div>
                      <div className="admin-upload-field">
                        <div className="mb-1 text-sm font-medium text-slate-700">{t.photoFile} <span className="text-xs text-slate-400 font-normal ml-2">(pdf, jpg, png, bmp)</span></div>
                        {profileForm.photoUrl ? (
                          <div className="flex flex-col gap-2 rounded-lg border bg-slate-50 p-2 mt-1">
                            <div className="flex items-center justify-between">
                              <a href={profileForm.photoUrl} target="_blank" rel="noreferrer" className="truncate text-sm text-blue-600 hover:underline font-medium" title={profileForm.photoUrl.split('/').pop()}>{profileForm.photoUrl.split('/').pop()}</a>
                              <Button size="sm" variant="destructive" type="button" onClick={() => setProfileForm((f) => ({ ...f, photoUrl: '' }))}>{t.delete}</Button>
                            </div>
                            <div className="relative h-48 w-full overflow-hidden rounded-md border bg-white flex items-center justify-center">
                              {/\.(jpeg|jpg|gif|png|svg|bmp)(\?.*)?$/i.test(profileForm.photoUrl) ? (
                                <img src={profileForm.photoUrl} alt="Preview" className="h-full w-full object-contain" />
                              ) : /\.(pdf)(\?.*)?$/i.test(profileForm.photoUrl) ? (
                                <iframe src={profileForm.photoUrl} title="Preview" className="h-full w-full border-0" />
                              ) : (
                                <div className="text-slate-400 text-sm">Preview not available</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <input className="mt-1 block w-full text-sm" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const data = await uploadFile(file); setProfileForm((f) => ({ ...f, photoUrl: data.url })); }} />
                        )}
                      </div>
                        <div className="admin-editor-actions md:col-span-3">
                          <Button onClick={saveProfile}>{t.saveProfile}</Button>
                          <Button variant="outline" onClick={resetProfileForm}>{t.cancel}</Button>
                        </div>
                      </div>
                    )}
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                      <Input placeholder={t.filterProfiles} value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)} />
                      <select value={profileSort} onChange={(e) => setProfileSort(e.target.value as 'name-asc' | 'name-desc' | 'status-asc')}>
                        <option value="name-asc">{t.nameAsc}</option>
                        <option value="name-desc">{t.nameDesc}</option>

                        <option value="status-asc">{t.statusAsc}</option>
                      </select>
                      <Button variant="outline" onClick={() => exportAdminSection('excel', t.profileControls, [t.name, t.status, t.dimensions, t.price], filteredProfiles.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.status, item.dimensions || '-', item.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price)} ${item.currency ? item.currency.symbol : ''}` : '-']))}>{t.exportExcel}</Button>
                      <Button variant="outline" onClick={() => exportAdminSection('pdf', t.profileControls, [t.name, t.status, t.dimensions, t.price], filteredProfiles.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.status, item.dimensions || '-', item.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price)} ${item.currency ? item.currency.symbol : ''}` : '-']))}>{t.exportPdf}</Button>
                    </div>
                    <div className="admin-table-wrap">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><th className="px-4 py-3">{t.name}</th><th className="px-4 py-3">{t.status}</th><th className="px-4 py-3">{t.dimensions}</th><th className="px-4 py-3">{t.currency}</th><th className="px-4 py-3">{t.price}</th><th className="px-4 py-3 text-right">{t.actions}</th></tr></thead>
                        <tbody>
                          {profileRows.items.map((item) => (
                            <tr key={item.id} className="material-table-row">
                              <td className="px-4 py-3 font-medium text-slate-900">{item.name}{item.nameDe ? ' / ' + item.nameDe : ''}</td>

                              <td className="px-4 py-3"><span className={`material-chip ${item.status === 'NOT_AVAILABLE' ? 'bg-red-100 text-red-700' : item.status === 'IN_DEVELOPMENT' ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-700'}`}>{item.status}</span></td>
                              <td className="px-4 py-3 text-slate-600">{item.dimensions || '-'}</td>
                              <td className="px-4 py-3 text-slate-600">{item.currency ? `${item.currency.code} (${item.currency.symbol})` : '-'}</td>
                              <td className="px-4 py-3 text-slate-600">{item.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price)} ${item.currency ? item.currency.symbol : ''}` : '-'}</td>
                              <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => startEditProfile(item)}>{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteItem('/admin/profiles/' + item.id)}>{t.delete}</Button></div></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="admin-pagination"><span>{t.showing} {profileRows.start}-{profileRows.end} / {profileRows.total} {t.records}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={profileRows.page <= 1} onClick={() => setProfilePage((page) => page - 1)}>{t.previous}</Button><span>{t.pageLabel} {profileRows.page} {t.ofLabel} {profileRows.totalPages}</span><Button size="sm" variant="outline" disabled={profileRows.page >= profileRows.totalPages} onClick={() => setProfilePage((page) => page + 1)}>{t.next}</Button></div></div>
                  </CardContent>
                </Card>
                )}


                </div>
              </>
            )}
        </main>
      </div>
    </div>
  );
}

export default AdminPage;






















