const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return value.length > 0 && value.length <= 254 && EMAIL_RE.test(value);
}

/** Trim and cap a user-supplied string so a single field can't bloat the DB or an email. */
export function cleanStr(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}
