'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cupon } from '@/hooks/use-cupones';

interface CuponFormProps {
  cupon?: Cupon | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function CuponForm({ cupon, onSubmit, onCancel, isLoading }: CuponFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: cupon
      ? {
          codigo: cupon.codigo,
          porcentaje_descuento: parseFloat(cupon.porcentaje_descuento),
          fecha_expiracion: cupon.fecha_expiracion.split('T')[0],
          limite_usos: cupon.limite_usos,
        }
      : {
          codigo: '',
          porcentaje_descuento: 10,
          fecha_expiracion: '',
          limite_usos: 100,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-card border rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">{cupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">Código del Cupón *</Label>
          <Input
            id="codigo"
            {...register('codigo', {
              required: 'El código es requerido',
              pattern: {
                value: /^[A-Z0-9_-]+$/,
                message: 'Solo mayúsculas, números, guiones y guiones bajos',
              },
              minLength: {
                value: 3,
                message: 'Mínimo 3 caracteres',
              },
              maxLength: {
                value: 50,
                message: 'Máximo 50 caracteres',
              },
            })}
            placeholder="DESCUENTO10"
            className={errors.codigo ? 'border-red-500' : ''}
          />
          {errors.codigo && <p className="text-sm text-red-500">{errors.codigo.message}</p>}
          <p className="text-xs text-muted-foreground">
            Usa mayúsculas, números, guiones (-) o guiones bajos (_)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="porcentaje_descuento">Porcentaje de Descuento (%) *</Label>
          <Input
            id="porcentaje_descuento"
            type="number"
            step="0.01"
            {...register('porcentaje_descuento', {
              required: 'El porcentaje es requerido',
              min: {
                value: 1,
                message: 'Mínimo 1%',
              },
              max: {
                value: 100,
                message: 'Máximo 100%',
              },
            })}
            placeholder="10"
            className={errors.porcentaje_descuento ? 'border-red-500' : ''}
          />
          {errors.porcentaje_descuento && (
            <p className="text-sm text-red-500">{errors.porcentaje_descuento.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha_expiracion">Fecha de Expiración *</Label>
          <Input
            id="fecha_expiracion"
            type="date"
            {...register('fecha_expiracion', {
              required: 'La fecha de expiración es requerida',
              validate: (value) => {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return selectedDate >= today || 'La fecha debe ser futura';
              },
            })}
            className={errors.fecha_expiracion ? 'border-red-500' : ''}
          />
          {errors.fecha_expiracion && (
            <p className="text-sm text-red-500">{errors.fecha_expiracion.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="limite_usos">Límite de Usos *</Label>
          <Input
            id="limite_usos"
            type="number"
            {...register('limite_usos', {
              required: 'El límite de usos es requerido',
              min: {
                value: 1,
                message: 'Mínimo 1 uso',
              },
              max: {
                value: 10000,
                message: 'Máximo 10,000 usos',
              },
            })}
            placeholder="100"
            className={errors.limite_usos ? 'border-red-500' : ''}
          />
          {errors.limite_usos && (
            <p className="text-sm text-red-500">{errors.limite_usos.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : cupon ? 'Actualizar' : 'Crear Cupón'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
