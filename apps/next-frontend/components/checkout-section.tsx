'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth-client';
import { useCreateMarketplacePreference } from '@/hooks/use-wallet';
import { Loader2, AlertCircle } from 'lucide-react';

interface CheckoutSectionProps {
  eventId: string;
  eventTitle: string;
  categories: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    available: number;
  }>;
  organizerId: string;
  organizerName: string;
}

interface CartItem {
  categoryId: string;
  categoryName: string;
  price: number;
  quantity: number;
}

export function CheckoutSection({
  eventId,
  eventTitle,
  categories,
  organizerId,
  organizerName,
}: CheckoutSectionProps) {
  const { data: session } = useSession();
  const createPreference = useCreateMarketplacePreference();
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (categoryId: string, categoryName: string, price: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.categoryId === categoryId);
      if (existing) {
        return prev.map((item) =>
          item.categoryId === categoryId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { categoryId, categoryName, price, quantity: 1 }];
    });
  };

  const removeFromCart = (categoryId: string) => {
    setCart((prev) => prev.filter((item) => item.categoryId !== categoryId));
  };

  const updateQuantity = (categoryId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(categoryId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.categoryId === categoryId ? { ...item, quantity } : item)),
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const marketplaceFee = Math.round(total * 0.1 * 100) / 100; // 10% fee
  const sellerAmount = total - marketplaceFee;

  const handleCheckout = async () => {
    if (!session?.user?.id) {
      // Redirigir a login
      window.location.href = '/sign-in';
      return;
    }

    if (cart.length === 0) {
      alert('Por favor selecciona al menos una entrada');
      return;
    }

    // Validar que el checkout sea posible
    try {
      const validateResponse = await fetch('/api/checkout/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ eventId }),
      });

      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        if (errorData.code === 'WALLET_NOT_LINKED') {
          alert(
            'El organizador aún no ha vinculado su billetera de Mercado Pago. Por favor contacta al organizador.',
          );
        } else if (errorData.code === 'WALLET_EXPIRED') {
          alert(
            'La sesión de la billetera del organizador ha expirado. Por favor contacta al organizador para que la renueve.',
          );
        } else {
          alert(errorData.error || 'Error al validar el checkout');
        }
        return;
      }
    } catch (validateError) {
      console.error('Error validating checkout:', validateError);
      alert('Error al validar el checkout');
      return;
    }

    const items = cart.map((item) => ({
      title: `${item.categoryName} - ${eventTitle}`,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'ARS',
    }));

    const externalReference = `event-${eventId}-buyer-${session.user.id}-${Date.now()}`;

    try {
      const preference = await createPreference.mutateAsync({
        items,
        external_reference: externalReference,
        metadata: {
          eventId,
          eventTitle,
          organizerId,
          organizerName,
          buyerId: session.user.id,
          cartItems: cart,
        },
      });

      if (preference?.init_point) {
        window.location.href = preference.init_point;
      } else if (preference?.sandbox_init_point) {
        window.location.href = preference.sandbox_init_point;
      } else {
        alert('Error al crear la preferencia de pago');
      }
    } catch (error) {
      console.error('Error al procesar el checkout:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Categorías disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Entradas Disponibles</CardTitle>
          <CardDescription>Selecciona las entradas que deseas comprar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {categories.length === 0 ? (
              <div className="rounded-md bg-stone-100 p-4 text-center text-stone-600">
                No hay entradas disponibles en este momento
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-md border border-stone-200 p-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-stone-900">{category.name}</h3>
                    <p className="text-sm text-stone-600">${category.price.toFixed(2)} ARS</p>
                    <p className="text-xs text-stone-500">
                      {category.available} de {category.stock} disponibles
                    </p>
                  </div>
                  <Button
                    onClick={() => addToCart(category.id, category.name, category.price)}
                    disabled={category.available <= 0}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Agregar
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Carrito y checkout */}
      {cart.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Resumen de Compra</CardTitle>
            <CardDescription className="text-orange-800">
              {cart.length} categoría(s) seleccionada(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.categoryId} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">{item.categoryName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.categoryId, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        −
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.categoryId, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.categoryId)}
                      className="text-xs text-red-600 hover:text-red-700 mt-1"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-orange-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Subtotal:</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Comisión de plataforma (10%):</span>
                <span className="font-medium">-${marketplaceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-700 font-semibold">Recibe organizador:</span>
                <span className="font-semibold text-stone-900">${sellerAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-orange-200 pt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-600 mb-1">Total a pagar:</p>
                <p className="text-2xl font-bold text-stone-900">${total.toFixed(2)}</p>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={createPreference.isPending}
                className="bg-orange-600 hover:bg-orange-700 w-32"
              >
                {createPreference.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Ir a Pagar'
                )}
              </Button>
            </div>

            {createPreference.isPending && (
              <div className="rounded-md bg-blue-50 border border-blue-200 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Redirigiendo a Mercado Pago para completar el pago...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info del organizador */}
      <Card className="bg-stone-50">
        <CardHeader>
          <CardTitle className="text-sm">Organizador</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-700">{organizerName}</p>
          <p className="text-xs text-stone-500 mt-2">
            Al pagar, el organizador recibe el valor de las entradas menos una comisión de
            plataforma del 10%.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
