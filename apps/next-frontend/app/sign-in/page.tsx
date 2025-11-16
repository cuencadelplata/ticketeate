import { Suspense } from 'react';
import { SignInPageContent } from '@/components/sign-in-page-content';

export default function SignInPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}
    >
      <SignInPageContent />
    </Suspense>
  );
}
