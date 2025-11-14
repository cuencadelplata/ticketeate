export default function NotFound() {
  return (
    <main className="min-h-screen py-16">
      <div className="fixed left-0 top-0 z-5 h-full w-full bg-gradient-to-b from-neutral-950 to-neutral-900" />
      <div className="relative z-20 min-h-screen text-zinc-200">
        <div className="mx-auto max-w-[68rem] space-y-4 px-20 pb-3 pt-10">
          <h1 className="text-4xl font-bold text-stone-100">Evento no encontrado</h1>
          <p className="text-stone-300">
            El evento que estás buscando no existe o ha sido eliminado.
          </p>
          <a
            href="/eventos"
            className="inline-block rounded-lg bg-white px-6 py-3 text-base font-medium text-black shadow-lg hover:bg-stone-200 transition-colors"
          >
            Ver todos los eventos
          </a>
        </div>
      </div>
    </main>
  );
}
