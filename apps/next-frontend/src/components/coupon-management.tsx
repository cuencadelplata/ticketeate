'use client';

import { useState } from 'react';
import { Plus, Trash2, Calendar, Tag, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Coupon, CreateCouponData } from '@/types/coupons';

interface CouponManagementProps {
  eventId: string;
}

export function CouponManagement({ eventId }: CouponManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cupones, setCupones] = useState<Coupon[]>([]);
  const [newCupon, setNewCupon] = useState<Partial<CreateCouponData>>({
    eventoid: eventId,
    codigo: '',
    porcentaje_descuento: 0,
    limite_usos: 1,
  });

  const loadCupones = async () => {
    try {
      const response = await fetch(`/api/eventos/${eventId}/cupones`);
      if (!response.ok) throw new Error('Error al cargar cupones');
      const data = await response.json();
      setCupones(data);
    } catch (error) {
      toast.error('Error al cargar los cupones');
    }
  };

  const handleCreateCupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/eventos/${eventId}/cupones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCupon),
      });

      if (!response.ok) throw new Error('Error al crear el cupón');

      toast.success('Cupón creado exitosamente');
      setIsOpen(false);
      loadCupones();
    } catch (error) {
      toast.error('Error al crear el cupón');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCupon = async (cuponId: string) => {
    try {
      const response = await fetch(`/api/eventos/${eventId}/cupones/${cuponId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el cupón');

      toast.success('Cupón eliminado exitosamente');
      loadCupones();
    } catch (error) {
      toast.error('Error al eliminar el cupón');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cupones de Descuento</h3>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cupón
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cupones.map((cupon) => (
          <div
            key={cupon.cuponid}
            className="bg-card p-4 rounded-lg border border-border shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-primary">{cupon.codigo}</h4>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    {cupon.porcentaje_descuento}% de descuento
                  </p>
                  <p className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {cupon.usos_actuales} de {cupon.limite_usos} usos
                  </p>
                  <p className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Expira: {new Date(cupon.fecha_expiracion).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteCupon(cupon.cuponid)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Cupón</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCupon} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código del Cupón</Label>
              <Input
                id="codigo"
                value={newCupon.codigo}
                onChange={(e) =>
                  setNewCupon((prev) => ({ ...prev, codigo: e.target.value.toUpperCase() }))
                }
                placeholder="Ej: SUMMER2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="porcentaje">Porcentaje de Descuento</Label>
              <Input
                id="porcentaje"
                type="number"
                min="1"
                max="100"
                value={newCupon.porcentaje_descuento}
                onChange={(e) =>
                  setNewCupon((prev) => ({
                    ...prev,
                    porcentaje_descuento: parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="limite">Límite de Usos</Label>
              <Input
                id="limite"
                type="number"
                min="1"
                value={newCupon.limite_usos}
                onChange={(e) =>
                  setNewCupon((prev) => ({ ...prev, limite_usos: parseInt(e.target.value) || 1 }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiracion">Fecha de Expiración</Label>
              <Input
                id="expiracion"
                type="datetime-local"
                onChange={(e) =>
                  setNewCupon((prev) => ({ ...prev, fecha_expiracion: new Date(e.target.value) }))
                }
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                Crear Cupón
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}