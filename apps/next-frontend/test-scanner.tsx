'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useEffect, useState } from 'react';

export default function TestScannerPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [eventId] = useState('evento-test-001');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNavigate = () => {
    router.push(`/evento/manage/${eventId}/scanner`);
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg border border-gray-800 p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Scanner de Entradas</h1>

        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <span className="font-semibold">Usuario actual:</span> {session?.user?.name || 'No identificado'}
            </p>
            <p className="text-sm text-blue-300">
              <span className="font-semibold">Rol:</span> {session?.user?.role || 'Sin rol'}
            </p>
          </div>

          {session?.user?.role === 'ORGANIZADOR' || session?.user?.role === 'COLABORADOR' ? (
            <div>
              <button
                onClick={handleNavigate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Ir al Scanner
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                ID del evento: {eventId}
              </p>
            </div>
          ) : (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-300">
                ❌ No tienes permisos para acceder al scanner. Solo ORGANIZADOR y COLABORADOR pueden hacerlo.
              </p>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Códigos QR de prueba:</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• QR001, QR002, QR003, QR004</li>
              <li>• QR005, QR006, QR007, QR008</li>
            </ul>
          </div>

          {!session && (
            <button
              onClick={() => router.push('/sign-in')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
