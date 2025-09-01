'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Search } from 'lucide-react'; 
//import DarkMode from './DarkMode';
type NavbarProps = {
  setQuery: (value: string) => void;
};

function Navbar() {
  return (
    <div className="flex h-14 items-center justify-between bg-transparent px-6">
      {/* Logo + links */}
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-2 bg-orange-500 p-2 rounded-full">
        
          <Image
            src="/wordmark-light.png"
            alt="Ticketeate"
            width={130}
            height={40}
            priority
          />
        </Link>

        <div className="hidden space-x-6 pl-12 md:flex">
          <Link href="/eventos" className="text-sm font-medium text-white hover:text-orange-100  bg-orange-500 p-2 rounded-full">
            Mis Eventos
          </Link>
          <Link href="/productoras" className="text-sm font-medium text-white hover:text-orange-100 bg-orange-500 p-2 rounded-full">
            Productoras
          </Link>
          <Link href="/descubrir" className="text-sm font-medium text-white hover:text-orange-100  bg-orange-500 p-2 rounded-full">
            Descubrir
          </Link>
        </div>
      </div>

      {/*  Buscador + sesion */}
      <div className="flex items-center space-x-6">
        {/* Barra de busqueda */}
        <div className="relative hidden md:flex">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por artista o eventos"
            className="h-9 w-96 pl-10 pr-4 rounded-full text-sm text-gray-400 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Botones de Clerk */}
        <SignedOut>
          {/* <SignInButton> */}
            <button className="rounded-full bg-orange-600 px-4 py-2 hover:bg-orange-700 text-white ...">
              Iniciar sesión
            </button>
          {/* </SignInButton> */}
          {/* <SignUpButton> */}
            <button className="rounded-full bg-orange-700 px-4 py-2 hover:bg-orange-700 text-white ...">
              Registrarse
            </button>
            
          {/* <SignUpButton> */}
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </div>


      







  );
}

export { Navbar };
export default Navbar;

