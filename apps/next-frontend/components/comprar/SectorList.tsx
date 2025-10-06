"use client";

import React from "react";

export type Sector = {
  nombre: string;
  precioDesde: number;
  fee?: number;
  numerado: boolean;
  color: string;
};

type SectorKey = string;

type SectorListProps = {
  sectores: Record<SectorKey, Sector>;
  sectorSeleccionado: SectorKey;
  onSelect: (key: SectorKey) => void;
  getDisponibilidad: (key: SectorKey) => number;
};

export function SectorList({ sectores, sectorSeleccionado, onSelect, getDisponibilidad }: SectorListProps) {
  return (
    <div className="max-h-[300px] flex-1 overflow-y-auto p-4">
      {Object.keys(sectores).map((key) => {
        const s = sectores[key];
        const activo = key === sectorSeleccionado;
        return (
          <label
            key={key}
            className={[
              'mb-3 grid cursor-pointer items-center gap-3 rounded-xl border bg-white p-4',
              '[grid-template-columns:24px_1fr_auto]',
              activo ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50',
            ].join(' ')}
          >
            <div className="flex items-center justify-center">
              <span className="inline-block h-4 w-4 rounded border border-black/10" style={{ background: s.color }} />
            </div>

            <div className="flex flex-col">
              <div className="font-bold text-lg">{s.nombre}</div>
              <div className="mt-1 text-lg font-semibold">$ {s.precioDesde.toLocaleString('es-AR')}</div>
              <div className="mt-1 text-sm font-semibold text-green-700">{getDisponibilidad(key)} disponibles</div>
            </div>

            <input type="radio" name="sector" checked={activo} onChange={() => onSelect(key)} className="h-5 w-5 text-red-500" />
          </label>
        );
      })}
    </div>
  );
}


