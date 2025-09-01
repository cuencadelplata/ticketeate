import Image from 'next/image';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Navbar } from '@/components/navbar';
import {EventCard} from '@/components/event-card';
import { Footer } from '@/components/footer';
/* import Carrusel from '@/components/carrusel'; */

// 🔹 Datos de ejemplo para eventos 
const events = [
  {
    title: "Lollapalooza",
    description: "Hola de Nuevo",
    price: "$2500000",
    date: "hola",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrDmZh_Geg-RRTaB2ZVCyGBXggVotnRxRjUg&s",

  },
  {
    title: "The Life of a Show Girl World Tour",
    description: "Taylor Swift en vivo.",
    price: "$3000000",
    date: "2026-07-15",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Video211/v4/64/af/6b/64af6b79-fc3b-347b-11a8-039815b9c41e/25UM1IM20144.crop.jpg/1200x630mv.jpg",
  },
  {
    title: "Maria Becerra",
    description: "360",
    price: "$180000",
    date: "2025-12-13",
    image: "https://cdn.getcrowder.com/images/3d1c8c9d-0c52-4baa-ae92-02ad038799c6-mb-1312-banneraa-1920x720.jpg?w=1920&format=webp",
  },
   {
    title: "Andrea Boccelli",
    description: "Live in Concert",
    price: "$2500000",
    date: "2024-11-17",
    image: "https://cdn.getcrowder.com/images/46b4b663-800e-4b06-a168-821ef9fe5cde-827975eb-67e2-41e7-bd16-34b8a4a6df15-andreabocelli-hsi-banneraa-1920x720-min.jpg?w=1920&format=webp",
  },
  {
    title: "Bad Bunny",
    description: "Debí tirar mas fotos",
    price: "$3000000",
    date: "2026-02-13",
    image: "https://cdn.getcrowder.com/images/fcf30efa-77c5-4cf9-8b36-67387ca88ab1-789058aa-7e3a-40ae-9a96-7dcf42b8c66b-banner-mobile--quentro-640-x-640.jpg?w=1920&format=webp",
  },
  {
    title: "Pink Floyd",
    description: "PRISMA",
    price: "$1800",
    date: "2024-07-15",
    image: "https://cdn.getcrowder.com/images/c08b4235-92f1-42c2-a342-2b7d5733c56b-640x640-85.jpg?w=1920&format=webp",
  },
   {
    title: "Airbag",
    description: "Gira Mundial 2023",
    price: "$2000000",
    date: "2024-10-05",
    image: "https://cdn.getcrowder.com/images/d2a3ff29-13fa-4438-bf75-5f0e1a396772-21214967-cdc1-44d7-a8a1-82c30d4ad569-1920x720-9-min.jpg?w=1920&format=webp",
  },
];

const masVendidos = events.filter(evt =>
  ["Lollapalooza", "The Life of a Show Girl World Tour", "Pink Floyd"].includes(evt.title)
);
const internationalArtists = events.filter(evt =>
  ["Andrea Boccelli", "Bad Bunny", "Pink Floyd"].includes(evt.title)
);
const artistasNacionales = events.filter(evt =>
  ["Maria Becerra", "Airbag"].includes(evt.title)
);

export default function Home() {
  
  return (
    <main className="min-h-screen">
      {/* Navbar fija en todas las páginas */}
      <Navbar />

      <main className="min-h-screen ">
  ...
</main>
{/* <Carrusel />    */}


      {/* Contenido principal */}
      <section className=" rounded-small bg-orange-900  container mx-auto px-4 py-8  mt-5">
        <h1 className="text-2xl font-bold mb-6 text-orange-100 ">Más Vendidos</h1>

        {/* Grid de eventos */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {masVendidos.map((event, i) => (
            <EventCard key={i} {...event} />
          ))}
        </div>
      </section>

      {/* Sección Artistas internacionales */}
      <section className="rounded-small bg-orange-900  container mx-auto px-4 py-8  mt-5">
        <h1 className=" text-2xl font-bold mb-6 text-orange-100 " >Artistas Internacionales</h1>
        <div className=" grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {internationalArtists.map((event, i) => (
            <EventCard key={i} {...event} />
          ))}
        </div>
      </section>

      {/* Sección Artistas Nacionales */}
      <section className="rounded-small bg-orange-900 container mx-auto px-4 py-8  mt-5">
        <h1 className="text-2xl font-bold mb-6 text-orange-100">Artistas Nacionales</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artistasNacionales.map((event, i) => (
            <EventCard key={i} {...event} />
          ))}
        </div>
      </section>
        {/* Sección todo */}
      <section className="rounded-small bg-orange-900 container mx-auto px-2 py-8 mt-5">
        <h1 className="text-2xl font-bold mb-6 text-orange-100 ">Ver Todo</h1>
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
      {/* Footer */}
        <Footer/> 
           
     
    </main>
  );
}
