'use client';

import { useState } from 'react';
import { Tag, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CouponInputProps {
  eventId: string;
  onApplyCoupon: (descuento: number) => void;
}

export function CouponInput({ eventId, onApplyCoupon }: CouponInputProps) {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApplyCoupon = async () => {
    if (!codigo.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/redimir-cupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: codigo.trim(),
          eventoid: eventId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al aplicar el cupón');
      }

      if (!data.success) {
        throw new Error(data.error || 'El cupón no pudo ser aplicado');
      }

      setApplied(true);
      toast.success('Cupón aplicado correctamente');
      onApplyCoupon(data.descuento_aplicado);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al aplicar el cupón');
      setCodigo('');
      setApplied(false);
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <Check className="w-4 h-4" />
        <span>Cupón aplicado</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="coupon-code">¿Tienes un cupón de descuento?</Label>
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            id="coupon-code"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            className="pl-10"
            placeholder="Ingresa tu código"
            disabled={loading}
          />
        </div>
        <Button onClick={handleApplyCoupon} disabled={loading || !codigo.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
        </Button>
      </div>
    </div>
  );
}
