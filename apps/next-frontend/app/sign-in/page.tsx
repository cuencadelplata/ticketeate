import { Suspense } from 'react';
import AuthPage from '@/components/auth-page';

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <AuthPage defaultTab="login" defaultRole="USUARIO" />
    </Suspense>
  );
}
