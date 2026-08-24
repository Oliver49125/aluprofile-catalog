import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE } from './apiBase';

export function recordVisit(pathname?: string) {
  try {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isTablet = /Tablet|iPad/i.test(navigator.userAgent);
    const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
    const browser = navigator.userAgent.includes('Chrome')
      ? 'Chrome'
      : navigator.userAgent.includes('Safari')
      ? 'Safari'
      : navigator.userAgent.includes('Firefox')
      ? 'Firefox'
      : navigator.userAgent.includes('Edg')
      ? 'Edge'
      : 'Browser';
    const os = navigator.userAgent.includes('Mac')
      ? 'macOS'
      : navigator.userAgent.includes('Windows')
      ? 'Windows'
      : navigator.userAgent.includes('Android')
      ? 'Android'
      : navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')
      ? 'iOS'
      : 'OS';

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const currentPath = pathname || window.location.pathname || '/';

    fetch(`${API_BASE}/public/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitedPage: currentPath,
        device,
        browser,
        os,
        timezone,
      }),
    }).catch(() => {});
  } catch (err) {
    // Non-blocking telemetry
  }
}

export function VisitorTracker() {
  const location = useLocation();

  useEffect(() => {
    recordVisit(location.pathname);
  }, [location.pathname]);

  return null;
}
