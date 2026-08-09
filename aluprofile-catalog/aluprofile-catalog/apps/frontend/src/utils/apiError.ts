export function parseApiError(error: unknown): string {
  const tryParse = (str: string) => {
    let cleanStr = str;
    if (cleanStr.startsWith('Error: ')) {
      cleanStr = cleanStr.substring(7);
    }
    // Also remove leading/trailing quotes if it was doubly stringified
    cleanStr = cleanStr.trim();
    if (cleanStr.startsWith('"') && cleanStr.endsWith('"')) {
      try {
        cleanStr = JSON.parse(cleanStr);
      } catch {
        // ignore
      }
    }

    try {
      const parsed = JSON.parse(cleanStr);
      if (parsed && parsed.message) {
        if (Array.isArray(parsed.message)) {
          return parsed.message.join(', ');
        }
        return String(parsed.message);
      }
    } catch {
      // Ignored
    }
    
    // If it's a generic "Unauthorized" error message inside the string but not JSON
    if (cleanStr.includes('Invalid credentials')) return 'Invalid credentials';
    if (cleanStr.includes('Unauthorized')) return 'Unauthorized';

    return str;
  };

  if (error instanceof Error) {
    return tryParse(error.message);
  }

  if (typeof error === 'string') {
    return tryParse(error);
  }

  return 'An unexpected error occurred';
}
