'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle, Download, Home } from 'lucide-react';

export default function CompraExitosaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular validación del pago
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin">
              <CheckCircle size={64} className="text-green-500" />
            </div>
          </div>
        ) : (
          <>
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Compra Exitosa!</h1>
            <p className="text-gray-600 mb-6">
              Tu pago ha sido procesado correctamente. Revisa tu email para descargar tus entradas.
            </p>

            {paymentId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-600 mb-1">ID de Pago:</p>
                <p className="font-mono text-sm text-gray-900">{paymentId}</p>
                {externalReference && (
                  <>
                    <p className="text-sm text-gray-600 mb-1 mt-3">Referencia:</p>
                    <p className="font-mono text-sm text-gray-900">{externalReference}</p>
                  </>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                <Home size={20} />
                Volver al Inicio
              </button>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                <Download size={20} />
                Imprimir Comprobante
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Se ha enviado un email con tus entradas. Si no lo ves, revisa la carpeta de spam.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
