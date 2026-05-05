import { useMemo } from 'react';
import { CalendarProvider, useCalendarContext } from './context/CalendarContext';
import { useBookings } from './hooks/useBookings';
// import { CalendarView } from './components/CalendarView/index';
// import { BookingPanel } from './components/BookingPanel/index';
import { StatsBar } from './components/StatsBar/index';
import { FilterBar } from './components/FilterBar/index';

function CalendarApp() {
  const { bookings, loading, error } = useBookings();
  const { state } = useCalendarContext();

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      return (
        state.filters.statuses.has(b.status) &&
        state.filters.roomTypes.has(b.roomType)
      );
    });
  }, [bookings, state.filters]);

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen message={error} />;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b px-7"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-[1400px] mx-auto h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            <span
              className="font-semibold text-[15px] tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Guestara
            </span>
            <span
              className="text-xs pl-3 border-l"
              style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border)' }}
            >
              Occupancy Calendar
            </span>
          </div>

          <FilterBar />
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-7 py-6 flex gap-6 items-start">

        {/* Left — calendar + stats */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <StatsBar bookings={filteredBookings} />
          <CalendarView bookings={filteredBookings} />
        </div>

        {/* Right — booking panel */}
        <aside className="w-[340px] shrink-0 sticky top-20">
          <BookingPanel bookings={filteredBookings} />
        </aside>

      </main>
    </div>
  );
}

export default function App() {
  return (
    <CalendarProvider>
      <CalendarApp />
    </CalendarProvider>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-9 h-9 rounded-full border-[3px]"
          style={{
            borderColor: 'var(--border)',
            borderTopColor: 'var(--accent)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Loading bookings…
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div
        className="rounded-2xl p-12 text-center max-w-md"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <span className="text-4xl block mb-3">⚠</span>
        <p className="font-semibold text-base mb-2" style={{ color: 'var(--danger)' }}>
          Failed to load bookings
        </p>
        <p
          className="text-[13px] mb-3"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
        >
          {message}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Make sure <code>bookings.json</code> is in the <code>public/</code> folder.
        </p>
      </div>
    </div>
  );
}