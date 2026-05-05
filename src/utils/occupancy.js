import { parseLocalDate, toDateKey, addDays, countNights } from './dateUtils';

/**
 * Core rule:
 *   checkIn <= night < checkOut  →  room is occupied that night
 *   cancelled bookings never count
 */
function isNightOccupied(booking, nightDate) {
  if (booking.status === 'cancelled') return false;
  const night   = nightDate.getTime();
  const checkIn = parseLocalDate(booking.checkIn).getTime();
  const checkOut= parseLocalDate(booking.checkOut).getTime();
  return night >= checkIn && night < checkOut;
}

/**
 * Builds Map<"YYYY-MM-DD", number> of room counts for every day
 * in [windowStart, windowEnd] inclusive.
 */
export function buildOccupancyMap(bookings, windowStart, windowEnd) {
  const map = new Map();
  let cursor = new Date(windowStart);
  while (cursor <= windowEnd) {
    const key = toDateKey(cursor);
    let count = 0;
    for (const b of bookings) {
      if (isNightOccupied(b, cursor)) count++;
    }
    map.set(key, count);
    cursor = addDays(cursor, 1);
  }
  return map;
}

/**
 * Returns bookings that overlap [rangeStart, rangeEnd] (both inclusive).
 * A booking overlaps if its stay touches any night in the range.
 */
export function getOverlappingBookings(bookings, rangeStart, rangeEnd) {
  // rangeEnd is an inclusive night — add 1 day to make the exclusive boundary
  const exclusiveEnd = addDays(rangeEnd, 1);

  return bookings.filter((b) => {
    const bIn  = parseLocalDate(b.checkIn);
    const bOut = parseLocalDate(b.checkOut);
    return bIn < exclusiveEnd && bOut > rangeStart;
  });
}

/**
 * Maps count 0–10 to the CSS variable defined in global.css.
 */
export function occupancyToColor(count) {
  const c = Math.min(10, Math.max(0, count));
  return `var(--occ-${c})`;
}

/** Light text on dark cells (occ ≥ 6). */
export function occupancyToTextColor(count) {
  return count >= 6 ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)';
}

/**
 * Month-level stats derived from filtered bookings.
 * Uses totalAmount (your actual field name) and computes nights on the fly.
 */
export function computeMonthStats(bookings, year, month) {
  const monthStart = new Date(year, month, 1);
  const monthEnd   = new Date(year, month + 1, 0);
  const TOTAL_ROOMS = 10;

  const active = bookings.filter((b) => {
    if (b.status === 'cancelled') return false;
    const cin  = parseLocalDate(b.checkIn);
    const cout = parseLocalDate(b.checkOut);
    return cin <= monthEnd && cout > monthStart;
  });

  if (active.length === 0) {
    return { totalRevenue: 0, avgOccupancy: '0.0', longestStay: 0, mostBookedRoom: '—', totalBookings: 0 };
  }

  const totalRevenue = active.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const longestStay  = Math.max(...active.map((b) => countNights(b.checkIn, b.checkOut)));

  // Most booked room number
  const roomCounts = {};
  for (const b of active) {
    roomCounts[b.roomNumber] = (roomCounts[b.roomNumber] || 0) + 1;
  }
  const mostBookedRoom = Object.entries(roomCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  // Avg occupancy % = total occupied room-nights / (days * TOTAL_ROOMS) * 100
  const daysInMonth = monthEnd.getDate();
  const totalRoomNights = active.reduce((sum, b) => sum + countNights(b.checkIn, b.checkOut), 0);
  const avgOccupancy = ((totalRoomNights / (daysInMonth * TOTAL_ROOMS)) * 100).toFixed(1);

  return { totalRevenue, avgOccupancy, longestStay, mostBookedRoom, totalBookings: active.length };
}