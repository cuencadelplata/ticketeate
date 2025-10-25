import { Suspense } from 'react';
import AuthPage from '@/components/auth-page';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <AuthPage defaultTab="register" defaultRole="USUARIO" />
    </Suspense>
  );
}
