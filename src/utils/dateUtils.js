/**
 * Canonical date key "YYYY-MM-DD" from a local Date.
 * Never use .toISOString() — it shifts the day in UTC.
 */
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse "YYYY-MM-DD" into a local midnight Date.
 * new Date("YYYY-MM-DD") gives UTC midnight — wrong in UTC+5:30.
 */
export function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Returns a new Date offset by n months. */
export function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

/** Returns a new Date offset by n days. */
export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** True if two Dates are the same calendar day. */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

/** True if date falls within [start, end] inclusive. */
export function isInRange(date, start, end) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

/** Night count between two date strings. */
export function countNights(checkIn, checkOut) {
  return Math.round(
    (parseLocalDate(checkOut) - parseLocalDate(checkIn)) / 86400000
  );
}

/**
 * Builds the 42-cell (6×7) grid for a given year/month.
 * Week starts Sunday. Returns { date: Date, isCurrentMonth: boolean }[]
 */
export function getCalendarDays(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth  = new Date(year, month + 1, 0);
  const startPad     = firstOfMonth.getDay(); // 0=Sun
  const endPad       = 6 - lastOfMonth.getDay();
  const days         = [];

  // Prev-month padding
  for (let i = startPad - 1; i >= 0; i--) {
    days.push({ date: addDays(firstOfMonth, -(i + 1)), isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= lastOfMonth.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  // Next-month padding
  for (let i = 1; i <= endPad; i++) {
    days.push({ date: addDays(lastOfMonth, i), isCurrentMonth: false });
  }
  // Guarantee exactly 42 cells
  while (days.length < 42) {
    days.push({
      date: addDays(lastOfMonth, days.length - lastOfMonth.getDate() - startPad + 1),
      isCurrentMonth: false,
    });
  }

  return days;
}

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const WEEKDAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];