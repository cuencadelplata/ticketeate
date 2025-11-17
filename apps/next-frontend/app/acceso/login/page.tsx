import { Suspense } from 'react';
import { LoginPageContent } from '@/components/login-page-content';

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}
    >
      <LoginPageContent />
    </Suspense>
  );
}
