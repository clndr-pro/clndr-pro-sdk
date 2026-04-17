import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
      <h1>clndr-sdk Next.js example</h1>
      <p>
        <Link href="/book">Open booking page →</Link>
      </p>
      <p>
        Admin endpoint (secret key): <code>GET /api/bookings</code>
      </p>
    </main>
  );
}
