import { useMemo } from 'react';
import { useCalendarContext } from '../../context/CalendarContext';
import { getOverlappingBookings } from '../../utils/occupancy';
import { toDateKey, countNights as cn } from '../../utils/dateUtils';
import { exportCSV } from '../../utils/exportCSV';

const STATUS_STYLES = {
  confirmed:   { color: '#1a6b45', bg: '#e8f5ee', label: 'Confirmed' },
  checked_in:  { color: '#1565c0', bg: '#e8f0fe', label: 'Checked In' },
  checked_out: { color: '#6b6860', bg: '#f2f1ee', label: 'Checked Out' },
  cancelled:   { color: '#c0392b', bg: '#fdecea', label: 'Cancelled' },
};

export function BookingPanel({ bookings }) {
  const { state, dispatch } = useCalendarContext();
  const { selection } = state;

  const overlapping = useMemo(() => {
    if (!selection) return [];
    return getOverlappingBookings(bookings, selection.start, selection.end);
  }, [bookings, selection]);

  const rangeLabel = selection
    ? selection.start.getTime() === selection.end.getTime()
      ? toDateKey(selection.start)
      : `${toDateKey(selection.start)} → ${toDateKey(selection.end)}`
    : null;

  // ── Empty state — no selection ────────────────────────────────────
  if (!selection) {
    return (
      <div
        className="rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          minHeight: 320,
        }}
      >
        <span className="text-4xl">🗓️</span>
        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
          No date selected
        </p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          Click a day to see bookings.<br />
          Drag across days to select a range.
        </p>
      </div>
    );
  }

  // ── Empty state — selection has no bookings ───────────────────────
  if (overlapping.length === 0) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <PanelHeader
          rangeLabel={rangeLabel}
          count={0}
          onClear={() => dispatch({ type: 'CLEAR_SELECTION' })}
        />
        <div className="flex flex-col items-center justify-center text-center gap-3 py-10">
          <span className="text-3xl">🌿</span>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No bookings for this period
          </p>
        </div>
      </div>
    );
  }

  // ── Booking list ──────────────────────────────────────────────────
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="p-4 pb-3">
        <PanelHeader
          rangeLabel={rangeLabel}
          count={overlapping.length}
          onClear={() => dispatch({ type: 'CLEAR_SELECTION' })}
          onExport={() => exportCSV(overlapping, toDateKey(selection.start))}
        />
      </div>

      {/* Scrollable booking list */}
      <div className="flex flex-col gap-0 overflow-y-auto" style={{ maxHeight: 520 }}>
        {overlapping.map((booking, i) => (
          <BookingRow
            key={booking.id}
            booking={booking}
            isLast={i === overlapping.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ── Panel header ──────────────────────────────────────────────────────────────
function PanelHeader({ rangeLabel, count, onClear, onExport }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {count} booking{count !== 1 ? 's' : ''}
        </p>
        <p
          className="text-sm font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
        >
          {rangeLabel}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onExport && count > 0 && (
          <button
            onClick={onExport}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid #1a6b4530',
            }}
          >
            ↓ CSV
          </button>
        )}
        <button
          onClick={onClear}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-base transition-all hover:opacity-70"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-tertiary)',
          }}
          aria-label="Clear selection"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── Single booking row ────────────────────────────────────────────────────────
function BookingRow({ booking, isLast }) {
  const nights = cn(booking.checkIn, booking.checkOut);
  const style  = STATUS_STYLES[booking.status] ?? STATUS_STYLES.confirmed;

  return (
    <div
      className="px-4 py-3.5 flex flex-col gap-2"
      style={{
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Row 1 — guest + status */}
      <div className="flex items-center justify-between gap-2">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {booking.guestName}
        </p>
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
          style={{ background: style.bg, color: style.color }}
        >
          {style.label}
        </span>
      </div>

      {/* Row 2 — room + dates */}
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-md"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          #{booking.roomNumber}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {booking.roomType}
        </span>
        <span
          className="text-xs ml-auto"
          style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
        >
          {nights}N
        </span>
      </div>

      {/* Row 3 — check-in → check-out */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[11px]"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
        >
          {booking.checkIn}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>→</span>
        <span
          className="text-[11px]"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
        >
          {booking.checkOut}
        </span>
        <span
          className="text-[11px] ml-auto"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {booking.source}
        </span>
      </div>
    </div>
  );
}