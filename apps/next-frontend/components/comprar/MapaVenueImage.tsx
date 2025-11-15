'use client';

import Image from 'next/image';

export function MapaVenueImage() {
  return (
    <section className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-md">
      <div className="w-full max-w-[600px]">
        <div className="relative w-full overflow-hidden rounded-lg border group">
          <Image
            src="/raw.png"
            alt="Mapa de sectores"
            width={800}
            height={600}
            className="w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <span className="mt-2 block text-center text-sm font-semibold text-gray-600">
          Mapa de sectores
        </span>
      </div>
    </section>
  );
}
