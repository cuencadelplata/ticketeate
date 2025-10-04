import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import Navbar from '../components/navbar'; // <-- Agrega esta línea

export const metadata: Metadata = {
  title: 'Ticketeate - Crea, gestiona y vende entradas en minutos',
  description: 'La plataforma más completa para la gestión de eventos',
  icons: {
    icon: '/icon-ticketeate.png',
    shortcut: '/icon-ticketeate.png',
    apple: '/icon-ticketeate.png',
  },
};

// font jakarta
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta', // optional css variable
  display: 'swap',
});

// font instrument serif
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${jakarta.className} ${instrumentSerif.variable}`}>
        <Providers>
          <Navbar /> {/* <-- Cambia ConditionalNavbar por Navbar */}
          {children}
        </Providers>
        <Toaster position="top-right" richColors closeButton expand={true} />
      </body>
    </html>
  );
}
