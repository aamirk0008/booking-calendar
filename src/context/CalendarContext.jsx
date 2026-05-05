import { createContext, useContext, useReducer } from 'react';

const CalendarContext = createContext(null);

const today = new Date();

function getInitialState() {
  // Try to restore last viewed month + filters from localStorage
  try {
    const saved = localStorage.getItem('guestara-cal');
    if (saved) {
      const p = JSON.parse(saved);
      return {
        year: p.year ?? today.getFullYear(),
        month: p.month ?? today.getMonth(),
        selection: null,
        filters: {
          statuses: new Set(p.filters?.statuses ?? ['confirmed', 'checked_in', 'checked_out']),
          roomTypes: new Set(p.filters?.roomTypes ?? ['Standard', 'Deluxe', 'Suite', 'Penthouse']),
        },
      };
    }
  } catch {
    // localStorage unavailable — fall through to defaults
  }

  return {
    year: today.getFullYear(),
    month: today.getMonth(),
    selection: null, // { start: Date, end: Date } | null
    filters: {
      statuses: new Set(['confirmed', 'checked_in', 'checked_out']),
      roomTypes: new Set(['Standard', 'Deluxe', 'Suite', 'Penthouse']),
    },
  };
}

function persist(state) {
  try {
    localStorage.setItem('guestara-cal', JSON.stringify({
      year: state.year,
      month: state.month,
      filters: {
        statuses: [...state.filters.statuses],
        roomTypes: [...state.filters.roomTypes],
      },
    }));
  } catch {
    // ignore
  }
}

function reducer(state, action) {
  let next;

  switch (action.type) {
    case 'PREV_MONTH': {
      const d = new Date(state.year, state.month - 1, 1);
      next = { ...state, year: d.getFullYear(), month: d.getMonth(), selection: null };
      break;
    }
    case 'NEXT_MONTH': {
      const d = new Date(state.year, state.month + 1, 1);
      next = { ...state, year: d.getFullYear(), month: d.getMonth(), selection: null };
      break;
    }
    case 'GO_TODAY': {
      const now = new Date();
      next = { ...state, year: now.getFullYear(), month: now.getMonth(), selection: null };
      break;
    }
    case 'SET_SELECTION':
      next = { ...state, selection: action.payload };
      break;
    case 'CLEAR_SELECTION':
      next = { ...state, selection: null };
      break;
    case 'TOGGLE_STATUS': {
      const statuses = new Set(state.filters.statuses);
      statuses.has(action.payload)
        ? statuses.delete(action.payload)
        : statuses.add(action.payload);
      next = { ...state, filters: { ...state.filters, statuses }, selection: null };
      break;
    }
    case 'TOGGLE_ROOM_TYPE': {
      const roomTypes = new Set(state.filters.roomTypes);
      roomTypes.has(action.payload)
        ? roomTypes.delete(action.payload)
        : roomTypes.add(action.payload);
      next = { ...state, filters: { ...state.filters, roomTypes }, selection: null };
      break;
    }
    default:
      return state;
  }

  persist(next);
  return next;
}

export function CalendarProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);

  return (
    <CalendarContext.Provider value={{ state, dispatch }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendarContext must be inside CalendarProvider');
  return ctx;
}