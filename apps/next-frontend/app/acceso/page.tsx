import { Suspense } from 'react';
import { AccessPageContent } from '@/components/access-page-content';

export default function AccessPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}
    >
      <AccessPageContent />
    </Suspense>
  );
}
