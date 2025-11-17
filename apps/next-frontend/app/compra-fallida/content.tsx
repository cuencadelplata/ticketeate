'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

export default function CompraFallidaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  const getErrorMessage = () => {
    if (status === 'rejected') {
      return 'Tu pago fue rechazado. Por favor, verifica tus datos y vuelve a intentar.';
    }
    if (status === 'cancelled') {
      return 'Cancelaste el pago. Puedes intentar de nuevo cuando lo desees.';
    }
    return 'Ocurrió un error durante el procesamiento del pago. Intenta nuevamente.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Error en la Compra</h1>
        <p className="text-gray-600 mb-6">{getErrorMessage()}</p>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            <RotateCcw size={20} />
            Volver a Intentar
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            <Home size={20} />
            Ir al Inicio
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Si el problema persiste, contacta con nuestro equipo de soporte.
        </p>
      </div>
    </div>
  );
}
