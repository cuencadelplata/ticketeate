'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import {
  useCupones,
  useCreateCupon,
  useUpdateCupon,
  useDeleteCupon,
  Cupon,
} from '@/hooks/use-cupones';
import { useEvent } from '@/hooks/use-events';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CuponForm from './components/CuponForm';
import CuponCard from './components/CuponCard';

export default function ManageCuponesPage() {
  const params = useParams();
  const id =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : '';

  const { data: event, isLoading: loadingEvent } = useEvent(id);
  const { data: cupones, isLoading: loadingCupones } = useCupones(id);
  const createCupon = useCreateCupon();
  const updateCupon = useUpdateCupon();
  const deleteCupon = useDeleteCupon();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingCupon, setEditingCupon] = useState<Cupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreate = async (data: any) => {
    try {
      await createCupon.mutateAsync({
        eventId: id,
        ...data,
      });
      toast({
        title: 'Cupón creado',
        description: 'El cupón se creó exitosamente',
      });
      setShowForm(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el cupón',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingCupon) return;

    try {
      await updateCupon.mutateAsync({
        cuponId: editingCupon.cuponid,
        eventId: id,
        ...data,
      });
      toast({
        title: 'Cupón actualizado',
        description: 'El cupón se actualizó exitosamente',
      });
      setEditingCupon(null);
      setShowForm(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el cupón',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (cuponId: string) => {
    // eslint-disable-next-line no-undef
    if (!confirm('¿Estás seguro de que deseas eliminar este cupón?')) return;

    try {
      await deleteCupon.mutateAsync({ cuponId, eventId: id });
      toast({
        title: 'Cupón eliminado',
        description: 'El cupón se eliminó exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el cupón',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (cupon: Cupon) => {
    setEditingCupon(cupon);
    setShowForm(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: 'Código copiado',
      description: 'El código del cupón se copió al portapapeles',
    });
  };

  const handleToggleEstado = async (cupon: Cupon) => {
    const nuevoEstado = cupon.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      await updateCupon.mutateAsync({
        cuponId: cupon.cuponid,
        eventId: id,
        estado: nuevoEstado,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cambiar el estado',
        variant: 'destructive',
      });
    }
  };

  if (loadingEvent || loadingCupones) {
    return <div className="p-4">Cargando...</div>;
  }

  if (!event) {
    return <div className="p-4">No se pudo cargar el evento.</div>;
  }

  return (
    <div className="pt-12">
      <div className="container mx-auto p-6 max-w-6xl py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cupones de Descuento</h1>
            <p className="text-muted-foreground mt-1">Gestiona los cupones para {event.titulo}</p>
          </div>
          <Button
            onClick={() => {
              setEditingCupon(null);
              setShowForm(true);
            }}
            disabled={showForm}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cupón
          </Button>
        </div>

        {showForm && (
          <div className="mb-6">
            <CuponForm
              cupon={editingCupon}
              onSubmit={editingCupon ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingCupon(null);
              }}
              isLoading={createCupon.isPending || updateCupon.isPending}
            />
          </div>
        )}

        <div className="space-y-4">
          {cupones && cupones.length > 0 ? (
            cupones.map((cupon) => (
              <CuponCard
                key={cupon.cuponid}
                cupon={cupon}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCopyCode={handleCopyCode}
                onToggleEstado={handleToggleEstado}
                copiedCode={copiedCode}
                isDeleting={deleteCupon.isPending}
              />
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-lg">
                No hay cupones creados para este evento
              </p>
              <Button
                onClick={() => {
                  setEditingCupon(null);
                  setShowForm(true);
                }}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear primer cupón
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
