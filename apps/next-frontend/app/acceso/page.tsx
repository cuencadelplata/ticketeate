import { Suspense } from 'react';
import { SignUpPageContent } from '@/components/sign-up-page-content';

export default function AccessPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}
    >
      <SignUpPageContent />
    </Suspense>
  );
}
