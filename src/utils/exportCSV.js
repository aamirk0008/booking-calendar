import { countNights } from './dateUtils';

export function exportCSV(bookings, rangeLabel) {
  const headers = [
    'ID','Guest Name','Room','Room Type',
    'Check-In','Check-Out','Nights','Guests',
    'Status','Source','Total Amount (₹)'
  ];

  const rows = bookings.map((b) => [
    b.id,
    b.guestName,
    b.roomNumber,
    b.roomType,
    b.checkIn,
    b.checkOut,
    countNights(b.checkIn, b.checkOut),
    b.guests,
    b.status,
    b.source,
    b.totalAmount,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `bookings${rangeLabel ? `-${rangeLabel}` : ''}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}