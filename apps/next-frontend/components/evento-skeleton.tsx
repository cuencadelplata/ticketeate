// Componente Skeleton para la página de evento individual
const ShimmerSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`relative overflow-hidden rounded-md bg-stone-700 ${className}`} {...props}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-stone-600/50 to-transparent" />
  </div>
);

export const EventoSkeleton = () => (
  <main className="min-h-screen py-16">
    <div className="fixed left-0 top-0 z-5 h-full w-full bg-gradient-to-b from-neutral-950 to-neutral-900" />

    <div className="relative z-20 min-h-screen text-zinc-200">
      <div className="mx-auto max-w-[68rem] space-y-2 px-20 pb-3 pt-10">
        <div className="grid gap-6 md:grid-cols-[350px,1fr]">
          {/* Columna izquierda - Imagen */}
          <div className="space-y-2">
            <ShimmerSkeleton className="aspect-square w-full rounded-xl" />

            {/* Galería de imágenes skeleton */}
            <div className="space-y-2">
              <ShimmerSkeleton className="h-4 w-32" />
              <div className="grid grid-cols-2 gap-2">
                <ShimmerSkeleton className="aspect-square rounded-md" />
                <ShimmerSkeleton className="aspect-square rounded-md" />
              </div>
            </div>
          </div>

          {/* Columna derecha - Información */}
          <div className="space-y-4">
            {/* Título */}
            <ShimmerSkeleton className="h-10 w-3/4" />

            {/* Contador de views */}
            <div className="flex items-center gap-2">
              <ShimmerSkeleton className="h-4 w-4 rounded-full" />
              <ShimmerSkeleton className="h-4 w-24" />
            </div>

            {/* Fechas del evento */}
            <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
              <div className="flex items-center gap-2">
                <ShimmerSkeleton className="h-3.5 w-3.5 rounded" />
                <ShimmerSkeleton className="h-4 w-32" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <ShimmerSkeleton className="h-5 w-full" />
                  <div className="ml-2 flex gap-4">
                    <ShimmerSkeleton className="h-4 w-24" />
                    <ShimmerSkeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
              <ShimmerSkeleton className="h-4 w-20" />
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-[220px] w-full rounded-md" />
            </div>

            {/* Descripción */}
            <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
              <ShimmerSkeleton className="h-4 w-24" />
              <div className="space-y-2">
                <ShimmerSkeleton className="h-4 w-full" />
                <ShimmerSkeleton className="h-4 w-full" />
                <ShimmerSkeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Tipos de entradas */}
            <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
              <ShimmerSkeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <ShimmerSkeleton className="h-16 rounded-md" />
                <ShimmerSkeleton className="h-16 rounded-md" />
              </div>
            </div>

            {/* Botón de comprar */}
            <div className="rounded-xl border-1 bg-stone-900 bg-opacity-60 p-2">
              <ShimmerSkeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
);
