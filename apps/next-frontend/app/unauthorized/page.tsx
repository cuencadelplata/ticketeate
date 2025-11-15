'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Lock className="h-16 w-16 text-red-500" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h1>
            <p className="text-stone-400">
              {session?.user?.email && (
                <>
                  Tu email (<span className="text-white font-medium">{session.user.email}</span>) no
                  tiene permisos para acceder a esta sección.
                </>
              )}
              {!session?.user?.email && 'No tienes permisos para acceder a esta sección.'}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Volver al inicio
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-stone-700 hover:bg-stone-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
