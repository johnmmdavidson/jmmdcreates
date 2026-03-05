const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseDate(iso: string) {
  const [year, month] = iso.split("-").map(Number);
  return { year, month };
}

export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!endDate) return "";

  const end = parseDate(endDate);

  if (!startDate) {
    return `${MONTH_FULL[end.month - 1]} ${end.year}`;
  }

  const start = parseDate(startDate);

  if (start.year === end.year && start.month === end.month) {
    return `${MONTH_FULL[end.month - 1]} ${end.year}`;
  }

  if (start.year === end.year) {
    return `${MONTH_SHORT[start.month - 1]} – ${MONTH_SHORT[end.month - 1]} ${end.year}`;
  }

  return `${MONTH_SHORT[start.month - 1]} ${start.year} – ${MONTH_SHORT[end.month - 1]} ${end.year}`;
}

const UNIT_SYMBOLS: Record<string, string> = {
  in: '"',
  cm: " cm",
  ft: "'",
};

export function formatDimensions(
  width?: number,
  height?: number,
  depth?: number,
  unit: string = "in"
): string {
  if (!width || !height) return "";

  const sym = UNIT_SYMBOLS[unit] || '"';
  const parts = [width, height];
  if (depth) parts.push(depth);

  return parts.map((d) => `${d}${sym}`).join(" × ");
}
