import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import './index.css';
import App from './App.tsx';
import AdminPage from './AdminPage.tsx';
import CustomerPage from './CustomerPage.tsx';
import SearchPortalPage from './SearchPortalPage.tsx';
import CatalogPage from './CatalogPage.tsx';
import PrivacyPage from './PrivacyPage.tsx';
import TermsPage from './TermsPage.tsx';
import { initSentry } from './monitoring/sentry.ts';
import CookieConsentBanner, { initGA } from './components/CookieConsentBanner.tsx';

initSentry();
initGA();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/*" element={<CatalogPage />} />
            <Route path="/search" element={<SearchPortalPage />} />
            <Route path="/search/*" element={<SearchPortalPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/customer" element={<CustomerPage />} />
            <Route path="/customer/*" element={<CustomerPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/privacy/*" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/terms/*" element={<TermsPage />} />
            <Route path="*" element={<App />} />
          </Routes>

          <CookieConsentBanner />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);

