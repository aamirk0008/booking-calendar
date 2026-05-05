import { useMemo } from 'react';
import { useCalendarContext } from '../../context/CalendarContext';
import { useDragSelect } from '../../hooks/useDragSelect';
import { getCalendarDays, addDays, addMonths } from '../../utils/dateUtils';
import { buildOccupancyMap } from '../../utils/occupancy';
import { DayCell } from './DayCell';

export function CalendarGrid({ bookings }) {
  const { state } = useCalendarContext();
  const { year, month } = state;

  const { previewRange, cellHandlers } = useDragSelect();

  // Build 42-cell grid for current month
  const days = useMemo(
    () => getCalendarDays(year, month),
    [year, month]
  );

  // Window spans from first cell to last cell (includes prev/next month padding)
  const windowStart = days[0].date;
  const windowEnd   = days[days.length - 1].date;

  // Occupancy map for the entire visible window
  const occupancyMap = useMemo(
    () => buildOccupancyMap(bookings, windowStart, windowEnd),
    [bookings, windowStart, windowEnd]
  );

  return (
    <div
      className="grid grid-cols-7 gap-0.5"
      style={{ userSelect: 'none' }}
    >
      {days.map((day, i) => (
        <DayCell
          key={i}
          day={day}
          occupancyMap={occupancyMap}
          previewRange={previewRange}
          cellHandlers={cellHandlers}
        />
      ))}
    </div>
  );
}