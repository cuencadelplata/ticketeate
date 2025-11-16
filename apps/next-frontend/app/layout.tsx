import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import { ConditionalNavbar } from '../components/conditional-navbar';
import { Footer } from '@/components/footer';
import { SearchProvider } from '@/contexts/search-context';

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
    <html lang="es" suppressHydrationWarning className="h-full">
      <body className={`${jakarta.className} ${instrumentSerif.variable} h-full flex flex-col`}>
        <Providers>
          <SearchProvider>
            <div className="flex flex-col min-h-screen">
              <ConditionalNavbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </SearchProvider>
        </Providers>
        <Toaster position="top-right" richColors closeButton expand={true} />
      </body>
    </html>
  );
}
