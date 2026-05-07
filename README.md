# Booking Calendar Heatmap

A single-page React application that visualizes hotel bookings as an interactive occupancy heatmap calendar. Built as a frontend assignment for Guestara.

![Guestara Occupancy Calendar](./public/preview.png)

## Live Link: https://booking-calendar-seven.vercel.app/

---

## Features

### Core

- **Month-view calendar grid** — 6×7 grid (Sun–Sat), previous/next month padding cells always visible
- **Occupancy heatmap** — each day cell is colored by how many of the 10 rooms are occupied that night (lighter = low, darker = full)
- **Correct night logic** — a booking with `checkIn: 2026-02-10` and `checkOut: 2026-02-13` occupies Feb 10, 11, 12 — not Feb 13. Cancelled bookings never count.
- **Month navigation** — previous, next, and Today buttons. Active month/year always displayed.
- **Drag-to-select** — click and drag across cells to select a date range. Works forward, backward, and across month boundaries.
- **Booking detail panel** — clicking or dragging shows every booking overlapping the selected range: guest name, room, check-in, check-out, nights, status, source.
- **Data via fetch** — `bookings.json` is loaded from the `public/` folder with loading and error states handled.

### Open Scope

- **Filters** — filter by booking status (Confirmed, Checked In, Checked Out, Cancelled) and room type (Standard, Deluxe, Suite, Penthouse). Heatmap updates instantly.
- **Stats strip** — month-level metrics: total bookings, total revenue, average occupancy %, longest stay, most booked room.
- **CSV export** — export bookings in the selected range as a `.csv` file.
- **Hover tooltip** — hovering a cell shows a quick summary: occupancy bar, count, and guest list — no click needed.
- **Persistence** — last viewed month and active filters are saved to `localStorage` and restored on reload.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast dev server, modern React |
| Styling | Tailwind CSS v4 + CSS custom properties | Utility classes for layout, CSS vars for dynamic heatmap colors |
| Date logic | Native `Date` object | No moment/dayjs — date math is straightforward enough without a library |
| State | `useReducer` + Context | Month, selection, and filters often change together — atomic dispatch is cleaner than multiple `useState`s |
| Drag | Native mouse events | No `react-dnd` — `mousedown/mouseenter/mouseup` on the DOM is sufficient and simpler |
| Persistence | `localStorage` | No backend needed, survives reload, appropriate for a single-user tool |
| Fonts | DM Sans + DM Mono | Clean, readable, good contrast between UI text and numeric data |                                           |

---

## Project Structure

booking-calendar/
├── public/
│ └── bookings.json # 201 mock bookings, 10 rooms, Jan–May 2026
├── src/
│ ├── styles/
│ │ └── global.css # Tailwind import, CSS tokens, heatmap scale
│ ├── utils/
│ │ ├── dateUtils.js # toDateKey, parseLocalDate, getCalendarDays, etc.
│ │ ├── occupancy.js # buildOccupancyMap, getOverlappingBookings, computeMonthStats
│ │ └── exportCSV.js # Blob CSV download helper
│ ├── context/
│ │ └── CalendarContext.jsx # useReducer state, localStorage persistence
│ ├── hooks/
│ │ ├── useBookings.js # fetch with loading + error states
│ │ └── useDragSelect.js # native drag-to-select, global mouseup
│ ├── components/
│ │ ├── CalendarView/
│ │ │ ├── index.jsx # Composes header + grid + legend
│ │ │ ├── MonthHeader.jsx # Prev / Next / Today navigation
│ │ │ ├── WeekdayRow.jsx # Sun–Sat label row
│ │ │ ├── CalendarGrid.jsx # 42-cell grid, occupancy map, tooltip wiring
│ │ │ └── DayCell.jsx # Heatmap cell, drag handlers, selection highlight
│ │ ├── BookingPanel/
│ │ │ └── index.jsx # Overlapping bookings list, CSV export
│ │ ├── StatsBar/
│ │ │ └── index.jsx # Month-level stat cards
│ │ ├── FilterBar/
│ │ │ └── index.jsx # Status + room type pill toggles
│ │ └── HoverTooltip/
│ │ └── index.jsx # Fixed-position hover preview card
│ ├── App.jsx # Root layout, filteredBookings memo, loading/error screens
│ └── main.jsx # React root mount
├── vite.config.js
└── package.json


---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

The app runs at `http://localhost:5173`.

> **Note:** `bookings.json` must be in the `public/` folder. It is loaded via `fetch` at runtime — not bundled as a module.

---

## Key Design Decisions

**Why `useReducer` instead of multiple `useState`s?**
Month navigation and selection often need to change together — e.g. navigating to Today should also clear the selection. A single `dispatch` makes these atomic and keeps the state transition logic in one place.

**Why CSS custom properties for the heatmap?**
Tailwind generates static classes at build time. The heatmap color per cell is computed at runtime from occupancy data, so it needs to be applied as a dynamic inline style. CSS variables (`--occ-0` through `--occ-10`) defined in `global.css` make the scale easy to adjust and reference via `var(--occ-N)`.

**Why no date library?**
The date operations needed here — building a 42-cell grid, checking night occupancy, computing month diffs — are straightforward with the native `Date` object. The one non-obvious gotcha is parsing `"YYYY-MM-DD"` strings: `new Date("2026-04-01")` gives UTC midnight which shifts the day in UTC+5:30. The `parseLocalDate` utility handles this correctly by splitting the string and using `new Date(y, m-1, d)`.

**Occupancy math**
isOccupied = checkIn <= night < checkOut AND status !== 'cancelled'

The checkout day is free — the room turns over that morning. This is the most common bug in calendar implementations and is isolated in `occupancy.js` so it's easy to verify and test.

---

## Bookings Data

| Field | Type | Notes |
|---|---|---|
| `id` | string | e.g. `BK1000` |
| `guestName` | string | |
| `roomNumber` | string | 101–103, 201–203, 301–302, 401–402 |
| `roomType` | string | Standard, Deluxe, Suite, Penthouse |
| `checkIn` | string | `YYYY-MM-DD` |
| `checkOut` | string | `YYYY-MM-DD` — exclusive (checkout day is free) |
| `guests` | number | |
| `totalAmount` | number | INR |
| `status` | string | `confirmed`, `checked_in`, `checked_out`, `cancelled` |
| `source` | string | Direct, Airbnb, Booking.com, Expedia, etc. |