import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-24">
        <div className="text-center space-y-8 pt-12">
          <div className="flex justify-center items-center">
            <Image
              src="/wordmark-ticketeate.png"
              alt="Ticketeate"
              width={350}
              height={200}
            />
          </div>
          <div className="flex justify-center items-center">
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Crea, gestiona y vende entradas en minutos. La plataforma más
              completa para la gestión de eventos.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
