import { useMemo } from 'react';
import { useCalendarContext } from '../../context/CalendarContext';
import { computeMonthStats } from '../../utils/occupancy';
import { MONTH_NAMES } from '../../utils/dateUtils';

export function StatsBar({ bookings }) {
  const { state } = useCalendarContext();
  const { year, month } = state;

  const stats = useMemo(
    () => computeMonthStats(bookings, year, month),
    [bookings, year, month]
  );

  const cards = [
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      sub: MONTH_NAMES[month],
      icon: '📋',
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      sub: 'active bookings only',
      icon: '💰',
    },
    {
      label: 'Avg Occupancy',
      value: `${stats.avgOccupancy}%`,
      sub: 'across 10 rooms',
      icon: '📊',
    },
    {
      label: 'Longest Stay',
      value: `${stats.longestStay}N`,
      sub: 'this month',
      icon: '🌙',
    },
    {
      label: 'Most Booked Room',
      value: `#${stats.mostBookedRoom}`,
      sub: 'by booking count',
      icon: '🏆',
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, icon }) {
  return (
    <div
      className="rounded-xl px-4 py-3.5 flex flex-col gap-1"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </span>
        <span className="text-base">{icon}</span>
      </div>
      <p
        className="text-xl font-semibold tracking-tight leading-none"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </p>
      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        {sub}
      </p>
    </div>
  );
}