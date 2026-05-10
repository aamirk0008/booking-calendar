# Notes

## Open Scope Features

### 1. Persistence (localStorage)
Saves the active month and filter state across page reloads.
Chose this because it directly improves the front desk use case — if
you refresh the page mid-shift you should not lose your context.
Simple `localStorage` read on init + write on every dispatch. No
external library needed.

### 2. Stats Strip
Total bookings, revenue, average occupancy, longest stay, and most
booked room — all derived from the filtered bookings array.
Chose this because it gives the front desk an at-a-glance summary
without requiring any interaction. Every number updates instantly
when a filter is toggled, which makes the filtering feel purposeful
rather than decorative.

### 3. CSV Export
Exports the bookings in the selected date range as a `.csv` download.
Chose this because the booking panel already has exactly the right
data — exporting it is a natural next step for a tool used by real
staff who need to share or file records.

### 4. Hover Tooltip
Hovering a cell shows an occupancy bar and a guest list without
requiring a click. Chose this because it makes scanning the calendar
much faster — you can sweep across a week in one motion and see
who is in which room without committing to a selection.

---

## Trade-offs

**Inline styles mixed with Tailwind**
Heatmap colors are computed at runtime from occupancy counts and
applied as CSS custom properties (`var(--occ-N)`). Tailwind generates
static classes at build time so dynamic color values have to go
through inline styles. The result is a mix of Tailwind utility
classes for layout and spacing, and inline styles for anything that
changes based on data. It works but it is not perfectly consistent.
With more time I would explore Tailwind CSS variables support in v4
to close this gap.

**Occupancy map is O(days × bookings)**
`buildOccupancyMap` loops over every booking for every visible day.
At 201 bookings and 42 visible cells this is fast enough to be
imperceptible. At 10,000 bookings it would start to lag. A sweep
line algorithm (sort bookings by check-in, advance a pointer) would
bring this down to O(days + bookings) but added complexity that was
not justified at this scale.

**Tooltip state lives in CalendarGrid**
Every `onMouseEnter` sets state in `CalendarGrid` which triggers a
re-render of all 42 `DayCell`s. The cells are cheap to render so
this is not visually noticeable, but it is architecturally sloppy.
The tooltip should live in a portal at the app root with its own
isolated state so the grid is never involved.

**No unit tests**
The date math utilities (`getCalendarDays`, `buildOccupancyMap`,
`getOverlappingBookings`) are pure functions with clear inputs and
outputs — they are the most testable part of this codebase and also
the most critical to get right. I would write tests for these first
given more time.

---

## What I Would Do Differently

**Test the date utilities first**
Write tests for `isNightOccupied`, `getCalendarDays`, and
`getOverlappingBookings` before writing any components. These
functions are the foundation everything else depends on and a wrong
assumption here breaks the entire heatmap silently.

**Lift tooltip into a portal**
Move tooltip state out of `CalendarGrid` into a React portal at the
app root. This avoids unnecessary grid re-renders and also fixes
potential overflow clipping issues if the calendar ever lives inside
a scrollable container.

**Memoize DayCell**
Wrap `DayCell` in `React.memo` with a custom comparison function.
A cell only needs to re-render when its occupancy count, its
selection state, or the current date changes — not on every parent
state update.

**Keyboard navigation**
Arrow keys to move a focused day, Shift+Arrow to extend the
selection, Enter to confirm. This was on the open scope list and
would meaningfully improve accessibility. The selection logic in
`useDragSelect` would need to be generalised to accept keyboard
events alongside mouse events.

**Better cross-month selection UX**
Dragging onto a dimmed adjacent-month cell works correctly but there
is no affordance telling the user the selection continued into
another month. A small label like "Mar 28 → Apr 3" in the panel
header partially solves this but a visual bridge across the boundary
would be cleaner.