/**
 * Fecha calendario YYYY-MM-DD en la zona horaria indicada (p. ej. America/Costa_Rica).
 */
export function formatYmdInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Suma días calendario a una fecha Y-M-D interpretada en UTC medianoche. */
export function addCalendarDaysToYmd(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + deltaDays);
  return `${base.getUTCFullYear()}-${pad2(base.getUTCMonth() + 1)}-${pad2(base.getUTCDate())}`;
}
