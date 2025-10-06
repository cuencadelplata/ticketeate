import { EventsByCategory } from '@/components/events-by-category';

export default function DescubrirPage() {
  return (
    <main className="min-h-screen">
      <EventsByCategory showFilter={true} />
    </main>
  );
}
