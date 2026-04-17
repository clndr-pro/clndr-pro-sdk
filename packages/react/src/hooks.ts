'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BookingPageDetail, TimeSlot, CreateBookingInput, Booking } from '@clndr/sdk';
import { ClndrError } from '@clndr/sdk';
import { useClndr } from './provider';

type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Fetch a booking page by slug.
 */
export function useBookingPage(slug: string | null) {
  const client = useClndr();
  const [data, setData] = useState<BookingPageDetail | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setStatus('loading');
    client.bookingPages
      .get(slug)
      .then((res) => {
        if (!alive) return;
        setData(res);
        setStatus('success');
      })
      .catch((err: Error) => {
        if (!alive) return;
        setError(err);
        setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [client, slug]);

  return { data, status, error, isLoading: status === 'loading' };
}

/**
 * Fetch available slots for a booking page on a given date. Refetches when
 * the date changes.
 */
export function useAvailableSlots(slug: string | null, date: Date | null) {
  const client = useClndr();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error | null>(null);
  const lastKey = useRef<string>('');

  useEffect(() => {
    if (!slug || !date) return;
    const key = `${slug}|${date.toISOString()}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    let alive = true;
    setStatus('loading');
    client.bookingPages
      .getSlots(slug, date)
      .then((res) => {
        if (!alive) return;
        setSlots(res);
        setStatus('success');
      })
      .catch((err: Error) => {
        if (!alive) return;
        setError(err);
        setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [client, slug, date]);

  return { slots, status, error, isLoading: status === 'loading' };
}

/**
 * Imperative hook for creating a booking. Returns `{ create, data, status,
 * error }`. Call `create({...})` from a submit handler.
 */
export function useCreateBooking() {
  const client = useClndr();
  const [data, setData] = useState<Booking | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (input: CreateBookingInput) => {
      setStatus('loading');
      setError(null);
      try {
        const res = await client.bookings.create(input);
        setData(res);
        setStatus('success');
        return res;
      } catch (err) {
        const e = err as Error;
        setError(e);
        setStatus('error');
        throw e;
      }
    },
    [client],
  );

  return {
    create,
    data,
    status,
    error: error as ClndrError | Error | null,
    isLoading: status === 'loading',
  };
}
