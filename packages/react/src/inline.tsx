'use client';

import React from 'react';
import { BookingForm, BookingFormProps } from './components';

/**
 * Convenience wrapper that renders the booking flow inline at a given slug.
 * This is the highest-level component — one tag and you have a working
 * booking page.
 */
export function BookingInline(props: BookingFormProps) {
  return <BookingForm {...props} />;
}
