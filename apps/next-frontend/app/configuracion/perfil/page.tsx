'use client';

import { useRef } from 'react';
import { useSession, signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Trash2, Mail, Key, User } from 'lucide-react';
import {
  useProfile,
  useUpdateProfile,
  useUploadProfileImage,
  useDeleteProfileImage,
  useSendOtp,
  useVerifyOtp,
  useForgotPassword,
} from '@/hooks/use-profile';
import { useProfileForm } from '@/hooks/use-profile-form';

export default function PerfilPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TanStack Query hooks
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadProfileImage();
  const deleteImage = useDeleteProfileImage();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const forgotPassword = useForgotPassword();

  // Form state management
  const {
    formData,
    otpState,
    updateField,
    updateOtpState,
    resetOtpState,
    isFormValid,
    isEmailValid,
    isOtpValid,
  } = useProfileForm(profile ? { name: profile.name, email: profile.email } : undefined);

  // Si no está autenticado, redirigir al login
  if (!session && !sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso requerido</CardTitle>
            <CardDescription>Necesitas iniciar sesión para acceder a esta página</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signIn.social({ provider: 'google' })} className="w-full">
              Iniciar sesión con Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No se pudo cargar el perfil del usuario</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || !isEmailValid) {
      return;
    }

    updateProfile.mutate({
      name: formData.name,
      email: formData.email,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadImage.mutate(file);
  };

  const handleImageDelete = async () => {
    deleteImage.mutate();
  };

  const handleSendOtp = async () => {
    if (!profile?.email) return;

    sendOtp.mutate(profile.email, {
      onSuccess: () => {
        updateOtpState({ sent: true });
      },
    });
  };

  const handleVerifyOtp = async () => {
    if (!profile?.email || !isOtpValid) return;

    verifyOtp.mutate(
      { email: profile.email, otp: otpState.code },
      {
        onSuccess: () => {
          resetOtpState();
        },
      },
    );
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;

    forgotPassword.mutate(profile.email);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
          <p className="mt-2 text-gray-600">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="account">Cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Actualiza tu información personal y foto de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Foto de perfil */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.image || ''} alt={profile?.name || ''} />
                    <AvatarFallback className="text-lg">
                      {profile?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadImage.isPending}
                      >
                        {uploadImage.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Cambiar foto
                      </Button>
                      {profile?.image && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleImageDelete}
                          disabled={deleteImage.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">JPG, PNG o WebP. Máximo 5MB.</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Formulario de perfil */}
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      disabled={updateProfile.isPending || !isFormValid || !isEmailValid}
                    >
                      {updateProfile.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Guardar cambios'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Verificación de Email
                </CardTitle>
                <CardDescription>
                  Verifica tu correo electrónico para mayor seguridad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Estado de verificación</p>
                    <p className="text-sm text-gray-500">
                      {profile?.emailVerified ? 'Email verificado' : 'Email no verificado'}
                    </p>
                  </div>
                  {!profile?.emailVerified && (
                    <Button
                      onClick={handleSendOtp}
                      disabled={sendOtp.isPending || otpState.sent}
                      variant="outline"
                    >
                      {sendOtp.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : otpState.sent ? (
                        'Código enviado'
                      ) : (
                        'Enviar código'
                      )}
                    </Button>
                  )}
                </div>

                {otpState.sent && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        Se ha enviado un código de verificación a tu correo electrónico. Ingresa el
                        código de 6 dígitos a continuación.
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Código OTP"
                        value={otpState.code}
                        onChange={(e) => updateOtpState({ code: e.target.value })}
                        maxLength={6}
                        className="max-w-32"
                      />
                      <Button
                        onClick={handleVerifyOtp}
                        disabled={verifyOtp.isPending || !isOtpValid}
                      >
                        {verifyOtp.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Verificar'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Contraseña
                </CardTitle>
                <CardDescription>Gestiona tu contraseña y seguridad de la cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium">Restablecer contraseña</p>
                  <p className="text-sm text-gray-500">
                    Recibirás un enlace por correo electrónico para restablecer tu contraseña
                  </p>
                  <Button
                    onClick={handlePasswordReset}
                    disabled={forgotPassword.isPending}
                    variant="outline"
                  >
                    {forgotPassword.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Enviar enlace de restablecimiento'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Cuenta</CardTitle>
                <CardDescription>Detalles de tu cuenta y actividad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ID de Usuario</Label>
                    <p className="text-sm">{profile?.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Rol</Label>
                    <p className="text-sm capitalize">{profile?.role?.toLowerCase()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Miembro desde</Label>
                    <p className="text-sm">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Última actualización
                    </Label>
                    <p className="text-sm">
                      {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
