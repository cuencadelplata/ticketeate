import Image from 'next/image';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Navbar } from '@/components/navbar';
import EventCard from '@/components/event-card';

// 🔹 Datos de ejemplo para eventos 
const events = [
  {
    title: "Lollapalooza",
    description: "Hola de Nuevo",
    price: "$2500000",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrDmZh_Geg-RRTaB2ZVCyGBXggVotnRxRjUg&s",
  },
  {
    title: "The Life of a Show Girl World Tour",
    description: "Taylor Swift en vivo.",
    price: "$3000000",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Video211/v4/64/af/6b/64af6b79-fc3b-347b-11a8-039815b9c41e/25UM1IM20144.crop.jpg/1200x630mv.jpg",
  },
  {
    title: "Teatro Independiente",
    description: "Obra teatral única.",
    price: "$1800",
    image: "https://picsum.photos/400/300?random=3",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navbar fija en todas las páginas */}
      <Navbar />

      {/* Contenido principal */}
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Próximos eventos</h1>

        {/* Grid de eventos */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <EventCard key={i} {...event} />
          ))}
        </div>
      </section>
    </main>
  );
}
