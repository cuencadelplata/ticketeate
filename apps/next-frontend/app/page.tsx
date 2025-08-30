import Image from 'next/image';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Navbar } from '@/components/navbar';
// Datos de ejemplo para eventos (los mismos que en EventsGrid)

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
    
    
    </main>
  );
}
