import { MonthHeader } from './MonthHeader';
import { WeekdayRow } from './WeekdayRow';
import { CalendarGrid } from './CalendarGrid';

export function CalendarView({ bookings }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <MonthHeader />
      <WeekdayRow />
      <CalendarGrid bookings={bookings} />

      {/* Heatmap legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          Occupancy
        </span>
        <div className="flex items-center gap-0.5">
          {[0, 2, 4, 6, 8, 10].map((n) => (
            <div
              key={n}
              className="w-5 h-3 rounded-sm"
              style={{ background: `var(--occ-${n})` }}
              title={`${n} rooms`}
            />
          ))}
        </div>
        <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          Full
        </span>
      </div>
    </div>
  );
}