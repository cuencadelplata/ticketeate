'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Tipos para el historial
type HistorialCompra = {
  id: string;
  usuarioid: string;
  reservaid: string;
  eventoid: string;
  cantidad: number;
  monto_total: number;
  moneda: string;
  estado_compra: string;
  fecha_compra: string;
  fecha_evento: string;
  comprobante_url?: string;
  evento_titulo?: string;
  evento_ubicacion?: string;
  reserva_cantidad?: number;
  reserva_estado?: string;
};

export default function HistorialPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [compras, setCompras] = useState<HistorialCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ID de usuario fijo para testing (en producción sería session?.user?.id)
  const userId = 1;

  useEffect(() => {
    // Comentado temporalmente para testing
    // if (!isPending && !session) {
    //   router.push('/sign-in?redirect_url=/historial');
    //   return;
    // }

    // Cargar historial siempre para testing
    cargarHistorial();
  }, [session, isPending, router]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/compras/historial?usuario_id=${userId}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }

      const data = await response.json();
      setCompras(data.compras || []);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const descargarComprobante = async (compra: HistorialCompra) => {
    try {
      // Simular datos para generar el comprobante (similar a como se hace en /comprar)
      const { jsPDF } = await import('jspdf');
      const QRCode = await import('qrcode');

      const qrData = `https://ticketeate.com/entrada/${compra.reservaid}`;
      
      // Generar QR como dataURL
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256,
        color: { dark: '#000000', light: '#ffffff' },
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.setFont('helvetica', 'normal');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Tarjeta estilo UI
      const cardWidth = Math.min(180, pageWidth - 20);
      const cardHeight = 200;
      const cardX = (pageWidth - cardWidth) / 2;
      const cardY = (pageHeight - cardHeight) / 2;

      // Fondo verde claro
      pdf.setFillColor(236, 252, 240);
      pdf.setDrawColor(199, 230, 204);
      pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, 'FD');

      // Título
      const title = '¡Compra exitosa!';
      pdf.setTextColor(22, 101, 52);
      pdf.setFontSize(20);
      const titleWidth = pdf.getTextWidth(title);
      let cursorY = cardY + 14;
      pdf.text(title, cardX + (cardWidth - titleWidth) / 2, cursorY, { baseline: 'middle' });

      // QR centrado
      const qrSize = 50;
      pdf.addImage(
        qrDataUrl,
        'PNG',
        cardX + (cardWidth - qrSize) / 2,
        cursorY + 20,
        qrSize,
        qrSize,
        undefined,
        'FAST',
      );
      cursorY += 20 + qrSize + 10;

      // Contenido
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      const left = cardX + 12;
      
      pdf.text(`${compra.cantidad} entrada(s) para:`, left, cursorY);
      cursorY += 8;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(compra.evento_titulo || 'Evento', left, cursorY);
      cursorY += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Total: ${compra.monto_total} ${compra.moneda}`, left, cursorY);
      cursorY += 6;
      pdf.text(`Reserva: #${compra.reservaid}`, left, cursorY);
      cursorY += 6;
      pdf.text(`Fecha: ${new Date(compra.fecha_compra).toLocaleDateString('es-ES')}`, left, cursorY);

      const fileName = `comprobante-${compra.reservaid}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generando comprobante:', error);
      alert('Error al generar el comprobante. Inténtalo de nuevo.');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMonto = (monto: number, moneda: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: moneda === 'USD' ? 'USD' : 'ARS',
    }).format(monto);
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Cargando historial...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Historial de Compras</h1>
          <p className="text-gray-400">Aquí puedes ver todos los eventos que has comprado</p>
        </div>

        {compras.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-2xl font-semibold mb-2">No tienes compras aún</h2>
            <p className="text-gray-400 mb-6">¡Explora nuestros eventos y compra tu primera entrada!</p>
            <button
              onClick={() => router.push('/descubrir')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Descubrir Eventos
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {compras.map((compra) => (
              <div
                key={compra.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {compra.evento_titulo || 'Evento'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {compra.evento_ubicacion || 'Ubicación no disponible'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    compra.estado_compra === 'COMPLETADO' 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {compra.estado_compra}
                  </div>
                </div>

                {/* Información de la compra */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cantidad:</span>
                    <span className="text-white">{compra.cantidad} entrada(s)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white font-medium">
                      {formatearMonto(compra.monto_total, compra.moneda)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Fecha de compra:</span>
                    <span className="text-white">
                      {formatearFecha(compra.fecha_compra)}
                    </span>
                  </div>
                  {compra.fecha_evento && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Fecha del evento:</span>
                      <span className="text-white">
                        {formatearFecha(compra.fecha_evento)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botón de comprobante */}
                <button
                  onClick={() => descargarComprobante(compra)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Descargar Comprobante
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
