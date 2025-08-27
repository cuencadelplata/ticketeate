import Image from 'next/image';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-24">
        <div className="space-y-8 pt-12 text-center">
          <div className="flex items-center justify-center">
            <Image src="/wordmark-light.png" alt="Ticketeate" width={350} height={200} />
          </div>
          <div className="flex items-center justify-center">
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Crea, gestiona y vende entradas en minutos. La plataforma más completa para la gestión
              de eventos.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 pt-12">
          <SignedOut>
            <SignInButton>
              <button className="font-base h-6 cursor-pointer rounded-full bg-green-800 px-4 text-sm text-white sm:h-10 sm:px-5 sm:text-base">
                Inicia sesión
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="font-base h-6 cursor-pointer rounded-full bg-green-950 px-4 text-sm text-white sm:h-10 sm:px-5 sm:text-base">
                Registrate
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </main>
  );
}
