'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button, Card, CardBody, CardHeader, Divider, Spinner } from '@heroui/react';
import { Wallet, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleConnectMercadoPago = async () => {
    setIsConnecting(true);
    
    try {
      // Generar state para seguridad CSRF
      const state = Math.random().toString(36).substring(2, 15);
      
      // Guardar state en cookie
      document.cookie = `mp_oauth_state=${state}; path=/; max-age=600; SameSite=Lax`;
      
      // Construir URL de autorización de Mercado Pago
      const clientId = process.env.NEXT_PUBLIC_MERCADOPAGO_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/auth/mercadopago/callback`;
      
      if (!clientId) {
        throw new Error('Client ID de Mercado Pago no configurado');
      }
      
      const authUrl = new URL('https://auth.mercadopago.com/authorization');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('scope', 'read write');
      
      // Redirigir a Mercado Pago
      window.location.href = authUrl.toString();
      
    } catch (error) {
      console.error('Error al conectar con Mercado Pago:', error);
      toast.error('Error al conectar con Mercado Pago');
      setIsConnecting(false);
    }
  };

  const handleDisconnectMercadoPago = async () => {
    try {
      const response = await fetch('/api/auth/mercadopago/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsConnected(false);
        toast.success('Billetera de Mercado Pago desconectada');
      } else {
        throw new Error('Error al desconectar');
      }
    } catch (error) {
      console.error('Error al desconectar Mercado Pago:', error);
      toast.error('Error al desconectar la billetera');
    }
  };

  // Verificar estado de conexión con Mercado Pago
  useEffect(() => {
    const checkMercadoPagoConnection = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/mercadopago/status');
        if (response.ok) {
          const data = await response.json();
          setIsConnected(data.connected);
        }
      } catch (error) {
        console.error('Error al verificar conexión:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkMercadoPagoConnection();
  }, [session]);

  // Manejar parámetros de URL para mostrar mensajes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'connected') {
      setIsConnected(true);
      toast.success('¡Billetera de Mercado Pago conectada exitosamente!');
      // Limpiar URL
      window.history.replaceState({}, document.title, '/profile');
    } else if (error) {
      let errorMessage = 'Error desconocido';
      switch (error) {
        case 'oauth_error':
          errorMessage = 'Error en la autorización de Mercado Pago';
          break;
        case 'no_code':
          errorMessage = 'No se recibió código de autorización';
          break;
        case 'invalid_state':
          errorMessage = 'Estado de seguridad inválido';
          break;
        case 'token_error':
          errorMessage = 'Error al obtener token de acceso';
          break;
        case 'server_error':
          errorMessage = 'Error interno del servidor';
          break;
      }
      toast.error(errorMessage);
      // Limpiar URL
      window.history.replaceState({}, document.title, '/profile');
    }
  }, []);

  if (isPending || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardBody className="text-center py-8">
              <h1 className="text-2xl font-bold mb-4">Acceso Requerido</h1>
              <p className="text-gray-600 mb-4">
                Necesitas iniciar sesión para acceder a tu perfil.
              </p>
              <Button color="primary" href="/sign-in">
                Iniciar Sesión
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Información del Usuario */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Información Personal</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-lg">{session.user.name || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{session.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rol</label>
                  <p className="text-lg capitalize">
                    {(session as any).role || 'Usuario'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Conexión con Mercado Pago */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Billetera de Mercado Pago
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Conecta tu billetera de Mercado Pago para realizar pagos de forma rápida y segura.
                </p>
                
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Billetera conectada</span>
                    </div>
                    <Button
                      color="danger"
                      variant="bordered"
                      onPress={handleDisconnectMercadoPago}
                      startContent={<ExternalLink className="w-4 h-4" />}
                    >
                      Desconectar Billetera
                    </Button>
                  </div>
                ) : (
                  <Button
                    color="primary"
                    onPress={handleConnectMercadoPago}
                    isLoading={isConnecting}
                    startContent={!isConnecting && <Wallet className="w-4 h-4" />}
                    endContent={!isConnecting && <ExternalLink className="w-4 h-4" />}
                  >
                    {isConnecting ? 'Conectando...' : 'Conectar con Mercado Pago'}
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Información adicional */}
        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Beneficios de conectar tu billetera</h2>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Pagos más rápidos</h3>
                  <p className="text-sm text-gray-600">
                    No necesitas ingresar tus datos de pago cada vez
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Mayor seguridad</h3>
                  <p className="text-sm text-gray-600">
                    Tus datos están protegidos por Mercado Pago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Historial de pagos</h3>
                  <p className="text-sm text-gray-600">
                    Accede a tu historial de compras en un solo lugar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Promociones exclusivas</h3>
                  <p className="text-sm text-gray-600">
                    Accede a descuentos y ofertas especiales
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
