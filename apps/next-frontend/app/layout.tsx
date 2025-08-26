import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import { ClerkProvider, SignedIn, UserButton } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Ticketeate - Crea, gestiona y vende entradas en minutos',
  description: 'La plataforma más completa para la gestión de eventos',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
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
    <ClerkProvider>
      <html lang="es" className="dark">
        <body className={inter.className}>
          <Providers>{children}</Providers>
          <Toaster position="top-right" theme="dark" richColors closeButton expand={true} />
        </body>
      </html>
    </ClerkProvider>
  );
}
