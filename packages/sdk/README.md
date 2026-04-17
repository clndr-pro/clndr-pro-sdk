# @clndr-pro/sdk

TypeScript SDK for clndr.pro. See the [repo README](../../README.md) for full
docs.

```ts
import { Clndr } from '@clndr-pro/sdk';
const clndr = new Clndr(process.env.CLNDR_SECRET_KEY!);
const pages = await clndr.bookingPages.list();
```
