import { NextResponse } from 'next/server';
import { Clndr } from '@clndr-pro/sdk';

/**
 * Server-side route that uses the SECRET key to list bookings. Call this
 * from a client component with fetch('/api/bookings') — your publishable
 * key in the browser doesn't have `bookings:read` scope, so owner-only
 * operations must go through a server route like this.
 */
export async function GET() {
  const clndr = new Clndr({
    apiKey: process.env.CLNDR_SECRET_KEY!,
    baseUrl: process.env.CLNDR_BASE_URL,
  });
  const bookings = await clndr.bookings.list({ limit: 50 });
  return NextResponse.json({ bookings });
}
