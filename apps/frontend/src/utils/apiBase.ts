export function getApiBase(): string {
  if (import.meta.env.VITE_API_BASE) {
    return (import.meta.env.VITE_API_BASE as string).replace(/\/+$/, '');
  }
  return 'http://localhost:3000/api';
}

export const API_BASE = getApiBase();
