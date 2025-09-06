'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NavbarHome from '@/components/navbar-main';
import { EventCard } from '@/components/event-card';
import { Footer } from '@/components/footer';
import Carrusel from '@/components/carrusel';

// 🔹 Datos de ejemplo para eventos
const events = [
  {
    title: 'El unipersonal de Luciano Mellera',
    description: '',
    price: '$30.000',
    date: '2025-09-18',
    image:
      'https://www.movistararena.com.ar/static/artistas/BDFE1_LucianoMellera_FileFotoFichaDesktop',
    category: 'Satnd-up',
    category2: 'Comedia',
    disponibilidad: 'Disponibles',
  },
  {
    title: 'The Life of a Show Girl World Tour',
    description: 'Taylor Swift en vivo.',
    price: '$250.000',
    date: '2026-07-15',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Video211/v4/64/af/6b/64af6b79-fc3b-347b-11a8-039815b9c41e/25UM1IM20144.crop.jpg/1200x630mv.jpg',
    category: 'Concierto',
    category2: 'Pop',
    disponibilidad: 'Agotadas',
  },
  {
    title: 'Maria Becerra',
    description: '360',
    price: '$55.000',
    date: '2025-12-13',
    image:
      'https://cdn.getcrowder.com/images/3d1c8c9d-0c52-4baa-ae92-02ad038799c6-mb-1312-banneraa-1920x720.jpg?w=1920&format=webp',
    category: 'Concierto',
    category2: 'Pop',
    disponibilidad: 'Agotadas',
  },
  {
    title: 'Andrea Boccelli',
    description: 'Live in Concert',
    price: '$2500000',
    date: '2025-11-17',
    image:
      'https://cdn.getcrowder.com/images/46b4b663-800e-4b06-a168-821ef9fe5cde-827975eb-67e2-41e7-bd16-34b8a4a6df15-andreabocelli-hsi-banneraa-1920x720-min.jpg?w=1920&format=webp',
    category: 'Concierto',
    category2: 'Clásica',
    disponibilidad: 'Disponibles',
  },
  {
    title: 'Bad Bunny',
    description: 'Debí tirar mas fotos',
    price: '$70.000',
    date: '2026-02-13',
    image:
      'https://cdn.getcrowder.com/images/fcf30efa-77c5-4cf9-8b36-67387ca88ab1-789058aa-7e3a-40ae-9a96-7dcf42b8c66b-banner-mobile--quentro-640-x-640.jpg?w=1920&format=webp',
    category: 'Concierto',
    category2: 'Reggaeton',
    disponibilidad: 'Agotadas',
  },
  {
    title: ' GUNS N’ ROSES',
    description: 'DE REGRESO A LA CIUDAD DEL PARAÍSO',
    price: '$50.000',
    date: '2027-10-18',
    image:
      'https://cdn.getcrowder.com/images/2c298c07-dac1-4232-8080-704fac5256bb-gunsnroses-bannersaa-nuevafecha1920x720.jpg',
    category: 'Concierto',
    category2: 'Rock',
    disponibilidad: 'Agotadas',
  },
  {
    title: 'Airbag',
    description: 'Gira Mundial 2025',
    price: '$2000000',
    date: '2025-10-05',
    image:
      'https://cdn.getcrowder.com/images/d2a3ff29-13fa-4438-bf75-5f0e1a396772-21214967-cdc1-44d7-a8a1-82c30d4ad569-1920x720-9-min.jpg?w=1920&format=webp',
    category: 'Concierto',
    category2: 'Rock',
    disponibilidad: 'Disponibles',
  },
];

const masVendidos = events.filter((evt) =>
  [
    'El unipersonal de Luciano Mellera',
    'The Life of a Show Girl World Tour',
    'Pink Floyd',
  ].includes(evt.title),
);
const internationalArtists = events.filter((evt) =>
  ['Andrea Boccelli', 'Bad Bunny', 'Pink Floyd'].includes(evt.title),
);
const artistasNacionales = events.filter((evt) => ['Maria Becerra', 'Airbag'].includes(evt.title));

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = (searchParams.get('search') || '').trim();
  const showingSearch = Boolean(q);

  const results = useMemo(() => {
    if (!q) return [];
    const qLower = q.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(qLower) ||
        e.description.toLowerCase().includes(qLower) ||
        (e.category && e.category.toLowerCase().includes(qLower)) ||
        (e.category2 && e.category2.toLowerCase().includes(qLower)),
    );
  }, [q]);

  const handleClear = () => {
    router.push('/'); // quita ?search y vuelve a home
  };

  return (
    <main className="min-h-screen">
      {/* Navbar fija en todas las páginas */}
      <NavbarHome />

      {/* Si hay búsqueda, ocultamos el carrusel */}
      {!showingSearch && <Carrusel />}

      {showingSearch ? (
        <section className="rounded-small bg-orange-900 container mx-auto px-4 py-8 mt-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-orange-100">
              Resultados para: <span className="italic">“{q}”</span>
            </h1>
            <button
              onClick={handleClear}
              className="rounded-full bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              Limpiar búsqueda
            </button>
          </div>
          <p className="text-orange-200 mb-6">{results.length} resultado(s) encontrado(s)</p>

          {results.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((event, i) => (
                <EventCard key={i} {...event} />
              ))}
            </div>
          ) : (
            <div className="text-orange-100">
              No se encontraron eventos. Probá con otro término.
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Contenido principal sin búsqueda */}
          <section className="rounded-small bg-orange-900 container mx-auto px-4 py-8 mt-5">
            <h1 className="text-2xl font-bold mb-6 text-orange-100">Más Vendidos</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {masVendidos.map((event, i) => (
                <EventCard key={i} {...event} />
              ))}
            </div>
          </section>

          <section className="rounded-small bg-orange-900 container mx-auto px-4 py-8 mt-5">
            <h1 className="text-2xl font-bold mb-6 text-orange-100">Artistas Internacionales</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {internationalArtists.map((event, i) => (
                <EventCard key={i} {...event} />
              ))}
            </div>
          </section>

          <section className="rounded-small bg-orange-900 container mx-auto px-4 py-8 mt-5">
            <h1 className="text-2xl font-bold mb-6 text-orange-100">Artistas Nacionales</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {artistasNacionales.map((event, i) => (
                <EventCard key={i} {...event} />
              ))}
            </div>
          </section>

          <section className="rounded-small bg-orange-900 container mx-auto px-2 py-8 mt-5">
            <h1 className="text-2xl font-bold mb-6 text-orange-100">Ver Todo</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event, i) => (
                <EventCard key={i} {...event} />
              ))}
            </div>
          </section>

          {/* Botón de arrepentimiento */}
          <div className="flex justify-center mt-12">
            <button className="rounded-full bg-red-800 px-12 py-6 text-white hover:bg-red-700 text-lg">
              Botón de Arrepentimiento
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <Footer />
    </main>
  );
}