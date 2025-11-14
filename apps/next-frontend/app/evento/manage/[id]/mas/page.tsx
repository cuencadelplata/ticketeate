'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useEffect } from 'react';

export default function MasPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const eventId = params.id as string;

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/sign-in?redirect_url=/evento/manage/${eventId}/mas`);
      return;
    }

    if (session?.user && session.user.role !== 'ORGANIZADOR' && session.user.role !== 'COLABORADOR') {
      router.push('/');
    }
  }, [session, isPending, eventId, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session?.user || (session.user.role !== 'ORGANIZADOR' && session.user.role !== 'COLABORADOR')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Volver
        </button>

        <h1 className="text-4xl font-bold mb-2">Más Opciones</h1>
        <p className="text-gray-400 mb-8">Gestiona tu evento</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push(`/evento/manage/${eventId}/mas/scanner`)}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-6 text-left transition-all hover:border-blue-600"
          >
            <div className="text-4xl mb-3">📷</div>
            <h2 className="text-xl font-bold mb-2">Escáner de Entradas</h2>
            <p className="text-gray-400 text-sm">
              Escanea códigos QR para validar la entrada de asistentes al evento
            </p>
          </button>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 opacity-50 cursor-not-allowed">
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-xl font-bold mb-2">Estadísticas</h2>
            <p className="text-gray-400 text-sm">Próximamente</p>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            💡 Solo organizadores y colaboradores tienen acceso a estas herramientas de gestión.
          </p>
        </div>
      </div>
    </div>
  );
}