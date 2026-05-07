import { useMemo, useState } from 'react';
import { useCalendarContext } from '../../context/CalendarContext';
import { useDragSelect } from '../../hooks/useDragSelect';
import { getCalendarDays } from '../../utils/dateUtils';
import { buildOccupancyMap } from '../../utils/occupancy';
import { DayCell } from './DayCell';
import { HoverTooltip } from '../HoverTooltip/index';

export function CalendarGrid({ bookings }) {
  const { state } = useCalendarContext();
  const { year, month } = state;

  const { previewRange, cellHandlers } = useDragSelect();

  // Hover tooltip state
  const [tooltip, setTooltip] = useState(null);

  const days = useMemo(
    () => getCalendarDays(year, month),
    [year, month]
  );

  const windowStart = days[0].date;
  const windowEnd   = days[days.length - 1].date;

  const occupancyMap = useMemo(
    () => buildOccupancyMap(bookings, windowStart, windowEnd),
    [bookings, windowStart, windowEnd]
  );

  const handleCellMouseEnter = (e, date) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ date, x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleCellMouseLeave = () => setTooltip(null);

  return (
    <>
      <div className="grid grid-cols-7 gap-0.5" style={{ userSelect: 'none' }}>
        {days.map((day, i) => (
          <DayCell
            key={i}
            day={day}
            occupancyMap={occupancyMap}
            previewRange={previewRange}
            cellHandlers={cellHandlers}
            onMouseEnter={(e) => handleCellMouseEnter(e, day.date)}
            onMouseLeave={handleCellMouseLeave}
          />
        ))}
      </div>

      <HoverTooltip tooltip={tooltip} bookings={bookings} />
    </>
  );
}