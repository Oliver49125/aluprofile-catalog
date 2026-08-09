import React from 'react';
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent';
import ReactGA from 'react-ga4';

// Replace this with the actual GA4 Measurement ID for the client
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; 

export const initGA = () => {
  const isConsentGiven = getCookieConsentValue() === "true";
  if (isConsentGiven) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }
};

const CookieConsentBanner: React.FC = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Akzeptieren"
      declineButtonText="Ablehnen"
      cookieName="CookieConsent"
      enableDeclineButton
      onAccept={() => {
        initGA();
      }}
      style={{ background: "#2B373B", color: "#fff", zIndex: 1000 }}
      buttonStyle={{ background: "#4CAF50", color: "#fff", fontSize: "14px", borderRadius: "4px" }}
      declineButtonStyle={{ background: "#f44336", color: "#fff", fontSize: "14px", borderRadius: "4px" }}
      expires={365}
    >
      Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern. Wenn Sie auf "Akzeptieren" klicken, stimmen Sie der Verwendung von Cookies und der Analyse Ihrer Nutzung (z.B. Google Analytics) zu. <a href="/privacy" style={{ color: "#4CAF50" }}>Mehr erfahren</a>.
    </CookieConsent>
  );
};

export default CookieConsentBanner;
