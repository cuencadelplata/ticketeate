import { bus } from './bus';
import type { CompraRealizada } from './types';

// Evitar doble registro en hot-reload
declare global {
  // eslint-disable-next-line no-var
  var __handlers_registrados__: boolean | undefined;
}

if (!globalThis.__handlers_registrados__) {
  // Handler: generación de PDF (stub)
  bus.on('compra.realizada', async (p: CompraRealizada) => {
    console.log('[events] compra.realizada recibida', {
      reservaId: p.reservaId,
      entradas: p.entradas.length,
      monto: p.montoTotal,
    });
    // Aquí podrías llamar a un servicio/serverless que genere PDFs y envíe email
  });

  globalThis.__handlers_registrados__ = true;
}

export {};
