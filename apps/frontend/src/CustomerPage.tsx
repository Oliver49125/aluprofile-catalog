import toast from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  Boxes,
  Eye,
  EyeOff,
  UserRoundPlus,
  Wrench,
  ShieldAlert,
  Building2,
  Save,
  FileSpreadsheet,
  FileText,
  Plus,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';


import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { parseApiError } from './utils/apiError';

type Lang = 'en' | 'de';
type RefOption = { id: number; name: string; nameDe?: string };

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

const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api').replace(/\/+$/, '');

const TXT = {
  en: {
    title: 'Customer Profile Portal',
    subtitle: 'Create an account, sign in, and manage your own aluminum profiles.',
    backToCatalog: 'Back to Catalog',
    language: 'Language',
    signIn: 'Customer Login',
    loginLabel: 'Login',
    signUp: 'Customer Registration',
    signInNote: 'Use your email or username and password to access your customer workspace.',
    signUpNote: 'Create a customer account first, then manage your own profile records.',
    usernameOrEmail: 'Username or email',
    password: 'Password',
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
    showPassword: 'Show',
    hidePassword: 'Hide',
    alreadyHaveAccount: 'Already have an account?',
    firstName: 'First name',
    lastName: 'Last name',
    emailAddress: 'Email address',
    verificationCode: 'Verification code',
    createAccount: 'Create account',
    creatingAccount: 'Creating account...',
    verifyEmail: 'Verify your email',
    verifyEmailNote: 'Enter the code sent to your email address to complete registration.',
    completeRegistration: 'Complete registration',
    verifyingAccount: 'Verifying account...',
    yourProfiles: 'Your Profiles',
    totalProfiles: 'Owned Profiles',

    categories: 'Categories',
    profileControls: 'Profile Controls',
    addProfile: 'Add Profile',
    editProfile: 'Edit Profile',
    closeEditor: 'Close Editor',
    cancel: 'Cancel',
    saveProfile: 'Save Profile',
    filterProfiles: 'Filter profiles',
    exportExcel: 'Export Excel',
    exportPdf: 'Export PDF',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',

    statusAsc: 'Status',
    showing: 'Showing',
    records: 'records',
    pageLabel: 'Page',
    ofLabel: 'of',
    previous: 'Previous',
    next: 'Next',
    name: 'Name',
    description: 'Description',
    usage: 'Usage',
    drawing: 'Drawing',
    dimensions: 'Dimensions',
    material: 'Material',
    weightPerMeter: 'Weight per meter',
    lengthMm: 'Length mm',
    status: 'Status',

    applications: 'Applications',
    crossSections: 'Cross-sections',
    drawingFile: 'Drawing file',
    photoFile: 'Photo file',
    logoFile: 'Logo file',
    noProfiles: 'No profiles created yet.',
    signedInAs: 'Signed in as',
    profileWorkspace: 'Profile Workspace',
    profileWorkspaceNote: 'Manage only the profile records owned by this customer account.',
    actions: 'Actions',
    companyProfile: 'Company Profile',
    companyAddress: 'Company Address',
    contactPerson: 'Contact Person',
    phone: 'Phone',
    website: 'Website',
    uploadReady: 'Upload ready',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this item? This action cannot be undone.',
    edit: 'Edit',
    price: 'Price',
    currency: 'Currency',
    uid: 'UID#',
  },
  de: {
    title: 'Kundenprofil-Portal',
    subtitle: 'Konto erstellen, anmelden und eigene Aluminiumprofile verwalten.',
    backToCatalog: 'Zuruck zum Katalog',
    language: 'Sprache',
    signIn: 'Kunden-Anmeldung',
    loginLabel: 'Login',
    signUp: 'Kunden-Registrierung',
    signInNote: 'Verwenden Sie Ihre E-Mail oder Ihren Benutzernamen und Ihr Passwort fur den Zugang.',
    signUpNote: 'Erstellen Sie zuerst ein Kundenkonto und verwalten Sie dann Ihre eigenen Profildatensatze.',
    usernameOrEmail: 'Benutzername oder E-Mail',
    password: 'Passwort',
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
    showPassword: 'Anzeigen',
    hidePassword: 'Ausblenden',
    alreadyHaveAccount: 'Sie haben bereits ein Konto?',
    firstName: 'Vorname',
    lastName: 'Nachname',
    emailAddress: 'E-Mail-Adresse',
    verificationCode: 'Bestatigungscode',
    createAccount: 'Konto erstellen',
    creatingAccount: 'Konto wird erstellt...',
    verifyEmail: 'E-Mail bestatigen',
    verifyEmailNote: 'Geben Sie den Code aus Ihrer E-Mail ein, um die Registrierung abzuschliessen.',
    completeRegistration: 'Registrierung abschliessen',
    verifyingAccount: 'Konto wird bestatigt...',
    yourProfiles: 'Ihre Profile',
    totalProfiles: 'Eigene Profile',

    categories: 'Kategorien',
    profileControls: 'Profilsteuerung',
    addProfile: 'Profil hinzufugen',
    editProfile: 'Profil bearbeiten',
    closeEditor: 'Editor schliessen',
    cancel: 'Abbrechen',
    saveProfile: 'Profil speichern',
    filterProfiles: 'Profile filtern',
    exportExcel: 'Excel exportieren',
    exportPdf: 'PDF exportieren',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',

    statusAsc: 'Status',
    showing: 'Zeige',
    records: 'Eintrage',
    pageLabel: 'Seite',
    ofLabel: 'von',
    previous: 'Zuruck',
    next: 'Weiter',
    name: 'Name',
    description: 'Beschreibung',
    usage: 'Anwendung',
    drawing: 'Zeichnung',
    dimensions: 'Abmessungen',
    material: 'Material',
    weightPerMeter: 'Gewicht pro Meter',
    lengthMm: 'Lange mm',
    status: 'Status',

    applications: 'Anwendungen',
    crossSections: 'Querschnitte',
    drawingFile: 'Zeichnungsdatei',
    photoFile: 'Fotodatei',
    logoFile: 'Logo-Datei',
    noProfiles: 'Noch keine Profile erstellt.',
    signedInAs: 'Angemeldet als',
    profileWorkspace: 'Profil-Arbeitsbereich',
    profileWorkspaceNote: 'Verwalten Sie nur die Profil-Datensatze dieses Kundenkontos.',
    actions: 'Aktionen',
    companyProfile: 'Firmenprofil',
    companyAddress: 'Firmenadresse',
    contactPerson: 'Ansprechpartner',
    phone: 'Telefon',
    website: 'Webseite',
    uploadReady: 'Upload abgeschlossen',
    delete: 'Loschen',
    confirmDelete: 'Sind Sie sicher, dass Sie dieses Element löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    edit: 'Bearbeiten',
    price: 'Preis',
    currency: 'Währung',
    uid: 'UID-Nr.',
  },
} as const;

