import { useCalendarContext } from '../../context/CalendarContext';
import { toDateKey, isSameDay, isInRange } from '../../utils/dateUtils';
import { occupancyToColor, occupancyToTextColor } from '../../utils/occupancy';

export function DayCell({ day, occupancyMap, previewRange, cellHandlers }) {
  const { state, dispatch } = useCalendarContext();
  const { date, isCurrentMonth } = day;

  const dateKey   = toDateKey(date);
  const occupancy = occupancyMap.get(dateKey) ?? 0;
  const today     = new Date();
  const isToday   = isSameDay(date, today);

  // Active confirmed selection from context
  const confirmed = state.selection;
  const isConfirmedSelected =
    confirmed &&
    isInRange(date, confirmed.start, confirmed.end);

  // Live preview while dragging
  const isPreview =
    previewRange &&
    isInRange(date, previewRange.start, previewRange.end);

  const isSelected = isConfirmedSelected || isPreview;

  // Range edge detection for start/end styling
  const isRangeStart =
    isSelected &&
    (confirmed
      ? isSameDay(date, confirmed.start)
      : previewRange && isSameDay(date, previewRange.start));

  const isRangeEnd =
    isSelected &&
    (confirmed
      ? isSameDay(date, confirmed.end)
      : previewRange && isSameDay(date, previewRange.end));

  const isSingleDay = isSelected && isRangeStart && isRangeEnd;

  // ── Visual states ────────────────────────────────────────────────
  let bg        = occupancyToColor(occupancy);
  let textColor = occupancyToTextColor(occupancy);
  let opacity   = isCurrentMonth ? 1 : 0.35;
  let border    = 'transparent';

  if (isSelected) {
    bg        = '#1a6b45';
    textColor = '#ffffff';
    opacity   = isCurrentMonth ? 1 : 0.6;
    border    = '#1a6b45';
  }

  if (isToday && !isSelected) {
    border = 'var(--accent)';
  }

  // Border radius logic for range
  let borderRadius = '10px';
  if (isSelected && !isSingleDay) {
    if (isRangeStart) borderRadius = '10px 0 0 10px';
    else if (isRangeEnd) borderRadius = '0 10px 10px 0';
    else borderRadius = '0';
  }

  return (
    <div
      data-date={dateKey}
      {...cellHandlers}
      className="relative flex flex-col p-2 cursor-pointer select-none transition-all duration-75"
      style={{
        minHeight: 80,
        background: bg,
        color: textColor,
        opacity,
        borderRadius,
        border: `2px solid ${border}`,
        userSelect: 'none',
      }}
    >
      {/* Day number */}
      <span
        className="text-[13px] font-medium leading-none"
        style={{
          color: isSelected
            ? '#ffffff'
            : isToday
            ? 'var(--accent)'
            : isCurrentMonth
            ? 'var(--text-primary)'
            : 'var(--text-tertiary)',
          fontWeight: isToday ? 700 : 500,
        }}
      >
        {date.getDate()}
      </span>

      {/* Occupancy count badge */}
      {occupancy > 0 && (
        <span
          className="mt-auto text-[11px] font-medium"
          style={{
            color: isSelected
              ? 'rgba(255,255,255,0.8)'
              : occupancyToTextColor(occupancy),
            fontFamily: 'var(--font-mono)',
          }}
        >
          {occupancy}/10
        </span>
      )}

      {/* Today dot */}
      {isToday && !isSelected && (
        <span
          className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--accent)' }}
        />
      )}
    </div>
  );
}