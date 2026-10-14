export function getApiBase(): string {
  if (import.meta.env.VITE_API_BASE) {
    return (import.meta.env.VITE_API_BASE as string).replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('aluprofile.biz')) {
    return 'https://api.aluprofile.biz/api';
  }
  return 'http://localhost:3000/api';
}

export const API_BASE = getApiBase();
