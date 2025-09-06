// app/productoras/[slug]/page.tsx
import Link from 'next/link';

const eventsByProducer: Record<string, { id: string; title: string; date: string }[]> = {
  'df-entertainment': [{ id: 'bocelli-2025', title: 'Andrea Bocelli', date: '2025-11-18' }],
  fenix: [],
  t4f: [],
  'la-trastienda': [],
};

export default function ProducerDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const events = eventsByProducer[slug] ?? [];

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">
        Eventos de <span className="text-orange-600">{slug.replaceAll('-', ' ')}</span>
      </h1>

      {events.length === 0 ? (
        <p className="text-gray-600">No hay eventos publicados aún.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <div className="font-semibold">{e.title}</div>
                <div className="text-sm text-gray-600">{e.date}</div>
              </div>
              <Link
                href={`/events/${e.id}`}
                className="rounded-lg bg-orange-500 px-4 py-2 text-white font-semibold hover:bg-orange-600 transition"
              >
                Comprar Entradas
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href="/productoras" className="mt-6 inline-block text-orange-600 hover:underline">
        ← Volver a productoras
      </Link>
    </main>
  );
}
