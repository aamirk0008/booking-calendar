import { useState, useEffect } from 'react';

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/bookings.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} — could not load bookings.json`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setBookings(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { bookings, loading, error };
}