import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Ticketeate - Crea, gestiona y vende entradas en minutos',
  description: 'La plataforma más completa para la gestión de eventos',
  icons: {
    icon: '/icon-ticketeate.png',
    shortcut: '/icon-ticketeate.png',
    apple: '/icon-ticketeate.png',
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" theme="dark" richColors closeButton expand />
        </Providers>
      </body>
    </html>
  );
}
