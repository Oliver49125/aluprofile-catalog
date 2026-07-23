import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthContext';
import './index.css';
import App from './App.tsx';
import AdminPage from './AdminPage.tsx';
import CustomerPage from './CustomerPage.tsx';
import { initSentry } from './monitoring/sentry.ts';
import CookieConsentBanner, { initGA } from './components/CookieConsentBanner.tsx';

initSentry();
initGA();

const pathname = window.location.pathname;
const page = pathname === '/admin' ? <AdminPage /> : pathname === '/customer' ? <CustomerPage /> : <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Toaster position="top-center" />
      {page}
      <CookieConsentBanner />
    </AuthProvider>
  </StrictMode>,
);
