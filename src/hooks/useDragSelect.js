import { useState, useEffect, useCallback } from 'react';
import { useCalendarContext } from '../context/CalendarContext';

/**
 * Handles drag-to-select across DayCell components.
 *
 * Each DayCell must:
 *   1. Spread {...cellHandlers} onto its root element
 *   2. Set data-date="YYYY-MM-DD" on that same element
 *
 * We read dates from the DOM so no per-cell callback prop is needed.
 * The global mouseup listener ensures drag always finalises even if
 * the user releases outside the grid.
 */
export function useDragSelect() {
  const { dispatch } = useCalendarContext();
  const [isDragging, setIsDragging] = useState(false);
  const [anchor, setAnchor]   = useState(null); // Date
  const [current, setCurrent] = useState(null); // Date

  // Normalise so start is always <= end
  const normalise = (a, b) => {
    if (!a || !b) return null;
    return a <= b ? { start: a, end: b } : { start: b, end: a };
  };

  const dateFromEvent = (e) => {
    const cell = e.target.closest('[data-date]');
    if (!cell) return null;
    const [y, m, d] = cell.dataset.date.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    const date = dateFromEvent(e);
    if (!date) return;
    e.preventDefault();
    setIsDragging(true);
    setAnchor(date);
    setCurrent(date);
  }, []);

  const handleMouseEnter = useCallback((e) => {
    if (!isDragging) return;
    const date = dateFromEvent(e);
    if (date) setCurrent(date);
  }, [isDragging]);

  // Global mouseup — fires even when released outside the grid
  useEffect(() => {
    if (!isDragging) return;

    const onMouseUp = (e) => {
      const date  = dateFromEvent(e) ?? current;
      const range = normalise(anchor, date ?? anchor);
      if (range) dispatch({ type: 'SET_SELECTION', payload: range });
      setIsDragging(false);
      setAnchor(null);
      setCurrent(null);
    };

    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, [isDragging, anchor, current, dispatch]);

  return {
    isDragging,
    previewRange: isDragging ? normalise(anchor, current) : null,
    cellHandlers: {
      onMouseDown:  handleMouseDown,
      onMouseEnter: handleMouseEnter,
    },
  };
}