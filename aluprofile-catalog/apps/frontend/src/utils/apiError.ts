export function parseApiError(error: unknown): string {
  if (error instanceof Error) {
    try {
      // Try to parse the error message if it's JSON (NestJS standard error format)
      const parsed = JSON.parse(error.message);
      if (parsed && parsed.message) {
        if (Array.isArray(parsed.message)) {
          return parsed.message.join(', ');
        }
        return String(parsed.message);
      }
    } catch {
      // If it's not JSON, just return the message
      return error.message;
    }
    return error.message;
  }
  return typeof error === 'string' ? error : 'An unexpected error occurred';
}
