import toast from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { parseApiError } from './utils/apiError';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { API_BASE } from './utils/apiBase';
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Layers,
  Layout,
  Shield,
  ShieldAlert,
  Sparkles,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import ClerkUsersPanel from './ClerkUsersPanel';
import AnalyticsPanel from './components/AnalyticsPanel';

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

const PAGE_SIZE = 10;

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
    adminPanel: 'Catalog System Admin Panel',
    adminSubtitle: 'Manage users, permissions, and catalog master data',
    analytics: 'Visitor Analytics',
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
    login: 'Catalog System Admin Login',
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
    adminPanel: 'Katalogsystem Admin-Panel',
    adminSubtitle: 'Benutzer, Berechtigungen und Katalog-Stammdaten verwalten',
    analytics: 'Besucher-Analysen',
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
    login: 'Katalogsystem Admin-Anmeldung',
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
  const { lang, setLang } = useLanguage();
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState<'error' | 'success'>('error');
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
  const [activeSection, setActiveSection] = useState<'overview' | 'landing' | 'analytics' | 'profiles' | 'categories' | 'currencies' | 'suppliers' | 'users' | 'roles'>('overview');

  const [siteSettingsForm, setSiteSettingsForm] = useState<Record<string, string>>({
    heroTitle: 'Industrial Aluminum Extrusions, Found Instantly.',
    heroTitleDe: 'Industrielle Aluminiumprofile, sofort gefunden.',
    heroSubtitle: 'Search and access detailed specifications, technical data, and instant downloads for standard and custom aluminum profiles.',
    heroSubtitleDe: 'Detaillierte Spezifikationen, technische Daten und sofortige CAD-Downloads für Standard- und Sonderprofile.',
    heroImageUrl: '/hero-3d-profile.png',
    heroSearchPlaceholder: 'Search by ID, dimensions, or material...',
    heroSearchPlaceholderDe: 'Nach Profil, Abmessungen oder Material suchen...',
    stat1Label: '150+ Profiles',
    stat1LabelDe: '150+ Profile',
    stat1Sub: 'Standard & Custom',
    stat1SubDe: 'Standard & Sonderprofile',
    stat2Label: '12+ Partners',
    stat2LabelDe: '12+ Partner',
    stat2Sub: 'Global Manufacturing Network',
    stat2SubDe: 'Herstellernetzwerk',
    stat3Label: '9,850+ Downloads',
    stat3LabelDe: '9.850+ Downloads',
    stat3Sub: 'Technical Data Sheets',
    stat3SubDe: 'Technische Datenblätter',
    heroBgColor: '#3c4a5c',
    featuredTitle: 'Featured Aluminum Profiles',
    featuredTitleDe: 'Ausgewählte Aluminiumprofile',
    howItWorksTitle: 'How It Works',
    howItWorksTitleDe: 'So funktioniert es',
    howItWorksSubtitle: 'Seamlessly Find and Integrate Your Profiles',
    howItWorksSubtitleDe: 'Profile nahtlos finden, prüfen und integrieren',
    aboutTitle: 'The Leading Global B2B Aluminum Profile Search Engine',
    aboutTitleDe: 'Der führende globale B2B-Katalog für Aluminiumprofile',
    aboutSubtitle: 'AluProfileBiz connects mechanical engineers, structural designers, and procurement agents directly with certified aluminum profile manufacturers worldwide.',
    aboutSubtitleDe: 'AluProfileBiz verbindet Maschinenbauingenieure, Konstrukteure und Einkäufer direkt mit verifizierten Aluminiumprofil-Herstellern weltweit.',
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



  const permissions = user?.permissions ?? [];
  const canViewAdmin = permissions.includes('VIEW_ADMIN');
  const canManageUsers = permissions.includes('USERS_MANAGE');
    const canManageProfiles = permissions.includes('PROFILES_MANAGE');
  const canManageSuppliers = permissions.includes('SUPPLIERS_MANAGE');
  const canManageCategories = permissions.includes('CATEGORIES_MANAGE');

  useEffect(() => {
    const nextSection =
      canManageProfiles ? 'profiles' : canManageCategories ? 'categories' : canManageCategories ? 'currencies' : canManageSuppliers ? 'suppliers' : canManageUsers ? 'users' : 'overview';

    if (activeSection === 'overview' || activeSection === 'landing' || activeSection === 'analytics') return;
    if (activeSection === 'profiles' && canManageProfiles) return;
    if (activeSection === 'suppliers' && canManageSuppliers) return;
    if (activeSection === 'categories' && canManageCategories) return;
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

  const suppliers = adminRef?.suppliers ?? [];
  const filteredSuppliers = useMemo(() => {
    let result = suppliers;
    if (supplierFilter) {
      const q = normalizeForSearch(supplierFilter);
      result = result.filter((item) =>
        normalizeForSearch(item.name).includes(q) ||
        (item.contactPerson && normalizeForSearch(item.contactPerson).includes(q)) ||
        (item.email && normalizeForSearch(item.email).includes(q)) ||
        (item.phone && normalizeForSearch(item.phone).includes(q))
      );
    }
    return [...result].sort((a, b) => compareText(a.name, b.name));
  }, [suppliers, supplierFilter]);

  const applicationRows = paginateItems(filteredApplications, applicationPage);
  const crossSectionRows = paginateItems(filteredCrossSections, crossSectionPage);
  const profileRows = paginateItems(filteredProfiles, profilePage);
  const currencyRows = paginateItems(filteredCurrencies, currencyPage);
  const roleRows = paginateItems(filteredRoles, rolePage);
  const supplierRows = paginateItems(filteredSuppliers, supplierPage);

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
                <Link to="/">
                  <button type="button" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-sm cursor-pointer">
                    Home
                  </button>
                </Link>

                <Link to="/catalog">
                  <button type="button" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shadow-sm cursor-pointer">
                    {t.backToCatalog}
                  </button>
                </Link>

                <Link to="/customer">
                  <button type="button" className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold transition-all shadow-sm cursor-pointer">
                    Customer Portal
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
                        <Boxes className="h-3.5 w-3.5" /> Catalog System
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
                          placeholder="admin@aluprofile.biz"
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
                  </form>

                ) : forgotPasswordStep === 'request' ? (
                  <form onSubmit={handleForgotPasswordRequest} className="w-full rounded-3xl border border-slate-700/80 bg-[#131c2a]/95 p-8 shadow-2xl backdrop-blur-xl space-y-5">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-400 shadow-sm">
                        <Boxes className="h-3.5 w-3.5" /> AluProfileBiz Admin
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
                        placeholder="admin@aluprofile.biz"
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
                  <p className="mt-3 text-2xl font-black tracking-tight text-white">{t.adminPanel}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{t.adminSubtitle}</p>
                  <div className="mt-6 space-y-2">
                    <button type="button" className={`admin-nav-link ${activeSection === 'overview' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('overview')}><span>{t.quickActions}</span><ChevronRight className="h-4 w-4" /></button>
                    <button type="button" className={`admin-nav-link ${activeSection === 'analytics' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('analytics')}><span>{t.analytics || 'Visitor Analytics'}</span><ChevronRight className="h-4 w-4" /></button>
                    <button type="button" className={`admin-nav-link ${activeSection === 'landing' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('landing')}><span>Landing Page UI</span><ChevronRight className="h-4 w-4" /></button>
                    {canManageProfiles && <button type="button" className={`admin-nav-link ${activeSection === 'profiles' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('profiles')}><span>{t.profileControls}</span><ChevronRight className="h-4 w-4" /></button>}


                    {canManageCategories && <button type="button" className={`admin-nav-link ${activeSection === 'categories' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('categories')}><span>{t.categoryControls}</span><ChevronRight className="h-4 w-4" /></button>}
                    {canManageSuppliers && <button type="button" className={`admin-nav-link ${activeSection === 'suppliers' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('suppliers')}><span>{t.supplierControls}</span><ChevronRight className="h-4 w-4" /></button>}
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
                    <Card id="admin-overview" className="material-panel bg-white shadow-sm border border-slate-200">
                      <CardHeader className="border-b border-slate-200/80 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-3 text-slate-900 font-black text-xl">
                            <Sparkles className="h-5 w-5 text-blue-600" /> {t.quickActions || 'Quick Actions & System Overview'}
                          </CardTitle>
                          <Button
                            onClick={() => setActiveSection('landing')}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm rounded-xl"
                          >
                            Landing Page UI &rarr;
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        {/* Section 1: Realtime Traffic & Google Analytics */}
                        <div className="space-y-4">
                          <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                            Realtime Traffic & Google Analytics
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Website Visits</span>
                                <Activity className="h-4 w-4 text-blue-600" />
                              </div>
                              <p className="text-2xl font-black text-slate-900">{websiteVisits ?? '-'}</p>
                              <span className="text-[10px] text-slate-400 font-medium">Logged DSGVO-Compliant Visits</span>
                            </div>

                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">GA Measurement Tag</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
                                </span>
                              </div>
                              <p className="text-lg font-extrabold text-blue-600 font-mono">G-5FEVSRGPSV</p>
                              <span className="text-[10px] text-slate-400 font-medium">Google Tag Manager Active</span>
                            </div>

                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-2">
                              <div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Telemetry & Filters</span>
                                <p className="text-xs text-slate-600 font-medium mt-0.5">Live user telemetry, search logs & geo-location</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => setActiveSection('analytics')}
                                variant="outline"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl w-full justify-between"
                              >
                                <span>Visitor Analytics</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Catalog & Administration Modules */}
                        <div className="space-y-4 pt-2">
                          <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                            Catalog & Administration Modules
                          </h4>
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {canManageProfiles && (
                              <div
                                onClick={() => setActiveSection('profiles')}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Boxes className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                                      {adminProfiles.length} {t.records}
                                    </span>
                                  </div>
                                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                                    {t.profileControls}
                                  </h3>
                                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Create, edit, and review technical profile specifications, CAD drawings, and stock status.
                                  </p>
                                </div>
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                                  <span>Manage Profiles</span>
                                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            )}

                            <div
                              onClick={() => setActiveSection('landing')}
                              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Layout className="h-5 w-5" />
                                  </div>
                                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                                    Hero & Controls
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                                  Landing Page UI
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                  Customize hero titles, colors, 3D image banners, stat badges, and section headings.
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                                <span>Edit Landing Page</span>
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>

                            {canManageCategories && (
                              <div
                                onClick={() => setActiveSection('categories')}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Layers className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                                      {applications.length + crossSections.length} {t.records}
                                    </span>
                                  </div>
                                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                                    {t.categoryControls}
                                  </h3>
                                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Organize profile applications and cross-section categories for multi-attribute search filtering.
                                  </p>
                                </div>
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                                  <span>Manage Categories</span>
                                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            )}

                            {canManageSuppliers && (
                              <div
                                onClick={() => setActiveSection('suppliers')}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Building2 className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full">
                                      {adminRef?.suppliers?.length ?? 0} {t.records}
                                    </span>
                                  </div>
                                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                                    {t.supplierControls}
                                  </h3>
                                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Manage aluminum manufacturers, partner details, catalog profile linking, and email alerts.
                                  </p>
                                </div>
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                                  <span>Manage Suppliers</span>
                                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            )}

                            {canManageCategories && (
                              <div
                                onClick={() => setActiveSection('currencies')}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <KeyRound className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-black text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-full">
                                      {adminRef?.currencies.length || 0} {t.records}
                                    </span>
                                  </div>
                                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-violet-600 transition-colors">
                                    {t.currencies}
                                  </h3>
                                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Configure global currency codes, pricing symbols, and localization formats.
                                  </p>
                                </div>
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-violet-600">
                                  <span>Manage Currencies</span>
                                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            )}

                            {canManageUsers && (
                              <div
                                onClick={() => setActiveSection('users')}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Users className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
                                      {userList.length} Users
                                    </span>
                                  </div>
                                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                                    {t.clerkUsers} & Permissions
                                  </h3>
                                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Invite, update, and manage authenticated users, admin roles, and section access rights.
                                  </p>
                                </div>
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                                  <span>Manage Users & Roles</span>
                                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Section 3: System Maintenance & Demo Data */}
                        <div className="space-y-4 pt-2">
                          <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                            System Maintenance & Utilities
                          </h4>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-extrabold text-slate-900">{t.seedDemoData}</p>
                              <p className="text-xs text-slate-500 font-medium">
                                Populate standard demo aluminum profiles, suppliers, and category records for staging and verification.
                              </p>
                            </div>
                            <Button
                              onClick={seedDemoData}
                              variant="outline"
                              className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl"
                            >
                              {t.seedDemoData}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === 'landing' && (
                    <Card id="admin-landing" className="material-panel bg-white shadow-sm border border-slate-200">
                      <CardHeader className="border-b border-slate-200/80 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-3 text-slate-900 font-black text-xl"><Boxes className="h-5 w-5 text-blue-600" /> Landing Page Settings & Controls</CardTitle>
                          <Button onClick={saveSiteSettings} disabled={isSavingSettings} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm rounded-xl">
                            {isSavingSettings ? 'Saving...' : 'Save Settings'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        {/* HERO CONFIGURATION */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider">Hero Banner Configuration</h4>
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">Bilingual (EN / DE)</span>
                          </div>

                          {/* Hero Titles */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block text-xs font-bold text-slate-700">
                              Hero Title (EN)
                              <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.heroTitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, heroTitle: e.target.value }))} placeholder="Industrial Aluminum Extrusions, Found Instantly." />
                            </label>
                            <label className="block text-xs font-bold text-slate-700">
                              Hero Title (DE)
                              <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.heroTitleDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, heroTitleDe: e.target.value }))} placeholder="Industrielle Aluminiumprofile, sofort gefunden." />
                            </label>
                          </div>

                          {/* Hero Subtitles */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block text-xs font-bold text-slate-700">
                              Hero Subtitle (EN)
                              <textarea className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" rows={2} value={siteSettingsForm.heroSubtitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, heroSubtitle: e.target.value }))} placeholder="Search and access detailed specifications, technical data, and instant downloads..." />
                            </label>
                            <label className="block text-xs font-bold text-slate-700">
                              Hero Subtitle (DE)
                              <textarea className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" rows={2} value={siteSettingsForm.heroSubtitleDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, heroSubtitleDe: e.target.value }))} placeholder="Detaillierte Spezifikationen, technische Daten und sofortige CAD-Downloads..." />
                            </label>
                          </div>

                          {/* Search Placeholders */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block text-xs font-bold text-slate-700">
                              Search Box Placeholder (EN)
                              <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.heroSearchPlaceholder || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, heroSearchPlaceholder: e.target.value }))} placeholder="Search by ID, dimensions, or material..." />
                            </label>
                            <label className="block text-xs font-bold text-slate-700">
                              Search Box Placeholder (DE)
                              <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.heroSearchPlaceholderDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, heroSearchPlaceholderDe: e.target.value }))} placeholder="Nach Profil, Abmessungen oder Material suchen..." />
                            </label>
                          </div>

                          {/* Background Color & Hero Image */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <label className="block text-xs font-bold text-slate-700">
                              Hero Background Color
                              <div className="flex items-center gap-2 mt-1">
                                <input type="color" className="h-9 w-12 rounded-xl border border-slate-200 bg-white p-1 cursor-pointer" value={siteSettingsForm.heroBgColor || '#3c4a5c'} onChange={e => setSiteSettingsForm(f => ({ ...f, heroBgColor: e.target.value }))} />
                                <Input className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.heroBgColor || '#3c4a5c'} onChange={e => setSiteSettingsForm(f => ({ ...f, heroBgColor: e.target.value }))} />
                              </div>
                            </label>

                            <label className="block text-xs font-bold text-slate-700">
                              Hero Image URL / File Upload
                              <div className="flex items-center gap-2 mt-1">
                                <Input className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.heroImageUrl || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, heroImageUrl: e.target.value }))} placeholder="/hero-3d-profile.png" />
                                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0">
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
                          </div>
                        </div>

                        {/* STATS CARDS SETTINGS */}
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                          <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">Stats Cards Configuration (EN / DE)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-xs font-bold text-slate-800">Stat Card 1 (Profiles)</span>
                              <Input placeholder="Main label EN (e.g. 150+ Profiles)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat1Label || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat1Label: e.target.value }))} />
                              <Input placeholder="Main label DE (z.B. 150+ Profile)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat1LabelDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat1LabelDe: e.target.value }))} />
                              <Input placeholder="Subtitle EN (e.g. Standard & Custom)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat1Sub || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat1Sub: e.target.value }))} />
                              <Input placeholder="Subtitle DE (z.B. Standard & Sonderprofile)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat1SubDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat1SubDe: e.target.value }))} />
                            </div>

                            <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-xs font-bold text-slate-800">Stat Card 2 (Partners)</span>
                              <Input placeholder="Main label EN (e.g. 12+ Partners)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat2Label || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat2Label: e.target.value }))} />
                              <Input placeholder="Main label DE (z.B. 12+ Partner)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat2LabelDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat2LabelDe: e.target.value }))} />
                              <Input placeholder="Subtitle EN (e.g. Global Network)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat2Sub || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat2Sub: e.target.value }))} />
                              <Input placeholder="Subtitle DE (z.B. Herstellernetzwerk)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat2SubDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat2SubDe: e.target.value }))} />
                            </div>

                            <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-xs font-bold text-slate-800">Stat Card 3 (Downloads)</span>
                              <Input placeholder="Main label EN (e.g. 9,850+ Downloads)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat3Label || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat3Label: e.target.value }))} />
                              <Input placeholder="Main label DE (z.B. 9.850+ Downloads)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat3LabelDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat3LabelDe: e.target.value }))} />
                              <Input placeholder="Subtitle EN (e.g. Technical Data Sheets)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat3Sub || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat3Sub: e.target.value }))} />
                              <Input placeholder="Subtitle DE (z.B. Technische Datenblätter)" className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" value={siteSettingsForm.stat3SubDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, stat3SubDe: e.target.value }))} />
                            </div>
                          </div>
                        </div>

                        {/* SECTION TITLES & CONTENT */}
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                          <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">Featured & How It Works Sections (EN / DE)</h4>
                          
                          {/* Featured Titles */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block text-xs font-bold text-slate-700">
                              Featured Section Title (EN)
                              <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.featuredTitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, featuredTitle: e.target.value }))} placeholder="Featured Aluminum Profiles" />
                            </label>
                            <label className="block text-xs font-bold text-slate-700">
                              Featured Section Title (DE)
                              <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.featuredTitleDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, featuredTitleDe: e.target.value }))} placeholder="Ausgewählte Aluminiumprofile" />
                            </label>
                          </div>

                          {/* How It Works Titles */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block text-xs font-bold text-slate-700">
                              How It Works Title (EN)
                              <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.howItWorksTitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, howItWorksTitle: e.target.value }))} placeholder="How It Works" />
                            </label>
                            <label className="block text-xs font-bold text-slate-700">
                              How It Works Title (DE)
                              <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.howItWorksTitleDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, howItWorksTitleDe: e.target.value }))} placeholder="So funktioniert es" />
                            </label>
                          </div>

                          {/* How It Works Subtitles */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block text-xs font-bold text-slate-700">
                              How It Works Subtitle (EN)
                              <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.howItWorksSubtitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, howItWorksSubtitle: e.target.value }))} placeholder="Seamlessly Find and Integrate Your Profiles" />
                            </label>
                            <label className="block text-xs font-bold text-slate-700">
                              How It Works Subtitle (DE)
                              <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.howItWorksSubtitleDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, howItWorksSubtitleDe: e.target.value }))} placeholder="Profile nahtlos finden, prüfen und integrieren" />
                            </label>
                          </div>

                          {/* About Section */}
                          <div className="pt-2 border-t border-slate-200 space-y-4">
                            <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider">About Section (EN / DE)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <label className="block text-xs font-bold text-slate-700">
                                About Section Title (EN)
                                <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.aboutTitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, aboutTitle: e.target.value }))} placeholder="The Leading Global B2B Aluminum Profile Search Engine" />
                              </label>
                              <label className="block text-xs font-bold text-slate-700">
                                About Section Title (DE)
                                <Input className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20" value={siteSettingsForm.aboutTitleDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, aboutTitleDe: e.target.value }))} placeholder="Der führende globale B2B-Katalog für Aluminiumprofile" />
                              </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <label className="block text-xs font-bold text-slate-700">
                                About Subtitle / Description (EN)
                                <textarea className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" rows={3} value={siteSettingsForm.aboutSubtitle || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, aboutSubtitle: e.target.value }))} placeholder="AluProfileBiz connects mechanical engineers, structural designers..." />
                              </label>
                              <label className="block text-xs font-bold text-slate-700">
                                About Subtitle / Description (DE)
                                <textarea className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" rows={3} value={siteSettingsForm.aboutSubtitleDe || ''} onChange={e => setSiteSettingsForm(f => ({ ...f, aboutSubtitleDe: e.target.value }))} placeholder="AluProfileBiz verbindet Maschinenbauingenieure, Konstrukteure und Einkäufer..." />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <Button onClick={saveSiteSettings} disabled={isSavingSettings} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 text-xs shadow-sm rounded-xl">
                            {isSavingSettings ? 'Saving Settings...' : 'Save All Settings'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === 'analytics' && (
                    <div id="admin-analytics">
                      <AnalyticsPanel
                        lang={lang}
                        totalVisits={websiteVisits || 815}
                        registeredUsersCount={userList.length || 5}
                      />
                    </div>
                  )}

                {activeSection === 'users' && <div id="admin-users"><ClerkUsersPanel canManageUsers={canManageUsers} lang={lang} /></div>}

                {activeSection === 'roles' && canManageUsers && (
                  <Card id="admin-roles" className="material-panel bg-white shadow-sm border border-slate-200">
                    <CardHeader className="border-b border-slate-200/80 bg-slate-50/50">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-3 text-slate-900 font-black text-xl">
                          <UserCog className="h-5 w-5 text-purple-600" /> {t.appRolePermissions}
                        </CardTitle>
                        <Button
                          variant={showRoleForm ? 'secondary' : 'default'}
                          onClick={() => showRoleForm ? resetRoleForm() : setShowRoleForm(true)}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-sm"
                        >
                          {showRoleForm ? t.closeEditor : (`+ ${t.addAccessRule}`)}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {showRoleForm && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4 shadow-sm">
                          <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                            Access Rule & Permission Assignments
                          </h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">{t.email} *</label>
                              <Input
                                placeholder={t.email}
                                value={userForm.email}
                                onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                                disabled={!!userForm.id}
                                className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                {t.usernameOrEmail.replace(' or email', '').replace(' oder E-Mail', '')}
                              </label>
                              <Input
                                placeholder="Username"
                                value={userForm.username ?? ''}
                                onChange={(e) => setUserForm((f) => ({ ...f, username: e.target.value }))}
                                className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">{t.password}</label>
                              <Input
                                type="password"
                                placeholder={t.password}
                                value={userForm.password ?? ''}
                                onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                                className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">{t.role}</label>
                              <select
                                value={userForm.role}
                                onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value as AppRole }))}
                                className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-xs px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                              >
                                {(adminRef?.roleOptions ?? ['ADMIN', 'MANAGER', 'USER']).map((role) => (
                                  <option key={role} value={role}>{role}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">Granted System Permissions</label>
                            <div className="grid gap-3 md:grid-cols-2">
                              {(adminRef?.permissionOptions ?? ['VIEW_ADMIN', 'PROFILES_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE', 'SUPPLIERS_MANAGE'] as AppPermission[]).map((permission) => (
                                <label key={permission} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={userForm.permissions.includes(permission)}
                                    onChange={(e) => setUserForm((f) => ({
                                      ...f,
                                      permissions: e.target.checked
                                        ? [...new Set([...f.permissions, permission])]
                                        : f.permissions.filter((item) => item !== permission)
                                    }))}
                                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                  />
                                  <KeyRound className="h-4 w-4 text-purple-600" />
                                  <span className="text-xs font-bold">{permission}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                            <Button variant="outline" onClick={resetRoleForm} className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">
                              {t.cancel}
                            </Button>
                            <Button onClick={saveUser} className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm">
                              {t.save}
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                        <Input
                          placeholder={t.filterRoles}
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-purple-500/20"
                        />
                        <select
                          value={roleSort}
                          onChange={(e) => setRoleSort(e.target.value as 'user-asc' | 'role-asc')}
                          className="rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-xs px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                        >
                          <option value="user-asc">{t.nameAsc || 'Email A-Z'}</option>
                          <option value="role-asc">{t.roleAsc || 'Role A-Z'}</option>
                        </select>
                        <Button variant="outline" onClick={() => exportAdminSection('excel', t.appRolePermissions, [t.email, t.role, t.permissions || 'Permissions'], filteredRoles.map((item) => [item.email, item.role, item.permissions.join(', ')]))} className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">{t.exportExcel}</Button>
                        <Button variant="outline" onClick={() => exportAdminSection('pdf', t.appRolePermissions, [t.email, t.role, t.permissions || 'Permissions'], filteredRoles.map((item) => [item.email, item.role, item.permissions.join(', ')]))} className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">{t.exportPdf}</Button>
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-sm text-left">
                          <thead>
                            <tr className="bg-slate-50/80 text-slate-600 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200">
                              <th className="px-5 py-3.5">{t.email}</th>
                              <th className="px-5 py-3.5">{t.usernameOrEmail.replace(' or email', '').replace(' oder E-Mail', '')}</th>
                              <th className="px-5 py-3.5">{t.role}</th>
                              <th className="px-5 py-3.5">{t.permissions || 'Permissions'}</th>
                              <th className="px-5 py-3.5 text-right">{t.actions}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {roleRows.items.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-5 py-4 font-extrabold text-slate-900">{item.email}</td>
                                <td className="px-5 py-4 font-medium text-slate-600">{item.username || '-'}</td>
                                <td className="px-5 py-4">
                                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                                    {item.role}
                                  </span>
                                </td>
                                <td className="px-5 py-4 font-medium text-slate-600 text-xs">{item.permissions.join(', ')}</td>
                                <td className="px-5 py-4 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <Button size="sm" variant="ghost" onClick={() => startEditRole(item)} className="text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl">{t.edit}</Button>
                                    <Button size="sm" variant="destructive" onClick={() => deleteUser(item.id)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl">{t.delete}</Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-600">
                        <span>{t.showing} {roleRows.start}-{roleRows.end} / {roleRows.total} {t.records}</span>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" disabled={roleRows.page <= 1} onClick={() => setRolePage((page) => page - 1)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl">{t.previous}</Button>
                          <span className="font-bold text-slate-900 px-2">{t.pageLabel} {roleRows.page} {t.ofLabel} {roleRows.totalPages}</span>
                          <Button size="sm" variant="outline" disabled={roleRows.page >= roleRows.totalPages} onClick={() => setRolePage((page) => page + 1)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl">{t.next}</Button>
                        </div>
                      </div>
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <BadgeCheck className="h-4 w-4 text-blue-600" /> {t.backendEnforced || 'Backend Enforced'}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {activeSection === 'currencies' && canManageCategories && (
                  <div id="admin-currencies" className="space-y-6">
                    <Card className="material-panel bg-white shadow-sm border border-slate-200">
                      <CardHeader className="border-b border-slate-200/80 bg-slate-50/50">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <CardTitle className="flex items-center gap-3 text-slate-900 font-black text-xl">
                            <BadgeCheck className="h-5 w-5 text-emerald-600" /> {t.currencies}
                          </CardTitle>
                          <Button
                            variant={showCurrencyForm ? 'secondary' : 'default'}
                            onClick={() => showCurrencyForm ? resetCurrencyForm() : setShowCurrencyForm(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm"
                          >
                            {showCurrencyForm ? t.closeEditor : (`+ ${t.addCurrency}`)}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        {showCurrencyForm && (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4 shadow-sm">
                            <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                              Currency Specifications
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">{t.currencyCode} *</label>
                                <Input
                                  placeholder="e.g. EUR"
                                  value={currencyCode}
                                  onChange={(e) => setCurrencyCode(e.target.value)}
                                  className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/20"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">{t.currencySymbol} *</label>
                                <Input
                                  placeholder="e.g. €"
                                  value={currencySymbol}
                                  onChange={(e) => setCurrencySymbol(e.target.value)}
                                  className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/20"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                              <Button variant="outline" onClick={resetCurrencyForm} className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">
                                {t.cancel}
                              </Button>
                              <Button onClick={saveCurrency} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm">
                                {t.saveCurrency}
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                          <Input
                            placeholder={t.filterCurrencies}
                            value={currencyFilter}
                            onChange={(e) => setCurrencyFilter(e.target.value)}
                            className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-emerald-500/20"
                          />
                          <select
                            value={currencySort}
                            onChange={(e) => setCurrencySort(e.target.value as 'code-asc' | 'code-desc')}
                            className="rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-xs px-3 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                          >
                            <option value="code-asc">{t.nameAsc}</option>
                            <option value="code-desc">{t.nameDesc}</option>
                          </select>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="bg-slate-50/80 text-slate-600 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="px-5 py-3.5">{t.currencyCode}</th>
                                <th className="px-5 py-3.5">{t.currencySymbol}</th>
                                <th className="px-5 py-3.5 text-right">{t.actions}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {currencyRows.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-5 py-4 font-extrabold text-slate-900">{item.code}</td>
                                  <td className="px-5 py-4 font-bold text-slate-700">{item.symbol}</td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <Button size="sm" variant="ghost" onClick={() => startEditCurrency(item)} className="text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl">{t.edit}</Button>
                                      <Button size="sm" variant="destructive" onClick={() => deleteItem('/admin/currencies/' + item.id)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl">{t.delete}</Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-600">
                          <span>{t.showing} {currencyRows.start}-{currencyRows.end} / {currencyRows.total} {t.records}</span>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" disabled={currencyRows.page <= 1} onClick={() => setCurrencyPage((page) => page - 1)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl">{t.previous}</Button>
                            <span className="font-bold text-slate-900 px-2">{t.pageLabel} {currencyRows.page} {t.ofLabel} {currencyRows.totalPages}</span>
                            <Button size="sm" variant="outline" disabled={currencyRows.page >= currencyRows.totalPages} onClick={() => setCurrencyPage((page) => page + 1)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl">{t.next}</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'suppliers' && canManageSuppliers && (
                  <div className="space-y-6">
                    <Card className="material-panel bg-white shadow-sm border border-slate-200">
                      <CardHeader className="border-b border-slate-200/80 bg-slate-50/50">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <CardTitle className="flex items-center gap-3 text-slate-900 font-black text-xl">
                            <Building2 className="h-5 w-5 text-amber-600" /> {t.supplierControls}
                          </CardTitle>
                          <Button
                            onClick={() => { resetSupplierForm(); setShowSupplierForm(true); }}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-sm gap-1.5"
                          >
                            <span className="text-base font-bold">+</span> {t.addSupplier}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                          <Input
                            placeholder={t.filterSuppliers}
                            value={supplierFilter}
                            onChange={(e) => { setSupplierFilter(e.target.value); setSupplierPage(1); }}
                            className="max-w-xs rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="bg-slate-50/80 text-slate-600 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4">{t.name}</th>
                                <th className="p-4">{t.contactPerson}</th>
                                <th className="p-4">{t.email}</th>
                                <th className="p-4 text-right">{t.actions}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {supplierRows.items.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-8 text-center text-sm font-semibold text-slate-400">
                                    {lang === 'de' ? 'Keine Lieferanten gefunden.' : 'No suppliers found.'}
                                  </td>
                                </tr>
                              ) : (
                                supplierRows.items.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 font-extrabold text-slate-900">{item.name}</td>
                                    <td className="p-4 font-medium text-slate-600">{item.contactPerson || '-'}</td>
                                    <td className="p-4 font-medium text-slate-600">{item.email || '-'}</td>
                                    <td className="p-4 text-right">
                                      <div className="flex justify-end gap-1.5">
                                        <Button variant="ghost" size="sm" onClick={() => startEditSupplier(item)} className="text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl">
                                          {t.edit}
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => deleteItem('/admin/suppliers/' + item.id)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl">
                                          {t.delete}
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Bar for Suppliers */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-600">
                          <span>
                            {t.showing} {supplierRows.start}-{supplierRows.end} / {supplierRows.total} {t.records}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={supplierRows.page <= 1}
                              onClick={() => setSupplierPage((page) => page - 1)}
                              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl"
                            >
                              {t.previous}
                            </Button>
                            <span className="font-bold text-slate-900 px-2">
                              {t.pageLabel} {supplierRows.page} {t.ofLabel} {supplierRows.totalPages}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={supplierRows.page >= supplierRows.totalPages}
                              onClick={() => setSupplierPage((page) => page + 1)}
                              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl"
                            >
                              {t.next}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {showSupplierForm && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
                        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-black text-slate-900">{editType === 'supplier' ? t.edit : t.addSupplier}</h3>
                            <button onClick={resetSupplierForm} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
                          </div>
                          <div className="space-y-3">
                            <div><label className="mb-1 block text-xs font-bold text-slate-700">{t.name} *</label><Input value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" /></div>
                            <div><label className="mb-1 block text-xs font-bold text-slate-700">{t.name} (DE)</label><Input value={supplierForm.nameDe} onChange={e => setSupplierForm(f => ({ ...f, nameDe: e.target.value }))} className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" /></div>
                            <div><label className="mb-1 block text-xs font-bold text-slate-700">{t.contactPerson}</label><Input value={supplierForm.contactPerson} onChange={e => setSupplierForm(f => ({ ...f, contactPerson: e.target.value }))} className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" /></div>
                            <div><label className="mb-1 block text-xs font-bold text-slate-700">{t.email}</label><Input value={supplierForm.email} onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" /></div>
                            <div><label className="mb-1 block text-xs font-bold text-slate-700">{t.phone}</label><Input value={supplierForm.phone} onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))} className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" /></div>
                            <div><label className="mb-1 block text-xs font-bold text-slate-700">{t.website}</label><Input value={supplierForm.website} onChange={e => setSupplierForm(f => ({ ...f, website: e.target.value }))} className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" /></div>
                            <div><label className="mb-1 block text-xs font-bold text-slate-700">{t.address}</label><Input value={supplierForm.address} onChange={e => setSupplierForm(f => ({ ...f, address: e.target.value }))} className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" /></div>
                            <div><label className="mb-1 block text-xs font-bold text-slate-700">{t.uid}</label><Input value={supplierForm.uid} onChange={e => setSupplierForm(f => ({ ...f, uid: e.target.value }))} className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs" /></div>
                            <Button onClick={saveSupplier} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-sm py-2.5 mt-2" disabled={!supplierForm.name}>{t.saveSupplier}</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'categories' && canManageCategories && (
                  <div id="admin-categories" className="space-y-6">
                    {/* Application Categories */}
                    <Card className="material-panel bg-white shadow-sm border border-slate-200">
                      <CardHeader className="border-b border-slate-200/80 bg-slate-50/50">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <CardTitle className="flex items-center gap-3 text-slate-900 font-black text-xl">
                            <Layers className="h-5 w-5 text-cyan-600" /> {t.application}
                          </CardTitle>
                          <Button
                            variant={showApplicationForm ? 'secondary' : 'default'}
                            onClick={() => showApplicationForm ? resetApplicationForm() : setShowApplicationForm(true)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-sm"
                          >
                            {showApplicationForm ? t.closeEditor : (`+ ${t.addApplication}`)}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        {showApplicationForm && (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4 shadow-sm">
                            <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                              Application Category Details
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">{t.appName} (EN) *</label>
                                <Input
                                  placeholder="e.g. Automation Systems"
                                  value={applicationName}
                                  onChange={(e) => setApplicationName(e.target.value)}
                                  className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500/20"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">{t.appName} (DE)</label>
                                <Input
                                  placeholder="z.B. Automatisierungssysteme"
                                  value={applicationNameDe}
                                  onChange={(e) => setApplicationNameDe(e.target.value)}
                                  className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500/20"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                              <Button variant="outline" onClick={resetApplicationForm} className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">
                                {t.cancel}
                              </Button>
                              <Button onClick={saveApplication} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm">
                                {t.saveApplication}
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                          <Input
                            placeholder={t.filterApplications}
                            value={applicationFilter}
                            onChange={(e) => setApplicationFilter(e.target.value)}
                            className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-cyan-500/20"
                          />
                          <select
                            value={applicationSort}
                            onChange={(e) => setApplicationSort(e.target.value as 'name-asc' | 'name-desc' | 'count-desc')}
                            className="rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-xs px-3 py-2 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                          >
                            <option value="name-asc">{t.nameAsc}</option>
                            <option value="name-desc">{t.nameDesc}</option>
                            <option value="count-desc">{t.countDesc}</option>
                          </select>
                          <Button variant="outline" onClick={() => exportAdminSection('excel', t.application, [t.name, t.profileCount], filteredApplications.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))} className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">{t.exportExcel}</Button>
                          <Button variant="outline" onClick={() => exportAdminSection('pdf', t.application, [t.name, t.profileCount], filteredApplications.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))} className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">{t.exportPdf}</Button>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="bg-slate-50/80 text-slate-600 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="px-5 py-3.5">{t.name}</th>
                                <th className="px-5 py-3.5">{t.profileCount}</th>
                                <th className="px-5 py-3.5 text-right">{t.actions}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {applicationRows.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-5 py-4 font-extrabold text-slate-900">{item.name}{item.nameDe ? ' / ' + item.nameDe : ''}</td>
                                  <td className="px-5 py-4 font-bold text-slate-700">{item.profilesCount ?? 0}</td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <Button size="sm" variant="ghost" onClick={() => startEditApplication(item)} className="text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl">{t.edit}</Button>
                                      <Button size="sm" variant="destructive" onClick={() => deleteItem('/admin/applications/' + item.id)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl">{t.delete}</Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-600">
                          <span>{t.showing} {applicationRows.start}-{applicationRows.end} / {applicationRows.total} {t.records}</span>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" disabled={applicationRows.page <= 1} onClick={() => setApplicationPage((page) => page - 1)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl">{t.previous}</Button>
                            <span className="font-bold text-slate-900 px-2">{t.pageLabel} {applicationRows.page} {t.ofLabel} {applicationRows.totalPages}</span>
                            <Button size="sm" variant="outline" disabled={applicationRows.page >= applicationRows.totalPages} onClick={() => setApplicationPage((page) => page + 1)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl">{t.next}</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cross-Section Categories */}
                    <Card className="material-panel bg-white shadow-sm border border-slate-200">
                      <CardHeader className="border-b border-slate-200/80 bg-slate-50/50">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <CardTitle className="flex items-center gap-3 text-slate-900 font-black text-xl">
                            <Layers className="h-5 w-5 text-blue-600" /> {t.crossSection}
                          </CardTitle>
                          <Button
                            variant={showCrossSectionForm ? 'secondary' : 'default'}
                            onClick={() => showCrossSectionForm ? resetCrossSectionForm() : setShowCrossSectionForm(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm"
                          >
                            {showCrossSectionForm ? t.closeEditor : (`+ ${t.addCrossSection}`)}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        {showCrossSectionForm && (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4 shadow-sm">
                            <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                              Cross-Section Details
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">{t.crossSectionName} (EN) *</label>
                                <Input
                                  placeholder="e.g. 40x40 Square"
                                  value={crossSectionName}
                                  onChange={(e) => setCrossSectionName(e.target.value)}
                                  className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">{t.crossSectionName} (DE)</label>
                                <Input
                                  placeholder="z.B. 40x40 Quadratisch"
                                  value={crossSectionNameDe}
                                  onChange={(e) => setCrossSectionNameDe(e.target.value)}
                                  className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                              <Button variant="outline" onClick={resetCrossSectionForm} className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">
                                {t.cancel}
                              </Button>
                              <Button onClick={saveCrossSection} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm">
                                {t.saveCrossSection}
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                          <Input
                            placeholder={t.filterCrossSections}
                            value={crossSectionFilter}
                            onChange={(e) => setCrossSectionFilter(e.target.value)}
                            className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-blue-500/20"
                          />
                          <select
                            value={crossSectionSort}
                            onChange={(e) => setCrossSectionSort(e.target.value as 'name-asc' | 'name-desc' | 'count-desc')}
                            className="rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-xs px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          >
                            <option value="name-asc">{t.nameAsc}</option>
                            <option value="name-desc">{t.nameDesc}</option>
                            <option value="count-desc">{t.countDesc}</option>
                          </select>
                          <Button variant="outline" onClick={() => exportAdminSection('excel', t.crossSection, [t.name, t.profileCount], filteredCrossSections.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))} className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">{t.exportExcel}</Button>
                          <Button variant="outline" onClick={() => exportAdminSection('pdf', t.crossSection, [t.name, t.profileCount], filteredCrossSections.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))} className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl">{t.exportPdf}</Button>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="bg-slate-50/80 text-slate-600 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="px-5 py-3.5">{t.name}</th>
                                <th className="px-5 py-3.5">{t.profileCount}</th>
                                <th className="px-5 py-3.5 text-right">{t.actions}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {crossSectionRows.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-5 py-4 font-extrabold text-slate-900">{item.name}{item.nameDe ? ' / ' + item.nameDe : ''}</td>
                                  <td className="px-5 py-4 font-bold text-slate-700">{item.profilesCount ?? 0}</td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <Button size="sm" variant="ghost" onClick={() => startEditCrossSection(item)} className="text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl">{t.edit}</Button>
                                      <Button size="sm" variant="destructive" onClick={() => deleteItem('/admin/cross-sections/' + item.id)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl">{t.delete}</Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-600">
                          <span>{t.showing} {crossSectionRows.start}-{crossSectionRows.end} / {crossSectionRows.total} {t.records}</span>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" disabled={crossSectionRows.page <= 1} onClick={() => setCrossSectionPage((page) => page - 1)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl">{t.previous}</Button>
                            <span className="font-bold text-slate-900 px-2">{t.pageLabel} {crossSectionRows.page} {t.ofLabel} {crossSectionRows.totalPages}</span>
                            <Button size="sm" variant="outline" disabled={crossSectionRows.page >= crossSectionRows.totalPages} onClick={() => setCrossSectionPage((page) => page + 1)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl">{t.next}</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'profiles' && canManageProfiles && (
                  <Card id="admin-profiles" className="material-panel bg-white shadow-sm border border-slate-200">
                    <CardHeader className="border-b border-slate-200/80 bg-slate-50/50">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-3 text-slate-900 font-black text-xl">
                          <Boxes className="h-5 w-5 text-blue-600" /> {t.profileControls}
                        </CardTitle>
                        <Button
                          onClick={() => showProfileForm ? resetProfileForm() : setShowProfileForm(true)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm rounded-xl"
                        >
                          {showProfileForm ? (t.closeEditor || 'Close Editor') : (`+ ${t.addProfile || 'Add Profile'}`)}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {showProfileForm && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-6 shadow-sm">
                          {/* Sub-section 1: Profile Specifications */}
                          <div className="space-y-4">
                            <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                              Profile Details & Multilingual Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <label className="block text-xs font-bold text-slate-700">
                                {t.name} (EN) *
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="e.g. 40x40 Heavy T-Slot Profile"
                                  value={profileForm.name}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                                />
                              </label>
                              <label className="block text-xs font-bold text-slate-700">
                                {t.name} (DE)
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="z.B. 40x40 Schweres Nutprofil"
                                  value={profileForm.nameDe}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, nameDe: e.target.value }))}
                                />
                              </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <label className="block text-xs font-bold text-slate-700">
                                Description (EN)
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="Technical description..."
                                  value={profileForm.description}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))}
                                />
                              </label>
                              <label className="block text-xs font-bold text-slate-700">
                                Description (DE)
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="Technische Beschreibung..."
                                  value={profileForm.descriptionDe}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, descriptionDe: e.target.value }))}
                                />
                              </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <label className="block text-xs font-bold text-slate-700">
                                Usage / Application Field (EN)
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="e.g. Machine frames, automation fixtures"
                                  value={profileForm.usage}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, usage: e.target.value }))}
                                />
                              </label>
                              <label className="block text-xs font-bold text-slate-700">
                                Usage / Application Field (DE)
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="z.B. Maschinenbau, Gestellbau"
                                  value={profileForm.usageDe}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, usageDe: e.target.value }))}
                                />
                              </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                              <label className="block text-xs font-bold text-slate-700">
                                {t.dimensions}
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="e.g. 40x40 mm"
                                  value={profileForm.dimensions}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, dimensions: e.target.value }))}
                                />
                              </label>
                              <label className="block text-xs font-bold text-slate-700">
                                Weight (kg/m)
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="e.g. 1.85"
                                  value={profileForm.weightPerMeter}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, weightPerMeter: e.target.value }))}
                                />
                              </label>
                              <label className="block text-xs font-bold text-slate-700">
                                Length (mm)
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="e.g. 6000"
                                  value={profileForm.lengthMm}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, lengthMm: e.target.value }))}
                                />
                              </label>
                              <label className="block text-xs font-bold text-slate-700">
                                Material Alloy (EN)
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="e.g. EN AW-6063 T6"
                                  value={profileForm.material}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, material: e.target.value }))}
                                />
                              </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                              <label className="block text-xs font-bold text-slate-700">
                                Material Alloy (DE)
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="z.B. EN AW-6063 T6"
                                  value={profileForm.materialDe}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, materialDe: e.target.value }))}
                                />
                              </label>
                              <label className="block text-xs font-bold text-slate-700">
                                {t.price}
                                <Input
                                  className="mt-1 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="e.g. 24.50"
                                  value={profileForm.price}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, price: e.target.value }))}
                                />
                              </label>
                              <label className="block text-xs font-bold text-slate-700">
                                {t.currency}
                                <select
                                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                  value={profileForm.currencyId}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, currencyId: e.target.value }))}
                                >
                                  <option value="">-- Select {t.currency} --</option>
                                  {adminRef?.currencies.map((currency) => (
                                    <option key={currency.id} value={currency.id}>
                                      {currency.code} ({currency.symbol})
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="block text-xs font-bold text-slate-700">
                                {t.status}
                                <select
                                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-bold"
                                  value={profileForm.status}
                                  onChange={(e) => setProfileForm((f) => ({ ...f, status: e.target.value }))}
                                >
                                  {adminRef?.statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          </div>

                          {/* Sub-section 2: Categories & Classifications */}
                          <div className="space-y-4 pt-4 border-t border-slate-200">
                            <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                              Category & Classification Links
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <label className="block text-xs font-bold text-slate-700">
                                Linked Applications (Hold Cmd/Ctrl to multi-select)
                                <select
                                  multiple
                                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none min-h-[110px]"
                                  value={profileForm.applicationIds.map(String)}
                                  onChange={(e) => setProfileForm((f) => ({
                                    ...f,
                                    applicationIds: Array.from(e.target.selectedOptions).map((option) => Number(option.value))
                                  }))}
                                >
                                  {applications.map((item) => (
                                    <option key={item.id} value={item.id} className="py-1">
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="block text-xs font-bold text-slate-700">
                                Linked Cross-Sections (Hold Cmd/Ctrl to multi-select)
                                <select
                                  multiple
                                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none min-h-[110px]"
                                  value={profileForm.crossSectionIds.map(String)}
                                  onChange={(e) => setProfileForm((f) => ({
                                    ...f,
                                    crossSectionIds: Array.from(e.target.selectedOptions).map((option) => Number(option.value))
                                  }))}
                                >
                                  {crossSections.map((item) => (
                                    <option key={item.id} value={item.id} className="py-1">
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          </div>

                          {/* Sub-section 3: Technical Drawings & Photos */}
                          <div className="space-y-4 pt-4 border-t border-slate-200">
                            <h4 className="font-extrabold text-[#0284c7] text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                              Technical Schematics & Photos
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-700">
                                    {t.drawingFile} (CAD Schematic)
                                  </span>
                                  <span className="text-[10px] text-slate-400">PDF, JPG, PNG, BMP</span>
                                </div>
                                {profileForm.drawingUrl ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                      <a
                                        href={profileForm.drawingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-bold text-blue-600 truncate hover:underline"
                                      >
                                        {profileForm.drawingUrl.split('/').pop()}
                                      </a>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        type="button"
                                        onClick={() => setProfileForm((f) => ({ ...f, drawingUrl: '' }))}
                                        className="h-7 text-[11px] font-bold rounded-lg"
                                      >
                                        {t.delete}
                                      </Button>
                                    </div>
                                    <div className="h-36 w-full rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-2">
                                      {/\.(jpeg|jpg|gif|png|svg|bmp)(\?.*)?$/i.test(profileForm.drawingUrl) ? (
                                        <img src={profileForm.drawingUrl} alt="Drawing Preview" className="h-full w-full object-contain" />
                                      ) : /\.(pdf)(\?.*)?$/i.test(profileForm.drawingUrl) ? (
                                        <iframe src={profileForm.drawingUrl} title="Drawing Preview" className="h-full w-full border-0" />
                                      ) : (
                                        <span className="text-xs text-slate-400">Drawing file uploaded</span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer">
                                    <Boxes className="h-6 w-6 text-slate-400 mb-1" />
                                    <span className="text-xs font-bold text-blue-600">Upload CAD Drawing</span>
                                    <span className="text-[10px] text-slate-400">Click to browse files</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const data = await uploadFile(file);
                                        setProfileForm((f) => ({ ...f, drawingUrl: data.url }));
                                      }}
                                    />
                                  </label>
                                )}
                              </div>

                              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-700">
                                    {t.photoFile} (Product Photo)
                                  </span>
                                  <span className="text-[10px] text-slate-400">PDF, JPG, PNG, BMP</span>
                                </div>
                                {profileForm.photoUrl ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                      <a
                                        href={profileForm.photoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-bold text-blue-600 truncate hover:underline"
                                      >
                                        {profileForm.photoUrl.split('/').pop()}
                                      </a>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        type="button"
                                        onClick={() => setProfileForm((f) => ({ ...f, photoUrl: '' }))}
                                        className="h-7 text-[11px] font-bold rounded-lg"
                                      >
                                        {t.delete}
                                      </Button>
                                    </div>
                                    <div className="h-36 w-full rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-2">
                                      {/\.(jpeg|jpg|gif|png|svg|bmp)(\?.*)?$/i.test(profileForm.photoUrl) ? (
                                        <img src={profileForm.photoUrl} alt="Photo Preview" className="h-full w-full object-contain" />
                                      ) : /\.(pdf)(\?.*)?$/i.test(profileForm.photoUrl) ? (
                                        <iframe src={profileForm.photoUrl} title="Photo Preview" className="h-full w-full border-0" />
                                      ) : (
                                        <span className="text-xs text-slate-400">Photo file uploaded</span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer">
                                    <Boxes className="h-6 w-6 text-slate-400 mb-1" />
                                    <span className="text-xs font-bold text-blue-600">Upload Product Photo</span>
                                    <span className="text-[10px] text-slate-400">Click to browse files</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const data = await uploadFile(file);
                                        setProfileForm((f) => ({ ...f, photoUrl: data.url }));
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Editor Actions */}
                          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                            <Button
                              variant="outline"
                              onClick={resetProfileForm}
                              className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl"
                            >
                              {t.cancel || 'Cancel'}
                            </Button>
                            <Button
                              onClick={saveProfile}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm"
                            >
                              {t.saveProfile || 'Save Profile'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Search & Export Toolbar */}
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                        <Input
                          placeholder={t.filterProfiles || 'Search by profile name, dimension, material...'}
                          value={profileFilter}
                          onChange={(e) => setProfileFilter(e.target.value)}
                          className="rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
                        />
                        <select
                          value={profileSort}
                          onChange={(e) => setProfileSort(e.target.value as 'name-asc' | 'name-desc' | 'status-asc')}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        >
                          <option value="name-asc">{t.nameAsc}</option>
                          <option value="name-desc">{t.nameDesc}</option>
                          <option value="status-asc">{t.statusAsc}</option>
                        </select>
                        <Button
                          variant="outline"
                          onClick={() => exportAdminSection('excel', t.profileControls, [t.name, t.status, t.dimensions, t.price], filteredProfiles.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.status, item.dimensions || '-', item.price ? `${item.currency ? item.currency.symbol : '€'} ${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price)}` : '-']))}
                          className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl"
                        >
                          {t.exportExcel}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => exportAdminSection('pdf', t.profileControls, [t.name, t.status, t.dimensions, t.price], filteredProfiles.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.status, item.dimensions || '-', item.price ? `${item.currency ? item.currency.symbol : '€'} ${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price)}` : '-']))}
                          className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl"
                        >
                          {t.exportPdf}
                        </Button>
                      </div>

                      {/* Profiles Table */}
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50/80 text-slate-600 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="px-5 py-3.5">{t.name}</th>
                              <th className="px-5 py-3.5">{t.status}</th>
                              <th className="px-5 py-3.5">{t.dimensions}</th>
                              <th className="px-5 py-3.5">{t.currency}</th>
                              <th className="px-5 py-3.5">{t.price}</th>
                              <th className="px-5 py-3.5 text-right">{t.actions}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {profileRows.items.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-5 py-8 text-center text-sm font-semibold text-slate-500">
                                  No profiles found for current filter.
                                </td>
                              </tr>
                            ) : (
                              profileRows.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-5 py-4">
                                    <p className="font-extrabold text-slate-900 text-sm">
                                      {item.name}
                                    </p>
                                    {item.nameDe && (
                                      <p className="text-xs text-slate-500 font-medium">
                                        {item.nameDe}
                                      </p>
                                    )}
                                  </td>
                                  <td className="px-5 py-4">
                                    <span
                                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                        item.status === 'NOT_AVAILABLE'
                                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                                          : item.status === 'IN_DEVELOPMENT'
                                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-xs font-bold text-slate-700">
                                    {item.dimensions || '-'}
                                  </td>
                                  <td className="px-5 py-4 text-xs font-medium text-slate-600">
                                    {item.currency ? `${item.currency.code} (${item.currency.symbol})` : '-'}
                                  </td>
                                  <td className="px-5 py-4 text-xs font-extrabold text-slate-900">
                                    {item.price
                                      ? `${item.currency ? item.currency.symbol : '€'} ${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(item.price)}`
                                      : '-'}
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => startEditProfile(item)}
                                        className="text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl"
                                      >
                                        {t.edit}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteItem('/admin/profiles/' + item.id)}
                                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl"
                                      >
                                        {t.delete}
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Bar */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-600">
                        <span>
                          {t.showing} {profileRows.start}-{profileRows.end} / {profileRows.total} {t.records}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={profileRows.page <= 1}
                            onClick={() => setProfilePage((page) => page - 1)}
                            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl"
                          >
                            {t.previous}
                          </Button>
                          <span className="font-bold text-slate-900 px-2">
                            {t.pageLabel} {profileRows.page} {t.ofLabel} {profileRows.totalPages}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={profileRows.page >= profileRows.totalPages}
                            onClick={() => setProfilePage((page) => page + 1)}
                            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl"
                          >
                            {t.next}
                          </Button>
                        </div>
                      </div>
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






















