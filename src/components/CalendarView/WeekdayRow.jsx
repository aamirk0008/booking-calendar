import { WEEKDAY_LABELS } from '../../utils/dateUtils';

export function WeekdayRow() {
  return (
    <div className="grid grid-cols-7 mb-1">
      {WEEKDAY_LABELS.map((day) => (
        <div
          key={day}
          className="text-center text-[11px] font-medium py-2 uppercase tracking-wider"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {day}
        </div>
      ))}
    </div>
  );
}