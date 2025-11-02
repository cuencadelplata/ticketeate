'use client';

import { Cupon } from '@/hooks/use-cupones';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Copy, Check, Tag, Calendar, Users, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CuponCardProps {
  cupon: Cupon;
  onEdit: (cupon: Cupon) => void;
  onDelete: (cuponId: string) => void;
  onCopyCode: (code: string) => void;
  onToggleEstado: (cupon: Cupon) => void;
  copiedCode: string | null;
  isDeleting: boolean;
}

export default function CuponCard({
  cupon,
  onEdit,
  onDelete,
  onCopyCode,
  onToggleEstado,
  copiedCode,
  isDeleting,
}: CuponCardProps) {
  const isExpired = new Date(cupon.fecha_expiracion) < new Date();
  const isMaxedOut = cupon.usos_actuales >= cupon.limite_usos;
  const isActive = cupon.estado === 'ACTIVO' && !isExpired && !isMaxedOut;

  const getStatusBadge = () => {
    if (isExpired) return <Badge variant="destructive">Expirado</Badge>;
    if (isMaxedOut) return <Badge variant="secondary">Agotado</Badge>;
    if (cupon.estado === 'INACTIVO') return <Badge variant="outline">Inactivo</Badge>;
    return (
      <Badge variant="default" className="bg-green-600">
        Activo
      </Badge>
    );
  };

  const usagePercentage = (cupon.usos_actuales / cupon.limite_usos) * 100;

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-md">
              <Tag className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold font-mono">{cupon.codigo}</span>
            </div>
            {getStatusBadge()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Percent className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{cupon.porcentaje_descuento}% de descuento</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                Expira: {format(new Date(cupon.fecha_expiracion), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>
                {cupon.usos_actuales} / {cupon.limite_usos} usos
              </span>
            </div>
          </div>

          {/* Barra de progreso de usos */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                usagePercentage >= 90
                  ? 'bg-red-500'
                  : usagePercentage >= 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopyCode(cupon.codigo)}
            className="flex items-center gap-2"
          >
            {copiedCode === cupon.codigo ? (
              <>
                <Check className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={() => onEdit(cupon)} disabled={isDeleting}>
            <Pencil className="w-4 h-4" />
          </Button>

          <Button
            variant={isActive ? 'outline' : 'default'}
            size="sm"
            onClick={() => onToggleEstado(cupon)}
            disabled={isDeleting || isExpired || isMaxedOut}
          >
            {isActive ? 'Desactivar' : 'Activar'}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(cupon.cuponid)}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
