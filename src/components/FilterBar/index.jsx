import { useCalendarContext } from '../../context/CalendarContext';

const STATUSES = [
  { key: 'confirmed',   label: 'Confirmed',   color: '#1a6b45', bg: '#e8f5ee' },
  { key: 'checked_in',  label: 'Checked In',  color: '#1565c0', bg: '#e8f0fe' },
  { key: 'checked_out', label: 'Checked Out', color: '#6b6860', bg: '#f2f1ee' },
  { key: 'cancelled',   label: 'Cancelled',   color: '#c0392b', bg: '#fdecea' },
];

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Penthouse'];

export function FilterBar() {
  const { state, dispatch } = useCalendarContext();

  return (
    <div className="flex items-center gap-6">

      {/* Status filters */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-medium shrink-0"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Status
        </span>
        <div className="flex items-center gap-1.5">
          {STATUSES.map(({ key, label, color, bg }) => {
            const active = state.filters.statuses.has(key);
            return (
              <button
                key={key}
                onClick={() => dispatch({ type: 'TOGGLE_STATUS', payload: key })}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: active ? bg : 'transparent',
                  color: active ? color : 'var(--text-tertiary)',
                  border: `1px solid ${active ? color + '40' : 'var(--border)'}`,
                  opacity: active ? 1 : 0.6,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-5" style={{ background: 'var(--border)' }} />

      {/* Room type filters */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-medium shrink-0"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Room
        </span>
        <div className="flex items-center gap-1.5">
          {ROOM_TYPES.map((type) => {
            const active = state.filters.roomTypes.has(type);
            return (
              <button
                key={type}
                onClick={() => dispatch({ type: 'TOGGLE_ROOM_TYPE', payload: type })}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: active ? 'var(--accent-light)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-tertiary)',
                  border: `1px solid ${active ? 'var(--accent)' + '40' : 'var(--border)'}`,
                  opacity: active ? 1 : 0.6,
                }}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}