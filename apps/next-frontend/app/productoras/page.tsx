// app/productoras/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';

type Producer = {
  slug: string;
  name: string;
  city: string;
  logo?: string;
};

const producers: Producer[] = [
  { slug: 'df-entertainment', name: 'DF Entertainment', city: 'Buenos Aires' },
  { slug: 'fenix', name: 'Fenix Entertainment', city: 'Buenos Aires' },
  { slug: 't4f', name: 'Time For Fun (T4F)', city: 'Buenos Aires' },
  { slug: 'la-trastienda', name: 'La Trastienda', city: 'Buenos Aires' },
];

export default function ProductorasPage() {
  return (
    <main className="mx-auto p-6 ">
      {/*Logo + perfil del usuario */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center bg-orange-500 p-2 rounded-full">
          <Image src="/wordmark-light.png" alt="Ticketeate" width={130} height={40} priority />
        </Link>
        <UserButton />
      </div>

      <h1 className="text-4xl font-bold text-orange-500 mb-6">Productoras Argentinas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {producers.map((p) => (
          <div
            key={p.slug}
            className="rounded-xl border border-orange-300 bg-white p-4 shadow hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold text-gray-900">{p.name}</h2>
            <p className="text-sm text-gray-600">{p.city}, Argentina</p>

            <Link
              href={`/productoras/${p.slug}`}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              Ver eventos
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
