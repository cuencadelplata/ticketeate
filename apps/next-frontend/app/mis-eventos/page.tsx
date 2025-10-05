import { Suspense } from 'react';
import UserEventsList from '@/components/user-events-list';
import { Navbar } from '@/components/navbar';

export default function MyEventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="text-center py-8">
            <p className="text-stone-400">Cargando eventos...</p>
          </div>
        }>
          <UserEventsList />
        </Suspense>
      </div>
    </div>
  );
}
