import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthContext';
import './index.css';
import App from './App.tsx';
import AdminPage from './AdminPage.tsx';
import CustomerPage from './CustomerPage.tsx';
import SearchPortalPage from './SearchPortalPage.tsx';
import PrivacyPage from './PrivacyPage.tsx';
import ImprintPage from './ImprintPage.tsx';
import TermsPage from './TermsPage.tsx';
import { initSentry } from './monitoring/sentry.ts';
import CookieConsentBanner, { initGA } from './components/CookieConsentBanner.tsx';

initSentry();
initGA();

const pathname = window.location.pathname;
let page = <SearchPortalPage />;
if (pathname === '/admin') page = <AdminPage />;
else if (pathname === '/customer') page = <CustomerPage />;
else if (pathname === '/privacy') page = <PrivacyPage />;
else if (pathname === '/imprint') page = <ImprintPage />;
else if (pathname === '/terms') page = <TermsPage />;
else if (pathname === '/legacy') page = <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Toaster position="top-center" />
      {page}
      <CookieConsentBanner />
    </AuthProvider>
  </StrictMode>,
);
