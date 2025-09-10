export type EntradaEmitida = { id_entrada: string; codigo_qr: string };

export type CompraRealizada = {
  reservaId: string;
  pagoId: string;
  usuarioId: string;
  eventoId: string;
  categoriaId: string;
  cantidad: number;
  montoTotal: number;
  entradas: EntradaEmitida[];
};

export type EventMap = {
  'compra.realizada': CompraRealizada;
};