const PAGE_SIZE = 5;

function paginateItems<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paged = items.slice(startIndex, startIndex + pageSize);
  return {
    items: paged,
    total,
    totalPages,
    page: currentPage,
    start: total === 0 ? 0 : startIndex + 1,
    end: total === 0 ? 0 : startIndex + paged.length,
  };
}

function normalizeForSearch(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function compareText(a: unknown, b: unknown) {
  return normalizeForSearch(a).localeCompare(normalizeForSearch(b));
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => '"' + String(value ?? '').replace(/"/g, '""') + '"').join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportTablePdf(title: string, headers: string[], rows: Array<Array<string | number>>) {
  const documentHtml = '<!doctype html><html><head><meta charset="utf-8" /><title>' + title + '</title><style>body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; } h1 { font-size: 22px; margin: 0 0 16px; } table { width: 100%; border-collapse: collapse; font-size: 12px; } th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; } th { background: #f1f5f9; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; }</style></head><body><h1>' + title + '</h1><table><thead><tr>' + headers.map((header) => '<th>' + header + '</th>').join('') + '</tr></thead><tbody>' + rows.map((row) => '<tr>' + row.map((value) => '<td>' + String(value ?? '') + '</td>').join('') + '</tr>').join('') + '</tbody></table></body></html>';
  const blob = new Blob([documentHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    URL.revokeObjectURL(url);
    return;
  }
  win.onload = () => {
    setTimeout(() => {
      win.focus();
      win.print();
      setTimeout(() => {
        win.close();
        URL.revokeObjectURL(url);
      }, 150);
    }, 250);
  };
}

function CustomerPage() {
  const { token, user, login, logout, isLoading } = useAuth();
  const initialMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'sign-up' ? 'sign-up' : 'sign-in';
  const [lang, setLang] = useState<Lang>('en');
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>(initialMode);
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
  const [signUpStep, setSignUpStep] = useState<'details' | 'verify'>('details');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpCode, setSignUpCode] = useState('');
  const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
  const [referenceData, setReferenceData] = useState<{
    applications: RefOption[];
    crossSections: RefOption[];
    statusOptions: string[];
  } | null>(null);

  const [supplierForm, setSupplierForm] = useState({
    name: '', nameDe: '', industry: '', address: '', contactPerson: '', email: '', phone: '', website: '', uid: ''
  });
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);

  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [profilePage, setProfilePage] = useState(1);
  const [profilePageSize, setProfilePageSize] = useState<number>(5);
  const [profileFilter, setProfileFilter] = useState('');
  const [profileSort, setProfileSort] = useState<'newest' | 'oldest' | 'priceAsc' | 'priceDesc' | 'name-asc' | 'name-desc' | 'status-asc'>('newest');

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
    applicationIds: [] as number[],
    crossSectionIds: [] as number[],
    price: '',
    currencyId: '' as string | number,
  });

  const t = useMemo(() => TXT[lang], [lang]);


  function showMessage(text: string, type: 'error' | 'success' = 'error') {
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

  async function handleForgotPasswordReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function resetSignUpState() {
    setSignUpStep('details');
    setSignUpLoading(false);
    setSignUpCode('');
    setShowSignUpPassword(false);
  }

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setSignUpLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: signUpFirstName.trim() || undefined,
          lastName: signUpLastName.trim() || undefined,
          username: signUpUsername.trim() || undefined,
          email: signUpEmail.trim(),
          password: signUpPassword,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      login(data.token, data.user);
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    } finally {
      setSignUpLoading(false);
    }
  }

  async function handleSignUpVerification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function openSignUp() {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
    setAuthMode('sign-up');
    setMessage('');
    setForgotPasswordMode(false);
    resetSignUpState();
  }

  function openSignIn() {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/customer?mode=sign-in');
    }
    setAuthMode('sign-in');
    backToLogin();
    resetSignUpState();
  }

  async function authedApi(path: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...(options?.headers ?? {}),
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res.json();
  }

  async function loadCustomerData() {
    try {
      const [refs, ownProfiles, supData] = await Promise.all([
        authedApi('/customer/reference-data'),
        authedApi('/customer/profiles'),
        authedApi('/customer/supplier').catch(() => null), // Catch error in case it fails initially
      ]);
      setReferenceData(refs);
      setProfiles(ownProfiles);

      if (supData) {
        setSupplierForm({
          name: supData.name || '',
          nameDe: supData.nameDe || '',
          industry: supData.industry || '',
          address: supData.address || '',
          contactPerson: supData.contactPerson || '',
          email: supData.email || '',
          phone: supData.phone || '',
          website: supData.website || '',
          uid: supData.uid || '',
        });
      }
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    }
  }

  useEffect(() => {
    if (!user) return;
    loadCustomerData();
  }, [user]);

  function resetProfileForm() {
    setEditId(null);
    setShowForm(false);
    setProfileForm({
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
      applicationIds: [],
      crossSectionIds: [],
      price: '',
      currencyId: '',
    });
  }

  function startEditProfile(profile: Profile) {
    setEditId(profile.id);
    setShowForm(true);
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
      applicationIds: (profile.applications ?? []).map((item) => item.id),
      crossSectionIds: (profile.crossSections ?? []).map((item) => item.id),
      price: profile.price !== undefined && profile.price !== null ? new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profile.price) : '',
      currencyId: profile.currency?.id || '',
    });
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/customer/uploads`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const data = await response.json();
    showMessage(`${t.uploadReady}: ${data.filename}`, 'success');
    return data;
  }

  async function saveSupplier() {
    if (!supplierForm.name) { showMessage('Supplier name is required'); return; }
    try {
      setIsSavingSupplier(true);
      const res = await fetch(`${API_BASE}/customer/supplier`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(supplierForm),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend Error:", res.status, errText);
        throw new Error(errText || 'Failed to save');
      }
      await loadCustomerData();
      showMessage('Supplier saved successfully', 'success');
    } catch (e: any) {
      console.error(e);
      showMessage('Failed to save supplier profile: ' + parseApiError(e), 'error');
    } finally {
      setIsSavingSupplier(false);
    }
  }

  async function saveProfile() {
    if (!profileForm.name) { showMessage('Profile name is required', 'error'); return; }
    setIsSaving(true);
    setMessage('');
    const payload = {
      ...profileForm,

      weightPerMeter: profileForm.weightPerMeter || undefined,
      lengthMm: profileForm.lengthMm || undefined,
    };
    try {
      if (editId) {
        await authedApi(`/customer/profiles/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await authedApi('/customer/profiles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await loadCustomerData();
      resetProfileForm();
      showMessage('Profile saved successfully', 'success');
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProfile(id: number) {
    setConfirmAction({
      message: t.confirmDelete,
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await authedApi(`/customer/profiles/${id}`, { method: 'DELETE' });
          await loadCustomerData();
          showMessage('Profile deleted successfully', 'success');
        } catch (error) {
          showMessage(parseApiError(error), 'error');
        }
      }
    });
  }

  async function hideAllProfiles() {
    setConfirmAction({
      message: lang === 'de' ? 'Möchten Sie wirklich alle Profile ausblenden? Alle Profile werden auf "Nicht verfügbar" gesetzt.' : 'Are you sure you want to hide all your profiles? They will be set to NOT AVAILABLE.',
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await authedApi('/customer/profiles/hide-all', { method: 'POST' });
          await loadCustomerData();
          showMessage(lang === 'de' ? 'Alle Profile erfolgreich ausgeblendet' : 'All profiles hidden successfully', 'success');
        } catch (error) {
          showMessage(parseApiError(error), 'error');
        }
      }
    });
  }

  async function toggleProfileVisibility(profile: Profile) {
    const isAvailable = profile.status === 'AVAILABLE';
    const newStatus = isAvailable ? 'NOT_AVAILABLE' : 'AVAILABLE';
    try {
      await authedApi(`/customer/profiles/${profile.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...profile, status: newStatus }),
      });
      await loadCustomerData();
      showMessage(lang === 'de' ? 'Sichtbarkeit aktualisiert' : 'Visibility updated', 'success');
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    }
  }

  useEffect(() => {
    setProfilePage(1);
  }, [profileFilter, profileSort, profiles.length]);

  const filteredProfiles = useMemo(() => {
    const query = normalizeForSearch(profileFilter);
    return [...profiles]
      .filter((item) => !query || [item.name, item.nameDe, item.description, item.descriptionDe, item.usage, item.usageDe, item.dimensions, item.material, item.materialDe, item.status].some((value) => normalizeForSearch(value).includes(query)))
      .sort((a, b) => {
        if (profileSort === 'newest') return b.id - a.id;
        if (profileSort === 'oldest') return a.id - b.id;
        if (profileSort === 'priceAsc') return (a.price || 0) - (b.price || 0);
        if (profileSort === 'priceDesc') return (b.price || 0) - (a.price || 0);
        if (profileSort === 'name-desc') return compareText(b.name, a.name);
        if (profileSort === 'status-asc') return compareText(a.status, b.status) || compareText(a.name, b.name);
        return compareText(a.name, b.name);
      });
  }, [profiles, profileFilter, profileSort]);

  const profileRows = paginateItems(filteredProfiles, profilePage, profilePageSize);


  function exportCustomerProfiles(kind: 'excel' | 'pdf') {
    const headers = [t.drawing, t.name, t.description, t.usage, t.applications, t.crossSections, t.status, t.dimensions, t.material, t.weightPerMeter, t.lengthMm, t.price];
    const rows = filteredProfiles.map((item) => [
      item.drawingUrl || '-',
      item.nameDe ? item.name + ' / ' + item.nameDe : item.name,
      item.descriptionDe ? (item.description || '-') + ' / ' + item.descriptionDe : item.description || '-',
      item.usageDe ? (item.usage || '-') + ' / ' + item.usageDe : item.usage || '-',

      (item.applications ?? []).map((entry) => entry.nameDe ? entry.name + ' / ' + entry.nameDe : entry.name).join(', ') || '-',
      (item.crossSections ?? []).map((entry) => entry.nameDe ? entry.name + ' / ' + entry.nameDe : entry.name).join(', ') || '-',
      item.status,
      item.dimensions || '-',
      item.materialDe ? (item.material || '-') + ' / ' + item.materialDe : item.material || '-',
      item.weightPerMeter ?? '-',
      item.lengthMm ?? '-',
      item.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price)} ${item.currency ? item.currency.symbol : ''}` : '-',
    ]);

    if (kind === 'excel') {
      downloadCsv('customer-profiles.csv', headers, rows);
      return;
    }

    exportTablePdf(t.profileControls, headers, rows);
  }
  return (
    <div className="min-h-screen">
      <div className="material-shell">
        {token && (
          <header className="w-full bg-gradient-to-r from-[#0f172a] via-[#131c2a] to-[#080d16] border border-slate-800/90 shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-8">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-400 shadow-sm">
                  <UserRoundPlus className="h-4 w-4" /> Customer Portal
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-5xl">{t.title}</h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">{t.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a href="/catalog">
                  <Button className="rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs px-5 py-2.5 border border-white/10 backdrop-blur-md transition-all cursor-pointer">
                    {t.backToCatalog}
                  </Button>
                </a>

                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-[#1e293b] px-3.5 py-2 text-xs font-extrabold text-slate-300 shadow-sm">
                  <span className="text-slate-400">{t.language}:</span>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Lang)}
                    className="bg-transparent border-0 font-extrabold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="en" className="bg-slate-900">EN</option>
                    <option value="de" className="bg-slate-900">DE</option>
                  </select>
                </label>

                {token && (
                  <Button
                    onClick={logout}
                    className="rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-extrabold text-xs px-4 py-2.5 border border-red-500/20 transition-all cursor-pointer"
                  >
                    Logout
                  </Button>
                )}
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

        {!token && (
          <Card className="border-0 shadow-2xl bg-gradient-to-b from-[#0f172a] via-[#0b1320] to-[#080d16] min-h-[75vh] flex items-center justify-center p-4 sm:p-8 rounded-3xl relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

            <CardContent className="w-full max-w-md p-0 z-10">
              {authMode === 'sign-in' ? (
                !forgotPasswordMode ? (
                  <form onSubmit={handleLogin} className="w-full rounded-3xl border border-slate-700/80 bg-[#131c2a]/95 p-8 shadow-2xl backdrop-blur-xl space-y-5">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-400 shadow-sm">
                        <Boxes className="h-3.5 w-3.5" /> AluProfile System
                      </div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">{t.signIn}</h2>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{t.signInNote}</p>
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
                          placeholder="Username or email"
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

                    <div className="flex items-center justify-between gap-3 text-xs font-bold">
                      <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer" onClick={openForgotPassword}>
                        {t.forgotPassword}
                      </button>
                      <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer" onClick={openSignUp}>
                        {t.signUp}
                      </button>
                    </div>

                    <Button
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs py-3 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                      type="submit"
                      disabled={loginLoading || !!isLoading}
                    >
                      {loginLoading ? t.signingIn : t.signIn}
                    </Button>

                    <div className="pt-4 border-t border-slate-800 space-y-2">
                      <p className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400">⚡ 1-Click Fast Auto-Fill Login</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifier('customer@aluprofile.com');
                            setPassword('customer123');
                            toast.success('Customer credentials auto-filled!');
                          }}
                          className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-extrabold text-xs border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span>👤 Customer Login</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifier('admin@aluprofile.com');
                            setPassword('admin123');
                            toast.success('Admin credentials auto-filled!');
                          }}
                          className="py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-extrabold text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span>🔑 Admin Login</span>
                        </button>
                      </div>
                    </div>
                  </form>


                ) : forgotPasswordStep === 'request' ? (
                  <form onSubmit={handleForgotPasswordRequest} className="w-full rounded-3xl border border-slate-700/80 bg-[#131c2a]/95 p-8 shadow-2xl backdrop-blur-xl space-y-5">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-400 shadow-sm">
                        <Boxes className="h-3.5 w-3.5" /> AluProfile System
                      </div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">{t.forgotPassword}</h2>
                    </div>
                    <p className="text-xs text-slate-400 text-center leading-relaxed">{t.resetPasswordHelp}</p>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        {t.usernameOrEmail}
                      </label>
                      <Input className="rounded-2xl border-slate-700 bg-[#1e293b] text-white placeholder:text-slate-500 focus:border-cyan-400 text-xs py-2.5" autoComplete="username" autoFocus value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={t.usernameOrEmail} />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs font-bold pt-2">
                      <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer" onClick={backToLogin}>{t.backToLogin}</button>
                    </div>
                    <Button className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs py-3 shadow-lg shadow-blue-500/25 cursor-pointer" type="submit" disabled={forgotPasswordLoading || !!isLoading}>
                      {forgotPasswordLoading ? t.sendingResetCode : t.sendResetCode}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotPasswordReset} className="w-full rounded-3xl border border-slate-700/80 bg-[#131c2a]/95 p-8 shadow-2xl backdrop-blur-xl space-y-5">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-400 shadow-sm">
                        <Boxes className="h-3.5 w-3.5" /> AluProfile System
                      </div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">{t.forgotPassword}</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                          {t.resetCode}
                        </label>
                        <Input className="rounded-2xl border-slate-700 bg-[#1e293b] text-white placeholder:text-slate-500 focus:border-cyan-400 text-xs py-2.5" autoComplete="one-time-code" autoFocus value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder={t.resetCode} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                          {t.newPassword}
                        </label>
                        <div className="relative">
                          <Input className="rounded-2xl border-slate-700 bg-[#1e293b] text-white placeholder:text-slate-500 focus:border-cyan-400 text-xs py-2.5 pr-16" type={showResetPassword ? 'text' : 'password'} autoComplete="new-password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder={t.newPassword} />
                          <button type="button" className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-xs font-bold text-slate-400 hover:text-white cursor-pointer" onClick={() => setShowResetPassword((value: boolean) => !value)}>
                            {showResetPassword ? <EyeOff className="h-4 w-4 text-cyan-400" /> : <Eye className="h-4 w-4" />}
                            {showResetPassword ? t.hidePassword : t.showPassword}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs font-bold pt-2">
                      <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer" onClick={backToLogin}>{t.backToLogin}</button>
                    </div>
                    <Button className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs py-3 shadow-lg shadow-blue-500/25 cursor-pointer" type="submit" disabled={forgotPasswordLoading || !!isLoading}>
                      {forgotPasswordLoading ? t.resettingPassword : t.setNewPassword}
                    </Button>
                  </form>
                )
              ) : signUpStep === 'details' ? (
                <form onSubmit={handleSignUp} className="w-full rounded-3xl border border-slate-700/80 bg-[#131c2a]/95 p-8 shadow-2xl backdrop-blur-xl space-y-5">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-400 shadow-sm">
                      <Boxes className="h-3.5 w-3.5" /> AluProfile System
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">{t.signUp}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{t.signUpNote}</p>
                  </div>
                  <div className="space-y-3.5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300">{t.firstName}</label>
                        <Input className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2" autoComplete="given-name" value={signUpFirstName} onChange={(e) => setSignUpFirstName(e.target.value)} placeholder={t.firstName} />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300">{t.lastName}</label>
                        <Input className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2" autoComplete="family-name" value={signUpLastName} onChange={(e) => setSignUpLastName(e.target.value)} placeholder={t.lastName} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">
                        {t.usernameOrEmail.replace(' or email', '').replace(' oder E-Mail', '')}
                      </label>
                      <Input className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2" autoComplete="username" value={signUpUsername} onChange={(e) => setSignUpUsername(e.target.value)} placeholder={t.usernameOrEmail.replace(' or email', '').replace(' oder E-Mail', '')} />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">{t.emailAddress}</label>
                      <Input className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2" type="email" autoComplete="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} placeholder={t.emailAddress} />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">{t.password}</label>
                      <div className="relative">
                        <Input className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2 pr-16" type={showSignUpPassword ? 'text' : 'password'} autoComplete="new-password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} placeholder={t.password} />
                        <button type="button" className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-xs font-bold text-slate-400 hover:text-white cursor-pointer" onClick={() => setShowSignUpPassword((value) => !value)}>
                          {showSignUpPassword ? <EyeOff className="h-4 w-4 text-cyan-400" /> : <Eye className="h-4 w-4" />}
                          {showSignUpPassword ? t.hidePassword : t.showPassword}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 text-xs font-bold pt-2">
                    <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer" onClick={openSignIn}>{t.signIn}</button>
                  </div>
                  <Button className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs py-3 shadow-lg shadow-blue-500/25 cursor-pointer" type="submit" disabled={signUpLoading || !!isLoading}>
                    {signUpLoading ? t.creatingAccount : t.createAccount}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignUpVerification} className="w-full rounded-3xl border border-slate-700/80 bg-[#131c2a]/95 p-8 shadow-2xl backdrop-blur-xl space-y-5">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-400 shadow-sm">
                      <Boxes className="h-3.5 w-3.5" /> AluProfile System
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">{t.verifyEmail}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{t.verifyEmailNote}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">{t.verificationCode}</label>
                    <Input className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" autoComplete="one-time-code" autoFocus value={signUpCode} onChange={(e) => setSignUpCode(e.target.value)} placeholder={t.verificationCode} />
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs font-bold pt-2">
                    <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer" onClick={openSignUp}>{t.backToLogin}</button>
                    <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer" onClick={openSignIn}>{t.signIn}</button>
                  </div>
                  <Button className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs py-3 shadow-lg shadow-blue-500/25 cursor-pointer" type="submit" disabled={signUpLoading || !!isLoading}>
                    {signUpLoading ? t.verifyingAccount : t.completeRegistration}
                  </Button>
                </form>
              )}
            </CardContent>

          </Card>
        )}

        {token && (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Owned Profiles Stat Card */}
              <div className="rounded-3xl border border-slate-700/80 bg-[#131c2a] p-6 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">{t.totalProfiles}</p>
                    <p className="text-3xl font-extrabold text-white mt-2">{profiles.length}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                    <Boxes className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Categories Stat Card */}
              <div className="rounded-3xl border border-slate-700/80 bg-[#131c2a] p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">{t.categories}</p>
                    <p className="text-3xl font-extrabold text-white mt-2">{(referenceData?.applications.length ?? 0) + (referenceData?.crossSections.length ?? 0)}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Wrench className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>


            {/* Professional Company Profile Card */}
            <Card className="border border-slate-700/80 shadow-2xl bg-[#131c2a] text-white overflow-hidden rounded-3xl">
              <CardHeader className="border-b border-slate-800 bg-[#0f172a]/90 py-5 px-6 sm:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-extrabold text-white">{t.companyProfile}</CardTitle>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {lang === 'de'
                          ? 'Verwalten Sie die offiziellen Stammdaten Ihres Unternehmens für Angebote & CAD-Downloads'
                          : 'Manage organization identity, contact details, and VAT information for CAD specs & RFQs'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6 px-6 sm:px-8 pb-8">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Group 1: Organization & Identity */}
                  <div className="space-y-4 bg-[#1e293b]/60 p-5 rounded-2xl border border-slate-800">
                    <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <span>1. Organization & Identification</span>
                    </h4>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">{t.name} (EN)</label>
                      <Input
                        placeholder="e.g. Aluprofile Systems GmbH"
                        value={supplierForm.name}
                        onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                        className="rounded-2xl border-slate-700 bg-[#0f172a] text-white text-xs py-2.5 focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">{t.name} (DE)</label>
                      <Input
                        placeholder="z.B. Aluprofile Systeme GmbH"
                        value={supplierForm.nameDe}
                        onChange={(e) => setSupplierForm({ ...supplierForm, nameDe: e.target.value })}
                        className="rounded-2xl border-slate-700 bg-[#0f172a] text-white text-xs py-2.5 focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">{lang === 'de' ? 'Branche / Sektor' : 'Industry Sector'}</label>
                      <Input
                        placeholder="e.g. Industrial Automation / Mechanical Engineering"
                        value={supplierForm.industry}
                        onChange={(e) => setSupplierForm({ ...supplierForm, industry: e.target.value })}
                        className="rounded-2xl border-slate-700 bg-[#0f172a] text-white text-xs py-2.5 focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">{t.uid} (Tax ID / VAT)</label>
                      <Input
                        placeholder="e.g. DE123456789 / CHE-123.456.789"
                        value={supplierForm.uid}
                        onChange={(e) => setSupplierForm({ ...supplierForm, uid: e.target.value })}
                        className="rounded-2xl border-slate-700 bg-[#0f172a] text-white text-xs py-2.5 focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Group 2: Contact & Location */}
                  <div className="space-y-4 bg-[#1e293b]/60 p-5 rounded-2xl border border-slate-800">
                    <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <span>2. Contact & Address Details</span>
                    </h4>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">{t.contactPerson}</label>
                      <Input
                        placeholder="e.g. Dipl.-Ing. Max Mustermann"
                        value={supplierForm.contactPerson}
                        onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                        className="rounded-2xl border-slate-700 bg-[#0f172a] text-white text-xs py-2.5 focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">{t.emailAddress}</label>
                      <Input
                        type="email"
                        placeholder="contact@company.com"
                        value={supplierForm.email}
                        onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                        className="rounded-2xl border-slate-700 bg-[#0f172a] text-white text-xs py-2.5 focus:border-cyan-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.phone}</label>
                        <Input
                          placeholder="+49 (0) 123 4567"
                          value={supplierForm.phone}
                          onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                          className="rounded-2xl border-slate-700 bg-[#0f172a] text-white text-xs py-2.5 focus:border-cyan-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.website}</label>
                        <Input
                          placeholder="https://www.company.com"
                          value={supplierForm.website}
                          onChange={(e) => setSupplierForm({ ...supplierForm, website: e.target.value })}
                          className="rounded-2xl border-slate-700 bg-[#0f172a] text-white text-xs py-2.5 focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">{t.companyAddress}</label>
                      <Input
                        placeholder="Street, Postal Code, City, Country"
                        value={supplierForm.address}
                        onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                        className="rounded-2xl border-slate-700 bg-[#0f172a] text-white text-xs py-2.5 focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <Button
                    onClick={saveSupplier}
                    disabled={isSavingSupplier}
                    className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs px-6 py-3 shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSavingSupplier ? 'Saving Profile...' : 'Save Company Profile'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>


            {/* Modern Profile Controls Section */}
            <Card className="border border-slate-700/80 shadow-2xl bg-[#131c2a] text-white overflow-hidden rounded-3xl">
              <CardHeader className="border-b border-slate-800 bg-[#0f172a]/90 py-5 px-6 sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-extrabold text-white">{t.profileControls}</CardTitle>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {lang === 'de'
                          ? 'Erstellen und verwalten Sie Ihre eigenen Aluminiumprofile'
                          : 'Create, manage, and publish custom aluminum profile specifications'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      className="rounded-2xl border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-extrabold text-xs px-4 py-2.5 cursor-pointer transition-all"
                      onClick={hideAllProfiles}
                    >
                      {lang === 'de' ? 'Alle ausblenden' : 'Hide All Profiles'}
                    </Button>
                    <Button
                      className={`rounded-2xl font-extrabold text-xs px-5 py-2.5 shadow-lg cursor-pointer transition-all flex items-center gap-2 ${
                        showForm
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-blue-500/25'
                      }`}
                      onClick={() => (showForm ? resetProfileForm() : setShowForm(true))}
                    >
                      <Plus className="h-4 w-4" />
                      <span>{showForm ? t.closeEditor : t.addProfile}</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6 px-6 sm:px-8 pb-8">
                {/* Profile Editor Form */}
                {showForm && (
                  <div className="rounded-3xl border border-slate-700/90 bg-[#0f172a] p-6 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span>{editId ? (lang === 'de' ? 'Profil bearbeiten' : 'Edit Profile Specification') : (lang === 'de' ? 'Neues Profil hinzufügen' : 'Create New Profile Specification')}</span>
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">{t.signedInAs}: {user?.email || user?.id}</span>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.name} (EN)</label>
                        <Input placeholder="e.g. 40x40 Heavy T-Slot" value={profileForm.name} onChange={(e) => setProfileForm((current) => ({ ...current, name: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.name} (DE)</label>
                        <Input placeholder="z.B. 40x40 Schwer Nut 8" value={profileForm.nameDe} onChange={(e) => setProfileForm((current) => ({ ...current, nameDe: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.dimensions}</label>
                        <Input placeholder="e.g. 40x40 mm" value={profileForm.dimensions} onChange={(e) => setProfileForm((current) => ({ ...current, dimensions: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.description} (EN)</label>
                        <Input placeholder="Profile description" value={profileForm.description} onChange={(e) => setProfileForm((current) => ({ ...current, description: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.description} (DE)</label>
                        <Input placeholder="Profilbeschreibung" value={profileForm.descriptionDe} onChange={(e) => setProfileForm((current) => ({ ...current, descriptionDe: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.weightPerMeter} (kg/m)</label>
                        <Input placeholder="e.g. 1.75" value={profileForm.weightPerMeter} onChange={(e) => setProfileForm((current) => ({ ...current, weightPerMeter: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.usage} (EN)</label>
                        <Input placeholder="e.g. Automation framing" value={profileForm.usage} onChange={(e) => setProfileForm((current) => ({ ...current, usage: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.usage} (DE)</label>
                        <Input placeholder="z.B. Maschinenbau" value={profileForm.usageDe} onChange={(e) => setProfileForm((current) => ({ ...current, usageDe: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.lengthMm} (mm)</label>
                        <Input placeholder="e.g. 6000" value={profileForm.lengthMm} onChange={(e) => setProfileForm((current) => ({ ...current, lengthMm: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.material} (EN)</label>
                        <Input placeholder="e.g. EN AW-6063 T6" value={profileForm.material} onChange={(e) => setProfileForm((current) => ({ ...current, material: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.material} (DE)</label>
                        <Input placeholder="z.B. EN AW-6063 T6" value={profileForm.materialDe} onChange={(e) => setProfileForm((current) => ({ ...current, materialDe: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.price}</label>
                        <Input placeholder="e.g. 45.50" value={profileForm.price} onChange={(e) => setProfileForm((current) => ({ ...current, price: e.target.value }))} className="rounded-2xl border-slate-700 bg-[#1e293b] text-white text-xs py-2.5" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.currency}</label>
                        <select
                          value={profileForm.currencyId}
                          onChange={(e) => setProfileForm((current) => ({ ...current, currencyId: e.target.value }))}
                          className="w-full rounded-2xl border border-slate-700 bg-[#1e293b] text-white text-xs p-2.5 focus:border-cyan-400"
                        >
                          <option value="" className="bg-slate-900">-- Select {t.currency} --</option>
                          {((referenceData as any)?.currencies ?? []).map((currency: any) => (
                            <option key={currency.id} value={currency.id} className="bg-slate-900">
                              {currency.code} ({currency.symbol})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.status}</label>
                        <select
                          value={profileForm.status}
                          onChange={(e) => setProfileForm((current) => ({ ...current, status: e.target.value }))}
                          className="w-full rounded-2xl border border-slate-700 bg-[#1e293b] text-white text-xs p-2.5 focus:border-cyan-400 font-bold"
                        >
                          {(referenceData?.statusOptions ?? []).map((status) => (
                            <option key={status} value={status} className="bg-slate-900">
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.applications}</label>
                        <select
                          multiple
                          value={profileForm.applicationIds.map(String)}
                          onChange={(e) => setProfileForm((current) => ({ ...current, applicationIds: Array.from(e.target.selectedOptions).map((option) => Number(option.value)) }))}
                          className="w-full h-24 rounded-2xl border border-slate-700 bg-[#1e293b] text-white text-xs p-2 focus:border-cyan-400"
                        >
                          {(referenceData?.applications ?? []).map((item) => (
                            <option key={item.id} value={item.id} className="p-1 rounded hover:bg-cyan-500/20">
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300">{t.crossSections}</label>
                        <select
                          multiple
                          value={profileForm.crossSectionIds.map(String)}
                          onChange={(e) => setProfileForm((current) => ({ ...current, crossSectionIds: Array.from(e.target.selectedOptions).map((option) => Number(option.value)) }))}
                          className="w-full h-24 rounded-2xl border border-slate-700 bg-[#1e293b] text-white text-xs p-2 focus:border-cyan-400"
                        >
                          {(referenceData?.crossSections ?? []).map((item) => (
                            <option key={item.id} value={item.id} className="p-1 rounded hover:bg-cyan-500/20">
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* File Uploads */}
                      <div className="space-y-1.5 bg-[#1e293b]/60 p-4 rounded-2xl border border-slate-800">
                        <label className="block text-xs font-bold text-slate-300">{t.drawingFile} (PDF/Image)</label>
                        {profileForm.drawingUrl ? (
                          <div className="flex items-center justify-between gap-2 bg-[#0f172a] p-2 rounded-xl border border-slate-700">
                            <a href={profileForm.drawingUrl} target="_blank" rel="noreferrer" className="truncate text-xs text-cyan-400 underline">{profileForm.drawingUrl.split('/').pop()}</a>
                            <Button size="sm" variant="destructive" className="h-7 text-xs rounded-lg" onClick={() => setProfileForm((current) => ({ ...current, drawingUrl: '' }))}>{t.delete}</Button>
                          </div>
                        ) : (
                          <input type="file" accept="image/*,.pdf" className="w-full text-xs text-slate-400 file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-cyan-400" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const data = await uploadFile(file); setProfileForm((current) => ({ ...current, drawingUrl: data.url })); }} />
                        )}
                      </div>

                      <div className="space-y-1.5 bg-[#1e293b]/60 p-4 rounded-2xl border border-slate-800">
                        <label className="block text-xs font-bold text-slate-300">{t.photoFile} (PDF/Image)</label>
                        {profileForm.photoUrl ? (
                          <div className="flex items-center justify-between gap-2 bg-[#0f172a] p-2 rounded-xl border border-slate-700">
                            <a href={profileForm.photoUrl} target="_blank" rel="noreferrer" className="truncate text-xs text-cyan-400 underline">{profileForm.photoUrl.split('/').pop()}</a>
                            <Button size="sm" variant="destructive" className="h-7 text-xs rounded-lg" onClick={() => setProfileForm((current) => ({ ...current, photoUrl: '' }))}>{t.delete}</Button>
                          </div>
                        ) : (
                          <input type="file" accept="image/*,.pdf" className="w-full text-xs text-slate-400 file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-cyan-400" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const data = await uploadFile(file); setProfileForm((current) => ({ ...current, photoUrl: data.url })); }} />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                      <Button variant="outline" className="rounded-2xl border-slate-700 text-slate-300 hover:bg-slate-800 text-xs px-5 py-2.5" onClick={resetProfileForm}>
                        {t.cancel}
                      </Button>
                      <Button onClick={saveProfile} disabled={isSaving} className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs px-6 py-2.5 shadow-lg shadow-blue-500/25 cursor-pointer">
                        {isSaving ? 'Saving...' : t.saveProfile}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Toolbar Controls Bar */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-[#0f172a]/90 p-4 rounded-2xl border border-slate-800">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder={t.filterProfiles}
                        value={profileFilter}
                        onChange={(e) => setProfileFilter(e.target.value)}
                        className="rounded-2xl border-slate-700 bg-[#1e293b] pl-10 text-white text-xs py-2.5 focus:border-cyan-400"
                      />
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="relative">
                      <select
                        value={profileSort}
                        onChange={(e) => setProfileSort(e.target.value as any)}
                        className="rounded-2xl border border-slate-700 bg-[#1e293b] text-white text-xs font-bold py-2.5 px-3 focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="newest" className="bg-slate-900">✨ Newest First</option>
                        <option value="oldest" className="bg-slate-900">⌛ Oldest First</option>
                        <option value="priceAsc" className="bg-slate-900">💲 Price: Low to High</option>
                        <option value="priceDesc" className="bg-slate-900">💲 Price: High to Low</option>
                        <option value="name-asc" className="bg-slate-900">🔤 Name (A–Z)</option>
                        <option value="name-desc" className="bg-slate-900">🔤 Name (Z–A)</option>
                        <option value="status-asc" className="bg-slate-900">🏷️ Status</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Per Page Selector */}
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <span>Per Page:</span>
                      <select
                        value={profilePageSize}
                        onChange={(e) => {
                          setProfilePageSize(Number(e.target.value));
                          setProfilePage(1);
                        }}
                        className="rounded-xl border border-slate-700 bg-[#1e293b] text-white text-xs font-bold py-1.5 px-2.5 cursor-pointer"
                      >
                        <option value={5} className="bg-slate-900">5</option>
                        <option value={10} className="bg-slate-900">10</option>
                        <option value={25} className="bg-slate-900">25</option>
                        <option value={50} className="bg-slate-900">50</option>
                        <option value={1000} className="bg-slate-900">All</option>
                      </select>
                    </label>

                    <Button
                      variant="outline"
                      className="rounded-2xl border-slate-700 bg-[#1e293b] hover:bg-slate-800 text-slate-200 text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
                      onClick={() => exportCustomerProfiles('excel')}
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                      <span>{t.exportExcel}</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-2xl border-slate-700 bg-[#1e293b] hover:bg-slate-800 text-slate-200 text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
                      onClick={() => exportCustomerProfiles('pdf')}
                    >
                      <FileText className="h-4 w-4 text-red-400" />
                      <span>{t.exportPdf}</span>
                    </Button>
                  </div>
                </div>

                {/* Table Records List */}
                {!filteredProfiles.length ? (
                  <div className="rounded-3xl border border-dashed border-slate-800 bg-[#0f172a]/50 p-12 text-center text-sm text-slate-400 space-y-2">
                    <Boxes className="h-10 w-10 text-slate-600 mx-auto" />
                    <p className="font-extrabold text-slate-300">{t.noProfiles}</p>
                    <p className="text-xs text-slate-500">Click &quot;Add Profile&quot; above to create your first custom extrusion profile.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-[#0f172a]">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 bg-[#131c2a] text-[11px] font-black uppercase tracking-wider text-slate-400">
                            <th className="px-4 py-3.5">{t.drawing}</th>
                            <th className="px-4 py-3.5">{t.name}</th>
                            <th className="px-4 py-3.5">{t.description}</th>
                            <th className="px-4 py-3.5">{t.usage}</th>
                            <th className="px-4 py-3.5">{t.applications}</th>
                            <th className="px-4 py-3.5">{t.crossSections}</th>
                            <th className="px-4 py-3.5">{t.status}</th>
                            <th className="px-4 py-3.5">{t.dimensions}</th>
                            <th className="px-4 py-3.5">{t.material}</th>
                            <th className="px-4 py-3.5">{t.weightPerMeter}</th>
                            <th className="px-4 py-3.5">{t.lengthMm}</th>
                            <th className="px-4 py-3.5">{t.price}</th>
                            <th className="px-4 py-3.5 text-right">{t.actions}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {profileRows.items.map((profile) => {
                            const displayName = profile.nameDe ? profile.name + ' / ' + profile.nameDe : profile.name;
                            const descriptionText = profile.descriptionDe ? (profile.description || '-') + ' / ' + profile.descriptionDe : profile.description || '-';
                            const displayUsage = profile.usageDe ? (profile.usage || '-') + ' / ' + profile.usageDe : profile.usage || '-';
                            const displayMaterial = profile.materialDe ? (profile.material || '-') + ' / ' + profile.materialDe : profile.material || '-';
                            const displayApplications = (profile.applications ?? []).map((entry) => entry.nameDe ? entry.name + ' / ' + entry.nameDe : entry.name).join(', ') || '-';
                            const displayCrossSections = (profile.crossSections ?? []).map((entry) => entry.nameDe ? entry.name + ' / ' + entry.nameDe : entry.name).join(', ') || '-';
                            return (
                              <tr key={profile.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="px-4 py-3">
                                  {profile.drawingUrl ? (
                                    <a href={profile.drawingUrl} target="_blank" rel="noreferrer" className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-white p-1 shadow-sm">
                                      <img src={profile.drawingUrl} alt={profile.name} className="h-full w-full object-contain" loading="lazy" />
                                    </a>
                                  ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900 text-[10px] font-bold text-slate-500">N/A</div>
                                  )}
                                </td>
                                <td className="px-4 py-3 font-extrabold text-white">{displayName}</td>
                                <td className="px-4 py-3 text-slate-400">{descriptionText}</td>
                                <td className="px-4 py-3 text-slate-400">{displayUsage}</td>
                                <td className="px-4 py-3 text-slate-400">{displayApplications}</td>
                                <td className="px-4 py-3 text-slate-400">{displayCrossSections}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                                    profile.status === 'NOT_AVAILABLE'
                                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                      : profile.status === 'IN_DEVELOPMENT'
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}>
                                    {profile.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-300 font-mono">{profile.dimensions || '-'}</td>
                                <td className="px-4 py-3 text-slate-400">{displayMaterial}</td>
                                <td className="px-4 py-3 text-slate-400">{profile.weightPerMeter ? new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profile.weightPerMeter) : '-'}</td>
                                <td className="px-4 py-3 text-slate-400">{profile.lengthMm ? new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profile.lengthMm) : '-'}</td>
                                <td className="px-4 py-3 font-extrabold text-cyan-400">
                                  {profile.price ? `${new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profile.price)} ${profile.currency ? profile.currency.symbol : ''}` : '-'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button size="sm" variant="outline" className="h-8 rounded-xl border-slate-700 text-slate-300 text-[11px]" onClick={() => toggleProfileVisibility(profile)}>
                                      {profile.status === 'AVAILABLE' ? <EyeOff className="h-3.5 w-3.5 text-amber-400" /> : <Eye className="h-3.5 w-3.5 text-emerald-400" />}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 rounded-xl text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-[11px]" onClick={() => startEditProfile(profile)}>
                                      {t.edit}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-[11px]" onClick={() => deleteProfile(profile.id)}>
                                      {t.delete}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Interactive Pagination Controls */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-[#0f172a] p-4 rounded-2xl border border-slate-800 text-xs">
                      <div className="text-slate-400 font-medium">
                        {t.showing} <span className="font-extrabold text-white">{profileRows.start}</span>–<span className="font-extrabold text-white">{profileRows.end}</span> of <span className="font-extrabold text-cyan-400">{profileRows.total}</span> {t.records}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={profileRows.page <= 1}
                          onClick={() => setProfilePage((page) => page - 1)}
                          className="h-8 rounded-xl border-slate-700 bg-[#1e293b] text-slate-200 disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>{t.previous}</span>
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: profileRows.totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setProfilePage(p)}
                              className={`h-8 w-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                profileRows.page === p
                                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                                  : 'bg-[#1e293b] text-slate-400 hover:bg-slate-700 hover:text-white'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={profileRows.page >= profileRows.totalPages}
                          onClick={() => setProfilePage((page) => page + 1)}
                          className="h-8 rounded-xl border-slate-700 bg-[#1e293b] text-slate-200 disabled:opacity-40"
                        >
                          <span>{t.next}</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerPage;




















