import { ClndrProviderWrapper } from './provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClndrProviderWrapper>{children}</ClndrProviderWrapper>
      </body>
    </html>
  );
}
