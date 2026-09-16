/** Escapes one CSV cell and prevents spreadsheet formula interpretation. */
export function escapeCsvCell(value) {
  const text = String(value ?? "");
  const hardened = /^[\t\r\n]*[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(hardened) ? `"${hardened.replaceAll('"', '""')}"` : hardened;
}
