// app/productoras/page.tsx
import Link from "next/link";

type Producer = {
  slug: string;
  name: string;
  city: string;
  logo?: string;
};

const producers: Producer[] = [
  { slug: "df-entertainment", name: "DF Entertainment", city: "Buenos Aires" },
  { slug: "fenix", name: "Fenix Entertainment", city: "Buenos Aires" },
  { slug: "t4f", name: "Time For Fun (T4F)", city: "Buenos Aires" },
  { slug: "la-trastienda", name: "La Trastienda", city: "Buenos Aires" },
];

export default function ProductorasPage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-orange-600">Productoras Argentinas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {producers.map((p) => (
          <div
            key={p.slug}
            className="rounded-xl border border-orange-300 bg-white p-4 shadow hover:shadow-md transition"
          >
            {/* Podés poner un logo si tenés */}
            {/* {p.logo && <img src={p.logo} alt={p.name} className="h-14 mb-3 object-contain" />} */}

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
  {/* Botón volver al inicio */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-orange-600 px-6 py-2 text-white font-semibold hover:bg-orange-700 transition"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}

