import { useState, useCallback } from 'react';
import { useCalendarContext } from '../../context/CalendarContext';
import { buildOccupancyMap, getOverlappingBookings } from '../../utils/occupancy';
import { toDateKey, parseLocalDate } from '../../utils/dateUtils';

const STATUS_STYLES = {
  confirmed:   { color: '#1a6b45', label: 'Confirmed' },
  checked_in:  { color: '#1565c0', label: 'Checked In' },
  checked_out: { color: '#6b6860', label: 'Checked Out' },
  cancelled:   { color: '#c0392b', label: 'Cancelled' },
};

export function useHoverTooltip(bookings) {
  const [tooltip, setTooltip] = useState(null);
  // tooltip: { date: Date, x: number, y: number } | null

  const handleMouseEnter = useCallback((e, date) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      date,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return { tooltip, handleMouseEnter, handleMouseLeave };
}

export function HoverTooltip({ tooltip, bookings }) {
  if (!tooltip) return null;

  const { date, x, y } = tooltip;
  const dateKey = toDateKey(date);

  // Bookings occupying this single night
  const dayBookings = getOverlappingBookings(bookings, date, date).filter(
    (b) => b.status !== 'cancelled'
  );

  const occupied = dayBookings.length;

  return (
    <div
      className="fixed z-[999] pointer-events-none"
      style={{
        left: x,
        top: y - 8,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div
        className="rounded-xl p-3 min-w-[200px] max-w-[240px]"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Date */}
        <p
          className="text-xs font-semibold mb-2"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {dateKey}
        </p>

        {/* Occupancy bar */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--border)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(occupied / 10) * 100}%`,
                background: occupied >= 8
                  ? 'var(--occ-9)'
                  : occupied >= 5
                  ? 'var(--occ-5)'
                  : 'var(--occ-3)',
              }}
            />
          </div>
          <span
            className="text-xs font-medium shrink-0"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {occupied}/10
          </span>
        </div>

        {/* Guest list */}
        {dayBookings.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            No active bookings
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {dayBookings.slice(0, 4).map((b) => {
              const s = STATUS_STYLES[b.status] ?? STATUS_STYLES.confirmed;
              return (
                <div key={b.id} className="flex items-center justify-between gap-2">
                  <span
                    className="text-[11px] truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {b.guestName}
                  </span>
                  <span
                    className="text-[11px] shrink-0 font-medium"
                    style={{
                      color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    #{b.roomNumber}
                  </span>
                </div>
              );
            })}
            {dayBookings.length > 4 && (
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                +{dayBookings.length - 4} more
              </p>
            )}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"
        style={{
          bottom: -6,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderLeft: 'none',
        }}
      />
    </div>
  );
}