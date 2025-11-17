import { Suspense } from 'react';
import { RegisterPageContent } from '@/components/register-page-content';

export default function RegisterPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}
    >
      <RegisterPageContent />
    </Suspense>
  );
}
