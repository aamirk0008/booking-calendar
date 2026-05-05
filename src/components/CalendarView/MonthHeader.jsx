import { useCalendarContext } from '../../context/CalendarContext';
import { MONTH_NAMES } from '../../utils/dateUtils';

export function MonthHeader() {
  const { state, dispatch } = useCalendarContext();
  const { year, month } = state;

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth();

  return (
    <div className="flex items-center justify-between mb-4">

      {/* Month + Year label */}
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {MONTH_NAMES[month]}{' '}
        <span style={{ color: 'var(--text-tertiary)' }}>{year}</span>
      </h2>

      {/* Navigation */}
      <div className="flex items-center gap-2">

        {/* Today button */}
        {!isCurrentMonth && (
          <button
            onClick={() => dispatch({ type: 'GO_TODAY' })}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid #1a6b4530',
            }}
          >
            Today
          </button>
        )}

        {/* Prev */}
        <button
          onClick={() => dispatch({ type: 'PREV_MONTH' })}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          aria-label="Previous month"
        >
          ‹
        </button>

        {/* Next */}
        <button
          onClick={() => dispatch({ type: 'NEXT_MONTH' })}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          aria-label="Next month"
        >
          ›
        </button>

      </div>
    </div>
  );
}