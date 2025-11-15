'use client';

import React, { useState } from 'react';
import { Copy, Trash2, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateInviteCode,
  useGetInviteCodes,
  useDeactivateInviteCode,
  useGetColaboradores,
} from '@/hooks/use-invite-codes';

interface InviteCodesManagementProps {
  eventoid: string;
}

export function InviteCodesManagement({ eventoid }: InviteCodesManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [maxUsos, setMaxUsos] = useState('999999');
  const [expirationDays, setExpirationDays] = useState('30');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { mutate: createInviteCode, isPending: isCreating } = useCreateInviteCode();
  const { data: inviteCodes, isLoading: isLoadingCodes, refetch } = useGetInviteCodes(eventoid);
  const { mutate: deactivateCode, isPending: isDeactivating } = useDeactivateInviteCode();
  const { data: colaboradores } = useGetColaboradores(eventoid);

  const handleGenerateCode = () => {
    const fecha_expiracion = new Date();
    fecha_expiracion.setDate(fecha_expiracion.getDate() + parseInt(expirationDays));

    createInviteCode(
      {
        eventoid,
        codigo: customCode || undefined,
        fecha_expiracion,
        usos_max: parseInt(maxUsos),
      },
      {
        onSuccess: (data) => {
          toast.success(`Código "${data.codigo}" generado exitosamente`);
          setShowForm(false);
          setCustomCode('');
          setMaxUsos('999999');
          setExpirationDays('30');
          refetch();
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Error al generar código');
        },
      },
    );
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Código copiado al portapapeles');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeactivateCode = (codigoid: string) => {
    // eslint-disable-next-line no-undef
    if (!confirm('¿Desactivar este código de invitación?')) return;

    deactivateCode(
      { eventoid, codigoid },
      {
        onSuccess: () => {
          toast.success('Código desactivado');
          refetch();
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Error al desactivar código');
        },
      },
    );
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 pt-24 p-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Códigos de Invitación</h2>
          <p className="text-sm text-stone-400">Gestiona códigos para que colaboradores se unan</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 px-4 py-2 text-white transition-colors"
        >
          <Plus size={18} />
          Generar Código
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-lg border border-stone-700 bg-stone-800 p-6 space-y-4">
          <h3 className="font-semibold text-white">Crear Nuevo Código</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-stone-400">
                Código Personalizado (opcional)
              </label>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                placeholder="Dejar en blanco para generar aleatoriamente"
                maxLength={20}
                className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-white placeholder-stone-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-stone-400">Máximo de Usos</label>
              <input
                type="number"
                value={maxUsos}
                onChange={(e) => setMaxUsos(e.target.value)}
                min="1"
                className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-stone-400">Expira en (días)</label>
              <input
                type="number"
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
                min="1"
                className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleGenerateCode}
              disabled={isCreating}
              className="flex-1 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:bg-stone-700 px-4 py-2 font-medium text-white transition-colors"
            >
              {isCreating ? 'Generando...' : 'Generar Código'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setCustomCode('');
              }}
              className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Códigos Activos */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Códigos Generados</h3>

        {isLoadingCodes ? (
          <div className="text-center py-8 text-stone-400">Cargando códigos...</div>
        ) : !inviteCodes || inviteCodes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-700 p-8 text-center">
            <p className="text-stone-400">No hay códigos de invitación aún</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {inviteCodes.map((code) => (
              <div
                key={code.codigoid}
                className={`rounded-lg border p-4 ${
                  code.estado === 'ACTIVO'
                    ? 'border-orange-500/30 bg-orange-500/10'
                    : 'border-stone-700 bg-stone-800 opacity-50'
                }`}
              >
                {/* Código */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="font-mono text-2xl font-bold text-orange-400">{code.codigo}</div>
                  <button
                    onClick={() => handleCopyCode(code.codigo)}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    {copiedCode === code.codigo ? (
                      <Check size={18} className="text-green-400" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between text-stone-300">
                    <span>Usos:</span>
                    <span className="font-semibold">
                      {code.usos_totales} / {code.usos_max}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>Expira:</span>
                    <span className="font-semibold">{formatDate(code.fecha_expiracion)}</span>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>Estado:</span>
                    <span
                      className={`font-semibold ${
                        code.estado === 'ACTIVO' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {code.estado}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${(code.usos_totales / code.usos_max) * 100}%` }}
                  />
                </div>

                {/* Actions */}
                {code.estado === 'ACTIVO' && (
                  <button
                    onClick={() => handleDeactivateCode(code.codigoid)}
                    disabled={isDeactivating}
                    className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Desactivar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colaboradores */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white">
          Colaboradores Asignados ({colaboradores?.length || 0})
        </h3>

        {!colaboradores || colaboradores.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-700 p-8 text-center">
            <p className="text-stone-400">No hay colaboradores aún</p>
          </div>
        ) : (
          <div className="rounded-lg border border-stone-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-stone-300 font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left text-stone-300 font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-stone-300 font-semibold">
                      Código Usado
                    </th>
                    <th className="px-4 py-3 text-left text-stone-300 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-700">
                  {colaboradores.map(
                    (col: {
                      colaborador_evento_id: React.Key | null | undefined;
                      usuario: { name: any; email: any };
                      invite_code_used:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      fecha_asignacion: string | Date;
                    }) => (
                      <tr key={col.colaborador_evento_id} className="hover:bg-stone-800/50">
                        <td className="px-4 py-3 text-white">{col.usuario?.name || '-'}</td>
                        <td className="px-4 py-3 text-stone-300">{col.usuario?.email || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold text-orange-400">
                            {col.invite_code_used}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-400">
                          {formatDate(col.fecha_asignacion)}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
