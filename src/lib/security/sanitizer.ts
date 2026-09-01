/**
 * Sanitizes user input string against XSS and control characters.
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove direct HTML tags
    .slice(0, 1000); // Prevent memory exhaustion from giant strings
}

/**
 * Neutralizes CSV Formula Injection (CWE-1236).
 * Values starting with =, +, -, @, \t, or \r can execute commands in spreadsheet applications.
 * Prepending a single quote (') forces spreadsheet software to treat the cell as literal text.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === undefined || value === null) return "";
  let str = String(value).trim();

  // Check for dangerous leading formula characters
  const DANGEROUS_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];
  if (DANGEROUS_PREFIXES.some((prefix) => str.startsWith(prefix))) {
    str = `'${str}`;
  }

  // Escape inner double quotes for CSV format
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Validates EPIC / Voter ID format.
 * Typically 10-16 alphanumeric characters (e.g., ABC1234567).
 */
export function isValidVoterCard(card: unknown): boolean {
  if (typeof card !== "string") return false;
  const clean = card.trim();
  return clean.length >= 6 && clean.length <= 25 && /^[A-Z0-9\-_/]+$/i.test(clean);
}

/**
 * Validates mobile number format (10-14 digits, optional + prefix).
 */
export function isValidMobile(mobile: unknown): boolean {
  if (!mobile) return true; // Optional field
  if (typeof mobile !== "string") return false;
  const clean = mobile.replace(/[\s\-()]/g, "");
  return /^\+?[0-9]{10,14}$/.test(clean);
}
