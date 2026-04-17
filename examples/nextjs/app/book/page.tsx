import { BookingInline } from '@clndr-pro/react';

/**
 * Client-side booking page that uses the publishable key from ClndrProvider.
 * Change `slug` to match one of your booking pages.
 */
export default function BookPage() {
  return (
    <main style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
      <BookingInline slug="30-min-intro" />
    </main>
  );
}
