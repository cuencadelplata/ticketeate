import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations'

export const metadata: Metadata = {
  title: 'Ticketeate - Crea, gestiona y vende entradas en minutos',
  description: 'La plataforma más completa para la gestión de eventos',
  icons: {
    icon: '/icon-ticketeate.png',
    shortcut: '/icon-ticketeate.png',
    apple: '/icon-ticketeate.png',
  },
};

// font inter
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // optional css variable
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es" className="dark">
        <body className={inter.className}>
          <Providers>{children}</Providers>
          <Toaster position="top-right" theme="dark" richColors closeButton expand={true} />
        </body>
      </html>
    </ClerkProvider>
  );
}
