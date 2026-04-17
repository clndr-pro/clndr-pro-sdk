# @clndr-pro/react

React components + hooks for clndr.pro. See the [repo README](../../README.md)
for full docs.

```tsx
'use client';
import { ClndrProvider, BookingInline } from '@clndr-pro/react';

<ClndrProvider publishableKey={process.env.NEXT_PUBLIC_CLNDR_PUBLISHABLE_KEY!}>
  <BookingInline slug="30-min-intro" />
</ClndrProvider>;
```
